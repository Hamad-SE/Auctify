const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://vbswubwfvbwadynklpfv.supabase.co";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZic3d1YndmdmJ3YWR5bmtscGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQxMzQ5NTMsImV4cCI6MjA3OTcxMDk1M30.9iTxfDVSnj8PJVtf_Q487-P6GRAEq4muxmxgvPdx8g0";

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log("Testing storage upload as anon...");
    const dummyContent = "dummy file content";
    const { data, error } = await supabase.storage
        .from('auction-images')
        .upload('test.txt', dummyContent, {
            contentType: 'text/plain'
        });

    console.log("Storage upload result:");
    console.log("Data:", data);
    console.log("Error:", error);
}

test();
