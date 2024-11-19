import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/test'); 
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">Bienvenue sur le test de vitesse de frappe</h1>
      <p className="text-lg text-gray-700 mb-8">Mesurez votre vitesse de frappe au clavier en quelques secondes !</p>
      <button
        onClick={handleStartTest}
        className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600 transition duration-300"
      >
        Commencer le test
      </button>
    </div>
  );
};

export default HomePage;
