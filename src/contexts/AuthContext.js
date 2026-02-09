import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Simple authentication - in production, this would be much more secure
  const login = (username, password) => {
    // For now, simple credentials - you can change these
    if (username === 'admin' && password === 'qr2024') {
      setIsAuthenticated(true);
      localStorage.setItem('qr_auth', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('qr_auth');
  };

  // Check localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem('qr_auth');
    if (stored === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const value = {
    isAuthenticated,
    login,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
