import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "NightIsAlwaysBetter101";

// ✅ Extend Express Request to include userId
interface AuthenticatedRequest extends Request {
  userId?: string;
}

interface JwtPayload {
  userID: string;
}

export const authenticateUser = (
  req: AuthenticatedRequest, // ✅ Use the extended interface here
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    console.log("Authorization Header:", authHeader); // Debugging

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    console.log("Extracted Token:", token); // Debugging

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    console.log("Decoded Token Payload:", decoded); // Debugging

    req.userId = decoded.userID; // ✅ Attach userId to the extended request
    console.log("Attached userId to req:", req.userId); // Debugging

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
