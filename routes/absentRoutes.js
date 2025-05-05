import express from "express";
import {
	addAbsentRecord,
	getAbsenteesByDateForThatMonth,
	DeActivateAbsentRecordId,
	getAbsenteesByEmployeeIdForThatMonth,
} from "../Controllers/absentController.js";

const router = express.Router();

router.post("/addrecord", addAbsentRecord);
router.get("/getabsenteesforthismonth/:date", getAbsenteesByDateForThatMonth);
router.put("/deleteabsentrecord/:id", DeActivateAbsentRecordId);
router.get("/getabsenteesbymonthandid", getAbsenteesByEmployeeIdForThatMonth);

export default router;
