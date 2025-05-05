import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./Config/db.js";
import { fileURLToPath } from "url";
import path from "path";

// Routes
import employeeRoutes from "./routes/employeeRoutes.js";
import attendanceRoutes from "./routes/absentRoutes.js";
import leaveRoutes from "./routes/leaveRoutes.js";
import authRoutes from "./routes/authRoute.js";
import dashboard from "./routes/DashboardRoute.js";
// import reportRoutes from "./routes/reportRoutes.js";

dotenv.config();
connectDB();

const app = express();
// Serve uploaded files statically
app.use(cors());
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
	res.send("🚀 Backend is running...");
});

// Route Middleware
app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/leaves", leaveRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboard);
// app.use("/api/documents", documentRoutes);
// app.use("/api/reports", reportRoutes);

app.listen(process.env.PORT, () => {
	console.log(`Server running on port ${process.env.PORT}`);
});
