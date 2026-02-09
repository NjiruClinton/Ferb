import React from 'react';
import Login from '../Login/Login';
import {useAuth} from "../../contexts/AuthContext";

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();

  return isAuthenticated ? children : <Login />;
}

export default ProtectedRoute;
