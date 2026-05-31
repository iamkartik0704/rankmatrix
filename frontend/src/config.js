// This automatically switches between your local dev URL and the live URL
export const API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-backend-url.onrender.com' 
  : 'http://localhost:5000';