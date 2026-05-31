const fs = require('fs');
const csv = require('csv-parser');

const inputFile = 'data.csv'; // Ensure this matches your CSV filename
const outputFile = 'average.json';

const branchData = new Map();

console.log("Starting extraction: 60/30/10 Algorithm + Decimal Fix...");

fs.createReadStream(inputFile)
  .pipe(csv())
  .on('data', (row) => {
    const year = parseInt(row['Year']);
    
    // We only care about the last 3 years for the 60/30/10 algorithm
    if (year < 2023 || year > 2025) return; 

    const uniqueKey = `${row['Institute']}|${row['Academic Program Name']}|${row['Seat Type']}|${row['Quota']}|${row['Gender']}`;

    if (!branchData.has(uniqueKey)) {
        // Detect College Type automatically based on the name
        let instituteType = 'GFTI';
        const name = row['Institute'].toLowerCase();
        
        if (name.includes('indian institute of technology') || name.includes('ism dhanbad')) {
            instituteType = 'IIT';
        } else if (name.includes('national institute of technology') || name.includes('shibpur')) {
            instituteType = 'NIT';
        } else if (name.includes('information technology')) {
            instituteType = 'IIIT';
        }

        branchData.set(uniqueKey, {
            institute: row['Institute'],
            type: instituteType,
            program: row['Academic Program Name'],
            category: row['Seat Type'],
            quota: row['Quota'],
            gender: row['Gender'],
            history: {
                2023: { r1: null, final: null },
                2024: { r1: null, final: null },
                2025: { r1: null, final: null }
            }
        });
    }

    const currentBranch = branchData.get(uniqueKey);
    const round = parseInt(row['Round']);
    
    let rawClosingRank = row['Closing Rank'];
    if (!rawClosingRank) return; 
    
    // THE DECIMAL FIX: Keep numbers AND decimal points so 66.0 doesn't become 660
    const cleanString = rawClosingRank.replace(/[^0-9.]/g, ''); 
    const cleanClosingRank = Math.round(parseFloat(cleanString));
    
    if (isNaN(cleanClosingRank)) return;

    // CAPTURE DATA: JoSAA had 6 rounds usually, but only 5 rounds in 2024
    if (round === 1) {
        currentBranch.history[year].r1 = cleanClosingRank;
    } else if ((year === 2024 && round === 5) || (year !== 2024 && round === 6)) {
        currentBranch.history[year].final = cleanClosingRank;
    }
  })
  .on('end', () => {
    console.log("CSV parsed. Applying 60/30/10 weighted algorithm...");
    const finalDatabaseArray = [];

    branchData.forEach((data, key) => {
        const final25 = data.history[2025].final;
        const final24 = data.history[2024].final;
        const final23 = data.history[2023].final;

        // If a branch didn't exist in 2025, it's defunct. Skip it.
        if (!final25) return; 

        let weightedRank = 0;

        // CORE ALGORITHM: 60% (2025), 30% (2024), 10% (2023)
        if (final25 && final24 && final23) {
            weightedRank = (0.60 * final25) + (0.30 * final24) + (0.10 * final23);
        } 
        // Fallback for branches created in 2024 (maintaining a 2:1 ratio)
        else if (final25 && final24 && !final23) {
            weightedRank = (0.67 * final25) + (0.33 * final24);
        } 
        // Fallback for brand new branches in 2025
        else if (final25 && !final24 && !final23) {
            weightedRank = final25;
        }

        const finalWeightedRank = Math.round(weightedRank);

        finalDatabaseArray.push({
            institute: data.institute,
            type: data.type,
            program: data.program,
            category: data.category,
            quota: data.quota,
            gender: data.gender,
            predictedClosingRank: finalWeightedRank, // The algorithm output
            round1_2025: data.history[2025].r1,      // Kept for reference
            finalRound_2025: final25                 // Kept for user trust
        });
    });

    // Write the pristine data to JSON
    fs.writeFileSync(outputFile, JSON.stringify(finalDatabaseArray, null, 2));
    console.log(`✅ Success! Wrote ${finalDatabaseArray.length} records to ${outputFile}`);
  });