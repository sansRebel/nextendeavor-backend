import express from "express";
import { dialogflowWebhook,  } from "../controllers/dfWebhookController";

const router = express.Router();

// Webhook route for Dialogflow
router.post("/webhook", dialogflowWebhook);


export default router;
