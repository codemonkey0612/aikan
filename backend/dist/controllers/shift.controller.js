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
exports.deleteShift = exports.updateShift = exports.createShift = exports.getShiftById = exports.getAllShifts = void 0;
const ShiftService = __importStar(require("../services/shift.service"));
const pagination_validation_1 = require("../validations/pagination.validation");
const getAllShifts = async (req, res) => {
    // バリデーション済みクエリパラメータを使用（なければ元のqueryから取得）
    const validated = req.validatedQuery || req.query;
    // クエリパラメータからページネーション情報を取得
    const page = validated.page ? Number(validated.page) : 1;
    const limit = validated.limit ? Number(validated.limit) : 20;
    const sortBy = validated.sortBy || "created_at";
    const sortOrder = validated.sortOrder || "desc";
    // フィルター
    const filters = {
        nurse_id: req.query.nurse_id, // VARCHAR(100)
        facility_id: req.query.facility_id, // VARCHAR(50)
        shift_period: req.query.shift_period,
        date_from: req.query.date_from,
        date_to: req.query.date_to,
    };
    // Debug logging
    console.log('[Shift Controller] Request query params:', req.query);
    console.log('[Shift Controller] Filters:', filters);
    const { data, total } = await ShiftService.getShiftsPaginated(page, limit, sortBy, sortOrder, filters);
    const pagination = (0, pagination_validation_1.calculatePagination)(page, limit, total);
    // Debug logging
    console.log('[Shift Controller] Response:', {
        dataCount: data.length,
        total,
        pagination
    });
    res.json({
        data,
        pagination,
    });
};
exports.getAllShifts = getAllShifts;
const getShiftById = async (req, res) => {
    const shift = await ShiftService.getShiftById(Number(req.params.id));
    res.json(shift);
};
exports.getShiftById = getShiftById;
const createShift = async (req, res) => {
    try {
        const created = await ShiftService.createShift(req.body);
        res.status(201).json(created);
    }
    catch (error) {
        console.error("Error creating shift:", error);
        const status = error.status || error.statusCode || 500;
        res.status(status).json({
            message: error.message || "シフトの作成に失敗しました",
            ...(process.env.NODE_ENV === "development" && { stack: error.stack }),
        });
    }
};
exports.createShift = createShift;
const updateShift = async (req, res) => {
    const updated = await ShiftService.updateShift(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateShift = updateShift;
const deleteShift = async (req, res) => {
    await ShiftService.deleteShift(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteShift = deleteShift;
