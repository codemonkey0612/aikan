import { db } from "../config/db";

async function createNurseSalariesTable() {
  try {
    // テーブル作成（基本構造のみ）
    await db.query(`
      CREATE TABLE IF NOT EXISTS nurse_salaries (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        year_month VARCHAR(7) NOT NULL,
        amount INT,
        created_at DATETIME
      )
    `);
    
    // 外部キー制約を追加
    try {
      await db.query(`
        ALTER TABLE nurse_salaries 
        ADD CONSTRAINT fk_nurse_salaries_user 
        FOREIGN KEY (user_id) REFERENCES users(id)
      `);
    } catch (e: any) {
      if (e.errno !== 1022 && e.errno !== 1215 && e.code !== "ER_DUP_KEY") {
        console.log("Note: Foreign key may already exist or error:", e.message);
      }
    }
    
    // UNIQUE制約を追加
    try {
      await db.query(`
        ALTER TABLE nurse_salaries 
        ADD UNIQUE KEY unique_user_year_month (user_id, year_month)
      `);
    } catch (e: any) {
      if (e.errno !== 1061 && e.errno !== 1062 && e.code !== "ER_DUP_KEY") {
        console.log("Note: Unique constraint may already exist or error:", e.message);
      }
    }
    
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
        console.error("SQL:", error.sql.substring(0, 200));
      }
      await db.end();
      process.exit(1);
    }
  }
}

createNurseSalariesTable();

