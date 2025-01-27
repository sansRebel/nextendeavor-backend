import express from 'express';
import { generateRecommendations } from '../controllers/recController';

const router = express.Router();

router.post("/", generateRecommendations);

export default router;