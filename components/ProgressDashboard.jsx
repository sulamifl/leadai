"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar } from "react-chartjs-2";
import { getUserStats, getUserResults } from "@/lib/resultsService";

// Регистрируем необходимые элементы chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const PRIMARY = "#800120";
const SECONDARY = "#14465a";

const ProgressDashboard = () => {
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [statsData, resultsData] = await Promise.all([
          getUserStats(),
          getUserResults(50),
        ]);
        if (!mounted) return;
        setStats(statsData);
        setResults(resultsData);
      } catch (err) {
        console.error("ProgressDashboard error:", err);
        if (mounted) setError("Не удалось загрузить данные о прогрессе.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center text-gray-500">
        Загрузка прогресса...
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6 text-center text-red-500">
        {error}
      </div>
    );
  }

  // Пустое состояние — нет результатов
  if (!stats || stats.totalTests === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="rounded-2xl border border-gray-200 p-10 text-center shadow-sm">
          <h2 className="text-2xl font-bold mb-3" style={{ color: SECONDARY }}>
            Ваш прогресс
          </h2>
          <p className="text-gray-600 mb-6">
            У вас пока нет результатов тестов. Пройдите первый тест, чтобы увидеть
            свою статистику и графики прогресса.
          </p>
          <Link
            href="/tests"
            className="inline-block px-6 py-3 rounded-lg text-white font-semibold transition hover:opacity-90"
            style={{ backgroundColor: PRIMARY }}
          >
            Пройти тест
          </Link>
        </div>
      </div>
    );
  }

  const statCards = [
    { label: "Всего тестов", value: stats.totalTests },
    { label: "Средний балл", value: stats.averageOverall.toFixed(1) },
    { label: "Лучший балл", value: stats.bestOverall.toFixed(1) },
    { label: "Последний балл", value: stats.latestOverall.toFixed(1) },
  ];

  // Линейный график: прогресс по тестам (в обратном порядке — от старых к новым)
  const progressLabels = results
    .slice()
    .reverse()
    .map((_, index) => `Тест ${index + 1}`);
  const progressData = results
    .slice()
    .reverse()
    .map((r) => Number(r.overallScore));

  const lineData = {
    labels: progressLabels,
    datasets: [
      {
        label: "Overall Score",
        data: progressData,
        borderColor: PRIMARY,
        backgroundColor: "rgba(128, 1, 32, 0.1)",
        pointBackgroundColor: PRIMARY,
        pointBorderColor: "#fff",
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 9,
        ticks: { stepSize: 1 },
      },
    },
  };

  // Бар-чарт: средние баллы по секциям
  const sectionLabels = ["Listening", "Reading", "Speaking", "Writing"];
  const sectionData = sectionLabels.map(
    (label) => stats.sectionAverages[label.toLowerCase()] || 0
  );

  const barData = {
    labels: sectionLabels,
    datasets: [
      {
        label: "Средний балл",
        data: sectionData,
        backgroundColor: [
          PRIMARY,
          SECONDARY,
          "rgba(128, 1, 32, 0.6)",
          "rgba(20, 70, 90, 0.6)",
        ],
        borderRadius: 6,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 9,
        ticks: { stepSize: 1 },
      },
    },
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6" style={{ color: SECONDARY }}>
        Ваш прогресс
      </h2>

      {/* Карточки со статистикой */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl p-5 text-white shadow-md"
            style={{ backgroundColor: SECONDARY }}
          >
            <div className="text-sm opacity-80 mb-1">{card.label}</div>
            <div className="text-3xl font-bold">{card.value}</div>
          </div>
        ))}
      </div>

      {/* Линейный график прогресса */}
      <div className="rounded-2xl border border-gray-200 p-6 mb-8 shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: SECONDARY }}>
          Прогресс по тестам
        </h3>
        <div className="h-64">
          <Line data={lineData} options={lineOptions} />
        </div>
      </div>

      {/* Бар-чарт средних баллов по секциям */}
      <div className="rounded-2xl border border-gray-200 p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4" style={{ color: SECONDARY }}>
          Средние баллы по секциям
        </h3>
        <div className="h-64">
          <Bar data={barData} options={barOptions} />
        </div>
      </div>
    </div>
  );
};

export default ProgressDashboard;
