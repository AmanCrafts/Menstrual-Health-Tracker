import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home"; // Import Home Screen
import LogPeriod from "./components/logs"; // Import Log Period Screen


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 p-6">
        {/* 🌟 Navbar */}
        <nav className="flex justify-around bg-pink-500 text-white p-3 rounded-lg shadow-md">
          <Link to="/" className="hover:underline">🏠 Home</Link>
          <Link to="/log-period" className="hover:underline">🩸 Log Period</Link>
        </nav>

        {/* 🌟 Routes */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log-period" element={<LogPeriod />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
