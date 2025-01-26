import express from "express";
import { editAccount, deleteAccount } from "../controllers/userController";

const router = express.Router();

router.put("/edit", editAccount);
router.delete("/delete", deleteAccount);

export default router;