import express from "express";
import { authenticateUser } from "../Controllers/authController.js";
const router = express.Router();

router.post("/authenticateuser", authenticateUser);

export default router;
