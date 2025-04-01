import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white p-6">
      <header className="text-center text-2xl font-bold text-pink-600">
        Welcome to the Menstrual Health App
      </header>

      <div className="mt-6 p-4 bg-pink-100 rounded-lg shadow-md">
        <p className="text-lg text-gray-700">
          Track your menstrual cycle, log your periods, and manage your health
          with ease.
        </p>
      </div>

      <footer className="mt-6 text-center text-sm text-gray-500">
        &copy; 2025 Menstrual Health App
      </footer>
      <div className="mt-6 text-center">
        <p className="text-gray-500">Developed by AmanCrafts</p>
        <p className="text-gray-500">Version 1.0</p>
    </div>
    </div>


  );
};

export default Home;
