import React from "react";

const Home = () => {
  return (
    <div className="min-h-screen bg-pink-50 p-6">
      {/* Header */}
      <header className="text-center text-2xl font-bold text-pink-600">
        🩸 Period Tracker
      </header>

      {/* Cycle Overview */}
      <div className="mt-6 p-4 bg-white rounded-lg shadow-md">
        <p className="text-lg">🔴 Next Period in <strong>5 days</strong></p>
        <p className="text-lg">🟢 Ovulation in <strong>10 days</strong></p>
      </div>

      {/* Action Buttons */}
      <div className="mt-4 flex justify-center gap-4">
        <button className="bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md">
          Log Period
        </button>
        <button className="bg-purple-500 text-white px-4 py-2 rounded-lg shadow-md">
          View History
        </button>
      </div>

      {/* Insights & Articles */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="p-4 bg-white rounded-lg shadow-md text-center">
          📊 <strong>Insights</strong>
        </div>
        <div className="p-4 bg-white rounded-lg shadow-md text-center">
          📚 <strong>Articles</strong>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-6 text-center text-gray-500">
        🔔 Reminders | 🛠 Settings
      </footer>
    </div>
  );
};

export default Home;
