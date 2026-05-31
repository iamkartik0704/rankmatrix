import React from 'react';

const Navbar = ({ user, onLogout }) => {
  // Fallbacks just in case the Google auth object delays loading
  const userName = user?.name || 'kartik';
  const initial = userName.charAt(0).toLowerCase();

  return (
    <nav className="w-full flex justify-between items-center px-4 sm:px-6 lg:px-10 py-4 bg-[#0a0b10] border-b border-white/5 sticky top-0 z-50">
      
      {/* Left Side: Logo & Signature */}
      <div className="flex items-center gap-4">
        {/* Logo scales down slightly on mobile */}
        <div className="text-xl sm:text-2xl font-black tracking-tight">
          <span className="text-blue-500">Rank</span><span className="text-emerald-400">Matrix</span>
        </div>
        
        {/* The Signature Badge (Hidden on very small phones so it doesn't crowd the logo) */}
        <div className="hidden md:block px-3 py-1 bg-white/5 border border-white/10 rounded-full">
          <p className="text-xs tracking-wider text-gray-400">
            Made with <span className="text-yellow-500">💛</span> by <span className="font-bold text-gray-200">π</span>
          </p>
        </div>
      </div>
      
      {/* Right Side: User Controls */}
      <div className="flex items-center gap-3 sm:gap-5">
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Profile Avatar */}
          {user?.picture ? (
            <img src={user.picture} alt="Profile" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/10 shadow-sm" />
          ) : (
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#c026d3] flex items-center justify-center text-xs sm:text-sm font-bold text-white shadow-sm">
              {initial}
            </div>
          )}
          
          {/* Username (Hidden on tiny screens, visible on normal phones and up) */}
          <span className="hidden sm:block text-sm font-medium text-gray-200">
            {userName}
          </span>
        </div>

        {/* Logout Button */}
        <button 
          onClick={onLogout} 
          className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 rounded-md border border-white/10 transition-all duration-200"
        >
          Logout
        </button>
      </div>

    </nav>
  );
};

export default Navbar;