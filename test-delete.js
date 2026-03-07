// test-delete.js
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    console.log('Testing delete operation to see detailed DB error...');

    // First, let's login as a test user or just fetch one auction to see if we can delete it
    // Without auth, delete will fail if RLS is on, so we need to sign in

    // Actually, we can just inspect the policies if we use the service role key, but we don't have it.

    console.log('Fetching an auction...');
    const { data: auctions, error: fetchErr } = await supabase.from('auctions').select('*').limit(1);
    if (fetchErr) {
        console.error('Fetch error:', fetchErr);
        return;
    }

    if (!auctions || auctions.length === 0) {
        console.log('No auctions found to test.');
        return;
    }

    const auction = auctions[0];
    console.log('Attempting to delete auction:', auction.id);

    const { data, error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', auction.id)
        .select();

    console.log('Response DATA:', data);
    console.log('Response ERROR:', error);
}

testDelete();
