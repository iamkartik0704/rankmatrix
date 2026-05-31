const mongoose = require('mongoose');

const averageSchema = new mongoose.Schema({
  institute: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ['IIT', 'NIT', 'IIIT', 'GFTI'] // Protects your filter buttons
  },
  program: { 
    type: String, 
    required: true 
  },
  category: { 
    type: String, 
    required: true 
  },
  quota: { 
    type: String, 
    required: true 
  },
  gender: { 
    type: String, 
    required: true 
  },
  predictedClosingRank: { 
    type: Number, 
    required: true 
  },
  round1_2025: { 
    type: Number 
  },
  finalRound_2025: { 
    type: Number, 
    required: true 
  }
}, { 
  timestamps: true 
});

module.exports = mongoose.model('Average', averageSchema);