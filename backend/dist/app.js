"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const yamljs_1 = __importDefault(require("yamljs"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const facility_routes_1 = __importDefault(require("./routes/facility.routes"));
const corporation_routes_1 = __importDefault(require("./routes/corporation.routes"));
const resident_routes_1 = __importDefault(require("./routes/resident.routes"));
const vital_routes_1 = __importDefault(require("./routes/vital.routes"));
const shift_routes_1 = __importDefault(require("./routes/shift.routes"));
const visit_routes_1 = __importDefault(require("./routes/visit.routes"));
const salary_routes_1 = __importDefault(require("./routes/salary.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const attendance_routes_1 = __importDefault(require("./routes/attendance.routes"));
const diagnosis_routes_1 = __importDefault(require("./routes/diagnosis.routes"));
const carePlan_routes_1 = __importDefault(require("./routes/carePlan.routes"));
const medicationNote_routes_1 = __importDefault(require("./routes/medicationNote.routes"));
const vitalAlert_routes_1 = __importDefault(require("./routes/vitalAlert.routes"));
const file_routes_1 = __importDefault(require("./routes/file.routes"));
const alcohol_check_routes_1 = __importDefault(require("./routes/alcohol-check.routes"));
const nurseAvailability_routes_1 = __importDefault(require("./routes/nurseAvailability.routes"));
const facilityShiftRequest_routes_1 = __importDefault(require("./routes/facilityShiftRequest.routes"));
const salarySetting_routes_1 = __importDefault(require("./routes/salarySetting.routes"));
const salaryCalculation_routes_1 = __importDefault(require("./routes/salaryCalculation.routes"));
const error_middleware_1 = require("./middlewares/error.middleware");
const openapiDocument = yamljs_1.default.load("./openapi.yaml");
const app = (0, express_1.default)();
app.use("/docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(openapiDocument));
// Configure CORS to allow multiple origins
const allowedOrigins = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
    : ["http://localhost:5173", "https://aikan-system.com"];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express_1.default.json());
// Register routes
app.use("/api/auth", auth_routes_1.default);
app.use("/api/users", user_routes_1.default);
app.use("/api/facilities", facility_routes_1.default);
app.use("/api/corporations", corporation_routes_1.default);
app.use("/api/residents", resident_routes_1.default);
app.use("/api/vitals", vital_routes_1.default);
app.use("/api/shifts", shift_routes_1.default);
app.use("/api/visits", visit_routes_1.default);
app.use("/api/salaries", salary_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api/attendance", attendance_routes_1.default);
app.use("/api/diagnoses", diagnosis_routes_1.default);
app.use("/api/care-plans", carePlan_routes_1.default);
app.use("/api/medication-notes", medicationNote_routes_1.default);
app.use("/api/vital-alerts", vitalAlert_routes_1.default);
app.use("/api/files", file_routes_1.default);
app.use("/api/alcohol-checks", alcohol_check_routes_1.default);
app.use("/api/nurse-availability", nurseAvailability_routes_1.default);
app.use("/api/facility-shift-requests", facilityShiftRequest_routes_1.default);
app.use("/api/salary-settings", salarySetting_routes_1.default);
app.use("/api/salary-calculation", salaryCalculation_routes_1.default);
app.get("/api/health", (req, res) => {
    res.json({ message: "API is running" });
});
app.use(error_middleware_1.errorHandler);
exports.default = app;
