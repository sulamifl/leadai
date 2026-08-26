"use client";

import React, { useState } from "react";

const PRIMARY = "#800120";
const SECONDARY = "#14465a";

const StudyPlan = () => {
  const [currentScore, setCurrentScore] = useState("");
  const [targetScore, setTargetScore] = useState("");
  const [weeks, setWeeks] = useState(8);
  const [dailyMinutes, setDailyMinutes] = useState("");
  const [plan, setPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan("");

    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "studyPlan",
          currentScore,
          targetScore,
          weeks,
          dailyMinutes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate study plan");
      }

      setPlan(data.plan || "");
    } catch (err) {
      console.error("StudyPlan error:", err);
      setError(err.message || "Failed to generate study plan. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: SECONDARY }}>
        AI Study Plan
      </h2>

      <form
        onSubmit={handleGenerate}
        className="rounded-2xl border border-gray-200 p-6 shadow-sm mb-8"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: SECONDARY }}>
              Current Score
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="9"
              value={currentScore}
              onChange={(e) => setCurrentScore(e.target.value)}
              placeholder="e.g. 6.0"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: SECONDARY }}>
              Target Score
            </label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="9"
              value={targetScore}
              onChange={(e) => setTargetScore(e.target.value)}
              placeholder="e.g. 7.5"
              required
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: SECONDARY }}>
              Number of Weeks
            </label>
            <input
              type="number"
              min="1"
              max="52"
              value={weeks}
              onChange={(e) => setWeeks(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: SECONDARY }}>
              Minutes per Day
            </label>
            <input
              type="number"
              min="1"
              value={dailyMinutes}
              onChange={(e) => setDailyMinutes(e.target.value)}
              placeholder="e.g. 60"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:border-indigo-500 bg-white text-black"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-3 rounded-lg text-white font-semibold transition hover:opacity-90 disabled:opacity-60"
          style={{ backgroundColor: PRIMARY }}
        >
          {loading ? "Generating..." : "Generate Study Plan"}
        </button>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-8 text-red-600">
          {error}
        </div>
      )}

      {loading && (
        <div className="text-center text-gray-500 py-10">
          Generating your personalized study plan...
        </div>
      )}

      {plan && !loading && (
        <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: SECONDARY }}>
            Your Study Plan
          </h3>
          <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
            {plan}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyPlan;
