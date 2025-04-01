import React, { useState } from "react";

const LogPeriod = () => {
  const [date, setDate] = useState("");
  const [flow, setFlow] = useState("Light");

  return (
    <div className="min-h-screen bg-white p-6">
      <header className="text-center text-2xl font-bold text-pink-600">
        Log Your Period
      </header>

      <form className="mt-6 p-4 bg-pink-100 rounded-lg shadow-md">
        <label className="block mb-2 text-gray-700">
          Date:
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="ml-2 p-1 border border-gray-300 rounded"
          />
        </label>

        <label className="block mb-2 text-gray-700">
          Flow:
          <select
            value={flow}
            onChange={(e) => setFlow(e.target.value)}
            className="ml-2 p-1 border border-gray-300 rounded"
          >
            <option value="Light">Light</option>
            <option value="Medium">Medium</option>
            <option value="Heavy">Heavy</option>
          </select>
        </label>

        <button
          type="submit"
          className="mt-4 px-4 py-2 bg-pink-500 text-white rounded"
        >
          Log Period
        </button>
      </form>

      <footer className="mt-6 text-center text-sm text-gray-500">
        &copy; 2025 Menstrual Health App
      </footer>
    </div>
  );
};

export default LogPeriod;
