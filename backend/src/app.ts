import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import yaml from "yamljs";
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
const openapiDocument = yaml.load("./openapi.yaml");


const app = express();

app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapiDocument));

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);
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
