import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "NightIsAlwaysBetter101";

interface JwtPayload {
  userID: string;
}

export const authenticateUser = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader); 

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); 

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("Decoded Token Payload:", decoded); 

    req.userId = decoded.userID;

    next(); 
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
