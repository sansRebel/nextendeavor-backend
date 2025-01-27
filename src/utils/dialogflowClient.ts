import * as dialogflow from "@google-cloud/dialogflow";

const projectId = "formal-ember-449115-p8"; // Replace with your Dialogflow project ID

// Initialize Dialogflow client
const sessionClient = new dialogflow.SessionsClient({
  keyFilename: "/src/config/formal-ember-449115-p8-afdd584d1a28.json", // Path to your service account key
});

// Function to detect intent
export const detectIntent = async (query: string, sessionId: string) => {
  const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: query,
        languageCode: "en-US",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
};
