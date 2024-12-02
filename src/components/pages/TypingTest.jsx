import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { textsEn } from "../../texts/texts/en";
import { textsFr } from "../../texts/texts/fr";
import { wordsEn } from "../../texts/words/en";
import { wordsFr } from "../../texts/words/fr";

const TypingTest = () => {
  const [language, setLanguage] = useState("fr");
  const [theme, setTheme] = useState("text");
  const [texts, setTexts] = useState(textsEn);
  const [words, setWords] = useState(wordsFr);
  const [targetTexts, setTargetTexts] = useState([]);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [targetText, setTargetText] = useState("");
  const [typedText, setTypedText] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [isTestActive, setIsTestActive] = useState(false);
  const [testStarted, setTestStarted] = useState(false);
  const [errors, setErrors] = useState(0);
  const [wordsPerMinute, setWordsPerMinute] = useState(0);
  const [correctLetters, setCorrectLetters] = useState(0);
  const [hasSavedScore, setHasSavedScore] = useState(false);
  const [isTestCompleted, setIsTestCompleted] = useState(false);

  useEffect(() => {
    const textMap = {
      text: { en: textsEn, fr: textsFr },
      word: { en: wordsEn, fr: wordsFr }
    };
    setTexts(textMap['text'][language]);
    setWords(textMap['word'][language]);
  }, [theme, language]);

  const generateRandomTexts = useCallback((count = 3) => {
    if (texts.length < count) {
      console.warn("Not enough texts in the source list to generate the required number.");
      return texts; 
    }
    const shuffledTexts = [...texts].sort(() => 0.5 - Math.random());
    return shuffledTexts.slice(0, count);
  }, [texts]);

  const generateRandomWords = useCallback((count = 60) => {
    const selectedWords = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * words.length);
      selectedWords.push(words[randomIndex]);
    }
    return selectedWords.join(' ');
  }, [words]);

  useEffect(() => {
    if (theme === 'text') {
      const randomTexts = generateRandomTexts();
      setTargetTexts(randomTexts);
      setTargetText(randomTexts.join(" ")); 
      setCurrentTextIndex(0);
    } else {
      const randomWordText = generateRandomWords();
      setTargetText(randomWordText);
      setTargetTexts([]);
    }
  }, [texts, words, theme, generateRandomTexts, generateRandomWords]);

  const handleNextText = () => {
    if (currentTextIndex < targetTexts.length - 1) {
      const nextIndex = currentTextIndex + 1;
      setCurrentTextIndex(nextIndex);
      setTargetText(targetTexts[nextIndex]);
      setTypedText(""); // Réinitialise le texte saisi pour le nouveau texte.
      setErrors(0); // Réinitialise le compteur d'erreurs.
      setCorrectLetters(0);
    } else {
      console.log("All texts completed. Ending test early.");
      endTestEarly(); // Termine le test s'il n'y a plus de textes.
    }
  };

  const handleTyping = (event) => {
    const { value } = event.target;
    if (!isTestActive) {
      setIsTestActive(true);
      setTestStarted(true);
    }

    if (value === targetText) {
      handleNextText();
      return;
    }

    if (value.length < typedText.length) {
      setTypedText(value);
      return;
    }

    const lastTypedIndex = value.length - 1;
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

  const calculateWords = (text) => text.trim().split(/\s+/).length;

  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const wordsTyped = calculateWords(typedText);
      setWordsPerMinute(((wordsTyped / (60 - timeLeft)) * 60).toFixed(2));
    }
  }, [typedText, timeLeft, isTestActive]);

  const endTestEarly = () => {
    if (!isTestCompleted) {
      setIsTestCompleted(true);
      setIsTestActive(false);
      autoSaveScore();
      setHasSavedScore(true);
    }
  };

  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if ((timeLeft === 0 || isTestCompleted) && !hasSavedScore) {
      endTest();
      autoSaveScore();
      setHasSavedScore(true);
    }
  }, [isTestActive, timeLeft, isTestCompleted, hasSavedScore]);

  const autoSaveScore = useCallback(async () => {
    const scoreData = {
      words_per_minute: parseFloat(wordsPerMinute),
      accuracy: parseFloat(((correctLetters / (correctLetters + errors || 1)) * 100).toFixed(2)),
      average_errors: errors
    };
    const token = localStorage.getItem('token');
    if (token) {
      try {
        await axios.post('http://localhost:5000/save-score', scoreData, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
      } catch (error) {
        localStorage.setItem('typingTestScore', JSON.stringify(scoreData));
        console.error('Auto-save failed', error);
      }
    } else {
      localStorage.setItem('typingTestScore', JSON.stringify(scoreData));
    }
  }, [wordsPerMinute, correctLetters, errors]);

  const endTest = () => {
    setIsTestActive(false);
  };

  const resetTest = () => {
    if (theme === 'text') {
      const randomTexts = generateRandomTexts();
      setTargetTexts(randomTexts);
      setTargetText(randomTexts[0]);
      setCurrentTextIndex(0);
    } else {
      const randomWordText = generateRandomWords();
      setTargetText(randomWordText);
      setTargetTexts([]);
    }

    setTypedText("");
    setTimeLeft(60);
    setErrors(0);
    setWordsPerMinute(0);
    setCorrectLetters(0);
    setIsTestActive(false);
    setTestStarted(false);
    setHasSavedScore(false);
    setIsTestCompleted(false);
  };

  const accuracy = ((correctLetters / (correctLetters + errors || 1)) * 100).toFixed(2);


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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row">
          <div className="md:w-1/3 pr-8 mb-8 md:mb-0">
            <div
              className={`bg-white rounded-xl shadow-lg p-6 mb-4 transition-all duration-500 ease-in-out overflow-hidden ${testStarted ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                }`}
            >
              <h2 className="text-xl font-semibold mb-4 text-indigo-600">
                {language === "en" ? "Statistics" : "Statistiques"}
              </h2>
              <div className="grid grid-cols-2 gap-4">
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
            </div>

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
                      onClick={() => setTheme("text")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${theme === "text"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        }`}
                    >
                      {language === "en" ? "Text" : "Texte"}
                    </button>
                    <button
                      onClick={() => setTheme("word")}
                      className={`px-4 py-2 rounded-full transition-colors duration-300 ${theme === "word"
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

          <div className="md:w-2/3">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-center mb-2 text-indigo-600">
                  {language === "en" ? "Typing Speed Test" : "Test de vitesse de frappe"}
                </h1>

                {!localStorage.getItem("token") && (
                  <p className="text-center text-[14px] text-gray-500 mb-8">
                    {language === "en"
                      ? "Log in to save your score!"
                      : "Connectez-vous pour enregistrer votre score !"}
                  </p>
                )}

                <div className="mb-8">
                  <div className="bg-gray-100 p-6 rounded-lg select-none">
                    <p className="text-lg leading-relaxed">{getHighlightedText()}</p>
                  </div>
                </div>


                {theme === 'text' && targetTexts.length > 0 && (
                  <div className="text-center text-sm text-gray-500 mb-4">
                    {language === "en"
                      ? `Text ${currentTextIndex + 1} of ${targetTexts.length}`
                      : `Texte ${currentTextIndex + 1} sur ${targetTexts.length}`}
                  </div>
                )}

                <textarea
                  value={typedText}
                  onChange={handleTyping}
                  rows="4"
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={language === "en" ? "Start typing here..." : "Commencez à taper ici..."}
                  disabled={timeLeft === 0 || isTestCompleted}
                />

                {(timeLeft === 0 || isTestCompleted) && (
                  <div className="mt-8 text-center">
                    <div className="flex justify-center space-x-4">
                      <button
                        onClick={resetTest}
                        className="px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition duration-300"
                      >
                        {language === "en" ? "Start Again" : "Recommencer"}
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