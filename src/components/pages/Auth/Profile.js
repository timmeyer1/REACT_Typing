import React, { useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';  // Un exemple de bouton de déconnexion

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token);
            setUser(decoded);  // Décode le token et met l'utilisateur dans l'état
        }
    }, []);

    if (!user) {
        return <p>Vous n'êtes pas connecté. Veuillez vous connecter.</p>;
    }

    return (
        <div>
            <h2>Profil</h2>
            <p>Username: {user.username}</p>
            <Logout />
        </div>
    );
};

export default Profile;
