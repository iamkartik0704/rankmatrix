// components/PredictorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const PredictorDashboard = ({ user }) => { // user passed down from OAuth login
  const [inputs, setInputs] = useState({
    mainsRank: '',
    advRank: '',
    category: 'OPEN',
    gender: 'Gender-Neutral',
    domicileState: 'Haryana',
    types: ['IIT', 'NIT', 'IIIT', 'GFTI']
  });

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFilterToggle = (type) => {
    setInputs(prev => ({
      ...prev,
      types: prev.types.includes(type) 
        ? prev.types.filter(t => t !== type)
        : [...prev.types, type]
    }));
  };

  const fetchPredictions = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure ranks are numbers
      const payload = {
        ...inputs,
        mainsRank: Number(inputs.mainsRank),
        advRank: inputs.advRank ? Number(inputs.advRank) : null
      };
      
      const res = await axios.post('/api/predict', payload);
      setResults(res.data.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">RankMatrix Predictor</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Form Panel */}
        <div className="bg-white p-6 rounded-lg shadow">
          <form onSubmit={fetchPredictions} className="space-y-4">
            <div>
              <label>JEE Mains Rank *</label>
              <input type="number" required className="w-full border p-2" 
                value={inputs.mainsRank} onChange={e => setInputs({...inputs, mainsRank: e.target.value})} />
            </div>
            
            <div>
              <label>JEE Advanced Rank (Optional)</label>
              <input type="number" className="w-full border p-2" 
                value={inputs.advRank} onChange={e => setInputs({...inputs, advRank: e.target.value})} />
            </div>

            {/* Dropdowns for Category, Gender, Domicile go here */}
            
            <div className="flex gap-2 mb-4">
              {['IIT', 'NIT', 'IIIT', 'GFTI'].map(type => (
                <button 
                  key={type} type="button"
                  onClick={() => handleFilterToggle(type)}
                  className={`px-3 py-1 rounded ${inputs.types.includes(type) ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  {type}
                </button>
              ))}
            </div>

            <button type="submit" className="w-full bg-green-600 text-white py-2 rounded">
              {loading ? 'Analyzing...' : 'Predict Colleges'}
            </button>
          </form>
        </div>

        {/* Results Panel */}
        <div className="md:col-span-2">
          {results.length > 0 ? (
            <div className="space-y-4">
              {results.map((college, idx) => (
                <div key={idx} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-lg">{college.institute}</h3>
                    <p className="text-gray-600">{college.program} ({college.quota})</p>
                    <p className="text-sm">Cutoff: {college.predictedClosingRank}</p>
                  </div>
                  <div className={`px-4 py-2 rounded text-white font-bold
                    ${college.chanceScore === 'High' ? 'bg-green-500' 
                    : college.chanceScore === 'Medium' ? 'bg-yellow-500' 
                    : 'bg-red-500'}`}
                  >
                    {college.chanceScore}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 mt-10">Enter your ranks to see predictions.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictorDashboard;