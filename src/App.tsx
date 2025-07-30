import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Portfolio from './pages/Portfolio';
import Calculator from './pages/Calculator';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Routes>
          <Route path="/" element={<Portfolio />} />
          <Route path="/calculadora" element={<Calculator />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;