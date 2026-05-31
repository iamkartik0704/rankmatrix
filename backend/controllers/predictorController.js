// controllers/predictorController.js
const Cutoff = require('../models/Cutoff.js');

const EXACT_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Delhi', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

// --- SPATIAL & STATE MAPPING ENGINE ---
const getStateFromInstitute = (instituteName) => {
  const name = instituteName.toLowerCase();
  
  // Custom City Mappings for NITs/GFTIs that don't have the state in their name
  if (name.includes('kurukshetra')) return 'Haryana';
  if (name.includes('tiruchirappalli')) return 'Tamil Nadu';
  if (name.includes('warangal')) return 'Telangana';
  if (name.includes('surathkal')) return 'Karnataka';
  if (name.includes('rourkela') || name.includes('bhubaneswar')) return 'Odisha';
  if (name.includes('allahabad') || name.includes('motilal nehru')) return 'Uttar Pradesh';
  if (name.includes('calicut')) return 'Kerala';
  if (name.includes('jaipur') || name.includes('malaviya')) return 'Rajasthan';
  if (name.includes('nagpur') || name.includes('visvesvaraya')) return 'Maharashtra';
  if (name.includes('surat') || name.includes('sardar vallabhbhai') || name.includes('vadodara') || name.includes('diu')) return 'Gujarat';
  if (name.includes('bhopal') || name.includes('maulana azad')) return 'Madhya Pradesh';
  if (name.includes('durgapur')) return 'West Bengal';
  if (name.includes('silchar')) return 'Assam';
  if (name.includes('jalandhar') || name.includes('b r ambedkar')) return 'Punjab';
  if (name.includes('jamshedpur')) return 'Jharkhand';
  if (name.includes('patna')) return 'Bihar';
  if (name.includes('raipur')) return 'Chhattisgarh';
  if (name.includes('agartala')) return 'Tripura';
  if (name.includes('arunachal pradesh')) return 'Arunachal Pradesh';
  if (name.includes('delhi')) return 'Delhi';
  if (name.includes('goa')) return 'Goa';
  if (name.includes('hamirpur')) return 'Himachal Pradesh';
  if (name.includes('srinagar')) return 'Jammu and Kashmir';

  // Fallback: Check if the exact state name is anywhere in the institute string (Great for IIITs)
  for (let state of EXACT_STATES) {
      if (name.includes(state.toLowerCase())) {
          return state;
      }
  }
  
  return 'Unknown'; 
};

// Neighbor Map for "Near My Domicile State" logic
const getNeighborStates = (state) => {
    const map = {
        'Haryana': ['Punjab', 'Delhi', 'Uttar Pradesh', 'Rajasthan', 'Chandigarh', 'Himachal Pradesh'],
        'Delhi': ['Haryana', 'Uttar Pradesh'],
        'Maharashtra': ['Gujarat', 'Madhya Pradesh', 'Chhattisgarh', 'Telangana', 'Karnataka', 'Goa'],
        'Karnataka': ['Maharashtra', 'Goa', 'Kerala', 'Tamil Nadu', 'Andhra Pradesh', 'Telangana'],
        'Tamil Nadu': ['Kerala', 'Karnataka', 'Andhra Pradesh'],
        'Uttar Pradesh': ['Uttarakhand', 'Himachal Pradesh', 'Haryana', 'Delhi', 'Rajasthan', 'Madhya Pradesh', 'Chhattisgarh', 'Jharkhand', 'Bihar'],
        'Bihar': ['Uttar Pradesh', 'Jharkhand', 'West Bengal'],
        'West Bengal': ['Odisha', 'Jharkhand', 'Bihar', 'Sikkim', 'Assam'],
        'Rajasthan': ['Punjab', 'Haryana', 'Uttar Pradesh', 'Madhya Pradesh', 'Gujarat'],
        'Madhya Pradesh': ['Uttar Pradesh', 'Rajasthan', 'Gujarat', 'Maharashtra', 'Chhattisgarh'],
        'Chandigarh': ['Haryana', 'Punjab', 'Himachal Pradesh']
    };
    return map[state] || [];
};

// --- ADVANCED REGEX ENGINES ---
const getDetailedBranchRegex = (branches) => {
    if (!branches || branches.length === 0) return null;
    let regexParts = [];
    
    if (branches.includes('Computer Science & Allied Branches')) regexParts.push('computer|artificial|data science|software|machine learning|information technology|mathematics and computing');
    if (branches.includes('Electronics & Electrical Branches')) regexParts.push('electronic|electrical|communication|instrumentation|microelectronics');
    if (branches.includes('Mechanical & Industrial Branches')) regexParts.push('mechanical|mechatronics|production|manufacturing|industrial');
    if (branches.includes('Civil & Chemical')) regexParts.push('civil|chemical|polymer|ceramic');
    if (branches.includes('Architecture')) regexParts.push('architecture|planning');
    if (branches.includes('Biotechnology, Biomedical & Biochemical')) regexParts.push('bio|pharmaceutical');
    if (branches.includes('Aerospace & Aviation')) regexParts.push('aerospace|aeronautical|aviation');
    if (branches.includes('Metallurgical, Materials & Mining')) regexParts.push('metallurg|materials|mining');
    if (branches.includes('Mathematics, Computing & Data (Non-CSE)')) regexParts.push('mathematics|statistics');
    if (branches.includes('Pure Sciences (Physics, Chemistry, Economics, Earth Sciences, etc.)')) regexParts.push('physics|chemistry|economics|earth|pure science');
    if (branches.includes('B.Tech + MBA / Management Dual Degrees')) regexParts.push('mba|management');

    return new RegExp(regexParts.join('|'), 'i');
};

