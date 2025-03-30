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
        <label className="block mb-2 font-semibold">📅 Date:</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="p-2 border rounded-lg w-full"
        />

        <label className="block mt-4 font-semibold">💧 Flow Level:</label>
        <select
          value={flow}
          onChange={(e) => setFlow(e.target.value)}
          className="p-2 border rounded-lg w-full"
        >
          <option>Light</option>
          <option>Medium</option>
          <option>Heavy</option>
        </select>

        <button className="mt-6 bg-pink-500 text-white px-4 py-2 rounded-lg shadow-md w-full">
          Save
        </button>
      </form>
    </div>
  );
};

export default LogPeriod;
