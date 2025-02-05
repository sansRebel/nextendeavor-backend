import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// Debugging: Print the environment variable path
console.log("✅ Using Service Account Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

// Ensure the file exists
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)) {
  console.error("❌ ERROR: Service account JSON file NOT FOUND at", process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
  console.log("✅ Service Account Email:", serviceAccount.client_email);
}

// Initialize Dialogflow Client
const sessionClient = new SessionsClient();

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  try {
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

    const responses = await sessionClient.detectIntent(request);
    console.log("✅ Dialogflow Response:", responses[0]?.queryResult);

    res.json({
      fulfillmentText: responses[0]?.queryResult?.fulfillmentText || "No response from Dialogflow.",
      parameters: responses[0]?.queryResult?.parameters || {},
      intent: responses[0]?.queryResult?.intent?.displayName || "Unknown Intent",
    });
  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
  }
};