const getDurationRegex = (durations) => {
    if (!durations || durations.length === 0) return null;
    let regexParts = [];
    if (durations.includes('4 years')) regexParts.push('4 Years');
    if (durations.includes('5 years')) regexParts.push('5 Years');
    return new RegExp(regexParts.join('|'), 'i');
};

const getDegreeRegex = (degrees) => {
    if (!degrees || degrees.length === 0) return null;
    let regexParts = [];
    if (degrees.includes('B.Tech')) regexParts.push('Bachelor of Technology(?!.*Master)'); 
    if (degrees.includes('B.Sc + M.Sc')) regexParts.push('Bachelor of Science.*Master of Science');
    if (degrees.includes('B.Tech + M.Tech')) regexParts.push('Bachelor of Technology.*Master of Technology');
    if (degrees.includes('B.Tech + MBA')) regexParts.push('Master of Business Administration|Management');
    if (degrees.includes('B.Des')) regexParts.push('Bachelor of Design|B.Des');
    return new RegExp(regexParts.join('|'), 'i');
};

exports.getPredictions = async (req, res) => {
  try {
    const { 
        mainsRank, advRank, category, gender, domicileState, 
        types, detailedBranches, targetStates, probabilities, 
        durations, degrees 
    } = req.body;

    let query = {
      category: category,
      gender: gender,
      type: { $in: types }
    };

    const branchRegex = getDetailedBranchRegex(detailedBranches);
    const durationRegex = getDurationRegex(durations);
    const degreeRegex = getDegreeRegex(degrees);

    let programRegexes = [];
    if (branchRegex) programRegexes.push(branchRegex.source);
    if (durationRegex) programRegexes.push(durationRegex.source);
    if (degreeRegex) programRegexes.push(degreeRegex.source);

    if (programRegexes.length > 0) {
        const combinedRegex = programRegexes.map(r => `(?=.*(${r}))`).join('');
        query.program = { $regex: new RegExp(`^${combinedRegex}`, 'i') };
    }

    const potentialSeats = await Cutoff.find(query).lean();

    // THE FIX: Clean up the allowedStates array properly so the filter engages
    let finalAllowedStates = [];
    if (targetStates && targetStates.length > 0) {
        finalAllowedStates = [...targetStates];
        if (finalAllowedStates.includes('Near My Domicile State')) {
            // 1. Remove the placeholder string so it doesn't break the logic loop
            finalAllowedStates = finalAllowedStates.filter(s => s !== 'Near My Domicile State');
            // 2. Add the user's actual domicile state
            finalAllowedStates.push(domicileState);
            // 3. Add all the neighboring states
            finalAllowedStates.push(...getNeighborStates(domicileState));
        }
    }

    const evaluatedSeats = potentialSeats.map(seat => {
      const userRank = seat.type === 'IIT' ? advRank : mainsRank;
      if (!userRank) return null;

      const instituteState = getStateFromInstitute(seat.institute);

      // Quota Logic
      if (seat.type === 'NIT' || seat.type === 'GFTI') {
          if (seat.quota === 'HS' && instituteState !== domicileState) return null;
          if (seat.quota === 'OS' && instituteState === domicileState) return null;
      }

      // THE FIX: Strict State Target Filtering
      if (finalAllowedStates.length > 0 && !finalAllowedStates.includes(instituteState)) {
          return null; // Instantly drop colleges outside the target boundary
      }

      const closingRank = seat.predictedClosingRank;
      const margin = closingRank - userRank;
      const percentageDiff = (margin / closingRank) * 100;
      
      let chance = 'Unlikely';
      
      // --- DYNAMIC VOLATILITY SCALING ENGINE ---
      let mediumDrift, lowDrift;
      
      if (closingRank <= 5000) {
          // Top-Tier (Extreme rigidity. Example: IIT Bombay CS)
          mediumDrift = -2; // 2% stretch
          lowDrift = -5;    // 5% max stretch
      } else if (closingRank <= 15000) {
          // High-Tier (Slightly more flexible)
          mediumDrift = -4; 
          lowDrift = -8;    
      } else if (closingRank <= 35000) {
          // Mid-Tier (Standard volatility)
          mediumDrift = -7; 
          lowDrift = -15;   
      } else {
          // Lower-Tier (High volatility, heavily influenced by spot rounds)
          mediumDrift = -9; 
          lowDrift = -18;   
      }

      // Assigning the chance based on the dynamic thresholds
      if (margin >= 0) {
          chance = 'High';
      } else if (percentageDiff >= mediumDrift) {
          chance = 'Medium';
      } else if (percentageDiff >= lowDrift) {
          chance = 'Low';
      }

      if (chance === 'Unlikely') return null;

      if (probabilities && probabilities.length > 0 && !probabilities.includes(chance)) {
          return null; 
      }

      return {
        ...seat,
        userRankApplied: userRank,
        chanceScore: chance,
        margin: margin
      };
    }).filter(seat => seat !== null); 

    evaluatedSeats.sort((a, b) => a.predictedClosingRank - b.predictedClosingRank);

    res.status(200).json({ success: true, count: evaluatedSeats.length, data: evaluatedSeats });

  } catch (error) {
    console.error("Prediction Engine Error:", error);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
};