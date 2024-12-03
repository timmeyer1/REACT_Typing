import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();
    const isLoggedIn = !!localStorage.getItem('token');

    const handleStartTest = () => {
        navigate('/test');
        scrollToTop();
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
        scrollToTop();
    };

    const handleLinkClick = (path) => {
        navigate(path);
        scrollToTop();
    };

    return (
        <header className="bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-indigo-600">Typing Speed Test</h1>
                </div>
                <nav className="flex items-center space-x-4">
                    <button onClick={() => handleLinkClick('/')} className="text-gray-700 hover:text-indigo-600">Accueil</button>
                    <button onClick={() => handleLinkClick('/test')} className="text-gray-700 hover:text-indigo-600">Test</button>
                    <button onClick={() => handleLinkClick('/about')} className="text-gray-700 hover:text-indigo-600">À propos</button>
                    <a href="https://github.com/timmeyer1" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-indigo-600">GitHub</a>
                    {isLoggedIn ? (
                        <>
                            <button onClick={() => handleLinkClick('/profile')} className="text-gray-700 hover:text-indigo-600">Profil</button>
                            <button onClick={handleLogout} className="text-gray-700 hover:text-indigo-600">Déconnexion</button>
                        </>
                    ) : (
                        <>
                            <button onClick={() => handleLinkClick('/login')} className="text-gray-700 hover:text-indigo-600">Connexion</button>
                            <button onClick={() => handleLinkClick('/register')} className="text-gray-700 hover:text-indigo-600">Inscription</button>
                        </>
                    )}
                </nav>
            </div>
            <div className="text-center text-sm text-gray-500 py-2">
                © {new Date().getFullYear()} Typing Speed Test. Tous droits réservés.
            </div>
        </header>
    );
};

export default Header;