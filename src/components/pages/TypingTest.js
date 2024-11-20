import React, { useState, useEffect } from "react";
import { randomTexts } from "../../texts";

const TypingTest = () => {
  // État pour stocker le texte cible et le texte tapé
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");

  // État pour le chronomètre et le suivi du test
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTestActive, setIsTestActive] = useState(false);
  
  // État pour le suivi des erreurs et la vitesse
  const [errors, setErrors] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);

  // Génère un texte aléatoire au démarrage
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * randomTexts.length);
    setTargetText(randomTexts[randomIndex]);
  }, []);

  // Gestion de la saisie de l'utilisateur
  const handleTyping = (event) => {
    const { value } = event.target;

    if (!isTestActive) {
      setIsTestActive(true); // Démarre le test à la première frappe
    }

    // Vérifier si le texte tapé est correct jusqu'au dernier caractère tapé
    const currentCharacter = value[value.length - 1];
    const correctCharacter = targetText[value.length - 1];

    if (currentCharacter !== correctCharacter) {
      setErrors((prev) => prev + 1); // Compte une erreur
      return; // Arrête ici si une faute est détectée
    }

    // Si pas de faute, met à jour le texte tapé
    setTypedText(value);
  };

  // Fonction pour calculer les mots tapés
  const calculateWords = (text) => {
    return text.trim().split(/\s+/).length;
  };

  // Calcul de la vitesse en temps réel
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const wordsTyped = calculateWords(typedText);
      setWordsPerMinute(((wordsTyped / (60 - timeLeft)) * 60).toFixed(2));
    }
  }, [typedText, timeLeft, isTestActive]);

  // Fonction pour terminer le test
  const endTest = () => {
    setIsTestActive(false);
  };

  // Démarre le compte à rebours dès que le test commence
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      endTest(); // Termine le test lorsque le temps est écoulé
    }
  }, [isTestActive, timeLeft]);

  // Vérifie les correspondances caractère par caractère
  const getHighlightedText = () => {
    return targetText.split("").map((char, index) => {
      let color;
      if (index < typedText.length) {
        color = char === typedText[index] ? "text-green-500" : "text-red-500";
      }
      return (
        <span key={index} className={color}>
          {char}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      <h1 className="text-2xl font-bold mb-4">Typing Speed Test</h1>

      <div className="text-lg mb-4">Time Left: {timeLeft}s</div>
      <div className="text-lg mb-4">Words per Minute: {wordsPerMinute}</div>
      <div className="text-lg mb-4">Errors: {errors}</div>

      <div className="border p-4 rounded w-3/4 bg-gray-100 mb-4">
        <p className="text-lg">{getHighlightedText()}</p>
      </div>

      <textarea
        value={typedText}
        onChange={handleTyping}
        rows="4"
        className="border p-2 w-3/4"
        placeholder="Start typing here..."
        disabled={timeLeft === 0} // Désactive lorsque le test est terminé
      />

      {timeLeft === 0 && (
        <div className="mt-4">
          <p>Final Words per Minute: {wordsPerMinute}</p>
          <p>Total Errors: {errors}</p>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
