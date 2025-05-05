import Absent from "../Models/Absent.js";
import Employee from "../Models/Employee.js";

export const addAbsentRecord = async (req, res) => {
	try {
		const { employeeId, date, absentType, reason, markedBy } = req.body;
		const dateOnly = new Date(date).toISOString().split("T")[0]; // "2025-04-05"

		const newRecord = new Absent({
			employeeId,
			date: dateOnly,
			absentType,
			reason,
			markedBy,
		});
		await newRecord.save();
		res.status(201).json({ success: true, message: "New record added!" });
	} catch (err) {
		console.error("Error adding absent record:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const getAbsenteesByDateForThatMonth = async (req, res) => {
	try {
		const date = new Date(req.params.date);
		const year = date.getFullYear();
		const month = String(date.getMonth() + 1).padStart(2, "0");

		const startOfMonth = `${year}-${month}-01`;
		const nextMonth = `${month === "12" ? year + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		// Fetch absentee records for the month
		const absentees = await Absent.find({
			date: {
				$gte: startOfMonth,
				$lt: nextMonth,
			},
			status: 1,
		});

		// Extract employee IDs from absentee records to avoid fetching unnecessary employees
		const employeeIds = absentees.map((absent) => absent.employeeId);

		// Fetch employees who are absent
		const employees = await Employee.find({
			_id: { $in: employeeIds },
		});

		// Map employees by _id for quick lookup
		const employeeMap = employees.reduce((acc, emp) => {
			acc[emp._id.toString()] = emp;
			return acc;
		}, {});

		// Add name of the one who marked the absentee record
		const absenteesWithMarkedByName = absentees.map((absent) => {
			const markedByInfo = employeeMap[absent.markedBy];
			const employeeInfo = employeeMap[absent.employeeId];

			return {
				...absent._doc,
				markedByName: markedByInfo ? markedByInfo.name : "Unknown",
				employeeName: employeeInfo ? employeeInfo.name : "Unknown",
			};
		});

		res.json(absenteesWithMarkedByName);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

export const getAbsenteesByEmployeeIdForThatMonth = async (req, res) => {
	try {
		// Optional: Get the month and year from query parameters
		const { year, month, employeeId } = req.query;

		if (!year || !month) {
			return res
				.status(400)
				.json({ message: "Year and month are required as query parameters." });
		}

		const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
		const nextMonth = `${month === "12" ? parseInt(year) + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		// Fetch absentee records for the employee in the given month
		const absentees = await Absent.find({
			employeeId: employeeId,
			date: {
				$gte: startOfMonth,
				$lt: nextMonth,
			},
			status: 1,
		});

		// Get the employee and the ones who marked them absent (if different people marked)
		const markerIds = absentees.map((a) => a.markedBy);
		const allRelevantIds = [...new Set([employeeId, ...markerIds])];

		const employees = await Employee.find({ _id: { $in: allRelevantIds } });

		const employeeMap = employees.reduce((acc, emp) => {
			acc[emp._id.toString()] = emp;
			return acc;
		}, {});

		const absenteesWithMarkedByName = absentees.map((absent) => {
			const markedByInfo = employeeMap[absent.markedBy];
			const employeeInfo = employeeMap[absent.employeeId];

			return {
				...absent._doc,
				markedByName: markedByInfo ? markedByInfo.name : "Unknown",
				employeeName: employeeInfo ? employeeInfo.name : "Unknown",
			};
		});

		res.json(absenteesWithMarkedByName);
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: err.message });
	}
};

export const DeActivateAbsentRecordId = async (req, res) => {
	try {
		const { id } = req.params; // assuming GUID is passed as a route param
		const updated = await Absent.findByIdAndUpdate(
			id,
			{ status: 0 },
			{ new: true }
		);

		if (!updated) {
			return res
				.status(404)
				.json({ success: false, message: "Record not found" });
		}

		res.status(200).json({
			success: true,
			message: "Absent record deactivated successfully",
			record: updated,
		});
	} catch (err) {
		console.error("Error deactivating record:", err);
		res.status(500).json({ message: err.message });
	}
};
