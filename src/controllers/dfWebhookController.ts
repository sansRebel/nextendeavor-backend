import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters || {};

  console.log("Intent Name:", intentName);
  console.log("Raw Parameters:", parameters); // Log raw parameters for debugging

  try {
    if (intentName === "Career Recommendation") {
      // Normalize parameter names
      const skillsRaw = parameters.skills || parameters.Skills || "";
      const interestsRaw = parameters.interests || parameters.Interests || "";

      // Clean and process the extracted values
      const skills = skillsRaw
        ? skillsRaw.split(/[, ]+/).map((s: string) => s.trim().toLowerCase())
        : [];
      const interests = interestsRaw
        ? interestsRaw.split(/[, ]+/).map((i: string) => i.trim().toLowerCase())
        : [];

      console.log("Extracted Skills:", skills);
      console.log("Extracted Interests:", interests);

      // Add recommendation logic here...
      res.json({
        fulfillmentText: `I’ve received your skills: ${skills.join(
          ", "
        )}, and interests: ${interests.join(", ")}.`,
      });
    } else {
      res.json({ fulfillmentText: "Sorry, I didn’t understand that request." });
    }
  } catch (error) {
    console.error("Dialogflow Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
};



