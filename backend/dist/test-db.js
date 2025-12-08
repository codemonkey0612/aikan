"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const db_1 = require("./config/db");
console.log("ENV CHECK:", {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    name: process.env.DB_NAME,
});
async function test() {
    try {
        const [rows] = await db_1.db.query("SELECT 1 + 1 AS result");
        console.log("DB Connected. Result:", rows);
    }
    catch (error) {
        console.error("DB Connection Failed:", error);
    }
}
test();
