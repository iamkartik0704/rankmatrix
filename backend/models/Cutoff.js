// models/Cutoff.js
const mongoose = require('mongoose');

const cutoffSchema = new mongoose.Schema({
  institute: { type: String, required: true },
  type: { type: String, enum: ['IIT', 'NIT', 'IIIT', 'GFTI'], required: true },
  program: { type: String, required: true },
  category: { type: String, required: true },
  isPwd: { type: Boolean, default: false },
  gender: { type: String, required: true },
  quota: { type: String, required: true }, // 'AI', 'HS', 'OS'
  state: { type: String }, // e.g., 'Haryana', 'Bihar' - used for HS quota matching
  predictedClosingRank: { type: Number, required: true }, // The weighted rank we calculated earlier
  round1_2025: { type: Number },
  finalRound_2025: { type: Number }
});

cutoffSchema.index({ type: 1, category: 1, gender: 1 });
// module.exports = mongoose.model('Cutoff', cutoffSchema);
module.exports = mongoose.model('Cutoff', cutoffSchema, 'averages');