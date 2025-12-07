import { db } from "../config/db";

async function createMissingTables() {
  try {
    console.log("Creating missing tables...");

    // Create nurse_availability table
    const createNurseAvailability = `
      CREATE TABLE IF NOT EXISTS \`nurse_availability\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`nurse_id\` VARCHAR(100) NOT NULL,
        \`year_month\` CHAR(7) NOT NULL,
        \`availability_data\` JSON NOT NULL,
        \`status\` ENUM('draft', 'submitted', 'approved') DEFAULT 'draft',
        \`submitted_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_nurse_id\` (\`nurse_id\`),
        INDEX \`idx_year_month\` (\`year_month\`),
        INDEX \`idx_status\` (\`status\`),
        UNIQUE KEY \`unique_nurse_month\` (\`nurse_id\`, \`year_month\`)
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `;

    await db.query(createNurseAvailability);
    console.log("✓ nurse_availability table created/verified");

    // Create facility_shift_requests table
    const createFacilityShiftRequests = `
      CREATE TABLE IF NOT EXISTS \`facility_shift_requests\` (
        \`id\` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        \`facility_id\` VARCHAR(50) NOT NULL,
        \`year_month\` CHAR(7) NOT NULL,
        \`request_data\` JSON NOT NULL,
        \`status\` ENUM('draft', 'submitted', 'scheduled') DEFAULT 'draft',
        \`submitted_at\` TIMESTAMP NULL,
        \`created_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        \`updated_at\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX \`idx_facility_id\` (\`facility_id\`),
        INDEX \`idx_year_month\` (\`year_month\`),
        INDEX \`idx_status\` (\`status\`),
        UNIQUE KEY \`unique_facility_month\` (\`facility_id\`, \`year_month\`)
      ) ENGINE=InnoDB
        DEFAULT CHARSET=utf8mb4
        COLLATE=utf8mb4_unicode_ci
    `;

    await db.query(createFacilityShiftRequests);
    console.log("✓ facility_shift_requests table created/verified");

    console.log("\n✅ All tables created successfully!");
    
    // Close the connection pool
    await db.end();
    process.exit(0);
  } catch (error: any) {
    console.error("❌ Error:", error.message);
    if (error.sql) {
      console.error("SQL:", error.sql);
    }
    await db.end();
    process.exit(1);
  }
}

createMissingTables();
