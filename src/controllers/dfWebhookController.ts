import { Request, Response } from "express";
import { SessionsClient } from "@google-cloud/dialogflow";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

// ✅ Force environment variable for credentials (to prevent Google from ignoring it)
process.env.GOOGLE_APPLICATION_CREDENTIALS = "/etc/secrets/nextendeavor-chatbot-h9ng-4ea81aa5f9d3.json";

console.log("✅ Using Service Account Path:", process.env.GOOGLE_APPLICATION_CREDENTIALS);

// ✅ Ensure the credentials file exists
if (!fs.existsSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string)) {
  console.error("❌ ERROR: Service account JSON file NOT FOUND at", process.env.GOOGLE_APPLICATION_CREDENTIALS);
} else {
  const serviceAccount = JSON.parse(fs.readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS as string, "utf8"));
  console.log("✅ Service Account Email:", serviceAccount.client_email);
}

// ✅ Explicitly provide the credentials to Dialogflow client
const sessionClient = new SessionsClient({
  keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS,
});

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

    // ✅ Debug: Print OAuth Token to check authentication
    const auth = await sessionClient.auth.getClient();
    const token = await auth.getAccessToken();
    console.log("✅ Generated OAuth Token:", token);

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

    // ✅ Send response back to frontend
    res.json({
      fulfillmentText: queryResult.fulfillmentText || "No response from Dialogflow.",
      parameters: queryResult.parameters || {}, // Keep parameters if needed
      intent: queryResult.intent?.displayName || "", // Send the intent name separately if required
    });
    
  } catch (error) {
    console.error("❌ Dialogflow API Error:", error);
    res.status(500).json({ error: "Failed to connect to Dialogflow API" });
  }
};


