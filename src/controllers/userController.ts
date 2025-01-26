import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

export const editAccount = async (req: Request, res: Response): Promise<void> => {
  const userId = req.body.userId; // Extract from req or decoded JWT
    const { name, email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
        }

        if (email && email !== user.email) {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ error: "Email is already in use" });
            return;
        }
        }

        let hashedPassword = user.password;
        if (password) {
        hashedPassword = await bcrypt.hash(password, 10);
        }

        const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            name: name || user.name,
            email: email || user.email,
            password: hashedPassword,
        },
        });

        res.status(200).json({
        message: "Account updated successfully",
        user: {
            name: updatedUser.name,
            email: updatedUser.email,
        },
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

export const deleteAccount = async (req: Request, res: Response): Promise<void> => {
    const userId = req.body.userId;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
        }

        await prisma.user.delete({ where: { id: userId } });

        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};
