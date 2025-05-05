import Employee from "../Models/Employee.js";

export const getEmployees = async (req, res) => {
	try {
		const employees = await Employee.find({ Status: "1" }).sort({ _id: -1 });
		res.json(employees);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

// Reusable function to check for duplicates
const checkForDuplicates = async (data, excludeId = null) => {
	const { phone, email, aadhar, pan, upi } = data;
	const filter = {
		$and: [
			{
				$or: [{ phone }, { email }, { aadhar }, { pan }, { upi }],
			},
			{ Status: "1" }, // only check among active employees
		],
	};

	// If excludeId is provided, exclude the employee with that ID from the check
	if (excludeId) {
		filter._id = { $ne: excludeId };
	}

	return await Employee.findOne(filter);
};

export const addEmployee = async (req, res) => {
	try {
		const {
			name,
			phone,
			email,
			aadhar,
			pan,
			upi,
			salary,
			role,
			joindate,
			password,
		} = req.body;

		// Check for duplicates before adding
		const existingEmployee = await checkForDuplicates({
			phone,
			email,
			aadhar,
			pan,
			upi,
		});
		if (existingEmployee) {
			return res.status(200).json({
				success: false,
				message:
					"Duplicate found. Please check the following fields: " +
					(existingEmployee.phone === phone ? "Phone " : "") +
					(existingEmployee.email === email ? "Email " : "") +
					(existingEmployee.aadhar === aadhar ? "Aadhar " : "") +
					(existingEmployee.pan === pan ? "PAN " : "") +
					(existingEmployee.upi === upi ? "UPI ID " : ""),
			});
		}

		const profilePic = req.files?.profilePic?.[0]?.path || "";
		const documents = req.files?.documents?.[0]?.path || "";

		const newEmp = new Employee({
			name,
			phone,
			email,
			aadhar,
			pan,
			upi,
			monthlySalary: salary,
			role: role,
			profilePic,
			DocId: documents,
			joinDate: new Date(joindate),
			password,
		});
		await newEmp.save();
		res.json({ success: true, message: "Employee added!" });
	} catch (err) {
		console.error("Add Employee Error:", err);
		res.status(500).json({ success: false, message: "Server error" });
	}
};

export const editEmployee = async (req, res) => {
	try {
		const { id } = req.params;
		const {
			name,
			phone,
			email,
			aadhar,
			pan,
			upi,
			salary,
			role,
			joindate,
			password,
		} = req.body;

		// Check for duplicates before updating (excluding the current employee)
		const existingEmployee = await checkForDuplicates(
			{ phone, email, aadhar, pan, upi },
			id // Exclude the current employee by ID
		);
		if (existingEmployee) {
			return res.status(200).json({
				success: false,
				message:
					"Duplicate found. Please check the following fields: " +
					(existingEmployee.phone === phone ? "Phone " : "") +
					(existingEmployee.email === email ? "Email " : "") +
					(existingEmployee.aadhar === aadhar ? "Aadhar " : "") +
					(existingEmployee.pan === pan ? "PAN " : "") +
					(existingEmployee.upi === upi ? "UPI ID " : ""),
			});
		}

		const employee = await Employee.findById(id);

		const profilePic = req.files?.profilePic?.[0]?.path || employee.profilePic;
		const documents = req.files?.documents?.[0]?.path || employee.DocId;

		const updatedEmployee = await Employee.findByIdAndUpdate(
			id,
			{
				name,
				phone,
				email,
				aadhar,
				pan,
				upi,
				monthlySalary: salary,
				role: role,
				profilePic,
				DocId: documents,
				joinDate: new Date(joindate),
				password,
			},
			{ new: true }
		);

		if (!updatedEmployee) {
			return res.status(200).json({ message: "Employee not found" });
		}

		res.json({ success: true, message: "Employee updated successfully!" });
	} catch (err) {
		console.error("Edit Employee Error:", err);
		res.status(200).json({ success: false, message: "Server error" });
	}
};

export const getEmployeeById = async (req, res) => {
	try {
		const employee = await Employee.findById(req.params.id);
		if (!employee) {
			return res.status(200).json({ message: "Employee not found" });
		}
		res.json(employee);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const DeActivateEmployeeById = async (req, res) => {
	try {
		const employee = await Employee.findById(req.params.id);
		if (!employee) {
			return res.status(200).json({ message: "Employee not found" });
		}
		const updated = await Employee.findByIdAndUpdate(
			req.params.id,
			{ Status: "0" },
			{ new: true }
		);
		if (!updated) {
			return res.status(404).json({ message: "Employee not found" });
		}
		res.json({ success: true, message: "Employee updated" });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};

export const GetAllEmployeesName = async (req, res) => {
	try {
		const employees = await Employee.find(
			{ Status: "1" }, // filter
			{ name: 1 } // projection
		).sort({ _id: -1 });

		res.json(employees);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
