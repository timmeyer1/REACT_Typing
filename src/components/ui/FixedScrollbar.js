import React from 'react';

const FixedScrollbar = () => {
  return (
    <div id="fixed-scroll" className="scroll-container">
      {/* Ton contenu défilant ici */}
      <p>Contenu très long pour démontrer le défilement...</p>
      <p>Encore du contenu...</p>
      <p>Encore plus de contenu...</p>
      {/* Ajoute autant de contenu que nécessaire */}
    </div>
  );
};

export default FixedScrollbar;
