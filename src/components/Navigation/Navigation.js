import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="bg-white/90 backdrop-blur-sm shadow-sm border-b rounded-lg mx-4 mt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-3">
          <div className="flex space-x-8">
            <Link
              to="/"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Single QR Generator
            </Link>
            <Link
              to="/qrs"
              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/qrs' 
                  ? 'text-blue-600 bg-blue-50' 
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
              }`}
            >
              Bulk QR Manager
            </Link>
          </div>
          <div className="text-sm text-gray-500">
            QR Code Tools
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;

