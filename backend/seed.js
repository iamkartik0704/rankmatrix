// seed.js
const mongoose = require('mongoose');
const fs = require('fs');
require('dotenv').config();
const Cutoff = require('./models/Cutoff');

const seedDatabase = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI);
    
    console.log('Reading JSON file...');
    const rawData = fs.readFileSync('./data1.json', 'utf-8');
    const cutoffs = JSON.parse(rawData);

    console.log('Processing and adding Institute Types...');
    // We map through the data and dynamically add the missing 'type' field
    const processedCutoffs = cutoffs.map(item => {
      let instituteType = 'GFTI'; // Default to GFTI
      const name = item.institute.toLowerCase();

      if (name.includes('indian institute of technology') || name.includes('ism dhanbad')) {
        instituteType = 'IIT';
      } else if (name.includes('national institute of technology') || name.includes('shibpur')) {
        instituteType = 'NIT';
      } else if (name.includes('information technology')) {
        instituteType = 'IIIT';
      }

      return {
        ...item,
        type: instituteType
      };
    });

    console.log('Clearing old data...');
    await Cutoff.deleteMany(); 

    console.log(`Injecting ${processedCutoffs.length} records into the database...`);
    await Cutoff.insertMany(processedCutoffs);

    console.log('✅ Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();