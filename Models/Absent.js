import mongoose from "mongoose";

const AbsentSchema = new mongoose.Schema(
	{
		employeeId: String,
		date: String,
		absentType: String,
		reason: String,
		markedBy: String,
		status: { type: String, default: "1" },
	},
	{ timestamps: true }
);

export default mongoose.model("Absentees", AbsentSchema);
