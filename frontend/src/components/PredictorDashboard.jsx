// components/PredictorDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';

const PredictorDashboard = ({ user }) => { 
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
    <div className="max-w-6xl mx-auto p-4 min-h-screen flex flex-col">
      
      <div className="flex-grow">
        
        {/* --- NEW NAVBAR --- */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900">RankMatrix Predictor</h1>
          
          {/* Signature Badge */}
          <div className="mt-3 sm:mt-0 text-sm tracking-widest text-gray-600 bg-gray-50 px-5 py-2 rounded-full border border-gray-200 shadow-sm">
            Made with 💛 by <span className="font-bold text-gray-900 font-serif">π</span>
          </div>
        </div>
        {/* ------------------ */}
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Form Panel */}
          <div className="bg-white p-6 rounded-lg shadow">
            <form onSubmit={fetchPredictions} className="space-y-4">
              <div>
                <label className="font-medium text-gray-700">JEE Mains Rank *</label>
                <input type="number" required className="w-full border rounded mt-1 p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={inputs.mainsRank} onChange={e => setInputs({...inputs, mainsRank: e.target.value})} />
              </div>
              
              <div>
                <label className="font-medium text-gray-700">JEE Advanced Rank (Optional)</label>
                <input type="number" className="w-full border rounded mt-1 p-2 focus:ring-2 focus:ring-blue-500 outline-none" 
                  value={inputs.advRank} onChange={e => setInputs({...inputs, advRank: e.target.value})} />
              </div>

              {/* Dropdowns for Category, Gender, Domicile go here */}
              
              <div className="flex flex-wrap gap-2 mb-4 pt-2">
                {['IIT', 'NIT', 'IIIT', 'GFTI'].map(type => (
                  <button 
                    key={type} type="button"
                    onClick={() => handleFilterToggle(type)}
                    className={`px-4 py-1.5 rounded text-sm font-medium transition-colors ${inputs.types.includes(type) ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {type}
                  </button>
                ))}
              </div>

              <button type="submit" className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white font-semibold py-2.5 rounded shadow">
                {loading ? 'Analyzing...' : 'Predict Colleges'}
              </button>
            </form>
          </div>

          {/* Results Panel */}
          <div className="md:col-span-2">
            {results.length > 0 ? (
              <div className="space-y-4">
                {results.map((college, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-lg shadow flex justify-between items-center border border-gray-100">
                    <div>
                      <h3 className="font-bold text-lg text-gray-800">{college.institute}</h3>
                      <p className="text-gray-600">{college.program} <span className="text-sm font-medium text-blue-600">({college.quota})</span></p>
                      <p className="text-sm text-gray-500 mt-1">Cutoff: <span className="font-semibold text-gray-700">{college.predictedClosingRank}</span></p>
                    </div>
                    <div className={`px-4 py-2 rounded text-white font-bold shadow-sm
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
              <div className="h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 p-10">
                <span className="text-4xl mb-3">🔍</span>
                <p className="font-medium text-lg">No Vectors Found</p>
                <p className="text-sm mt-1">Enter your ranks and select filters to see predictions.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictorDashboard;