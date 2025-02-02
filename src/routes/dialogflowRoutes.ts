import express from "express";
import cors from "cors";
import { dialogflowWebhook } from "../controllers/dfWebhookController";

const router = express.Router();

router.use(
    cors({
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        credentials: true,
    })
);

// Webhook route for Dialogflow
router.post("/webhook", dialogflowWebhook);
router.post("/chat", dialogflowWebhook)

export default router;
