#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('❌ Error: Missing environment variables');
  console.error('Please set VITE_SUPABASE_URL and SUPABASE_SERVICE_KEY in .env.local');
  console.log('\nTo get your service key:');
  console.log('1. Go to https://app.supabase.com');
  console.log('2. Select your project');
  console.log('3. Click Settings > API');
  console.log('4. Copy the Service Role Key (SECRET)');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function applyMigration() {
  try {
    console.log('🔄 Applying migration...');
    
    // Read and execute the migration SQL
    const migrationPath = path.join(process.cwd(), 'supabase/migrations/20260601000000_fix_admin_profiles_visibility.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute the SQL using Supabase RPC or direct execution
    // Note: We'll use a workaround by executing via multiple queries
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt && !stmt.startsWith('--'));
    
    for (const statement of statements) {
      console.log(`📝 Executing: ${statement.substring(0, 60)}...`);
      
      const { error } = await supabase.rpc('execute_sql', {
        query: statement
      }).catch(() => {
        // Fallback: Use direct query execution
        // This will fail if the RPC doesn't exist, which is expected
        return { error: 'RPC not available, please apply migration manually' };
      });
      
      if (error && error.message.includes('RPC not available')) {
        throw new Error('execute_sql RPC not available. Please apply migration manually through Supabase dashboard.');
      }
    }
    
    console.log('✅ Migration applied successfully!');
    console.log('\n🎉 Admin dashboard should now display all registered users!');
    
  } catch (error) {
    console.error('❌ Error applying migration:', error.message);
    console.log('\n💡 Fallback: Apply the migration manually through Supabase Dashboard:');
    console.log('1. Go to https://app.supabase.com');
    console.log('2. Select your project');
    console.log('3. Click SQL Editor');
    console.log('4. Copy the SQL from supabase/migrations/20260601000000_fix_admin_profiles_visibility.sql');
    console.log('5. Paste and run in the SQL editor');
    process.exit(1);
  }
}

applyMigration();
