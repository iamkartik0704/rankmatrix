import React from 'react';

const Navbar = ({ user, onLogout }) => {
  // Fallbacks just in case the Google auth object delays loading
  const userName = user?.name || 'kartik';
  const initial = userName.charAt(0).toLowerCase();

  return (
    <nav className="w-full flex justify-between items-center px-6 lg:px-10 py-4 bg-[#0a0b10] border-b border-white/5 sticky top-0 z-50">
      
      {/* Left Side: Logo */}
      <div className="text-2xl font-black tracking-tight">
        <span className="text-blue-500">Rank</span><span className="text-emerald-400">Matrix</span>
      </div>
      
      {/* Right Side: User Controls */}
      <div className="flex items-center gap-5">
        <div className="flex items-center gap-3">
          {/* Profile Avatar */}
          {user?.picture ? (
            <img src={user.picture} alt="Profile" className="w-8 h-8 rounded-full border border-white/10 shadow-sm" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#c026d3] flex items-center justify-center text-sm font-bold text-white shadow-sm">
              {initial}
            </div>
          )}
          
          {/* Username */}
          <span className="text-sm font-medium text-gray-200">
            {userName}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          className="px-4 py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-all duration-200"
        >
          Logout
        </button>
      </div>

    </nav>
  );
};

export default Navbar;