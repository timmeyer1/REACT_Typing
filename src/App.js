import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import depuis parts
import Header from './components/parts/Header';

// Import depuis pages
import HomePage from './components/pages/HomePage';
import TypingTest from './components/pages/TypingTest';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TypingTest />} />
      </Routes>
    </Router>
  );
}

export default App;
