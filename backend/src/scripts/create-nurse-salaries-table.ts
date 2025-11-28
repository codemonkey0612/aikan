import { db } from "../config/db";

async function createNurseSalariesTable() {
  try {
    // テーブル作成（基本構造のみ、1行で記述）
    await db.query("CREATE TABLE IF NOT EXISTS nurse_salaries (id BIGINT PRIMARY KEY AUTO_INCREMENT, user_id BIGINT NOT NULL, year_month TEXT NOT NULL, amount INT, created_at DATETIME)");
    
    // 外部キー制約を追加（既に存在する場合はスキップ）
    try {
      await db.query("ALTER TABLE nurse_salaries ADD CONSTRAINT fk_nurse_salaries_user FOREIGN KEY (user_id) REFERENCES users(id)");
    } catch (e: any) {
      if (e.code !== "ER_DUP_KEY" && e.errno !== 1022 && e.errno !== 1215) {
        console.log("Note: Foreign key constraint may already exist");
      }
    }
    
    // UNIQUE制約を追加（既に存在する場合はスキップ）
    try {
      await db.query("ALTER TABLE nurse_salaries ADD UNIQUE KEY unique_user_year_month (user_id, year_month)");
    } catch (e: any) {
      if (e.code !== "ER_DUP_KEY" && e.errno !== 1061 && e.errno !== 1062) {
        console.log("Note: Unique constraint may already exist");
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
        console.error("Full SQL:", error.sql);
      }
      await db.end();
      process.exit(1);
    }
  }
}

createNurseSalariesTable();

