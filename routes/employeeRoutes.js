// backend/routes/employeeRoutes.js
import express from "express";
import {
	getEmployees,
	addEmployee,
	getEmployeeById,
	editEmployee,
	DeActivateEmployeeById,
	GetAllEmployeesName,
} from "../Controllers/employeeController.js";
import upload from "../other/upload.js"; // your multer config

const router = express.Router();

router.get("/getemployeesname", GetAllEmployeesName); //GEt only names
router.get("/", getEmployees); // GET /api/employees

router.post(
	"/",
	upload.fields([
		{ name: "profilePic", maxCount: 1 },
		{ name: "documents", maxCount: 1 },
	]),
	addEmployee
);
// POST /api/employees
router.get("/:id", getEmployeeById); //Get Specific employee

router.put(
	"/edit/:id",
	upload.fields([
		{ name: "profilePic", maxCount: 1 },
		{ name: "documents", maxCount: 1 },
	]),
	editEmployee
);

router.put("/delete/:id", DeActivateEmployeeById);

export default router;
