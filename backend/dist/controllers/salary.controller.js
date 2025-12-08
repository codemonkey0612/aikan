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
exports.deleteSalary = exports.updateSalary = exports.createSalary = exports.getSalaryById = exports.getAllSalaries = void 0;
const SalaryService = __importStar(require("../services/salary.service"));
const getAllSalaries = async (req, res) => {
    const salaries = await SalaryService.getAllSalaries();
    res.json(salaries);
};
exports.getAllSalaries = getAllSalaries;
const getSalaryById = async (req, res) => {
    const salary = await SalaryService.getSalaryById(Number(req.params.id));
    res.json(salary);
};
exports.getSalaryById = getSalaryById;
const createSalary = async (req, res) => {
    const created = await SalaryService.createSalary(req.body);
    res.status(201).json(created);
};
exports.createSalary = createSalary;
const updateSalary = async (req, res) => {
    const updated = await SalaryService.updateSalary(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateSalary = updateSalary;
const deleteSalary = async (req, res) => {
    await SalaryService.deleteSalary(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteSalary = deleteSalary;
