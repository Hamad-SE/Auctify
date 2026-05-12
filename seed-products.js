import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: 'd:/Web Dev/auctify-bid-space-main/.env' });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
    console.log("Seeding products...");

    // Sign up a dummy user to authenticate
    const dummyEmail = `test_seller_${Date.now()}@example.com`;
    const dummyPassword = "Password123!";
    
    console.log("Signing up dummy user...");
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: dummyEmail,
        password: dummyPassword
    });

    if (authError) {
        console.error("Auth error:", authError);
        return;
    }

    const sellerId = authData.user.id;
    console.log("Authenticated as:", sellerId);

    const products = [
        {
            title: "2024 Veloce Phantom GTS",
            description: "A stunning luxury sports car featuring a V8 twin-turbo engine, carbon fiber bodywork, and a state-of-the-art aerodynamic design. Only 500 units produced globally.",
            category: "cars",
            starting_price: 150000,
            current_price: 155000,
            end_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "/images/luxury_car.png",
            seller_id: sellerId
        },
        {
            title: "Radiance Diamond Suite",
            description: "An exquisite diamond necklace and earrings set crafted in platinum. Features a breathtaking 5-carat center stone surrounded by flawless pavé diamonds.",
            category: "jewelry",
            starting_price: 45000,
            current_price: 46000,
            end_date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "/images/luxury_jewelry.png",
            seller_id: sellerId
        },
        {
            title: "Aether Pro X Smartphone",
            description: "The ultimate flagship device. Features a continuous edge-to-edge glass display, next-gen quantum processor, and a revolutionary triple-lens optic system.",
            category: "phones",
            starting_price: 1200,
            current_price: 1250,
            end_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "/images/luxury_phone.png",
            seller_id: sellerId
        },
        {
            title: "Zenith UltraBook Z1",
            description: "A masterclass in premium computing. Crafted from a single block of aerospace-grade aluminum, featuring a gorgeous 8K mini-LED display and exceptional battery life.",
            category: "electronics",
            starting_price: 2500,
            current_price: 2600,
            end_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
            image_url: "/images/luxury_laptop.png",
            seller_id: sellerId
        }
    ];

    for (const product of products) {
        const { error } = await supabase.from('auctions').insert(product);
        if (error) {
            console.error("Error inserting", product.title, ":", error);
        } else {
            console.log("Successfully inserted", product.title);
        }
    }

    console.log("Seeding complete.");
}

seed();
