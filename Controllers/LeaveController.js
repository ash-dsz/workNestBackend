import Leave from "../Models/Leave.js";
import Employee from "../Models/Employee.js";

//get leaves for selected month
export const getLeaveRecordByDateForThatMonth = async (req, res) => {
	try {
		const date = new Date(req.params.date);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");

		const startOfMonth = `${year}-${month}-01`;
		const nextMonth = `${month === "12" ? year + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		// Find all leave records that overlap with the month
		const leaves = await Leave.find({
			startDate: { $lt: nextMonth },
			endDate: { $gte: startOfMonth },
		});

		// Get all unique employee IDs involved
		const employeeIds = leaves.map((leave) => leave.employeeId);
		const markedByIds = leaves.map((leave) => leave.markedBy);
		const allIds = [...new Set([...employeeIds, ...markedByIds])];

		// Fetch corresponding employee records
		const employees = await Employee.find({ _id: { $in: allIds } });

		const employeeMap = employees.reduce((acc, emp) => {
			acc[emp._id.toString()] = emp;
			return acc;
		}, {});

		// Enrich leave records with names
		const enrichedLeaves = leaves.map((leave) => {
			const employeeInfo = employeeMap[leave.employeeId];
			const markedByInfo = employeeMap[leave.markedBy];

			return {
				...leave._doc,
				employeeName: employeeInfo ? employeeInfo.name : "Unknown",
				markedByName: markedByInfo ? markedByInfo.name : "Unknown",
			};
		});

		res.json(enrichedLeaves);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

// Get leaves for selected employee in a specific month
export const getLeaveRecordByEmployeeIdForThatMonth = async (req, res) => {
	try {
		const { year, month, employeeId } = req.query;

		if (!year || !month) {
			return res
				.status(400)
				.json({ message: "Year and month are required as query parameters." });
		}

		const paddedMonth = String(month).padStart(2, "0");
		const startOfMonth = `${year}-${paddedMonth}-01`;
		const nextMonth = `${month === "12" ? parseInt(year) + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		// Find leave records for the given employee that overlap with the selected month
		const leaves = await Leave.find({
			employeeId: employeeId,
			startDate: { $lt: nextMonth },
			endDate: { $gte: startOfMonth },
		});

		// Extract unique IDs for employee and markedBy
		const markedByIds = leaves.map((leave) => leave.markedBy);
		const allIds = [...new Set([employeeId, ...markedByIds])];

		// Fetch relevant employee data
		const employees = await Employee.find({ _id: { $in: allIds } });

		const employeeMap = employees.reduce((acc, emp) => {
			acc[emp._id.toString()] = emp;
			return acc;
		}, {});

		// Add names to the leave records
		const enrichedLeaves = leaves.map((leave) => {
			const employeeInfo = employeeMap[leave.employeeId];
			const markedByInfo = employeeMap[leave.markedBy];

			return {
				...leave._doc,
				employeeName: employeeInfo ? employeeInfo.name : "Unknown",
				markedByName: markedByInfo ? markedByInfo.name : "Unknown",
			};
		});

		res.json(enrichedLeaves);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

export const getAllPendingLeaves = async (req, res) => {
	try {
		// Step 1: Fetch all pending leave requests
		const leaves = await Leave.find({ status: "Pending" });

		// Step 2: Get unique employee IDs from those leaves
		const employeeIds = [
			...new Set(leaves.map((leave) => leave.employeeId.toString())),
		];

		// Step 3: Fetch corresponding employee records
		const employees = await Employee.find({ _id: { $in: employeeIds } });

		// Step 4: Create a map from employeeId to employee name
		const employeeMap = employees.reduce((acc, emp) => {
			acc[emp._id.toString()] = emp.name;
			return acc;
		}, {});

		// Step 5: Enrich leaves with employee name
		const enrichedLeaves = leaves.map((leave) => ({
			...leave._doc,
			employeeName: employeeMap[leave.employeeId] || "Unknown",
		}));

		res.json(enrichedLeaves);
	} catch (err) {
		console.error("Error fetching pending leaves:", err);
		res.status(500).json({ message: "Server Error" });
	}
};

//add new leave record
export const addLeaveRecord = async (req, res) => {
	try {
		const {
			employeeId,
			startdate,
			endate,
			leaveTitle,
			leaveType,
			reason,
			markedBy,
		} = req.body;

		const start = new Date(startdate);
		const end = new Date(endate);

		// Calculate the total number of leave days (inclusive)
		const oneDay = 1000 * 60 * 60 * 24;
		const totalLeaveDays = Math.round((end - start) / oneDay) + 1;

		const startDateOnly = start.toISOString().split("T")[0];
		const endDateOnly = end.toISOString().split("T")[0];

		const newRecord = new Leave({
			employeeId,
			leaveTitle,
			leaveType,
			startDate: startDateOnly,
			endDate: endDateOnly,
			reason,
			markedBy,
			totalLeaveDays,
		});

		await newRecord.save();
		res.status(201).json({ success: true, message: "New record added!" });
	} catch (err) {
		console.error("Error adding absent record:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const clearAllLeaveRecords = async (req, res) => {
	try {
		await Leave.deleteMany({}); // Deletes all documents in the collection

		res.status(200).json({
			success: true,
			message: "All leave records have been cleared.",
		});
	} catch (err) {
		console.error("Error clearing leave records:", err);
		res.status(500).json({
			success: false,
			message: "Failed to clear leave records.",
		});
	}
};

// Update leave status by GUID
export const updateLeaveStatus = async (req, res) => {
	try {
		const { leaveid, status, markedBy } = req.body; // Both GUID and status from the request body

		// Check if the status is valid

		// Update the leave record's status using the GUID
		const updatedLeave = await Leave.findByIdAndUpdate(
			leaveid, // The GUID of the leave record to update
			{ status, markedBy }, // The new status to set
			{ new: true } // Return the updated record
		);

		// If no leave record is found with the given GUID
		if (!updatedLeave) {
			return res.status(404).json({ message: "Leave record not found." });
		}

		// Respond with the updated leave record
		res.json({
			success: true,
			message: "Leave status updated successfully.",
			updatedLeave,
		});
	} catch (err) {
		console.error("Error updating leave status:", err);
		res
			.status(500)
			.json({ message: "Server error. Unable to update leave status." });
	}
};
