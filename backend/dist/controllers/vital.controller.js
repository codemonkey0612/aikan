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
exports.deleteVital = exports.updateVital = exports.createVital = exports.getVitalById = exports.getAllVitals = void 0;
const VitalService = __importStar(require("../services/vital.service"));
const pagination_validation_1 = require("../validations/pagination.validation");
const getAllVitals = async (req, res) => {
    // バリデーション済みクエリパラメータを使用（なければ元のqueryから取得）
    const validated = req.validatedQuery || req.query;
    // クエリパラメータからページネーション情報を取得
    const page = validated.page ? Number(validated.page) : 1;
    const limit = validated.limit ? Number(validated.limit) : 20;
    const sortBy = validated.sortBy || "created_at";
    const sortOrder = validated.sortOrder || "desc";
    // フィルター
    const filters = {
        resident_id: req.query.resident_id, // VARCHAR(50)
        measured_from: req.query.measured_from,
        measured_to: req.query.measured_to,
        created_by: req.query.created_by ? Number(req.query.created_by) : undefined,
    };
    const { data, total } = await VitalService.getVitalsPaginated(page, limit, sortBy, sortOrder, filters);
    const pagination = (0, pagination_validation_1.calculatePagination)(page, limit, total);
    res.json({
        data,
        pagination,
    });
};
exports.getAllVitals = getAllVitals;
const getVitalById = async (req, res) => {
    const vital = await VitalService.getVitalById(Number(req.params.id));
    res.json(vital);
};
exports.getVitalById = getVitalById;
const createVital = async (req, res) => {
    const created = await VitalService.createVital(req.body);
    res.status(201).json(created);
};
exports.createVital = createVital;
const updateVital = async (req, res) => {
    const updated = await VitalService.updateVital(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateVital = updateVital;
const deleteVital = async (req, res) => {
    await VitalService.deleteVital(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteVital = deleteVital;
