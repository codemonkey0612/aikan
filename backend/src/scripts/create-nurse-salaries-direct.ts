import { db } from "../config/db";

async function createNurseSalariesTable() {
  try {
    const sql = `CREATE TABLE IF NOT EXISTS nurse_salaries (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT NOT NULL,
  year_month CHAR(7) NOT NULL,
  amount INT,
  created_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id),
  UNIQUE (user_id, year_month)
)`;
    
    await db.query(sql);
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
        console.error("SQL:", error.sql);
      }
      await db.end();
      process.exit(1);
    }
  }
}

createNurseSalariesTable();
