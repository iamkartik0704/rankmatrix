// This automatically switches between your local dev URL and the live URL
export const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://rankmatrix.onrender.com/' 
  : 'http://localhost:5000';