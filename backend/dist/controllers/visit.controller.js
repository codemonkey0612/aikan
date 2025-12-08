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
exports.deleteVisit = exports.updateVisit = exports.createVisit = exports.getVisitById = exports.getAllVisits = void 0;
const VisitService = __importStar(require("../services/visit.service"));
const pagination_validation_1 = require("../validations/pagination.validation");
const getAllVisits = async (req, res) => {
    // バリデーション済みクエリパラメータを使用（なければ元のqueryから取得）
    const validated = req.validatedQuery || req.query;
    // クエリパラメータからページネーション情報を取得
    const page = validated.page ? Number(validated.page) : 1;
    const limit = validated.limit ? Number(validated.limit) : 20;
    const sortBy = validated.sortBy || "visited_at";
    const sortOrder = validated.sortOrder || "desc";
    // フィルター
    const filters = {
        shift_id: req.query.shift_id ? Number(req.query.shift_id) : undefined,
        resident_id: req.query.resident_id, // VARCHAR(50)
        visited_from: req.query.visited_from,
        visited_to: req.query.visited_to,
    };
    const { data, total } = await VisitService.getVisitsPaginated(page, limit, sortBy, sortOrder, filters);
    const pagination = (0, pagination_validation_1.calculatePagination)(page, limit, total);
    res.json({
        data,
        pagination,
    });
};
exports.getAllVisits = getAllVisits;
const getVisitById = async (req, res) => {
    const visit = await VisitService.getVisitById(Number(req.params.id));
    res.json(visit);
};
exports.getVisitById = getVisitById;
const createVisit = async (req, res) => {
    const created = await VisitService.createVisit(req.body);
    res.status(201).json(created);
};
exports.createVisit = createVisit;
const updateVisit = async (req, res) => {
    const updated = await VisitService.updateVisit(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateVisit = updateVisit;
const deleteVisit = async (req, res) => {
    await VisitService.deleteVisit(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteVisit = deleteVisit;
