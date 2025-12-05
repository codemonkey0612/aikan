import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
import userRoutes from "./routes/user.routes";
import authRoutes from "./routes/auth.routes";
import facilityRoutes from "./routes/facility.routes";
import corporationRoutes from "./routes/corporation.routes";
import residentRoutes from "./routes/resident.routes";
import vitalRoutes from "./routes/vital.routes";
import shiftRoutes from "./routes/shift.routes";
import visitRoutes from "./routes/visit.routes";
import salaryRoutes from "./routes/salary.routes";
import notificationRoutes from "./routes/notification.routes";
import attendanceRoutes from "./routes/attendance.routes";
import diagnosisRoutes from "./routes/diagnosis.routes";
import carePlanRoutes from "./routes/carePlan.routes";
import medicationNoteRoutes from "./routes/medicationNote.routes";
import vitalAlertRoutes from "./routes/vitalAlert.routes";
import fileRoutes from "./routes/file.routes";
import alcoholCheckRoutes from "./routes/alcohol-check.routes";
import nurseAvailabilityRoutes from "./routes/nurseAvailability.routes";
import facilityShiftRequestRoutes from "./routes/facilityShiftRequest.routes";
import salarySettingRoutes from "./routes/salarySetting.routes";
import salaryCalculationRoutes from "./routes/salaryCalculation.routes";
import { errorHandler } from "./middlewares/error.middleware";
const openapiDocument = yaml.load("./openapi.yaml");

const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);
app.use(express.json());

// Register routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/facilities", facilityRoutes);
app.use("/api/corporations", corporationRoutes);
app.use("/api/residents", residentRoutes);
app.use("/api/vitals", vitalRoutes);
app.use("/api/shifts", shiftRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/salaries", salaryRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/diagnoses", diagnosisRoutes);
app.use("/api/care-plans", carePlanRoutes);
app.use("/api/medication-notes", medicationNoteRoutes);
app.use("/api/vital-alerts", vitalAlertRoutes);
app.use("/api/files", fileRoutes);
app.use("/api/alcohol-checks", alcoholCheckRoutes);
app.use("/api/nurse-availability", nurseAvailabilityRoutes);
app.use("/api/facility-shift-requests", facilityShiftRequestRoutes);
app.use("/api/salary-settings", salarySettingRoutes);
app.use("/api/salary-calculation", salaryCalculationRoutes);

app.get("/api/health", (req, res) => {
  res.json({ message: "API is running" });
});

app.use(errorHandler);

export default app;
