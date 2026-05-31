import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const cachedUser = localStorage.getItem('rankMatrixUser');
    if (cachedUser) {
      setUser(JSON.parse(cachedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('rankMatrixUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('rankMatrixToken');
    localStorage.removeItem('rankMatrixUser');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white flex flex-col selection:bg-blue-500/30">
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <main className="flex-grow">
        {user ? (
          <Dashboard user={user} />
        ) : (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
      </main>
    </div>
  );
}

export default App;