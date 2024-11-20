import React, { useState, useEffect } from "react";
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

  const handleTyping = (event) => {
    const { value } = event.target;

    if (!isTestActive) {
      setIsTestActive(true); // Démarre le test à la première frappe
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
        </div>
      )}
    </div>
  );
};

export default TypingTest;
