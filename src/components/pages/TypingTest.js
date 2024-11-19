import React from 'react';

const TypingTest = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 text-center">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Test de vitesse de frappe</h2>
      <p className="mb-4 text-lg text-gray-700">Tapez le texte suivant aussi vite que possible :</p>
      <input
        type="text"
        placeholder="Tapez ici..."
        className="w-3/4 md:w-1/2 px-4 py-2 border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
      />
    </div>
  );
};

export default TypingTest;
