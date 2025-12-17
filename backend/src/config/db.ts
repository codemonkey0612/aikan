import dotenv from 'dotenv';
dotenv.config();
import { createPool } from 'mysql2/promise';

export const db = createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    // Return DATETIME and TIMESTAMP as strings without timezone conversion
    // This prevents MySQL from converting local time to UTC
    dateStrings: true,
    // Disable automatic type casting for dates to preserve original format
    typeCast: (field: any, next: any) => {
        // For DATETIME and TIMESTAMP fields, return as string without conversion
        if (field.type === 'DATETIME' || field.type === 'TIMESTAMP') {
            return field.string();
        }
        return next();
    },
});