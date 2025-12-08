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
exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getAllUsers = void 0;
const UserService = __importStar(require("../services/user.service"));
const pagination_validation_1 = require("../validations/pagination.validation");
const getAllUsers = async (req, res) => {
    // Check if pagination parameters are provided
    const hasPagination = req.query.page || req.query.limit;
    if (hasPagination) {
        // Paginated response
        const page = req.query.page ? Number(req.query.page) : 1;
        const limit = req.query.limit ? Number(req.query.limit) : 20;
        const sortBy = req.query.sortBy || "created_at";
        const sortOrder = req.query.sortOrder || "desc";
        const filters = {
            role: req.query.role,
            search: req.query.search,
        };
        const { data, total } = await UserService.getUsersPaginated(page, limit, sortBy, sortOrder, filters);
        const pagination = (0, pagination_validation_1.calculatePagination)(page, limit, total);
        res.json({
            data,
            pagination,
        });
    }
    else {
        // Non-paginated response (for backward compatibility)
        const users = await UserService.getAllUsers();
        res.json(users);
    }
};
exports.getAllUsers = getAllUsers;
const getUserById = async (req, res) => {
    const user = await UserService.getUserById(Number(req.params.id));
    res.json(user);
};
exports.getUserById = getUserById;
const createUser = async (req, res) => {
    try {
        // passwordフィールドをハッシュ化
        const { password, ...rest } = req.body;
        let hashedPassword = null;
        if (password) {
            const bcrypt = require("bcryptjs");
            hashedPassword = await bcrypt.hash(password, 10);
        }
        const created = await UserService.createUser({ ...rest, password: hashedPassword });
        res.json(created);
    }
    catch (error) {
        const status = error.status || 500;
        res.status(status).json({
            message: error.message || "ユーザーの作成に失敗しました",
        });
    }
};
exports.createUser = createUser;
const updateUser = async (req, res) => {
    const updated = await UserService.updateUser(Number(req.params.id), req.body);
    res.json(updated);
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    await UserService.deleteUser(Number(req.params.id));
    res.json({ message: "Deleted" });
};
exports.deleteUser = deleteUser;
