import { db } from "../config/db";
import { readFileSync } from "fs";
import { join } from "path";

async function createNurseSalariesTable() {
  try {
    // テーブル作成（基本構造のみ、制約は後から追加）
    await db.query("CREATE TABLE IF NOT EXISTS nurse_salaries (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, year_month VARCHAR(7) NOT NULL, amount INT, created_at DATETIME)");
    
    console.log("✓ nurse_salaries table created successfully");
    await db.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === "ER_TABLE_EXISTS_ERROR" || error.errno === 1050) {
      console.log("⚠ nurse_salaries table already exists");
      await db.end();
      process.exit(0);
    } else {
      console.error("❌ Error creating nurse_salaries table:", error.message);
      if (error.sql) {
        console.error("SQL:", error.sql.substring(0, 300));
      }
      await db.end();
      process.exit(1);
    }
  }
}

createNurseSalariesTable();

