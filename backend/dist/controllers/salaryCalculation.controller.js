"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllSalaries = exports.calculateAndSaveSalary = exports.calculateNurseSalary = void 0;
const SalaryCalculationService = __importStar(require("../services/salaryCalculation.service"));
const SalaryService = __importStar(require("../services/salary.service"));
const UserModel = __importStar(require("../models/user.model"));
const calculateNurseSalary = async (req, res) => {
    try {
        const { nurse_id, year_month } = req.params;
        console.log("calculateNurseSalary called with:", { nurse_id, year_month });
        if (!nurse_id || !year_month) {
            return res.status(400).json({ error: "nurse_id and year_month are required" });
        }
        // Validate year_month format (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(year_month)) {
            return res.status(400).json({ error: "year_month must be in format YYYY-MM" });
        }
        const calculation = await SalaryCalculationService.calculateNurseSalary(nurse_id, year_month);
        res.json(calculation);
    }
    catch (error) {
        console.error("Error in calculateNurseSalary:", error);
        console.error("Error stack:", error.stack);
        res.status(500).json({
            error: error.message || "Failed to calculate salary",
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};
exports.calculateNurseSalary = calculateNurseSalary;
const calculateAndSaveSalary = async (req, res) => {
    try {
        const { nurse_id, year_month } = req.body;
        const user = req.user;
        if (!user) {
            return res.status(401).json({ error: "Unauthorized" });
        }
        if (!nurse_id || !year_month) {
            return res.status(400).json({ error: "nurse_id and year_month are required" });
        }
        // Validate year_month format (YYYY-MM)
        if (!/^\d{4}-\d{2}$/.test(year_month)) {
            return res.status(400).json({ error: "year_month must be in format YYYY-MM" });
        }
        // Get user_id from nurse_id
        // Normalize nurse_id for comparison
        const normalizedNurseId = String(nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
        const users = await UserModel.getAllUsers();
        const nurseUser = users.find((u) => {
            if (!u.nurse_id)
                return false;
            const userNurseId = String(u.nurse_id).trim().replace(/\r\n/g, '').replace(/\n/g, '').replace(/\r/g, '');
            return userNurseId === normalizedNurseId;
        });
        if (!nurseUser) {
            return res.status(404).json({ error: "Nurse not found" });
        }
        const salary = await SalaryCalculationService.calculateAndSaveSalary(nurseUser.id, normalizedNurseId, year_month);
        res.json(salary);
    }
    catch (error) {
        console.error("Error in calculateAndSaveSalary:", error);
        res.status(500).json({ error: error.message || "Failed to calculate and save salary" });
    }
};
exports.calculateAndSaveSalary = calculateAndSaveSalary;
const getAllSalaries = async (req, res) => {
    try {
        const filters = {
            user_id: req.query.user_id
                ? parseInt(req.query.user_id)
                : undefined,
            nurse_id: req.query.nurse_id ? String(req.query.nurse_id).trim() : undefined,
            year_month: req.query.year_month ? String(req.query.year_month).trim() : undefined,
        };
        const salaries = await SalaryService.getAllSalaries(filters);
        res.json({ data: salaries });
    }
    catch (error) {
        console.error("Error in getAllSalaries:", error);
        res.status(500).json({ error: error.message || "Failed to fetch salaries" });
    }
};
exports.getAllSalaries = getAllSalaries;
