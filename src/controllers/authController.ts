import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { generateToken } from "../utils/jwtUtils";

const prisma = new PrismaClient();

export const signup = async (req: Request, res: Response): Promise<void> => {
    const { email, password, name } = req.body;

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
        res.status(400).json({ error: "User already exists" });
        return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the user
        const newUser = await prisma.user.create({
        data: {
            email,
            password: hashedPassword,
            name,
        },
        });

        // Generate JWT token
        const token = generateToken(newUser.id);

        res.status(201).json({ message: "Signup successful", token });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};



// sign in function

export const login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
        res.status(401).json({ error: "Invalid credentials" });
        return;
    }

    const token = generateToken(user.id);

    res.status(200).json({ message: "Login successful", token });
    } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
    }
};
