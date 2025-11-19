import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import TestAPIPage from './pages/TestAPIPage';
import './app.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/test" element={<TestAPIPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
