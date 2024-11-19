import React, { useState } from 'react';
import HomePage from './components/HomePage';
import TypingTest from './components/TypingTest';

function App() {
  const [testStarted, setTestStarted] = useState(false);

  const startTest = () => {
    setTestStarted(true);
  };

  return (
    <div className="App">
      {testStarted ? <TypingTest /> : <HomePage startTest={startTest} />}
    </div>
  );
}

export default App;
