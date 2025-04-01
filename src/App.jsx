import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from "./components/home"; // Import Home Screen
import LogPeriod from "./components/logs"; // Import Log Period Screen
import Login from "./components/Login";


const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-white p-6">
        <header className="text-center text-2xl font-bold text-pink-600">
          Menstrual Health App
        </header>

        <nav className="mt-4">
          <Link to="/" className="text-pink-500 mr-4">
            Home
          </Link>
          <Link to="/log" className="text-pink-500">
            Log Period
          </Link>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/log" element={<LogPeriod />} />
        </Routes>

        <Login></Login>
      </div>


    </Router>
  );
};


export default App;
