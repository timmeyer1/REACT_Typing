import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import depuis parts
import Header from './components/parts/Header';

// Import depuis pages
import HomePage from './components/pages/HomePage';
import TypingTest from './components/pages/TypingTest';
// Auth
import Register from './components/pages/Auth/Register';
import Login from './components/pages/Auth/Login';
import Profile from './components/pages/Auth/Profile';

// Import depuis api
import PrivateRoute from './components/api/PrivateRoute';
import PublicRoute from './components/api/PublicRoute';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/test" element={<TypingTest />} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />

      </Routes>
    </Router>
  );
}

export default App;
