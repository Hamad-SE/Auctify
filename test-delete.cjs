const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase env variables!");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function testDelete() {
    console.log('Testing delete operation to see detailed DB error...');

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
    console.log('Attempting to delete auction:', auction.id, 'with title:', auction.title);

    const { data, error } = await supabase.rpc('delete_auction', {
        p_auction_id: auction.id
    });

    console.log('Response DATA:', data);
    console.log('Response ERROR:', error);
}

testDelete();
