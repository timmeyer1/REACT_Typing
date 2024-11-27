import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Importer useNavigate pour la redirection

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const navigate = useNavigate(); // Hook pour gérer la navigation

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5000/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });
            const data = await response.json();

            if (data.token) {
                localStorage.setItem('token', data.token); // Sauvegarder le token JWT
                setMessage('Connexion réussie');

                // Rediriger vers /profile
                navigate('/profile');
            } else {
                setMessage(data.message);
            }
        } catch (error) {
            setMessage('Erreur de connexion');
        }
    };

    return (
        <div>
            <h2>Se connecter</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                />
                <input
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
                <button type="submit">Se connecter</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default Login;
