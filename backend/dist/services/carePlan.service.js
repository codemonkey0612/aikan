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
exports.deleteCarePlanItem = exports.updateCarePlanItem = exports.createCarePlanItem = exports.getCarePlanItemById = exports.getCarePlanItems = exports.deleteCarePlan = exports.updateCarePlan = exports.createCarePlan = exports.getCarePlansByResident = exports.getCarePlanById = exports.getAllCarePlans = void 0;
const CarePlanModel = __importStar(require("../models/carePlan.model"));
exports.getAllCarePlans = CarePlanModel.getAllCarePlans;
exports.getCarePlanById = CarePlanModel.getCarePlanById;
exports.getCarePlansByResident = CarePlanModel.getCarePlansByResident;
exports.createCarePlan = CarePlanModel.createCarePlan;
exports.updateCarePlan = CarePlanModel.updateCarePlan;
exports.deleteCarePlan = CarePlanModel.deleteCarePlan;
exports.getCarePlanItems = CarePlanModel.getCarePlanItems;
exports.getCarePlanItemById = CarePlanModel.getCarePlanItemById;
exports.createCarePlanItem = CarePlanModel.createCarePlanItem;
exports.updateCarePlanItem = CarePlanModel.updateCarePlanItem;
exports.deleteCarePlanItem = CarePlanModel.deleteCarePlanItem;
