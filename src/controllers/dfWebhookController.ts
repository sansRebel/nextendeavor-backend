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

      const careers = await prisma.career.findMany();
      const recommendations = careers
        .map((career) => {
          let skillScore = 0;
          let interestScore = 0;
      
          // Match skills
          if (career.requiredSkills) {
            skillScore = career.requiredSkills.filter((skill) =>
              skills.includes(skill.toLowerCase())
            ).length;
          }
      
          // Match interests
          if (career.description) {
            interestScore = interests.filter((interest) =>
              career.description.toLowerCase().includes(interest.toLowerCase())
            ).length;
          }
      
          return { ...career, score: skillScore + interestScore };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, 3); // Limit to top 3 recommendations
      
      res.json({
        fulfillmentText: recommendations.map((rec) =>
          `Title: ${rec.title}\nDescription: ${rec.description}`
        ).join("\n"),
      });
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




