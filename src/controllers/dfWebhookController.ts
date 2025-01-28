import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();


const extractRelevantWords = (input: string): string[] => {
  const stopWords = [
    "i", "am", "i'm", "good", "at", "and", "with", "love", "in", "for", "the", "a"
  ];

  return input
    .toLowerCase() // Convert to lowercase
    .replace(/[^\w\s]/g, "") // Remove punctuation (e.g., periods, commas)
    .split(/\s+/) // Split into words by whitespace
    .filter((word) => !stopWords.includes(word)); // Remove stop words
};


export const dialogflowWebhook = async (req: Request, res: Response): Promise<void> => {
  const intentName = req.body.queryResult.intent.displayName;
  const parameters = req.body.queryResult.parameters || {};

  console.log("Intent Name:", intentName);
  console.log("Raw Parameters:", parameters);

  try {
    if (intentName === "Career Recommendation") {
      const skillsRaw = parameters.skills || "";
      const interestsRaw = parameters.interests || "";

      // Extract relevant words
      const skills = extractRelevantWords(skillsRaw);
      const interests = extractRelevantWords(interestsRaw);

      console.log("Cleaned Skills:", skills);
      console.log("Cleaned Interests:", interests);

      // Add recommendation logic here...
      const careers = await prisma.career.findMany();
      const recommendations = careers
        .map((career) => {
          let skillScore = 0;
          let interestScore = 0;

          if (career.requiredSkills) {
            skillScore = career.requiredSkills.filter((skill) =>
              skills.includes(skill.toLowerCase())
            ).length;
          }

          if (career.description) {
            interestScore = interests.filter((interest) =>
              career.description.toLowerCase().includes(interest.toLowerCase())
            ).length;
          }

          return { ...career, score: skillScore + interestScore };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      if (recommendations.length > 0) {
        const responseText = recommendations.map((rec) =>
          `Title: ${rec.title}\nDescription: ${rec.description}`
        ).join("\n");
        res.json({
          fulfillmentText: `Here are your career recommendations:\n\n${responseText}`,
        });
      } else {
        res.json({ fulfillmentText: "Sorry, no recommendations found." });
      }

      return; // Prevent further execution
    }

    // Default response for unknown intents
    res.json({ fulfillmentText: "Sorry, I didn’t understand that request." });
  } catch (error) {
    console.error("Dialogflow Webhook Error:", error);

    // Ensure the error response is only sent once
    if (!res.headersSent) {
      res.status(500).send("Internal Server Error");
    }
  }
};





