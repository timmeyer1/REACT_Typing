import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  // Vérifie si l'utilisateur est connecté en regardant le token dans le localStorage
  const isLoggedIn = !!localStorage.getItem('token'); // Renvoie true si le token existe

  const handleStartTest = () => {
    navigate('/test');
  };

  const handleLogout = () => {
    localStorage.removeItem('token'); // Supprime le token pour déconnecter l'utilisateur
    navigate('/login'); // Redirige vers la page de connexion
  };

  return (
    <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center px-6">
        <Link
          to="/"
          className="text-2xl font-bold tracking-tight hover:text-indigo-200 transition duration-300"
        >
          Typing Speed Test
        </Link>

        <nav className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-indigo-200 transition duration-300">
            Accueil
          </Link>
          <button
            onClick={handleStartTest}
            className="bg-white text-indigo-600 px-4 py-2 rounded-full font-semibold hover:bg-indigo-100 transition duration-300"
          >
            Démarrer
          </button>
          <Link to="/about" className="hover:text-indigo-200 transition duration-300">
            À propos
          </Link>
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              <Link
                to="/profile"
                className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition duration-300"
              >
                Profil
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-full hover:bg-red-600 transition duration-300"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-purple-500 text-white px-4 py-2 rounded-full hover:bg-purple-600 transition duration-300"
            >
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
