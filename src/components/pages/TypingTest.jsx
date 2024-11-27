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
  const endTest = () => {
    setIsTestActive(false);

    // Stocker les données du score dans localStorage
    localStorage.setItem('typingTestScore', JSON.stringify({
      wordsPerMinute,
      accuracy,
      errors,
      timestamp: Date.now()
    }));
  };

  const saveScore = async () => {
    // Récupérer les données du score depuis localStorage
    const storedScore = JSON.parse(localStorage.getItem('typingTestScore'));

    if (!storedScore) {
      alert('Aucun score à sauvegarder');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(language === 'en'
          ? 'Please log in to save your score'
          : 'Veuillez vous connecter pour sauvegarder votre score'
        );
        return;
      }

      await axios.post('http://localhost:5000/save-score', {
        words_per_minute: parseFloat(storedScore.wordsPerMinute),
        accuracy: parseFloat(storedScore.accuracy),
        average_errors: storedScore.errors
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Supprimer le score stocké après sauvegarde
      localStorage.removeItem('typingTestScore');
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Colonne de gauche pour les boutons */}
          <div className="md:w-1/3 pr-8 mb-8 md:mb-0">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                {language === "en" ? "Settings" : "Paramètres"}
              </h2>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">
                    {language === "en" ? "Language" : "Langue"}
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setLanguage("fr")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${language === "fr"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      Français
                    </button>
                    <button
                      onClick={() => setLanguage("en")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${language === "en"
                        ? "bg-indigo-600 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      English
                    </button>
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2 text-gray-700">
                    {language === "en" ? "Theme" : "Thème"}
                  </h3>
                  <div className="flex flex-col space-y-2">
                    <button
                      onClick={() => setTheme("food")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${theme === "food"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {language === "en" ? "Text" : "Texte"}
                    </button>
                    <button
                      onClick={() => setTheme("music")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${theme === "music"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {language === "en" ? "Words" : "Mots"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne de droite pour le test */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-center mb-8 text-indigo-600">
                  {language === "en" ? "Typing Speed Test" : "Test de vitesse de frappe"}
                </h1>

                {timeLeft > 0 && (
                  <div className="grid grid-cols-2 gap-4 mb-8">
                    <div className="bg-indigo-100 p-4 rounded-lg text-center">
                      <div className="text-sm text-indigo-600 font-medium">
                        {language === "en" ? "Time Left" : "Temps restant"}
                      </div>
                      <div className="text-3xl font-bold text-indigo-800">{timeLeft}s</div>
                    </div>
                    <div className="bg-purple-100 p-4 rounded-lg text-center">
                      <div className="text-sm text-purple-600 font-medium">
                        {language === "en" ? "Words per Minute" : "Mots par minute"}
                      </div>
                      <div className="text-3xl font-bold text-purple-800">{wordsPerMinute}</div>
                    </div>
                    <div className="bg-red-100 p-4 rounded-lg text-center">
                      <div className="text-sm text-red-600 font-medium">
                        {language === "en" ? "Errors" : "Erreurs"}
                      </div>
                      <div className="text-3xl font-bold text-red-800">{errors}</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      <div className="text-sm text-green-600 font-medium">
                        {language === "en" ? "Accuracy" : "Précision"}
                      </div>
                      <div className="text-3xl font-bold text-green-800">{accuracy}%</div>
                    </div>
                  </div>
                )}

                <div className="mb-8">
                  <div className="bg-gray-100 p-6 rounded-lg">
                    <p className="text-lg leading-relaxed">{getHighlightedText()}</p>
                  </div>
                </div>

                <textarea
                  value={typedText}
                  onChange={handleTyping}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={language === "en" ? "Start typing here..." : "Commencez à taper ici..."}
                  disabled={timeLeft === 0}
                />

                {timeLeft === 0 && (
                  <div className="mt-8 text-center">
                    <h2 className="text-2xl font-bold mb-4 text-indigo-600">
                      {language === "en" ? "Test Results" : "Résultats du test"}
                    </h2>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="bg-indigo-100 p-4 rounded-lg">
                        <div className="text-sm text-indigo-600 font-medium">
                          {language === "en" ? "Final WPM" : "MPM final"}
                        </div>
                        <div className="text-2xl font-bold text-indigo-800">{wordsPerMinute}</div>
                      </div>
                      <div className="bg-red-100 p-4 rounded-lg">
                        <div className="text-sm text-red-600 font-medium">
                          {language === "en" ? "Total Errors" : "Erreurs totales"}
                        </div>
                        <div className="text-2xl font-bold text-red-800">{errors}</div>
                      </div>
                      <div className="bg-green-100 p-4 rounded-lg">
                        <div className="text-sm text-green-600 font-medium">
                          {language === "en" ? "Final Accuracy" : "Précision finale"}
                        </div>
                        <div className="text-2xl font-bold text-green-800">{accuracy}%</div>
                      </div>
                    </div>
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={resetTest}
                        className="px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition duration-300"
                      >
                        {language === "en" ? "Start Again" : "Recommencer"}
                      </button>
                      <button
                        onClick={saveScore}
                        disabled={scoreSaved}
                        className={`px-6 py-3 text-white text-lg font-semibold rounded-full transition duration-300 
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
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TypingTest;
