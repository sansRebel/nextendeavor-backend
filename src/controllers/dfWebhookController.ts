import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
dotenv.config();

const googleCredentials = {
  type: "service_account",
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key: (process.env.GOOGLE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
};


const sessionClient = new SessionsClient({ credentials: googleCredentials });


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
    const projectId = process.env.GOOGLE_PROJECT_ID || "nextendeavor-chatbot-h9ng";
    const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

    console.log("🟢 Sending request to Dialogflow with Project ID:", projectId);

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
      console.error("❌ Error: Missing queryResult in Dialogflow response.");
      res.status(500).json({ error: "Dialogflow did not return a valid response." });
      return;
    }

    console.log("🟢 Dialogflow Response:", queryResult);

    const intentName = queryResult.intent?.displayName || "";
    const action = queryResult.action || "";
    const parameters = queryResult.parameters?.fields || {};

    // ✅ Extract skills & interests directly from Dialogflow
    const skills = parameters.skills?.stringValue || "";
    const interests = parameters.interests?.stringValue || "";

    console.log("🟢 Extracted Skills:", skills);
    console.log("🟢 Extracted Interests:", interests);

    let responseMessage = queryResult.fulfillmentText || "No response from Dialogflow.";
    let recommendations: {
      id: string;
      title: string;
      description: string;
      requiredSkills: string[];
      industry: string | null;
      demand: number | null;
      growthPotential: number | null;
      salaryMin: number | null;
      salaryMax: number | null;
      totalScore: number;
    }[] = [];

    // ✅ Generate Career Recommendations if action is triggered
    if (action === "career_recommendation" && skills && interests) {
      recommendations = await generateCareerRecommendations(skills, interests);
      console.log("✅ Generated Career Recommendations:", recommendations);
      responseMessage = "Your recommendations have been generated below.";
    }

    res.json({
      fulfillmentText: responseMessage,
      intent: intentName,
      recommendations,
    });

  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
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

    // ✅ Sort careers by score in descending order
    const sortedCareers = scoredCareers.sort((a, b) => b.totalScore - a.totalScore);

    // ✅ Select the **best matching** career
    const topRecommendation = sortedCareers[0];

    // ✅ Only include additional recommendations if they are **80% as relevant as the top one**
    const additionalRecommendations = sortedCareers
      .slice(1)
      .filter(career => career.totalScore >= topRecommendation.totalScore * 0.8);

    // ✅ Combine and return results (1 to 3 recommendations max)
    return [topRecommendation, ...additionalRecommendations].slice(0, 3);

  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    return [];
  }
};

