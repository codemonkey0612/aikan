import { readFileSync } from "fs";
import { join } from "path";
import { db } from "../config/db";

async function runMigration(filename: string) {
  try {
    const migrationPath = join(__dirname, "../migrations", filename);
    const sql = readFileSync(migrationPath, "utf-8");
    
    // SQL文を分割して実行（セミコロンで区切る）
    const statements = sql
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    for (const statement of statements) {
      if (statement) {
        await db.query(statement);
        console.log(`✓ Executed: ${statement.substring(0, 50)}...`);
      }
    }
    
    console.log(`✓ Migration ${filename} completed successfully`);
  } catch (error: any) {
    if (error.code === "ER_TABLE_EXISTS_ERROR") {
      console.log(`⚠ Table already exists, skipping ${filename}`);
    } else {
      console.error(`❌ Error running migration ${filename}:`, error.message);
      throw error;
    }
  }
}

async function main() {
  const migrationFile = process.argv[2];
  if (!migrationFile) {
    console.error("Usage: ts-node run-migration.ts <migration-file>");
    process.exit(1);
  }

  try {
    await runMigration(migrationFile);
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

main();

