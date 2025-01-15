import React, { useState, useEffect, useCallback, useRef } from "react";
import axios from 'axios';
import { motion, AnimatePresence } from "framer-motion";
import { textsEn } from "../../texts/texts/en";
import { textsFr } from "../../texts/texts/fr";
import { wordsEn } from "../../texts/words/en";
import { wordsFr } from "../../texts/words/fr";

const TypingTest = () => {
  const LINES_TO_SHOW = 5;
  const WORDS_PER_LINE = 5;
  const TIME_LIMIT = 60;
  const SHAKE_DURATION = 0.3;

  const textStyles = {
    fontSize: '24px',    // Réduire la taille de la police
    lineHeight: '2.5',   // Augmenter l'espacement des lignes
    letterSpacing: '0.5px' // Ajouter un léger espacement entre les lettres
  };

  const containerRef = useRef(null);

  const textMap = {
    text: { en: textsEn, fr: textsFr },
    word: { en: wordsEn, fr: wordsFr }
  };

  // État principal amélioré avec le suivi des lignes
  const [state, setState] = useState({
    language: "fr",
    theme: "text",
    allLines: [],        // Toutes les lignes du test
    currentLineIndex: 0, // Index de la ligne actuelle
    typedText: "",       // Texte tapé pour la ligne actuelle
    timeLeft: TIME_LIMIT,
    isTestActive: false,
    testStarted: false,
    errors: 0,
    wordsPerMinute: 0,
    correctLetters: 0,
    totalTypedChars: 0,  // Total des caractères tapés
    hasSavedScore: false,
    isTestCompleted: false,
    shakeError: false
  });

  // Génération du contenu
  const generateLines = useCallback(() => {
    const currentTexts = textMap[state.theme][state.language];
    let words;

    if (state.theme === 'text') {
      const shuffled = [...currentTexts].sort(() => 0.5 - Math.random());
      words = shuffled.join(' ').split(' ');
    } else {
      words = Array(LINES_TO_SHOW * WORDS_PER_LINE)
        .fill()
        .map(() => currentTexts[Math.floor(Math.random() * currentTexts.length)]);
    }

    const lines = [];
    for (let i = 0; i < words.length; i += WORDS_PER_LINE) {
      lines.push(words.slice(i, i + WORDS_PER_LINE).join(' '));
    }

    return lines;
  }, [state.theme, state.language]);

  // Initialisation
  useEffect(() => {
    setState(prev => ({
      ...prev,
      allLines: generateLines(),
      currentLineIndex: 0,
      typedText: ""
    }));
  }, [state.language, state.theme, generateLines]);

  // Empêcher le défilement de la page
  useEffect(() => {
    const preventDefault = (e) => {
      if (e.key === ' ') {
        e.preventDefault();
      }
    };

    window.addEventListener('keydown', preventDefault);
    return () => window.removeEventListener('keydown', preventDefault);
  }, []);

  // Gestion des frappes
  useEffect(() => {
    const handleKeyPress = (event) => {
      if (state.isTestCompleted) return;

      if (!state.isTestActive) {
        setState(prev => ({ ...prev, isTestActive: true, testStarted: true }));
      }

      const currentLine = state.allLines[state.currentLineIndex];
      if (!currentLine) return;

      if (event.key === 'Backspace') {
        setState(prev => ({
          ...prev,
          typedText: prev.typedText.slice(0, -1)
        }));
        return;
      }

      if (event.key.length === 1) {
        const newTypedText = state.typedText + event.key;
        const isCorrect = newTypedText[newTypedText.length - 1] === currentLine[newTypedText.length - 1];

        // Vérifier si on est à la fin de la ligne
        const isEndOfLine = currentLine.length === newTypedText.length;

        // Ne passer à la ligne suivante que si on appuie sur espace à la fin
        if (isEndOfLine && event.key !== ' ') {
          return; // Ignorer toute autre touche que l'espace à la fin de la ligne
        }

        // Passer à la ligne suivante uniquement si on est à la fin et qu'on appuie sur espace
        if (isEndOfLine && event.key === ' ') {
          if (state.currentLineIndex === state.allLines.length - 1) {
            endTest();
          } else {
            setState(prev => ({
              ...prev,
              currentLineIndex: prev.currentLineIndex + 1,
              typedText: "",
              totalTypedChars: prev.totalTypedChars + 1
            }));
          }
          return;
        }

        setState(prev => ({
          ...prev,
          typedText: newTypedText,
          correctLetters: isCorrect ? prev.correctLetters + 1 : prev.correctLetters,
          errors: isCorrect ? prev.errors : prev.errors + 1,
          totalTypedChars: prev.totalTypedChars + 1,
          shakeError: !isCorrect
        }));

        if (!isCorrect) {
          setTimeout(() => {
            setState(prev => ({ ...prev, shakeError: false }));
          }, SHAKE_DURATION * 1000);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [state.isTestActive, state.typedText, state.currentLineIndex, state.allLines, state.isTestCompleted]);

  // Timer et calcul WPM
  useEffect(() => {
    if (state.isTestActive && state.timeLeft > 0) {
      const timerId = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          wordsPerMinute: ((prev.totalTypedChars / 5) / ((TIME_LIMIT - prev.timeLeft) / 60)).toFixed(2)
        }));
      }, 1000);
      return () => clearInterval(timerId);
    } else if (state.timeLeft === 0) {
      endTest();
    }
  }, [state.isTestActive, state.timeLeft]);

  const accuracy = ((state.correctLetters / (state.totalTypedChars || 1)) * 100).toFixed(2);

  // Composant d'affichage des lignes
  const TypingDisplay = () => (
    <div className="relative font-mono" style={textStyles}>
      {state.allLines.slice(state.currentLineIndex, state.currentLineIndex + LINES_TO_SHOW).map((line, index) => (
        <div
          key={state.currentLineIndex + index}
          className="mb-4 relative h-[50px]"
        >
          {/* Texte cible */}
          <div className="absolute text-gray-700 whitespace-pre">
            {line}
          </div>

          {/* Texte tapé */}
          {index === 0 && (
            <div className="absolute whitespace-pre">
              {line.split('').map((char, charIndex) => {
                const isTyped = charIndex < state.typedText.length;
                if (!isTyped) return null;

                const typedChar = state.typedText[charIndex];
                return (
                  <span
                    key={charIndex}
                    className={typedChar === char ? "text-green-500" : "text-red-500"}
                  >
                    {char}
                  </span>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );

  // Fonctions de gestion du test
  const endTest = () => {
    if (state.isTestCompleted) return; // Éviter les appels multiples

    setState(prev => ({
      ...prev,
      isTestActive: false,
      isTestCompleted: true,
      hasSavedScore: true
    }));
    saveScore();
  };

  const resetTest = () => {
    setState(prev => ({
      ...prev,
      allLines: generateLines(),
      currentLineIndex: 0,
      typedText: "",
      timeLeft: TIME_LIMIT,
      isTestActive: false,
      testStarted: false,
      errors: 0,
      wordsPerMinute: 0,
      correctLetters: 0,
      totalTypedChars: 0,
      hasSavedScore: false,
      isTestCompleted: false,
      shakeError: false
    }));
  };

  const calculateScore = () => ({
    words_per_minute: parseFloat(state.wordsPerMinute),
    accuracy: parseFloat(accuracy),
    average_errors: state.errors
  });

  const saveScore = async () => {
    const scoreData = calculateScore();
    const token = localStorage.getItem('token');
    try {
      if (token) {
        await axios.post('http://localhost:5000/save-score', scoreData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } else {
        localStorage.setItem('typingTestScore', JSON.stringify(scoreData));
      }
    } catch (error) {
      localStorage.setItem('typingTestScore', JSON.stringify(scoreData));
      console.error('Score save failed:', error);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">
          {/* Sidebar */}
          <div className="md:w-1/3 pr-8 mb-8 md:mb-0">
            {/* Statistics Section */}
            <div
              className={`bg-white rounded-xl shadow-lg p-6 mb-4 transition-all duration-500 ease-in-out overflow-hidden ${state.testStarted ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                {state.language === "en" ? "Statistics" : "Statistiques"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-100 p-4 rounded-lg text-center">
                  <div className="text-sm text-indigo-600 font-medium">
                    {state.language === "en" ? "Time Left" : "Temps restant"}
                  </div>
                  <div className="text-3xl font-bold text-indigo-800">{state.timeLeft}s</div>
                </div>
                <div className="bg-purple-100 p-4 rounded-lg text-center">
                  <div className="text-sm text-purple-600 font-medium">
                    {state.language === "en" ? "Words per Minute" : "Mots par minute"}
                  </div>
                  <div className="text-3xl font-bold text-purple-800">{state.wordsPerMinute}</div>
                </div>
                <div className="bg-red-100 p-4 rounded-lg text-center">
                  <div className="text-sm text-red-600 font-medium">
                    {state.language === "en" ? "Errors" : "Erreurs"}
                  </div>
                  <div className="text-3xl font-bold text-red-800">{state.errors}</div>
                </div>
                <div className="bg-green-100 p-4 rounded-lg text-center">
                  <div className="text-sm text-green-600 font-medium">
                    {state.language === "en" ? "Accuracy" : "Précision"}
                  </div>
                  <div className="text-3xl font-bold text-green-800">{accuracy}%</div>
                </div>
              </div>
            </div>

            {/* Settings Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                {state.language === "en" ? "Settings" : "Paramètres"}
              </h2>
              <div className="space-y-4">
                {[
                  {
                    title: state.language === "en" ? "Language" : "Langue",
                    options: [
                      { value: "fr", label: "Français" },
                      { value: "en", label: "English" },
                    ],
                    current: state.language,
                    setter: (lang) => setState((prev) => ({ ...prev, language: lang })),
                  },
                  {
                    title: state.language === "en" ? "Theme" : "Thème",
                    options: [
                      { value: "text", label: state.language === "en" ? "Text" : "Texte" },
                      { value: "word", label: state.language === "en" ? "Words" : "Mots" },
                    ],
                    current: state.theme,
                    setter: (theme) => setState((prev) => ({ ...prev, theme })),
                  },
                ].map((section, i) => (
                  <div key={i}>
                    <h3 className="text-lg font-medium mb-2 text-gray-700">{section.title}</h3>
                    <div className="flex flex-col space-y-2">
                      {section.options.map((option, j) => (
                        <button
                          key={j}
                          onClick={() => section.setter(option.value)}
                          className={`px-4 py-2 rounded-full transition-colors duration-300 ${section.current === option.value
                            ? "bg-indigo-600 text-white"
                            : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          {/* Main Test Section */}
          <div className="md:w-2/3">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8">
                <h1 className="text-4xl font-bold text-center mb-6 text-indigo-600">
                  {state.language === "en" ? "Typing Speed Test" : "Test de vitesse de frappe"}
                </h1>

                <div
                  ref={containerRef}
                  className="bg-gray-50 p-8 rounded-xl mb-8 min-h-[400px] cursor-text"
                  tabIndex={0}
                >
                  <TypingDisplay />
                </div>

                {state.isTestCompleted && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 text-center"
                  >
                    <button
                      onClick={resetTest}
                      className="px-8 py-4 bg-indigo-600 text-white text-xl font-semibold rounded-full hover:bg-indigo-700 transition duration-300 transform hover:scale-105"
                    >
                      {state.language === "en" ? "Start Again" : "Recommencer"}
                    </button>
                  </motion.div>
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