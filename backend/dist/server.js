"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const dotenv_1 = __importDefault(require("dotenv"));
const redis_1 = require("./config/redis");
dotenv_1.default.config();
const PORT = process.env.PORT;
// Redis接続を確立
(0, redis_1.connectRedis)().catch((error) => {
    console.error("Failed to connect to Redis:", error);
});
app_1.default.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`);
});
