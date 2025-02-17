import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { error } from "console";

const prisma = new PrismaClient();

interface AuthenticatedRequest extends Request {
    userId?: string;
  }
  


export const saveRecommendation = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
    const userId = req.userId;
    const {careerId} = req.body;
    console.log(careerId);

    if(!userId){
        res.status(401).json({ error: "Unauthorized personnel"});
        return;
    }

    if(!careerId){
        res.status(400).json({error: "Career ID is required"});
        return;
    }


    try {
    // Check if the career exists
    const career = await prisma.career.findUnique({ where: { id: careerId } });
    if (!career) {
        res.status(404).json({ error: "Career not found" });
        return;
        }

        // Check if the recommendation already exists for this user and career
        const existingRecommendation = await prisma.recommendation.findFirst({
        where: { userId, careerId },
        });

        if (existingRecommendation) {
        res.status(400).json({ error: "Recommendation already saved" });
        return;
        }

        // Save the recommendation
        const recommendation = await prisma.recommendation.create({
        data: {
            userId,
            careerId,
            saved: true, // Mark as saved
        },
        });

        res.status(201).json({
        message: "Recommendation saved successfully",
        recommendation,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};


export const getSavedRecommendations = async(req: AuthenticatedRequest, res: Response): Promise<void> =>{
    const userId = req.userId;
    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
            return;
        }
        
        try {
            // Fetch saved recommendations for the user
            const savedRecommendations = await prisma.recommendation.findMany({
            where: {
                userId,
                saved: true, // Only fetch saved recommendations
            },
            include: {
                career: true, // Include career details
            },
            });
        
            if (savedRecommendations.length === 0) {
            res.status(404).json({ error: "No saved recommendations found" });
            return;
            }
        
            // Format the response
            const recommendations = savedRecommendations.map((rec) => ({
            id: rec.id,
            careerId: rec.careerId,
            title: rec.career.title,
            description: rec.career.description,
            requiredSkills: rec.career.requiredSkills,
            salaryRange: rec.career.salaryRange,
            demand: rec.career.demand,
            savedAt: rec.createdAt,
            }));
        
            res.status(200).json({ recommendations });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Failed to fetch saved recommendations" });
        }
};

export const clearRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
    const userId = req.userId; // Extract userId from JWT middleware

    if (!userId) {
        res.status(401).json({ error: "Unauthorized" });
        return;
    }

    try {
        // Check if the user has any saved recommendations
        const existingRecommendations = await prisma.recommendation.findMany({
            where: { userId, saved: true },
        });

        if (existingRecommendations.length === 0) {
            res.status(404).json({ error: "No saved recommendations found to clear." });
            return;
        }

        // Delete all saved recommendations for this user
        await prisma.recommendation.deleteMany({
            where: { userId },
        });

        res.status(200).json({ message: "All saved recommendations have been cleared." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to clear recommendations" });
    }
};

export const viewCareer = async (req: Request, res: Response): Promise<void> => {
    const {careerId} = req.params;

    try {
        const career = await prisma.career.findUnique({
            where: {id: careerId}
        });

        if (!career){
            res.status(404).json({ error: "Career not found"});
            return;
        }

        res.status(200).json(career);
    }catch(error) {
        console.error("Error fetching career", error);
        res.status(500).json({error: "Internal server error"});
    }
};