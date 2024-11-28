import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const Register = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const [passwordError, setPasswordError] = useState('');

    const validatePassword = (password) => {
        const regex = /^(?=.*\d)(?=.*[!@#$%^&.*])(?=.*[a-zA-Z]).{8,}$/;
        return regex.test(password);
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);

        if (!validatePassword(newPassword)) {
            setPasswordError(
                "Le mot de passe doit contenir au moins 8 caractères, un chiffre et un caractère spécial."
            );
        } else {
            setPasswordError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Vérifiez la validation du mot de passe avant de soumettre
        if (!validatePassword(password)) {
            setMessage("Le mot de passe ne respecte pas les critères de sécurité.");
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('http://localhost:5000/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, email, password }),
            });
            const data = await response.json();
            setMessage(data.message);

            if (response.ok) {
                // Redirection vers /login si l'inscription réussit
                setTimeout(() => navigate('/login'), 1500);
            }
        } catch (error) {
            setMessage("Erreur d'inscription. Veuillez réessayer.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
                <h2 className="text-center text-3xl font-extrabold text-indigo-600">Créer un compte</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm">
                        <input
                            id="username"
                            name="username"
                            type="text"
                            required
                            placeholder="Nom d'utilisateur"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            placeholder="Adresse e-mail"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 sm:text-sm focus:ring-indigo-500 focus:border-indigo-500"
                        />
                        <input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Mot de passe"
                            value={password}
                            onChange={handlePasswordChange}
                            className={`block w-full px-3 py-2 border ${passwordError ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-b-md sm:text-sm focus:ring-indigo-500 focus:border-indigo-500`}
                        />
                        {passwordError && (
                            <p className="text-red-500 text-sm mt-2">{passwordError}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-2 px-4 text-white bg-indigo-600 hover:bg-indigo-700 rounded-md"
                    >
                        {isLoading ? 'Inscription en cours...' : 'S\'inscrire'}
                    </button>
                </form>
                {message && (
                    <p className={`text-center mt-3 ${message.includes('réussie') ? 'text-green-600' : 'text-red-600'}`}>
                        {message}
                    </p>
                )}
                <div className="text-center mt-4">
                    <Link to="/login" className="font-medium text-indigo-600 hover:text-indigo-500">
                        Déjà un compte ? Se connecter
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
