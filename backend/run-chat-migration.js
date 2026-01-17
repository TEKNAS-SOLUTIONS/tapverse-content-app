/**
 * Run Chat System Database Migration
 * Executes migration 013_chat_system.sql
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
    console.log('📄 Migration: 013_chat_system.sql');
    
    const migrationPath = path.join(__dirname, 'src/db/migrations/013_chat_system.sql');
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
          console.log(`✅ Executed statement successfully`);
        } catch (error) {
          // Ignore "already exists" errors for IF NOT EXISTS statements
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Skipped (already exists): ${error.message.substring(0, 80)}`);
          } else {
            throw error;
          }
        }
      }
    }
    
    await client.query('COMMIT');
    console.log('\n✅ Migration completed successfully!');
    
    // Verify migration - check if tables exist
    const tables = ['chat_conversations', 'chat_messages', 'chat_message_summaries', 'client_knowledge_base', 'admin_insights'];
    console.log('\n📊 Verification:');
    
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_name = $1
        );
      `, [table]);
      
      if (result.rows[0].exists) {
        console.log(`  ✅ Table '${table}' exists`);
      } else {
        console.log(`  ❌ Table '${table}' NOT found`);
      }
    }
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Migration failed:', error.message);
    console.error(error);
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
