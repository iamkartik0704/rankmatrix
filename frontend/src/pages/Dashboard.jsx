import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { API_BASE } from '../config';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable'; 

// --- DATA CONSTANTS ---
const INDIAN_STATES = [
  'Andaman and Nicobar Islands', 'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 
  'Chandigarh', 'Chhattisgarh', 'Dadra and Nagar Haveli', 'Delhi', 'Goa', 'Gujarat', 
  'Haryana', 'Himachal Pradesh', 'Jammu and Kashmir', 'Jharkhand', 'Karnataka', 'Kerala', 
  'Ladakh', 'Lakshadweep', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 
  'Mizoram', 'Nagaland', 'Odisha', 'Puducherry', 'Punjab', 'Rajasthan', 'Sikkim', 
  'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

const DETAILED_BRANCHES = [
  'Computer Science & Allied Branches', 'Electronics & Electrical Branches', 
  'Mechanical & Industrial Branches', 'Civil & Chemical', 'Architecture', 
  'Biotechnology, Biomedical & Biochemical', 'Aerospace & Aviation', 
  'Metallurgical, Materials & Mining', 'Mathematics, Computing & Data (Non-CSE)', 
  'Pure Sciences (Physics, Chemistry, Economics, Earth Sciences, etc.)', 
  'B.Tech + MBA / Management Dual Degrees'
];

const PROBABILITIES = ['High', 'Medium', 'Low'];
const COLLEGE_TYPES = ['IIT', 'NIT', 'IIIT', 'GFTI', 'Others', 'NIELIT', 'Central University'];
const DURATIONS = ['4 years', '5 years'];
const DEGREES = ['B.Tech', 'B.Sc + M.Sc', 'B.Tech + M.Tech', 'B.Tech + MBA', 'B.Des'];

// --- CUSTOM ATOMIC COMPONENTS ---
const PremiumDropdown = ({ label, value, options, onChange, subtitle }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="space-y-2 relative">
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label} {subtitle && <span className="text-gray-600 lowercase font-medium">{subtitle}</span>}
      </label>
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-black/40 border rounded-xl p-3.5 text-sm text-gray-200 cursor-pointer flex justify-between items-center transition-all duration-300 ${isOpen ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-black/60' : 'border-white/5 hover:border-white/10 hover:bg-black/50'}`}>
        <span className="truncate pr-4 font-medium">{options.find(opt => opt.value === value)?.label || 'Select...'}</span>
        <svg className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 max-h-60 overflow-y-auto custom-scrollbar">
          {options.map((option) => (
            <div key={option.value} onClick={() => { onChange(option.value); setIsOpen(false); }} className={`px-4 py-3 cursor-pointer text-sm transition-colors duration-150 flex items-center justify-between ${value === option.value ? 'bg-blue-500/10 text-blue-400 font-bold' : 'text-gray-400 hover:bg-white/5 hover:text-gray-200'}`}>
              {option.label}
              {value === option.value && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const SearchableMultiState = ({ label, selectedOptions, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const allOptions = ['Near My Domicile State', ...INDIAN_STATES];
  const filteredOptions = allOptions.filter(opt => opt.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleToggle = (option) => {
    if (selectedOptions.includes(option)) onChange(selectedOptions.filter(item => item !== option));
    else onChange([...selectedOptions, option]);
  };

  return (
    <div className="space-y-2 relative" ref={wrapperRef}>
      <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
      <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-black/40 border rounded-xl p-3.5 text-sm text-gray-200 cursor-pointer flex justify-between items-center transition-all duration-300 ${isOpen ? 'border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)] bg-black/60' : 'border-white/5 hover:border-white/10 hover:bg-black/50'}`}>
        <span className="truncate pr-4 font-medium">
          {selectedOptions.length === 0 ? 'Any State' : `${selectedOptions.length} State(s) Selected`}
        </span>
        <svg className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-400' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in duration-200">
          <div className="p-3 border-b border-white/5 bg-black/50">
            <div className="relative">
              <svg className="w-4 h-4 absolute left-3 top-2.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
              <input type="text" placeholder="Search state..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full bg-black border border-white/10 rounded-lg pl-9 pr-3 py-2 text-sm text-white outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>
          <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
            {filteredOptions.map((option) => (
              <label key={option} className="flex items-center space-x-3 px-3 py-2.5 hover:bg-white/5 rounded-lg cursor-pointer transition-colors group">
                <input type="checkbox" checked={selectedOptions.includes(option)} onChange={() => handleToggle(option)} className="w-4 h-4 rounded border-gray-600 bg-black text-blue-500 focus:ring-blue-500 focus:ring-offset-gray-900" />
                <span className={`text-sm ${selectedOptions.includes(option) ? 'text-white font-medium' : 'text-gray-400 group-hover:text-gray-200'}`}>{option}</span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PillGroup = ({ label, options, selected, onChange, useColors = false }) => (
  <div className="space-y-2.5 pt-1">
    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">{label}</label>
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const isSelected = selected.includes(opt);
        let colorClasses = 'bg-black/30 text-gray-500 border-white/5 hover:border-white/20 hover:text-gray-300';
        
        if (isSelected) {
          if (useColors) {
            if (opt === 'High') colorClasses = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.15)]';
            else if (opt === 'Medium') colorClasses = 'bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]';
            else if (opt === 'Low') colorClasses = 'bg-rose-500/10 text-rose-400 border-rose-500/50 shadow-[0_0_15px_rgba(225,29,72,0.15)]';
            else colorClasses = 'bg-blue-500/10 text-blue-400 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.15)]';
          } else {
            colorClasses = 'bg-white/10 text-white border-white/30 shadow-[0_0_15px_rgba(255,255,255,0.05)]';
          }
        }

        return (
          <button key={opt} type="button" onClick={() => {
            if (isSelected) onChange(selected.filter(item => item !== opt));
            else onChange([...selected, opt]);
          }} className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all duration-300 ${colorClasses}`}>
            {opt}
          </button>
        );
      })}
    </div>
  </div>
);

// --- MAIN COMPONENT ---
const Dashboard = ({ user }) => {
  const [inputs, setInputs] = useState(() => {
    const saved = localStorage.getItem('admitVector_inputs');
    const parsed = saved ? JSON.parse(saved) : {};
    return {
      mainsRank: parsed.mainsRank || '',
      advRank: parsed.advRank || '',
      category: parsed.category || 'OPEN',
      gender: parsed.gender || 'Gender-Neutral',
      domicileState: parsed.domicileState || 'Haryana',
      isPwd: parsed.isPwd || false, // Added PwD state initialization
      types: parsed.types || ['IIT', 'NIT', 'IIIT', 'GFTI'],
      probabilities: parsed.probabilities || [],
      durations: parsed.durations || [],
      degrees: parsed.degrees || [],
      targetStates: parsed.targetStates || [],
      detailedBranches: parsed.detailedBranches || []
    };
  });

  const [bookmarkedChoices, setBookmarkedChoices] = useState(() => {
    const saved = localStorage.getItem('admitVector_bookmarks');
    return saved ? JSON.parse(saved) : [];
  });

  const [comparedSeats, setComparedSeats] = useState([]);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('predictions'); 

  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [displayLimit, setDisplayLimit] = useState(25); 

  useEffect(() => {
    localStorage.setItem('admitVector_inputs', JSON.stringify(inputs));
  }, [inputs]);

  useEffect(() => {
    localStorage.setItem('admitVector_bookmarks', JSON.stringify(bookmarkedChoices));
  }, [bookmarkedChoices]);

  // --- NEW: PwD Toggle Logic ---
  const handlePwdToggle = (checked) => {
    setInputs((prev) => {
      // Strip any existing -PWD to avoid double appends (e.g., "SC-PWD-PWD")
      const baseCategory = prev.category.replace('-PWD', '');
      return {
        ...prev,
        isPwd: checked,
        category: checked ? `${baseCategory}-PWD` : baseCategory
      };
    });
  };

  const handleBranchToggle = (branch) => {
    setInputs(prev => ({
      ...prev,
      detailedBranches: prev.detailedBranches.includes(branch) ? prev.detailedBranches.filter(b => b !== branch) : [...prev.detailedBranches, branch]
    }));
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    setDisplayLimit(25); 
    
    try {
      const res = await axios.post(`${API_BASE}/api/predict`, {
        ...inputs,
        mainsRank: Number(inputs.mainsRank),
        advRank: inputs.advRank ? Number(inputs.advRank) : null
      });
      setResults(res.data.data);
    } catch (err) {
      console.error('Prediction request error:', err);
    }
    setLoading(false);
  };

  const generateUniqueId = (seat) => `${seat.institute}_${seat.program}_${seat.quota}`.replace(/\s+/g, '_');

  const toggleBookmark = (seat) => {
    const seatId = generateUniqueId(seat);
    const isBookmarked = bookmarkedChoices.some(b => generateUniqueId(b) === seatId);
    if (isBookmarked) {
      setBookmarkedChoices(prev => prev.filter(b => generateUniqueId(b) !== seatId));
    } else {
      setBookmarkedChoices(prev => [...prev, seat]);
    }
  };

  const moveChoiceOrder = (index, direction) => {
    const arrangedList = [...bookmarkedChoices];
    if (direction === 'up' && index > 0) {
      [arrangedList[index], arrangedList[index - 1]] = [arrangedList[index - 1], arrangedList[index]];
    } else if (direction === 'down' && index < arrangedList.length - 1) {
      [arrangedList[index], arrangedList[index + 1]] = [arrangedList[index + 1], arrangedList[index]];
    }
    setBookmarkedChoices(arrangedList);
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.setTextColor(30, 64, 175);
    doc.text("JEE College Predictor", 14, 22);
    
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Target Ledger - Counseling Strategy", 14, 30);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 38);
    doc.text(`JEE Mains Rank: ${inputs.mainsRank || 'N/A'} | JEE Adv Rank: ${inputs.advRank || 'N/A'} | Category: ${inputs.category} | State: ${inputs.domicileState}`, 14, 44);

    const tableColumn = ["Pref", "Institute", "Program", "Type", "Quota", "Exp. Cutoff", "Probability"];
    const tableRows = [];

    bookmarkedChoices.forEach((seat, index) => {
      const seatData = [
        index + 1,
        seat.institute,
        seat.program,
        seat.type,
        seat.quota,
        seat.predictedClosingRank?.toLocaleString() || 'N/A',
        seat.chanceScore
      ];
      tableRows.push(seatData);
    });

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255], fontStyle: 'bold' },
      alternateRowStyles: { fillColor: [245, 247, 250] },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45 },
        2: { cellWidth: 55 },
        3: { cellWidth: 12, halign: 'center' },
        4: { cellWidth: 12, halign: 'center' },
        5: { cellWidth: 20, halign: 'center' },
        6: { cellWidth: 18, halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 6) {
          if (data.cell.raw === 'High') data.cell.styles.textColor = [16, 185, 129];
          if (data.cell.raw === 'Medium') data.cell.styles.textColor = [245, 158, 11];
          if (data.cell.raw === 'Low') data.cell.styles.textColor = [225, 29, 72];
        }
      }
    });

    doc.save("JEE_College_Predictor_Ledger.pdf");
  };
    
  const toggleComparison = (seat) => {
    const seatId = generateUniqueId(seat);
    const isCompared = comparedSeats.some(c => generateUniqueId(c) === seatId);
    if (isCompared) {
      setComparedSeats(prev => prev.filter(c => generateUniqueId(c) !== seatId));
    } else {
      if (comparedSeats.length >= 3) return; 
      setComparedSeats(prev => [...prev, seat]);
    }
  };

  // --- Dynamic Category Options based on PwD State ---
  const categoryOptions = inputs.isPwd 
    ? [
        { label: 'OPEN-PWD', value: 'OPEN-PWD' },
        { label: 'OBC-NCL-PWD', value: 'OBC-NCL-PWD' },
        { label: 'SC-PWD', value: 'SC-PWD' },
        { label: 'ST-PWD', value: 'ST-PWD' },
        { label: 'EWS-PWD', value: 'EWS-PWD' }
      ]
    : [
        { label: 'OPEN', value: 'OPEN' },
        { label: 'OBC-NCL', value: 'OBC-NCL' },
        { label: 'SC', value: 'SC' },
        { label: 'ST', value: 'ST' },
        { label: 'EWS', value: 'EWS' }
      ];

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[#030712] p-4 sm:p-6 lg:p-10 font-sans text-gray-200 selection:bg-blue-500/30">
      
      {/* Background Ambience */}
      <div className="fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-900/10 blur-[120px]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-900/10 blur-[120px]"></div>
      </div>

      <div className="w-full max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 xl:gap-12 relative z-10">
        
        {/* Left Input Matrix */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0a0a0a]/80 backdrop-blur-2xl rounded-3xl border border-white/5 shadow-2xl h-[calc(100vh-120px)] sticky top-8 flex flex-col relative overflow-hidden">
          <div className="flex items-center gap-3 p-8 pb-6 flex-shrink-0 border-b border-white/5 relative z-10">
            <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">Input Matrix</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 pl-8 pb-32 pt-6 custom-scrollbar relative z-0">
            <form onSubmit={handleSearch} className="space-y-8 divide-y divide-white/5 pr-6">
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">JEE Mains Rank</label>
                    <input type="number" required className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all shadow-inner" value={inputs.mainsRank} onChange={e => setInputs({...inputs, mainsRank: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">JEE Adv Rank <span className="text-gray-600 font-medium lowercase">(Opt)</span></label>
                    <input type="number" className="w-full bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-3.5 text-sm font-medium text-white outline-none focus:border-blue-500/50 focus:bg-black/60 transition-all shadow-inner" value={inputs.advRank} onChange={e => setInputs({...inputs, advRank: e.target.value})} />
                  </div>
                </div>

                {/* --- NEW: PwD UI Checkbox properly styled for your Dark Theme --- */}
                <div className="bg-black/40 border border-white/5 hover:border-white/10 rounded-xl p-4 flex items-center transition-all duration-300">
                  <label className="flex items-center space-x-3 cursor-pointer w-full">
                    <div className="relative flex items-center justify-center">
                      <input 
                        type="checkbox" 
                        checked={inputs.isPwd} 
                        onChange={(e) => handlePwdToggle(e.target.checked)} 
                        className="peer appearance-none w-4 h-4 border border-gray-600 rounded-md bg-black checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer shadow-inner" 
                      />
                      <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </div>
                    <span className="text-sm font-medium text-gray-300">
                      Apply PwD Quota <span className="text-gray-500 text-xs">(Disability)</span>
                    </span>
                  </label>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <PremiumDropdown 
                    label="Category" 
                    value={inputs.category} 
                    onChange={(val) => setInputs({...inputs, category: val})} 
                    options={categoryOptions} // Dynamically fed options
                  />
                  <PremiumDropdown 
                    label="Seat Pool" 
                    value={inputs.gender} 
                    onChange={(val) => setInputs({...inputs, gender: val})} 
                    options={[{ label: 'Neutral', value: 'Gender-Neutral' }, { label: 'Female Only', value: 'Female-only' }]} 
                  />
                </div>
                <PremiumDropdown label="Domicile State" subtitle="(Home State Quota)" value={inputs.domicileState} onChange={(val) => setInputs({...inputs, domicileState: val})} options={INDIAN_STATES.map(s => ({label: s, value: s}))} />
              </div>

              <div className="space-y-6 pt-6">
                <SearchableMultiState label="College State Target" selectedOptions={inputs.targetStates} onChange={(val) => setInputs({...inputs, targetStates: val})} />
                <PillGroup label="Probability" options={PROBABILITIES} selected={inputs.probabilities} onChange={(val) => setInputs({...inputs, probabilities: val})} useColors={true} />
              </div>

              <div className="space-y-6 pt-6">
                <PillGroup label="College Type" options={COLLEGE_TYPES} selected={inputs.types} onChange={(val) => setInputs({...inputs, types: val})} />
                <PillGroup label="Course Duration" options={DURATIONS} selected={inputs.durations} onChange={(val) => setInputs({...inputs, durations: val})} />
                <PillGroup label="Degree" options={DEGREES} selected={inputs.degrees} onChange={(val) => setInputs({...inputs, degrees: val})} />
              </div>

              <div className="space-y-4 pt-6">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Academic Disciplines</label>
                <div className="space-y-1.5">
                  {DETAILED_BRANCHES.map(branch => (
                    <label key={branch} className={`flex items-start space-x-3 p-3 rounded-xl cursor-pointer transition-all duration-200 border ${inputs.detailedBranches.includes(branch) ? 'bg-blue-500/5 border-blue-500/20' : 'bg-transparent border-transparent hover:bg-white/5'}`}>
                      <div className="mt-0.5 relative flex items-center justify-center">
                        <input type="checkbox" checked={inputs.detailedBranches.includes(branch)} onChange={() => handleBranchToggle(branch)} className="peer appearance-none w-4 h-4 border border-gray-600 rounded-md bg-black checked:bg-blue-500 checked:border-blue-500 transition-all cursor-pointer" />
                        <svg className="absolute w-3 h-3 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                      <span className="text-sm leading-snug text-gray-400 peer-checked:text-blue-100 peer-checked:font-semibold">{branch}</span>
                    </label>
                  ))}
                </div>
              </div>
            </form>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full p-8 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/95 to-transparent pt-16 rounded-b-3xl pointer-events-none z-20">
            <button onClick={handleSearch} disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white text-sm font-black py-4.5 rounded-xl transition-all shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:-translate-y-0.5 flex justify-center items-center gap-2 pointer-events-auto h-14">
              {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Execute Analysis'}
            </button>
          </div>
        </div>

        {/* Right Tab Window Interface */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          
          {/* Dynamic Top Navigation Tabs */}
          <div className="flex border-b border-white/5 p-1 bg-black/20 rounded-xl max-w-md">
            <button onClick={() => setActiveTab('predictions')} className={`flex-1 text-center py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 ${activeTab === 'predictions' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
              Predictor Feed
            </button>
            <button onClick={() => setActiveTab('sandbox')} className={`flex-1 text-center py-2.5 text-xs font-black uppercase tracking-wider rounded-lg transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'sandbox' ? 'bg-white/10 text-white shadow-md' : 'text-gray-500 hover:text-gray-300'}`}>
              Target Ledger 
              {bookmarkedChoices.length > 0 && <span className="bg-emerald-500 text-white font-mono px-1.5 py-0.5 text-[10px] rounded-md shadow-sm">{bookmarkedChoices.length}</span>}
            </button>
          </div>

          {loading && (
            <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
              <div className="relative w-16 h-16">
                <div className="absolute inset-0 border-4 border-white/5 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-blue-400/80 font-bold tracking-widest uppercase text-xs animate-pulse">Computing Vectors...</p>
            </div>
          )}

          {/* TAB 1: ORIGINAL PREDICTIONS STREAM */}
          {!loading && activeTab === 'predictions' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              {results.length > 0 && (
                <div className="text-xs font-black uppercase tracking-widest text-gray-500 border-b border-white/5 pb-4 mb-2">
                  Displaying {Math.min(displayLimit, results.length)} of {results.length} vectors
                </div>
              )}

              {results.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[50vh] text-center">
                  <h3 className="text-gray-400 font-bold text-lg mb-1">{hasSearched ? 'No Vectors Found' : 'Awaiting Telemetry'}</h3>
                  <p className="text-gray-600 text-sm max-w-sm">Initialize parameters inside the input grid to compute admission bounds.</p>
                </div>
              )}

              {results.slice(0, displayLimit).map((seat, index) => {
                const isBookmarked = bookmarkedChoices.some(b => generateUniqueId(b) === generateUniqueId(seat));
                const isCompared = comparedSeats.some(c => generateUniqueId(c) === generateUniqueId(seat));
                const chanceColors = { High: 'border-l-emerald-500 text-emerald-400 bg-emerald-500/10 border-emerald-500/20', Medium: 'border-l-amber-500 text-amber-400 bg-amber-500/10 border-amber-500/20', Low: 'border-l-rose-500 text-rose-400 bg-rose-500/10 border-rose-500/20' }[seat.chanceScore];

                return (
                  <div key={index} className={`group bg-[#0a0a0a]/80 p-6 rounded-2xl border border-white/5 border-l-4 ${chanceColors.split(' ')[0]} hover:bg-[#111] transition-all duration-300 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-6 relative`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-[9px] font-black px-2.5 py-1 rounded bg-black border border-blue-500/20 text-blue-400">{seat.type}</span>
                        <span className="text-[10px] font-bold tracking-widest text-gray-500 uppercase">{seat.quota} Quota</span>
                      </div>
                      <h3 className="font-bold text-gray-100 text-lg mb-1 leading-tight">{seat.institute}</h3>
                      <p className="text-sm text-gray-400 font-medium max-w-2xl">{seat.program}</p>
                      
                      <div className="flex flex-wrap items-center gap-x-6 mt-4 text-xs bg-black/40 p-3 rounded-xl border border-white/5 inline-flex">
                        <div className="flex flex-col">
                          <span className="text-[9px] text-gray-500 font-black uppercase mb-0.5">Expected Cutoff</span>
                          <span className="text-white font-mono font-bold text-base">{seat.predictedClosingRank?.toLocaleString()}</span>
                        </div>
                        {seat.finalRound_2025 && (
                          <>
                            <div className="w-px h-6 bg-white/10"></div>
                            <div className="flex flex-col">
                              <span className="text-[9px] text-gray-500 font-black uppercase mb-0.5">2025 Cutoff</span>
                              <span className="text-gray-400 font-mono font-medium text-base">{seat.finalRound_2025.toLocaleString()}</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 min-w-[140px]">
                      <span className={`text-xs font-black px-4 py-2 rounded-xl text-center border w-full ${chanceColors.split(' ').slice(1).join(' ')}`}>
                        {seat.chanceScore} Chance
                      </span>
                      
                      <div className="flex gap-2 w-full">
                        <button onClick={() => toggleBookmark(seat)} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all flex items-center justify-center gap-1.5 ${isBookmarked ? 'bg-emerald-600 border-emerald-500 text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white'}`}>
                          {isBookmarked ? 'Saved' : 'Add Ledger'}
                        </button>
                        <button onClick={() => toggleComparison(seat)} disabled={!isCompared && comparedSeats.length >= 3} className={`flex-1 py-2 text-[10px] font-bold rounded-lg border transition-all ${isCompared ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-white/5 text-gray-400 hover:border-white/20 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed'}`}>
                          {isCompared ? 'Comparing' : 'Compare'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}

              {results.length > displayLimit && (
                <button onClick={() => setDisplayLimit(prev => prev + 25)} className="w-full py-4 bg-white/5 border border-white/5 hover:bg-white/10 rounded-xl font-bold text-sm text-gray-300 hover:text-white transition-all flex justify-center items-center gap-2 group h-14">
                  Load Next 25 Vectors
                </button>
              )}
            </div>
          )}

          {/* TAB 2: INTERACTIVE TARGET LEDGER */}
          {!loading && activeTab === 'sandbox' && (
            <div className="space-y-4 animate-in fade-in duration-300">
              <div className="flex justify-between items-end border-b border-white/5 pb-4 mb-2">
                <div>
                  <div className="text-xs font-black uppercase tracking-widest text-gray-500">Preference Sequence Grid</div>
                  <div className="text-gray-600 text-xs font-medium mt-1">Click arrows to modify priority weightings</div>
                </div>
                
                {bookmarkedChoices.length > 0 && (
                  <button onClick={handleExportPDF} className="bg-white/10 hover:bg-white/20 text-white border border-white/10 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg transition-all flex items-center gap-2">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    Export PDF
                  </button>
                )}
              </div>

              {bookmarkedChoices.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[40vh] text-center border border-dashed border-white/5 rounded-2xl bg-black/10 p-6">
                  <div className="text-2xl mb-2">📥</div>
                  <h3 className="text-gray-400 font-bold text-sm">Ledger Empty</h3>
                  <p className="text-gray-600 text-xs max-w-xs mt-1">Add high-probability rows from the main predictor panel to construct your strategic counseling layout here.</p>
                </div>
              )}

              {bookmarkedChoices.map((seat, index) => {
                const chanceColors = { High: 'border-l-emerald-500', Medium: 'border-l-amber-500', Low: 'border-l-rose-500' }[seat.chanceScore];
                return (
                  <div key={index} className={`bg-[#0a0a0a]/90 p-5 rounded-2xl border border-white/5 border-l-4 ${chanceColors} flex items-center justify-between gap-4`}>
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-xl bg-black border border-white/10 flex items-center justify-center text-sm font-mono font-bold text-emerald-400 flex-shrink-0 shadow-inner">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1 leading-tight mb-0.5">{seat.institute}</h4>
                        <p className="text-xs text-gray-400 line-clamp-1">{seat.program}</p>
                        <div className="flex gap-2 mt-1.5 text-[9px] font-black uppercase tracking-wider text-gray-500">
                          <span>{seat.type}</span>
                          <span>•</span>
                          <span>{seat.quota} Quota</span>
                          <span>•</span>
                          <span className="text-gray-400 font-mono font-medium">Cutoff: {seat.predictedClosingRank?.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => moveChoiceOrder(index, 'up')} disabled={index === 0} className="p-2 bg-black hover:bg-white/5 border border-white/5 rounded-lg text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 15l7-7 7 7"/></svg>
                      </button>
                      <button onClick={() => moveChoiceOrder(index, 'down')} disabled={index === bookmarkedChoices.length - 1} className="p-2 bg-black hover:bg-white/5 border border-white/5 rounded-lg text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/></svg>
                      </button>
                      <button onClick={() => toggleBookmark(seat)} className="p-2 bg-black/40 hover:bg-rose-950/20 border border-white/5 hover:border-rose-500/30 rounded-lg text-gray-500 hover:text-rose-400 transition-all ml-1">
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* --- FEATURE 4: FLOATING SIDE COMPARATIVE BAR --- */}
      {comparedSeats.length > 0 && (
        <div className="fixed bottom-6 right-6 z-40 bg-[#0a0a0a] border border-white/10 rounded-2xl p-4 shadow-2xl flex items-center gap-6 animate-in slide-in-from-bottom-8 duration-300">
          <div className="text-xs font-bold text-gray-400">
            Selected: <span className="text-white font-mono font-bold">{comparedSeats.length} / 3</span> vectors
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setComparedSeats([])} className="text-xs text-gray-500 hover:text-gray-300 font-bold uppercase tracking-wider">
              Clear
            </button>
            <button onClick={() => setIsCompareModalOpen(true)} className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-xs px-4 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-500/20">
              Launch Matrix Compare
            </button>
          </div>
        </div>
      )}

      {/* --- FEATURE 4: SIDE-BY-SIDE MATRIX OVERLAY MODAL --- */}
      {isCompareModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
          <div className="bg-[#0a0a0a] border border-white/10 rounded-3xl w-full max-w-5xl p-8 max-h-[85vh] overflow-y-auto custom-scrollbar shadow-2xl relative flex flex-col">
            
            <div className="flex justify-between items-center border-b border-white/5 pb-6 mb-6 flex-shrink-0">
              <div>
                <h3 className="text-xl font-black text-white">Versus Comparator</h3>
                <p className="text-xs text-gray-500 mt-0.5 font-medium">Side-by-side diagnostic array correlation mapping</p>
              </div>
              <button onClick={() => setIsCompareModalOpen(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-xl text-gray-400 hover:text-white transition-all border border-white/5">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>

            <div className="flex-1 grid gap-4 divide-y sm:divide-y-0 sm:divide-x divide-white/5 overflow-x-auto" style={{ gridTemplateColumns: `repeat(${comparedSeats.length}, minmax(240px, 1fr))` }}>
              {comparedSeats.map((seat, idx) => (
                <div key={idx} className="space-y-6 px-4 first:pl-0 last:pr-0 pt-4 sm:pt-0">
                  <div>
                    <span className="text-[9px] font-black px-2 py-0.5 rounded bg-black border border-blue-500/30 text-blue-400 mb-2 inline-block">{seat.type}</span>
                    <h4 className="font-bold text-gray-100 text-base leading-tight mb-1">{seat.institute}</h4>
                    <p className="text-xs text-gray-400 leading-normal">{seat.program}</p>
                  </div>
                  <div className="space-y-4 bg-black/20 p-4 rounded-xl border border-white/5">
                    <div>
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Expected Cutoff</div>
                      <div className="text-white font-mono font-bold text-lg">{seat.predictedClosingRank?.toLocaleString()}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-0.5">2025 Cutoff</div>
                      <div className="text-gray-300 font-mono font-medium text-sm">{seat.finalRound_2025?.toLocaleString() || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Admission Probability</div>
                      <div className={`text-xs font-black mt-1 inline-block px-2.5 py-1 rounded-md border ${seat.chanceScore === 'High' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : seat.chanceScore === 'Medium' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                        {seat.chanceScore} Margin
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-gray-500 font-black uppercase tracking-wider mb-0.5">Counseling Quota</div>
                      <div className="text-gray-400 text-xs font-medium mt-0.5">{seat.quota} Allocation</div>
                    </div>
                  </div>
                  <button onClick={() => toggleComparison(seat)} className="w-full py-2 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 text-xs font-bold rounded-xl transition-all">
                    Remove Column
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;