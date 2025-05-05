import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
	{
		name: String,
		phone: String,
		email: String,
		aadhar: String,
		pan: String,
		upi: String,
		monthlySalary: String,
		role: String,
		profilePic: { type: String, default: null },
		DocId: { type: String, default: null },
		joinDate: Date,
		password: String,
		Status: { type: String, default: "1" },
	},
	{ timestamps: true }
);

export default mongoose.model("Employee", employeeSchema);
