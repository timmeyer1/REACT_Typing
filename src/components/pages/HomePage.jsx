import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleStartTest = () => {
    navigate('/test'); 
  };

  React.useEffect(() => {
    document.title = 'Typing Speed Test - Test de Vitesse de Frappe';
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8 text-center">
        <h1 className="text-5xl font-extrabold text-transparent p-2 bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
          Typing Speed Test
        </h1>
        <p className="mt-3 text-xl text-gray-700">
          Mesurez et améliorez votre vitesse de frappe en un instant.
        </p>
        <div className="flex justify-center space-x-4 mt-6">
          <div className="text-center">
            <span className="block text-3xl font-bold text-indigo-600">60+</span>
            <span className="text-sm text-gray-600">Textes personnalisés</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-purple-600">2</span>
            <span className="text-sm text-gray-600">Langues (fr/en)</span>
          </div>
          <div className="text-center">
            <span className="block text-3xl font-bold text-indigo-600">2</span>
            <span className="text-sm text-gray-600">Catégories</span>
          </div>
        </div>
        <button
          onClick={handleStartTest}
          className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-semibold rounded-full hover:from-indigo-700 hover:to-purple-700 transition duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
        >
          Commencer le test
        </button>
      </div>
    </div>
  );
};

export default HomePage;