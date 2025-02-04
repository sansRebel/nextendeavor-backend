import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";

dotenv.config(); // Load environment variables

// Initialize Dialogflow Client
const sessionClient = new SessionsClient();

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  console.log("🔹 Incoming Request Body:", JSON.stringify(req.body, null, 2));

  if (!req.body || !req.body.message) {
    console.error("❌ Error: Missing 'message' in request body");
    res.status(400).json({ error: "Invalid request format. Missing 'message'." });
    return;
  }

  const message = req.body.message;
  const sessionId = req.body.sessionId || "default-session";
  const projectId = process.env.DIALOGFLOW_PROJECT_ID || "formal-ember-449115-p8";
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: "en",
      },
    },
  };

  try {
    const responses = await sessionClient.detectIntent(request);
    const result = responses[0].queryResult;

    console.log("✅ Dialogflow Response:", result);

    res.json({
      fulfillmentText: result?.fulfillmentText || "No response from Dialogflow.",
      parameters: result?.parameters || {},
      intent: result?.intent?.displayName || "Unknown Intent",
    });

    return;
  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
    return;
  }
};
