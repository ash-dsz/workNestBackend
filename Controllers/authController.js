import Employee from "../Models/Employee.js";

export const authenticateUser = async (req, res) => {
	try {
		const { phone, password } = req.body;

		const employee = await Employee.findOne(
			{ phone, password },
			{ role: 1, _id: 1 }
		);

		if (!employee) {
			return res.status(200).json({ message: "no user found" });
		}

		res.json(employee);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
};
