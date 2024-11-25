import React, { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import Logout from './Logout';  // Importer le composant de déconnexion

const Profile = () => {
    const [user, setUser] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const decoded = jwtDecode(token); // Décodez le token pour récupérer les données de l'utilisateur
            setUser(decoded);
        }
    }, []);

    if (!user) {
        return <p>Vous n'êtes pas connecté. Veuillez vous connecter.</p>;
    }

    return (
        <div>
            <h2>Profil</h2>
            <p>Email: {user.email}</p>
            <Logout />
        </div>
    );
};

export default Profile;
