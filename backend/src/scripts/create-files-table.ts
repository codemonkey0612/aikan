import { db } from "../config/db";

async function createFilesTable() {
  try {
    await db.query(`
      CREATE TABLE IF NOT EXISTS files (
        id BIGINT PRIMARY KEY AUTO_INCREMENT,
        file_name VARCHAR(255) NOT NULL,
        original_name VARCHAR(255) NOT NULL,
        file_path VARCHAR(500) NOT NULL,
        file_type VARCHAR(100) NOT NULL,
        file_size BIGINT NOT NULL,
        mime_type VARCHAR(100),
        category ENUM('RESIDENT_IMAGE', 'PROFILE_AVATAR', 'SHIFT_REPORT', 'SALARY_STATEMENT', 'CARE_NOTE_ATTACHMENT') NOT NULL,
        entity_type VARCHAR(50) NOT NULL,
        entity_id BIGINT NOT NULL,
        uploaded_by BIGINT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL,
        INDEX idx_category (category),
        INDEX idx_entity (entity_type, entity_id),
        INDEX idx_uploaded_by (uploaded_by)
      )
    `);
    
    console.log("✓ files table created successfully");
    await db.end();
    process.exit(0);
  } catch (error: any) {
    if (error.code === "ER_TABLE_EXISTS_ERROR" || error.errno === 1050) {
      console.log("⚠ files table already exists");
      await db.end();
      process.exit(0);
    } else {
      console.error("❌ Error creating files table:", error.message);
      if (error.sql) {
        console.error("Full SQL:", error.sql);
      }
      await db.end();
      process.exit(1);
    }
  }
}

createFilesTable();

