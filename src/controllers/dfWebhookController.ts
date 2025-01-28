import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  console.log("Intent Name:", intentName);
  console.log("Parameters:", parameters);

  try {
    if (intentName === "Career Recommendation") {
      const skills = parameters.skills ? parameters.skills.split(",") : [];
      const interests = parameters.interests ? parameters.interests.split(",") : [];

      console.log("Extracted Skills:", skills);
      console.log("Extracted Interests:", interests);

      // Your recommendation logic here...
    }
  } catch (error) {
    console.error("Dialogflow Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
};

