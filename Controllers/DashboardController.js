// controllers/DashboardController.js
import Employee from "../Models/Employee.js";
import Leave from "../Models/Leave.js";
import Absent from "../Models/Absent.js";

export const getEmployeeDashboardData = async (req, res) => {
	try {
		const { id, year, month } = req.body;
		const startOfMonth = `${year}-${String(month).padStart(2, "0")}-01`;
		const nextMonth = `${month === "12" ? +year + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		const leaves = await Leave.find({
			employeeId: id,
			startDate: { $lt: nextMonth },
			endDate: { $gte: startOfMonth },
		}).sort({ startDate: -1 });

		const absents = await Absent.find({
			employeeId: id,
			date: { $gte: startOfMonth, $lt: nextMonth },
			status: 1,
		}).sort({ date: -1 });

		res.json({
			totalLeaves: leaves.length,
			totalAbsents: absents.length,
			recentLeaves: leaves.slice(0, 3),
			recentAbsents: absents.slice(0, 3),
		});
	} catch (err) {
		res.status(500).json({ message: "Error fetching employee dashboard data" });
	}
};

export const getManagerDashboardData = async (req, res) => {
	try {
		const employees = await Employee.find({ Status: "1" });
		const totalEmployees = employees.length;

		const today = new Date().toISOString().split("T")[0];

		const absentsToday = await Absent.find({ date: today, status: 1 });
		const presentToday = totalEmployees - absentsToday.length;

		const pendingLeaves = await Leave.find({ status: "Pending" });
		const pendingLeavesCount = pendingLeaves.length;

		const year = new Date().getFullYear();
		const month = String(new Date().getMonth() + 1).padStart(2, "0");
		const startOfMonth = `${year}-${month}-01`;
		const nextMonth = `${month === "12" ? year + 1 : year}-${
			month === "12" ? "01" : String(Number(month) + 1).padStart(2, "0")
		}-01`;

		const monthlyLeaves = await Leave.find({
			startDate: { $lt: nextMonth },
			endDate: { $gte: startOfMonth },
		}).sort({ startDate: -1 });

		const monthlyAbsents = await Absent.find({
			date: { $gte: startOfMonth, $lt: nextMonth },
			status: 1,
		}).sort({ date: -1 });

		const payroll = employees.reduce(
			(sum, emp) => sum + (parseFloat(emp.monthlySalary) || 0),
			0
		);

		res.json({
			totalEmployees,
			presentToday,
			pendingLeavesCount,
			totalLeavesThisMonth: monthlyLeaves.length,
			totalAbsentsThisMonth: monthlyAbsents.length,
			monthlyPayroll: payroll,
			recentLeaves: monthlyLeaves.slice(0, 3),
			recentAbsents: monthlyAbsents.slice(0, 3),
		});
	} catch (err) {
		console.error(err);
		res.status(500).json({ message: "Server error" });
	}
};
