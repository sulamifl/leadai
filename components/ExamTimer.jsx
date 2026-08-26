"use client";
import React, { useState, useEffect, useRef } from 'react';

/**
 * ExamTimer — переиспользуемый таймер обратного отсчёта для симуляции
 * реального тайминга IELTS.
 *
 * Props:
 *  - duration: число секунд, отведённых на секцию (например 30 * 60)
 *  - onTimeUp: callback, вызываемый один раз по истечении времени
 *  - warningThreshold: число секунд, при котором таймер подсвечивается красным
 *                     (по умолчанию 5 минут = 300 секунд)
 *  - label: необязательный текст-подпись перед таймером (например "Time left")
 *  - paused: необязательный флаг для приостановки отсчёта (по умолчанию false)
 */
const ExamTimer = ({
  duration,
  onTimeUp,
  warningThreshold = 5 * 60,
  label = 'Time left',
  paused = false,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration);
  const onTimeUpRef = useRef(onTimeUp);
  const firedRef = useRef(false);

  // Держим актуальный callback в ref, чтобы не перезапускать интервал
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // Сбрасываем таймер при смене duration (новая секция)
  useEffect(() => {
    setTimeLeft(duration);
    firedRef.current = false;
  }, [duration]);

  useEffect(() => {
    if (paused) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!firedRef.current) {
            firedRef.current = true;
            onTimeUpRef.current && onTimeUpRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [paused, duration]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n) => (n < 10 ? `0${n}` : `${n}`);

    // Для длинных секций (>= 1 часа) показываем HH:MM:SS
    if (hours > 0) {
      return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    }
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const isWarning = timeLeft <= warningThreshold && timeLeft > 0;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '10px 16px',
        borderRadius: '8px',
        marginBottom: '16px',
        fontFamily: "'Roboto', sans-serif",
        fontWeight: 'bold',
        fontSize: '20px',
        color: isWarning ? '#ffffff' : '#800120',
        backgroundColor: isWarning ? '#c62828' : '#fbe9e7',
        border: isWarning ? '2px solid #b71c1c' : '2px solid #800120',
        transition: 'background-color 0.3s, color 0.3s',
      }}
    >
      <span style={{ fontSize: '14px', fontWeight: 'normal', opacity: 0.9 }}>
        {label}:
      </span>
      <span>{formatTime(timeLeft)}</span>
      {isWarning && (
        <span style={{ fontSize: '14px', fontWeight: 'normal', marginLeft: '4px' }}>
          ⚠
        </span>
      )}
    </div>
  );
};

export default ExamTimer;
