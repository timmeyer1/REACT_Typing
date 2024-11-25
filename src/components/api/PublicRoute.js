import React from 'react';
import { Navigate } from 'react-router-dom';

const PublicRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('token'); // Vérifiez si l'utilisateur est connecté
    return isAuthenticated ? <Navigate to="/" /> : children; // s'il l'est, redirigez vers la page d'accueil
};

export default PublicRoute;
