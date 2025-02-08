import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

process.env.GOOGLE_APPLICATION_CREDENTIALS = "/etc/secrets/nextendeavor-chatbot-h9ng-4ea81aa5f9d3.json";

console.log("✅ Using Service Account Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)) {
  console.error("❌ ERROR: Service account JSON file NOT FOUND at", process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
  console.log("✅ Service Account Email:", serviceAccount.client_email);
}

const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ Validate request format
    if (!req.body.message) {
      console.error("❌ Error: Missing 'message' in request body");
      res.status(400).json({ error: "Invalid request format. Missing 'message'." });
      return;
    }

    const message = req.body.message;
    const sessionId = req.body.sessionId || "default-session";
    const projectId = process.env.DIALOGFLOW_PROJECT_ID || "nextendeavor-chatbot-h9ng";
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    console.log(" Sending request to Dialogflow with Project ID:", projectId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "en",
        },
      },
    };

    const responses = await sessionClient.detectIntent(request);
    const queryResult = responses[0]?.queryResult;

    if (!queryResult) {
      console.error(" Error: Missing queryResult in Dialogflow response.");
      res.status(500).json({ error: "Dialogflow did not return a valid response." });
      return;
    }

    console.log(" Dialogflow Response:", queryResult);

    const intentName = queryResult.intent?.displayName || "";
    const parameters = queryResult.parameters?.fields || {}; // Extract parameters

    let responseMessage = queryResult.fulfillmentText || "No response from Dialogflow.";
    let recommendations: { id: string; title: string; description: string; requiredSkills: string[]; industry: string | null; demand: number | null; growthPotential: number | null; salaryMin: number | null; salaryMax: number | null; totalScore: number; }[] = [];

    if (intentName === "Career Recommendation") {
      const skills = parameters.skills?.stringValue || "";
      const interests = parameters.interests?.stringValue || "";

      if (skills && interests) {
        console.log(" Extracted Skills:", skills);
        console.log(" Extracted Interests:", interests);

        recommendations = await generateCareerRecommendations(skills, interests);

        console.log("✅ Generated Career Recommendations:", recommendations);
        responseMessage = "Your recommendations have been generated below.";
      }
    }

    res.json({
      fulfillmentText: responseMessage,
      intent: intentName,
      recommendations,
    });

  } catch (error) {
    console.error(" Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
  }
};

const generateCareerRecommendations = async (skills: string, interests: string) => {
  try {
    const careers = await prisma.career.findMany({
      select: {
        id: true,
        title: true,
        description: true,
        requiredSkills: true,
        salaryRange: true,
        industry: true,
        demand: true,
        growthPotential: true,
      },
    });
    console.log("🛠 Careers Fetched from Database:", careers);

    // ✅ Calculate matching scores
    const scoredCareers = careers.map((career) => {
      let skillScore = 0;
      let interestScore = 0;

      // ✅ Match skills
      if (career.requiredSkills) {
        skillScore = career.requiredSkills.filter((skill) =>
          skills.toLowerCase().includes(skill.toLowerCase())
        ).length;
      }

      // ✅ Match interests
      if (career.description.toLowerCase().includes(interests.toLowerCase())) {
        interestScore += 1;
      }

      // ✅ Extract salaryMin and salaryMax from salaryRange
      const salaryMatch = career.salaryRange.match(/\$([\d,]+) - \$([\d,]+)/);
      const salaryMin = salaryMatch ? parseInt(salaryMatch[1].replace(/,/g, ""), 10) : null;
      const salaryMax = salaryMatch ? parseInt(salaryMatch[2].replace(/,/g, ""), 10) : null;

      return {
        id: career.id,
        title: career.title,
        description: career.description,
        requiredSkills: career.requiredSkills,
        industry: career.industry,
        demand: career.demand,
        growthPotential: career.growthPotential,
        salaryMin,
        salaryMax,
        totalScore: skillScore + interestScore,
      };
    });

    // ✅ Sort and return top 3 recommendations
    return scoredCareers.sort((a, b) => b.totalScore - a.totalScore).slice(0, 3);
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    return [];
  }
};
