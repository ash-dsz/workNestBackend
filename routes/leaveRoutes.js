import express from "express";
import {
	addLeaveRecord,
	getAllPendingLeaves,
	getLeaveRecordByDateForThatMonth,
	clearAllLeaveRecords,
	updateLeaveStatus,
	getLeaveRecordByEmployeeIdForThatMonth,
} from "../Controllers/LeaveController.js";

const router = express.Router();

router.get("/getpendingleaverequest", getAllPendingLeaves);
router.post("/addnewleaverrequest", addLeaveRecord);
router.get("/getmonthlyleaverequest/:date", getLeaveRecordByDateForThatMonth);
router.get("/clean", clearAllLeaveRecords);
router.put("/updateleavestatus", updateLeaveStatus);
router.get("/getleavebymonthandid", getLeaveRecordByEmployeeIdForThatMonth);

export default router;
