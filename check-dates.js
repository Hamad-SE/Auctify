import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing Superbase URL or Key in .env");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAuctions() {
    const { data, error } = await supabase
        .from('auctions')
        .select('id, title, end_date')
        .order('created_at', { ascending: false })
        .limit(5);

    if (error) {
        console.error("Error fetching auctions:", error);
        return;
    }

    console.log("Current Time (Local):", new Date().toString());
    console.log("Current Time (UTC):", new Date().toISOString());
    console.log("---");

    for (const auction of data) {
        const endDate = new Date(auction.end_date);
        const hasEnded = new Date() > endDate;
        console.log(`Auction: ${auction.title}`);
        console.log(`End Date (DB raw): ${auction.end_date}`);
        console.log(`End Date (Local): ${endDate.toString()}`);
        console.log(`Has Ended? ${hasEnded ? 'YES (Chat Button Should Show)' : 'NO (Still Active)'}`);
        console.log('---');
    }
}

checkAuctions();
