const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();

// IMPORT YOUR MODEL HERE
// Replace './models/AverageModel' with the actual path to the Mongoose model you want to use for this data.
const TargetModel = require('./models/AverageModel'); 

const uploadData = async () => {
  try {
    console.log('🔗 Connecting to MongoDB...');
    // Make sure your .env file has your correct MONGO_URI
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected successfully.');

    console.log('📂 Reading average.json file...');
    // Ensure the path matches where your average.json file is located
    const rawData = fs.readFileSync('./average.json', 'utf-8');
    const jsonData = JSON.parse(rawData);

    console.log('🗑️ Optional: Clearing old data from the collection...');
    // Comment this out if you want to ADD to existing data instead of replacing it
    await TargetModel.deleteMany(); 

    console.log(`🚀 Injecting ${jsonData.length} records into MongoDB...`);
    await TargetModel.insertMany(jsonData);

    console.log('🎉 Data successfully pushed to MongoDB!');
    process.exit();
  } catch (error) {
    console.error('❌ Error pushing data:', error);
    process.exit(1);
  }
};

uploadData();