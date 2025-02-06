import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";
import { PrismaClient } from "@prisma/client";


const prisma = new PrismaClient();

dotenv.config();

// ✅ Force environment variable for credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/etc/secrets/nextendeavor-chatbot-h9ng-4ea81aa5f9d3.json";

console.log("✅ Using Service Account Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

// ✅ Ensure the credentials file exists
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)) {
  console.error("❌ ERROR: Service account JSON file NOT FOUND at", process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
  console.log("✅ Service Account Email:", serviceAccount.client_email);
}

// ✅ Initialize Dialogflow Client
const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// ✅ Function to handle Dialogflow webhook
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

    console.log("📢 Sending request to Dialogflow with Project ID:", projectId);

    const request = {
      session: sessionPath,
      queryInput: {
        text: {
          text: message,
          languageCode: "en",
        },
      },
    };

    // ✅ Make request to Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const queryResult = responses[0]?.queryResult;

    if (!queryResult) {
      console.error("❌ Error: Missing queryResult in Dialogflow response.");
      res.status(500).json({ error: "Dialogflow did not return a valid response." });
      return;
    }

    console.log("✅ Dialogflow Response:", queryResult);

    const intentName = queryResult.intent?.displayName || "";
    const parameters = queryResult.parameters?.fields || {}; // Extract parameters

    let responseMessage = queryResult.fulfillmentText || "No response from Dialogflow.";
    let recommendations = [];

    // ✅ Check if the Career Recommendation Intent has all required parameters
    if (intentName === "Career Recommendation") {
      const skills = parameters.skills?.stringValue || "";
      const interests = parameters.interests?.stringValue || "";

      if (skills && interests) {
        console.log("✅ Extracted Skills:", skills);
        console.log("✅ Extracted Interests:", interests);

        // ✅ Fetch and generate recommendations
        recommendations = await generateCareerRecommendations(skills, interests);

        console.log("✅ Generated Career Recommendations:", recommendations);
        responseMessage = "Your recommendations have been generated below.";
      }
    }

    // ✅ Send response back to frontend
    res.json({
      fulfillmentText: responseMessage,
      intent: intentName,
      recommendations, // Attach recommendations, but frontend will display them in a separate component
    });

  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
  }
};

// ✅ Function to generate career recommendations
const generateCareerRecommendations = async (skills: string, interests: string) => {
  try {
    // ✅ Fetch careers from database
    const careers = await prisma.career.findMany();

    // ✅ Calculate matching scores
    const scoredCareers = careers.map((career: any) => {
      let skillScore = 0;
      let interestScore = 0;

      // ✅ Match skills
      if (career.requiredSkills) {
        skillScore = career.requiredSkills.filter((skill: any) =>
          skills.toLowerCase().includes(skill.toLowerCase())
        ).length;
      }

      // ✅ Match interests
      if (career.description.toLowerCase().includes(interests.toLowerCase())) {
        interestScore += 1;
      }

      return { ...career, totalScore: skillScore + interestScore };
    });

    // ✅ Sort and return top 3 recommendations
    return scoredCareers
      .sort((a: any, b: any) => b.totalScore - a.totalScore)
      .slice(0, 3);
  } catch (error) {
    console.error("❌ Error generating recommendations:", error);
    return [];
  }
};
