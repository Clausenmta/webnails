
const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

async function applyMigration() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    // Read our SQL file
    const sqlPath = path.join(__dirname, 'migrations', '20250423_create_get_expense_categories.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');

    // Execute the SQL
    await pool.query(sql);
    console.log('Migration applied successfully!');
  } catch (error) {
    console.error('Error applying migration:', error);
  } finally {
    await pool.end();
  }
}

applyMigration();
