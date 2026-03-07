const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://vbswubwfvbwadynklpfv.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZic3d1YndmdmJ3YWR5bmtscGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzQ5NTMsImV4cCI6MjA3OTcxMDk1M30.9iTxfDVSnj8PJVtf_Q487-P6GRAEq4muxmxgvPdx8g0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Signing up test user...");
    const email = `test+${Date.now()}@example.com`;
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password: 'password123',
        options: { data: { full_name: 'Test Setup User' } }
    });

    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    const user = authData.user;
    console.log("Signed up user:", user.id);

    console.log("Testing storage upload...");
    const dummyContent = "dummy image data";
    const fileName = `${Date.now()}-test.txt`;

    const { error: uploadError } = await supabase.storage
        .from('auction-images')
        .upload(fileName, dummyContent, { contentType: 'text/plain' });

    if (uploadError) {
        console.error("Storage upload error:", uploadError);
    } else {
        console.log("Storage upload success!");
    }

    console.log("Testing auction insert...");
    const { error: insertError } = await supabase
        .from('auctions')
        .insert({
            title: "Test Listing",
            description: "Test description",
            category: "other",
            starting_price: 10,
            current_price: 10,
            end_date: "2026-03-05",
            image_url: `https://example.com/${fileName}`,
            seller_id: user.id
        });

    if (insertError) {
        console.error("Auction Insert Error:", insertError);
    } else {
        console.log("Auction Insert Success!");
    }
}

test();
