import React from 'react';
import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Vérifie l'authentification
    return isAuthenticated ? children : <Navigate to="/login" />; // s'il n'est pas connecté, on redirige vers login
};

export default PrivateRoute;
