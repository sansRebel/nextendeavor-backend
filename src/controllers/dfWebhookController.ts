import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";
import { generateCareerRecommendations } from "../utils/recommendationUtils"; // Import recommendation logic

dotenv.config();

// ✅ Force environment variable for credentials
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/etc/secrets/nextendeavor-chatbot-h9ng-4ea81aa5f9d3.json";

console.log("✅ Using Service Account Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

// ✅ Ensure credentials file exists
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)) {
  console.error("❌ ERROR: Service account JSON file NOT FOUND at", process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
  console.log("✅ Service Account Email:", serviceAccount.client_email);
}

// ✅ Initialize Dialogflow client
const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

// ✅ Extract relevant words from user input
const extractRelevantWords = (input: string): string[] => {
  const stopWords = [
    "i", "am", "i'm", "good", "at", "and", "with", "love", "in", "for", "the", "a"
  ];

  return input
    .toLowerCase()
    .replace(/[^\w\s]/g, "") // Remove punctuation
    .split(/\s+/) // Split into words
    .filter((word) => !stopWords.includes(word)); // Remove stop words
};

// ✅ Function to handle Dialogflow webhook
export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
    // ✅ Verify request format
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

    // ✅ Send request to Dialogflow
    const responses = await sessionClient.detectIntent(request);
    const queryResult = responses[0]?.queryResult;

    if (!queryResult) {
      console.error("❌ Error: Missing queryResult in Dialogflow response.");
      res.status(500).json({ error: "Dialogflow did not return a valid response." });
      return;
    }

    console.log("✅ Dialogflow Response:", queryResult);

    // ✅ Extract intent and parameters
    const intentName = queryResult.intent?.displayName || "";
    const parameters = queryResult.parameters?.fields || {};

    console.log("🎯 Detected Intent:", intentName);
    console.log("📌 Extracted Parameters:", parameters);

    let fulfillmentText = queryResult.fulfillmentText || "No response from Dialogflow.";
    let recommendations: { totalScore: number; id: string; title: string; description: string; requiredSkills: string[]; salaryRange: string; demand: number; }[] = [];

    // ✅ Handle "Career Recommendation" intent
    if (intentName === "Career Recommendation") {
      const skills = extractRelevantWords(parameters.skills?.stringValue || "");
      const interests = extractRelevantWords(parameters.interests?.stringValue || "");

      console.log("🔍 Extracted Skills:", skills);
      console.log("🔍 Extracted Interests:", interests);

      // Fetch recommendations based on extracted data
      recommendations = await generateCareerRecommendations(skills, interests);

      console.log("📌 Career Recommendations:", recommendations);

      fulfillmentText = "Here are some career recommendations based on your input!";
    }

    // ✅ Send response back to frontend
    res.json({
      fulfillmentText,
      parameters, // Keep extracted parameters if needed
      intent: intentName, // Include the intent name
      recommendations, // Attach career recommendations if applicable
    });

  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
  }
};
