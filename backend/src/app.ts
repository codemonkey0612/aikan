import express from "express";
import cors from "cors";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import facilityRoutes from "./routes/facility.routes";
import residentRoutes from "./routes/resident.routes";
import vitalRoutes from "./routes/vital.routes";
import shiftRoutes from "./routes/shift.routes";
import visitRoutes from "./routes/visit.routes";
import salaryRoutes from "./routes/salary.routes";
import notificationRoutes from "./routes/notification.routes";
import { errorHandler } from "./middlewares/error.middleware";



const app = express();

app.use(cors());
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/notifications", notificationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use(errorHandler);

export default app;
