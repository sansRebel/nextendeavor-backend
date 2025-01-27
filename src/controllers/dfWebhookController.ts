import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters;

  try {
    switch (intentName) {
      case "Career Recommendation": {
        // Extract skills and interests from the parameters
        const skills = parameters.skills ? parameters.skills.split(",") : [];
        const interests = parameters.interests ? parameters.interests.split(",") : [];

        // Fetch recommendations
        const careers = await prisma.career.findMany();
        const recommendations = careers
          .map((career) => {
            let score = 0;

            if (career.requiredSkills) {
              score += career.requiredSkills.filter((skill) =>
                skills.map((s: string) => s.trim().toLowerCase()).includes(skill.toLowerCase())
              ).length;
            }

            if (interests) {
              score += interests.filter((interest: string) =>
                career.description.toLowerCase().includes(interest.trim().toLowerCase())
              ).length;
            }

            return { ...career, score };
          })
          .sort((a, b) => b.score - a.score) // Sort by score
          .slice(0, 3); // Limit to top 3

        // Format response for Dialogflow
        const responseText = recommendations.map((rec) =>
          `Title: ${rec.title}\nDescription: ${rec.description}\n\n`
        ).join("\n");

        res.json({
          fulfillmentText: `Here are your career recommendations:\n\n${responseText}`,
        });
        break;
      }

      default:
        res.json({ fulfillmentText: "Sorry, I didn't understand that." });
        break;
    }
  } catch (error) {
    console.error("Dialogflow Webhook Error:", error);
    res.status(500).send("Internal Server Error");
  }
};
