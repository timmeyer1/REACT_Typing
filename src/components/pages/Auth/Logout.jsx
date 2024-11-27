import React from 'react';
import { useNavigate } from 'react-router-dom';

const Logout = () => {
    const navigate = useNavigate();

    const handleLogout = () => {
        // Supprimer le token JWT du localStorage
        localStorage.removeItem('token');

        // Rediriger l'utilisateur vers la page de login après la déconnexion
        navigate('/login');
    };

    return (
        <div>
            <button onClick={handleLogout}>Se déconnecter</button>
        </div>
    );
};

export default Logout;
