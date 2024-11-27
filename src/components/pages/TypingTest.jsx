import React, { useState, useEffect } from "react";
import axios from 'axios';
import { foodTextsEn } from "../../texts/food/en";
import { foodTextsFr } from "../../texts/food/fr";
import { musicTextsEn } from "../../texts/music/en";
import { musicTextsFr } from "../../texts/music/fr";

const TypingTest = () => {
  const [language, setLanguage] = useState("fr"); // Langue par défaut : anglais
  const [theme, setTheme] = useState("food"); // Thème par défaut : nourriture
  const [texts, setTexts] = useState(foodTextsEn); // Textes initiaux

  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");

  const [timeLeft, setTimeLeft] = useState(60); // Duree du test
  const [isTestActive, setIsTestActive] = useState(false);

  const [errors, setErrors] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(0);
  const [scoreSaved, setScoreSaved] = useState(false);

  // Mise à jour des textes en fonction du thème et de la langue
  useEffect(() => {
    let selectedTexts = [];
    if (theme === "food" && language === "en") {
      selectedTexts = foodTextsEn;
    } else if (theme === "food" && language === "fr") {
      selectedTexts = foodTextsFr;
    } else if (theme === "music" && language === "en") {
      selectedTexts = musicTextsEn;
    } else if (theme === "music" && language === "fr") {
      selectedTexts = musicTextsFr;
    }
    setTexts(selectedTexts);
  }, [theme, language]);

  // Génère un texte aléatoire chaque fois que les textes changent
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * texts.length);
    setTargetText(texts[randomIndex]);
  }, [texts]);

  // Gestionnaire de frappe
  const handleTyping = (event) => {
    const { value } = event.target;

    if (!isTestActive) {
      setIsTestActive(true); // Démarre le test à la première frappe
    }

    // Vérifier si l'utilisateur efface
    if (value.length < typedText.length) {
      setTypedText(value); // Mettez à jour le texte tapé sans compter d'erreur
      return;
    }

    const lastTypedIndex = value.length - 1;

    // Mise à jour des erreurs et des lettres correctes
    if (lastTypedIndex >= 0) {
      const currentCharacter = value[lastTypedIndex];
      const correctCharacter = targetText[lastTypedIndex];

      if (currentCharacter === correctCharacter) {
        setCorrectLetters((prev) => prev + 1);
      } else {
        setErrors((prev) => prev + 1);
      }
    }

    setTypedText(value);
  };

  // Calcul de la vitesse de frappe
  const calculateWords = (text) => {
    return text.trim().split(/\s+/).length;
  };

  // Mise à jour de la vitesse de frappe
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const wordsTyped = calculateWords(typedText);
      setWordsPerMinute(((wordsTyped / (60 - timeLeft)) * 60).toFixed(2));
    }
  }, [typedText, timeLeft, isTestActive]);

  // Fin du test
  const endTest = () => {
    setIsTestActive(false);
  };

  // Gestion du temps
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      endTest(); // Termine le test lorsque le temps est écoulé
    }
  }, [isTestActive, timeLeft]);

  // Calcul de la précision
  const accuracy = ((correctLetters / (correctLetters + errors || 1)) * 100).toFixed(2);

  // Génération du texte mis en forme
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


  // Fonction de sauvegarde du score
  const saveScore = async () => {
    // Empêcher plusieurs sauvegardes
    if (scoreSaved) return;

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        alert(language === 'en' ? 'Please log in to save your score' : 'Veuillez vous connecter pour sauvegarder votre score');
        return;
      }

      const response = await axios.post('http://localhost:5000/save-score', {
        words_per_minute: parseFloat(wordsPerMinute),
        accuracy: parseFloat(accuracy),
        average_errors: errors
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Marquer le score comme sauvegardé
      setScoreSaved(true);

      alert(language === 'en'
        ? 'Score saved successfully!'
        : 'Score sauvegardé avec succès !'
      );
    } catch (error) {
      console.error('Error saving score:', error);
      alert(language === 'en'
        ? 'Failed to save score. Please try again.'
        : 'Échec de la sauvegarde du score. Veuillez réessayer.'
      );
    }
  };





  // Réinitialiser le test
  const resetTest = () => {
    setTypedText("");
    setTimeLeft(60);
    setErrors(0);
    setWordsPerMinute(0);
    setCorrectLetters(0);
    setIsTestActive(false);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4">
      {/* Sélecteur de langue */}
      <div className="flex mb-4">
        <button
          onClick={() => setLanguage("fr")}
          className={`mr-2 px-4 py-2 rounded ${language === "fr" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          Français
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-2 rounded ${language === "en" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
        >
          English
        </button>
      </div>

      {/* Sélecteur de thème */}
      <div className="flex mb-4">
        <button
          onClick={() => setTheme("food")}
          className={`mr-2 px-4 py-2 rounded ${theme === "food" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          {language === "en" ? "Food" : "Nourriture"}
        </button>
        <button
          onClick={() => setTheme("music")}
          className={`px-4 py-2 rounded ${theme === "music" ? "bg-green-500 text-white" : "bg-gray-200"}`}
        >
          {language === "en" ? "Music" : "Musique"}
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-4">
        {language === "en" ? "Typing Speed Test" : "Test de vitesse de frappe"}
      </h1>

      <div className="text-lg mb-4">
        {language === "en" ? "Time Left" : "Temps restant"}: {timeLeft}s
      </div>
      <div className="text-lg mb-4">
        {language === "en" ? "Words per Minute" : "Mots par minute"}: {wordsPerMinute}
      </div>
      <div className="text-lg mb-4">
        {language === "en" ? "Errors" : "Erreurs"}: {errors}
      </div>
      <div className="text-lg mb-4">
        {language === "en" ? "Accuracy" : "Précision"}: {accuracy}%
      </div>

      <button
        className="px-4 py-2 bg-gray-500 text-white rounded mb-4 flex items-center"
        onClick={() => window.location.reload()}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" className="mr-2">
          <path fill="currentColor" d="M12.079 2.25c-4.794 0-8.734 3.663-9.118 8.333H2a.75.75 0 0 0-.528 1.283l1.68 1.666a.75.75 0 0 0 1.056 0l1.68-1.666a.75.75 0 0 0-.528-1.283h-.893c.38-3.831 3.638-6.833 7.612-6.833a7.66 7.66 0 0 1 6.537 3.643a.75.75 0 1 0 1.277-.786A9.16 9.16 0 0 0 12.08 2.25m8.761 8.217a.75.75 0 0 0-1.054 0L18.1 12.133a.75.75 0 0 0 .527 1.284h.899c-.382 3.83-3.651 6.833-7.644 6.833a7.7 7.7 0 0 1-6.565-3.644a.75.75 0 1 0-1.277.788a9.2 9.2 0 0 0 7.842 4.356c4.808 0 8.765-3.66 9.15-8.333H22a.75.75 0 0 0 .527-1.284z" />
        </svg>
        Refresh
      </button>

      <div className="border p-4 rounded w-3/4 bg-gray-100 mb-4">
        <p className="text-lg">{getHighlightedText()}</p>
      </div>


      <textarea
        value={typedText}
        onChange={handleTyping}
        rows="4"
        className="border p-2 w-3/4"
        placeholder={language === "en" ? "Start typing here..." : "Commencez à taper ici..."}
        disabled={timeLeft === 0} // Désactive lorsque le test est terminé
      />

      {timeLeft === 0 && (
        <div className="mt-4">
          <p>
            {language === "en" ? "Final Words per Minute" : "Mots par minute final"}: {wordsPerMinute}
          </p>
          <p>
            {language === "en" ? "Total Errors" : "Total des erreurs"}: {errors}
          </p>
          <p>
            {language === "en" ? "Final Accuracy" : "Précision finale"}: {accuracy}%
          </p>
          <button
            onClick={resetTest}
            className="px-6 py-3 bg-blue-500 text-white text-lg font-semibold rounded-md hover:bg-blue-600 transition duration-300"
          >
            {language === "en" ? "Start Again" : "Commencer à nouveau"}
          </button>
          <button
            onClick={saveScore}
            disabled={scoreSaved} // Désactive le bouton si déjà sauvegardé
            className={`px-6 py-3 text-white text-lg font-semibold rounded-md transition duration-300 ml-4 
          ${scoreSaved
                ? 'bg-gray-400 cursor-not-allowed'
                : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {language === 'en'
              ? (scoreSaved ? 'Score Saved' : 'Save Score')
              : (scoreSaved ? 'Score Sauvegardé' : 'Sauvegarder le score')
            }
          </button>
        </div>
      )}
    </div>
  );
};

export default TypingTest;
