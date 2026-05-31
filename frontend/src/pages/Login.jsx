import React, { useState, useEffect } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

const Login = ({ onLoginSuccess }) => {
  const phrases = [
    "Data-backed analysis for JoSAA aspirants.",
    "Predict your dream IIT, NIT, or IIIT.",
    "Calculate cutoffs with mathematical precision.",
    "Navigate counseling with absolute confidence."
  ];
  
  const [text, setText] = useState('');
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const currentPhrase = phrases[phraseIndex];
    const typingSpeed = isDeleting ? 30 : 50;

    const timeout = setTimeout(() => {
      if (!isDeleting && text === currentPhrase) {
        setTimeout(() => setIsDeleting(true), 2000);
      } else if (isDeleting && text === '') {
        setIsDeleting(false);
        setPhraseIndex((prev) => (prev + 1) % phrases.length);
      } else {
        setText(currentPhrase.substring(0, text.length + (isDeleting ? -1 : 1)));
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [text, isDeleting, phraseIndex]);

  const handleCredentialResponse = (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const userData = {
        name: decoded.name,
        email: decoded.email,
        picture: decoded.picture,
        token: credentialResponse.credential
      };
      onLoginSuccess(userData);
    } catch (error) {
      console.error("Authentication failed:", error);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#030712] font-sans selection:bg-blue-500/30">
      
      {/* LEFT SIDE: Immersive Branding & Visuals */}
      <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-black items-center justify-center border-r border-white/5">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] rounded-full bg-blue-600/10 blur-[150px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] rounded-full bg-emerald-600/10 blur-[150px] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay pointer-events-none"></div>

        <div className="relative z-10 p-16 max-w-2xl">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-12 w-2 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.6)]"></div>
            <h1 className="text-5xl font-black tracking-tight text-white leading-tight">JEE College<br/>Predictor</h1>
          </div>
          
          <h2 className="text-3xl font-bold text-gray-300 leading-tight mb-6">
            Stop guessing.<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Start calculating.</span>
          </h2>
          
          <div className="flex flex-wrap gap-4 mt-12">
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span> Live Data Matrix
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></span> Deep Regex Filters
            </div>
            <div className="bg-white/5 border border-white/10 px-4 py-2.5 rounded-xl text-xs font-bold text-gray-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span> PDF Export Ledger
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: The Login Interaction */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10">
        <div className="absolute inset-0 lg:hidden flex items-center justify-center pointer-events-none">
          <div className="w-full h-full max-w-lg bg-blue-600/10 blur-[100px] rounded-full"></div>
        </div>

        <div className="w-full max-w-md relative">
          <div className="bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-[2rem] p-8 sm:p-12 shadow-2xl relative overflow-hidden flex flex-col items-center text-center">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-500 to-blue-500 opacity-50"></div>

            {/* Mobile Branding */}
            <div className="lg:hidden flex items-center justify-center gap-3 mb-8 w-full">
              <div className="h-8 w-1.5 bg-gradient-to-b from-blue-500 to-emerald-500 rounded-full"></div>
              <h1 className="text-2xl font-black tracking-tight text-white leading-tight">JEE College<br/>Predictor</h1>
            </div>

            <div className="mb-8 space-y-4 w-full hidden lg:block">
              <h2 className="text-3xl font-black text-white">Welcome Back</h2>
            </div>

            <div className="h-14 flex items-start justify-center mb-6 w-full">
              <p className="text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
                {text}
                <span className="inline-block w-[2px] h-[1em] ml-1 bg-blue-400 animate-pulse align-middle"></span>
              </p>
            </div>

            <div className="w-full space-y-8 flex flex-col items-center">
              <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
              
              <div className="hover:scale-[1.02] transition-transform duration-300 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]">
                <GoogleLogin
                  onSuccess={handleCredentialResponse}
                  onError={() => console.log('Login Failed')}
                  theme="filled_black"
                  size="large"
                  shape="pill"
                  text="continue_with"
                />
              </div>
              
              <p className="text-[10px] text-gray-500 font-bold tracking-widest uppercase leading-loose">
                Authorized academic data sourced <br/> directly via JoSAA archives.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;