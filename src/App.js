import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import depuis parts
import Header from './components/parts/Header';

// Import depuis pages
import HomePage from './components/pages/HomePage';
import TypingTest from './components/pages/TypingTest';
import Register from './components/pages/Auth/Register';
import Login from './components/pages/Auth/Login';
import Profile from './components/pages/Auth/Profile';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TypingTest />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
      </Routes>
    </Router>
  );
}

export default App;
