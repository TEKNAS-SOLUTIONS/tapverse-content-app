/**
 * Run Database Migration Script
 * Executes migration 007_add_business_types_to_clients.sql
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pkg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pkg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'tapverse_content',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    console.log('📄 Migration: 007_add_business_types_to_clients.sql');
    
    const migrationPath = path.join(__dirname, 'src/db/migrations/007_add_business_types_to_clients.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    await client.query('BEGIN');
    
    // Split by semicolons and execute each statement
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await client.query(statement);
          console.log(`✅ Executed: ${statement.substring(0, 60)}...`);
        } catch (error) {
          // Ignore "already exists" errors for IF NOT EXISTS statements
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Skipped (already exists): ${statement.substring(0, 60)}...`);
          } else {
            throw error;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    
    // Verify migration
    const result = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'clients' 
      AND column_name IN ('business_types', 'primary_business_type', 'location', 'shopify_url')
      ORDER BY column_name
    `);
    
    console.log('\n📊 Verification:');
    if (result.rows.length === 0) {
      console.log('  ⚠️  No new columns found. They may already exist.');
    } else {
      result.rows.forEach(row => {
        console.log(`  ✅ ${row.column_name}: ${row.data_type}`);
      });
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('\n🎉 Migration process completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Migration process failed:', error);
    process.exit(1);
  });

