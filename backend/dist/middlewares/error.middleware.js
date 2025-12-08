"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
function errorHandler(err, _req, res, _next) {
    console.error("❌ Error:", err);
    // Handle validation errors
    if (err.name === "ValidationError") {
        return res.status(400).json({
            message: "Validation error",
            errors: err.errors,
        });
    }
    // Handle database errors
    if (err.code === "ER_DUP_ENTRY") {
        return res.status(400).json({
            message: "Duplicate entry",
            field: err.field,
        });
    }
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({
        message,
        ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    });
}
