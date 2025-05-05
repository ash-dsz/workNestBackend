import express from "express";
import {
	getEmployeeDashboardData,
	getManagerDashboardData,
} from "../Controllers/DashboardController.js";

const router = express.Router();

router.post("/employee", getEmployeeDashboardData);
router.get("/manager", getManagerDashboardData);

export default router;
