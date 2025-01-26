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

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized: No token provided" });
      return;
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Attach the userId to the request
    req.body.userId = decoded.userID;

    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    res.status(401).json({ error: "Unauthorized: Invalid token" });
  }
};
