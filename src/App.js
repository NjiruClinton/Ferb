import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Favicon from 'react-favicon';
import { AuthProvider } from './contexts/AuthContext';
import QRCodeGenerator from './components/QrCodeGenerator/QrCodeGenerator';
import QRsPage from './components/QRsPage/QRsPage';
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute';
import Navigation from './components/Navigation/Navigation';
import ErrorBoundary from './components/ErrorBoundary/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Favicon url={require("./logo.png")} />
            <Routes>
              <Route path="/" element={
                <div className="sm:bg-blue-700 bg-[url('/images/backg.jpg')] bg-cover min-h-screen">
                  <div className="absolute top-4 left-4 z-10">
                    <Navigation />
                  </div>
                  <QRCodeGenerator />
                </div>
              } />
              <Route path="/qrs" element={
                <ProtectedRoute>
                  <QRsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
