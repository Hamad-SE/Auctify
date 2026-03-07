import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config({ path: 'd:/Web Dev/auctify-bid-space-main/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    // Test authentication - since we don't have a user, let's just make a dummy user or check if inserting fails with what error
    console.log("Testing Supabase connection...");

    // Try to test the storage bucket upload directly as anon to see if bucket exists and auth fails
    // or test inserting into auctions

    // We cannot easily authenticate without a real user's email/password, 
    // but we can try an anon insert to see if it's an RLS issue or structural issue
    const { error: insertError } = await supabase
        .from('auctions')
        .insert({
            title: "Test",
            description: "Test description",
            category: "other",
            starting_price: 10,
            current_price: 10,
            end_date: "2026-03-05",
            image_url: "http://example.com/image.jpg",
            seller_id: "00000000-0000-0000-0000-000000000000" // fake uuid
        });

    console.log("Insert Error as anon:", insertError);
}

test();
