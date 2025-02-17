import express from 'express';
import {  saveRecommendation, getSavedRecommendations, clearRecommendations, viewCareer } from '../controllers/recController';
import { authenticateUser } from '../middlewares/authMiddlewares';

const router = express.Router();

router.post("/save", authenticateUser, saveRecommendation);
router.get("/saved", authenticateUser, getSavedRecommendations);
router.delete("/clear", authenticateUser, clearRecommendations);
router.get("/career/:careerId", viewCareer);

export default router;