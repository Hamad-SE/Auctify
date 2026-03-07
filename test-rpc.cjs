const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!supabaseUrl || !supabaseKey) {
    console.error("Missing supabase env variables!");
    process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRPC() {
    console.log('Checking if delete_auction RPC exists by calling it with an invalid UUID...');
    const { data, error } = await supabase.rpc('delete_auction', {
        p_auction_id: '00000000-0000-0000-0000-000000000000'
    });

    console.log('Response DATA:', data);
    console.log('Response ERROR details:', JSON.stringify(error, null, 2));
}

checkRPC();
