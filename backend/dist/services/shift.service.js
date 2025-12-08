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
exports.getShiftsPaginated = exports.deleteShift = exports.updateShift = exports.createShift = exports.getShiftById = exports.getAllShifts = void 0;
const ShiftModel = __importStar(require("../models/shift.model"));
const getAllShifts = () => ShiftModel.getAllShifts();
exports.getAllShifts = getAllShifts;
const getShiftById = (id) => ShiftModel.getShiftById(id);
exports.getShiftById = getShiftById;
const createShift = (data) => ShiftModel.createShift(data);
exports.createShift = createShift;
const updateShift = (id, data) => ShiftModel.updateShift(id, data);
exports.updateShift = updateShift;
const deleteShift = (id) => ShiftModel.deleteShift(id);
exports.deleteShift = deleteShift;
const getShiftsPaginated = (page, limit, sortBy, sortOrder, filters) => ShiftModel.getShiftsPaginated(page, limit, sortBy, sortOrder, filters);
exports.getShiftsPaginated = getShiftsPaginated;
