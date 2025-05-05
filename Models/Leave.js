import mongoose from "mongoose";

const LeaveSchema = new mongoose.Schema(
	{
		employeeId: String,
		leaveTitle: { type: String, default: "Casual Leave" },
		leaveType: String,
		startDate: String,
		endDate: String,
		totalLeaveDays: String,
		reason: String,
		markedBy: String,
		status: { type: String, default: "Pending" },
	},
	{ timestamps: true }
);

export default mongoose.model("Leaves", LeaveSchema);
