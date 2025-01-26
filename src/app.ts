import express from "express";
import authRoutes from "./routes/authRoutes";

const app = express();

// Middleware
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);

export default app;
