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
exports.acknowledgeVitalAlertTrigger = exports.getVitalAlertTriggers = exports.deleteVitalAlert = exports.updateVitalAlert = exports.createVitalAlert = exports.getVitalAlertsByResident = exports.getVitalAlertById = exports.getAllVitalAlerts = exports.checkVitalAlerts = void 0;
const VitalAlertModel = __importStar(require("../models/vitalAlert.model"));
const VitalModel = __importStar(require("../models/vital.model"));
/**
 * バイタル記録をチェックして、アラートをトリガーする
 */
const checkVitalAlerts = async (vital_record_id) => {
    const vital = await VitalModel.getVitalById(vital_record_id);
    if (!vital || !vital.resident_id) {
        return [];
    }
    // 入居者のアクティブなアラート設定を取得
    const alerts = await VitalAlertModel.getVitalAlertsByResident(vital.resident_id);
    const triggeredAlerts = [];
    for (const alert of alerts) {
        let shouldTrigger = false;
        let measuredValue = null;
        switch (alert.alert_type) {
            case "SYSTOLIC_BP":
                measuredValue = vital.systolic_bp;
                if (measuredValue !== null) {
                    shouldTrigger =
                        (alert.min_value !== null && measuredValue < alert.min_value) ||
                            (alert.max_value !== null && measuredValue > alert.max_value);
                }
                break;
            case "DIASTOLIC_BP":
                measuredValue = vital.diastolic_bp;
                if (measuredValue !== null) {
                    shouldTrigger =
                        (alert.min_value !== null && measuredValue < alert.min_value) ||
                            (alert.max_value !== null && measuredValue > alert.max_value);
                }
                break;
            case "PULSE":
                measuredValue = vital.pulse;
                if (measuredValue !== null) {
                    shouldTrigger =
                        (alert.min_value !== null && measuredValue < alert.min_value) ||
                            (alert.max_value !== null && measuredValue > alert.max_value);
                }
                break;
            case "TEMPERATURE":
                measuredValue = vital.temperature;
                if (measuredValue !== null) {
                    shouldTrigger =
                        (alert.min_value !== null && measuredValue < alert.min_value) ||
                            (alert.max_value !== null && measuredValue > alert.max_value);
                }
                break;
            case "SPO2":
                measuredValue = vital.spo2;
                if (measuredValue !== null) {
                    shouldTrigger =
                        (alert.min_value !== null && measuredValue < alert.min_value) ||
                            (alert.max_value !== null && measuredValue > alert.max_value);
                }
                break;
        }
        if (shouldTrigger && measuredValue !== null) {
            const trigger = await VitalAlertModel.createVitalAlertTrigger(vital_record_id, alert.id, measuredValue);
            if (trigger) {
                triggeredAlerts.push(trigger);
            }
        }
    }
    return triggeredAlerts;
};
exports.checkVitalAlerts = checkVitalAlerts;
exports.getAllVitalAlerts = VitalAlertModel.getAllVitalAlerts;
exports.getVitalAlertById = VitalAlertModel.getVitalAlertById;
exports.getVitalAlertsByResident = VitalAlertModel.getVitalAlertsByResident;
exports.createVitalAlert = VitalAlertModel.createVitalAlert;
exports.updateVitalAlert = VitalAlertModel.updateVitalAlert;
exports.deleteVitalAlert = VitalAlertModel.deleteVitalAlert;
exports.getVitalAlertTriggers = VitalAlertModel.getVitalAlertTriggers;
exports.acknowledgeVitalAlertTrigger = VitalAlertModel.acknowledgeVitalAlertTrigger;
