import React, { useState, useEffect, useCallback } from "react";
import axios from 'axios';
import { textsEn } from "../../texts/texts/en";
import { textsFr } from "../../texts/texts/fr";
import { wordsEn } from "../../texts/words/en";
import { wordsFr } from "../../texts/words/fr";

const TypingTest = () => {
  const [state, setState] = useState({
    language: "fr",
    theme: "text",
    targetText: "",
    typedText: "",
    timeLeft: 60,
    isTestActive: false,
    testStarted: false,
    errors: 0,
    wordsPerMinute: 0,
    correctLetters: 0,
    hasSavedScore: false,
    isTestCompleted: false
  });

  const textMap = {
    text: { en: textsEn, fr: textsFr },
    word: { en: wordsEn, fr: wordsFr }
  };

  const generateRandomContent = useCallback(() => {
    const currentTexts = textMap[state.theme][state.language];
    if (state.theme === 'text') {
      const shuffled = [...currentTexts].sort(() => 0.5 - Math.random());
      return shuffled.slice(0, 3).join(" ");
    }
    return Array(60).fill().map(() =>
      currentTexts[Math.floor(Math.random() * currentTexts.length)]
    ).join(' ');
  }, [state.theme, state.language]);

  useEffect(() => {
    setState(prev => ({ ...prev, targetText: generateRandomContent() }));
  }, [state.language, state.theme, generateRandomContent]);

  const calculateScore = () => ({
    words_per_minute: parseFloat(state.wordsPerMinute),
    accuracy: parseFloat(((state.correctLetters / (state.correctLetters + state.errors || 1)) * 100).toFixed(2)),
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

  const handleTyping = (event) => {
    const { value } = event.target;
    if (!state.isTestActive) {
      setState(prev => ({ ...prev, isTestActive: true, testStarted: true }));
    }

    const lastIndex = value.length - 1;
    const isCorrect = lastIndex >= 0 && value[lastIndex] === state.targetText[lastIndex];

    setState(prev => ({
      ...prev,
      typedText: value,
      correctLetters: isCorrect ? prev.correctLetters + 1 : prev.correctLetters,
      errors: isCorrect ? prev.errors : prev.errors + 1
    }));

    if (value === state.targetText) {
      endTest();
    }
  };

  const endTest = () => {
    setState(prev => ({
      ...prev,
      isTestActive: false,
      isTestCompleted: true,
      hasSavedScore: true
    }));
    saveScore();
  };

  useEffect(() => {
    if (state.isTestActive && state.timeLeft > 0) {
      const timerId = setInterval(() => {
        setState(prev => ({
          ...prev,
          timeLeft: prev.timeLeft - 1,
          wordsPerMinute: ((prev.typedText.trim().split(/\s+/).length / (60 - prev.timeLeft)) * 60).toFixed(2)
        }));
      }, 1000);
      return () => clearInterval(timerId);
    } else if (state.timeLeft === 0 && !state.hasSavedScore) {
      endTest();
    }
  }, [state.isTestActive, state.timeLeft]);

  const resetTest = () => {
    setState({
      ...state,
      targetText: generateRandomContent(),
      typedText: "",
      timeLeft: 60,
      isTestActive: false,
      testStarted: false,
      errors: 0,
      wordsPerMinute: 0,
      correctLetters: 0,
      hasSavedScore: false,
      isTestCompleted: false
    });
  };

  const getHighlightedText = () => {
    return state.targetText.split("").map((char, index) => (
      <span
        key={index}
        className={index < state.typedText.length ?
          (char === state.typedText[index] ? "text-green-500" : "text-red-500") :
          ""}
      >
        {char}
      </span>
    ));
  };

  const accuracy = ((state.correctLetters / (state.correctLetters + state.errors || 1)) * 100).toFixed(2);

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
                {[
                  { label: state.language === "en" ? "Time Left" : "Temps restant", value: `${state.timeLeft}s`, bg: "indigo" },
                  { label: state.language === "en" ? "Words per Minute" : "Mots par minute", value: state.wordsPerMinute, bg: "purple" },
                  { label: state.language === "en" ? "Errors" : "Erreurs", value: state.errors, bg: "red" },
                  { label: state.language === "en" ? "Accuracy" : "Précision", value: `${accuracy}%`, bg: "green" },
                ].map(({ label, value, bg }, i) => (
                  <div key={i} className={`bg-${bg}-100 p-4 rounded-lg text-center`}>
                    <div className={`text-sm text-${bg}-600 font-medium`}>{label}</div>
                    <div className={`text-3xl font-bold text-${bg}-800`}>{value}</div>
                  </div>
                ))}
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
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-8">
                <h1 className="text-3xl font-bold text-center mb-2 text-indigo-600">
                  {state.language === "en" ? "Typing Speed Test" : "Test de vitesse de frappe"}
                </h1>

                {!localStorage.getItem("token") && (
                  <p className="text-center text-[14px] text-gray-500 mb-8">
                    {state.language === "en"
                      ? "Log in to save your score!"
                      : "Connectez-vous pour enregistrer votre score !"}
                  </p>
                )}

                <div className="mb-8">
                  <div className="bg-gray-100 p-6 rounded-lg select-none">
                    <p className="text-lg leading-relaxed">{getHighlightedText()}</p>
                  </div>
                </div>

                <textarea
                  value={state.typedText}
                  onChange={handleTyping}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  placeholder={state.language === "en" ? "Start typing here..." : "Commencez à taper ici..."}
                  disabled={state.timeLeft === 0 || state.isTestCompleted}
                />

                {(state.timeLeft === 0 || state.isTestCompleted) && (
                  <div className="mt-8 text-center">
                    <button
                      onClick={resetTest}
                      className="px-6 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-full hover:bg-indigo-700 transition duration-300"
                    >
                      {state.language === "en" ? "Start Again" : "Recommencer"}
                    </button>
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