import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/test'); // Redirige vers la page de test
  };

  return (
    <header className="bg-blue-600 text-white py-4 shadow-md">
      <div className="container mx-auto flex justify-between items-center px-4">
        {/* Logo du site */}
        <Link to="/" className="text-2xl font-bold hover:text-blue-200 transition duration-300">
          Typing Speed Test
        </Link>

        {/* Liens de navigation */}
        <nav className="space-x-6 hidden md:flex">
          <Link to="/" className="hover:text-blue-200 transition duration-300">
            Accueil
          </Link>
          <Link to="/about" className="hover:text-blue-200 transition duration-300">
            À propos
          </Link>
        </nav>

        {/* Bouton pour démarrer le test */}
        <button
          onClick={handleStartTest}
          className="bg-white text-blue-600 px-4 py-2 rounded-md font-semibold hover:bg-blue-200 transition duration-300"
        >
          Démarrer
        </button>
      </div>
    </header>
  );
};

export default Header;
