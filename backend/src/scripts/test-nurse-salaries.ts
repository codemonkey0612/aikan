import { db } from "../config/db";

async function test() {
  try {
    const sql = `
      CREATE TABLE IF NOT EXISTS nurse_salaries (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        user_id BIGINT NOT NULL,
        year_month VARCHAR(7) NOT NULL,
        amount INT,
        created_at DATETIME,
        FOREIGN KEY (user_id) REFERENCES users(id),
        UNIQUE KEY unique_user_year_month (user_id, year_month)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `;
    
    await db.query(sql);
    console.log("✓ Table created successfully");
    await db.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === "ER_TABLE_EXISTS_ERROR" || error.errno === 1050) {
      console.log("⚠ Table already exists");
      await db.end();
      process.exit(0);
    } else {
      console.error("❌ Error:", error.message);
      if (error.sql) {
        console.error("SQL:", error.sql);
      }
      await db.end();
      process.exit(1);
    }
  }
}

test();

