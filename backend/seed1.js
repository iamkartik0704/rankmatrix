import dotenv from 'dotenv';
import mongoose from 'mongoose';
import fs from 'fs';
import cutoffSchema from './models/Cutoff.js'; // Important: You must include the .js extension for ES modules

dotenv.config(); // Loads MONGO_URI from your .env file

// Verify that the environment variable is loaded
if (!process.env.MONGO_URI) {
    console.error("❌ Error: MONGO_URI is not defined in your .env file.");
    process.exit(1);
}

// Read the parsed JSON data
const dataPath = './average.json'; // Ensure this points to your parsed data
let parsedData;

try {
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    parsedData = JSON.parse(rawData);
    console.log(`Loaded ${parsedData.length} records from ${dataPath}`);
} catch (error) {
    console.error("❌ Error reading average.json:", error.message);
    process.exit(1);
}

// Connect to MONGO and Seed
const seedDatabase = async () => {
    try {
        console.log("Connecting to MONGO...");
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MONGO Connected!");

        // Clear the existing collection to avoid duplicates
        console.log("Clearing old branch data...");
        await cutoffSchema.deleteMany();
        console.log("🗑️  Old data cleared.");

        // Insert the new data array
        console.log("Inserting new RankMatrix prediction vectors...");
        await cutoffSchema.insertMany(parsedData);
        console.log("🎉 Database successfully seeded with PwD categories!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Seeding Error:", error);
        process.exit(1);
    }
};

seedDatabase();