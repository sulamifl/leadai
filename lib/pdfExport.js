/**
 * Модуль экспорта результатов IELTS-теста в PDF.
 *
 * Использует библиотеку jspdf (генератор PDF). Импорт jspdf выполняется
 * динамически и только на клиенте, чтобы избежать обращения к document/window
 * во время серверного рендеринга Next.js.
 */

const SECTION_LABELS = {
  listening: "Listening",
  reading: "Reading",
  speaking: "Speaking",
  writing: "Writing",
};

const SECTION_ORDER = ["listening", "reading", "writing", "speaking"];

/**
 * Утилита: добавляет многострочный текст в PDF с переносом по словам.
 * @param {import('jspdf').jsPDF} doc - экземпляр jsPDF
 * @param {string} text - текст для вывода
 * @param {number} x - координата X
 * @param {number} y - координата Y (обновляется по ссылке через объект)
 * @param {Object} options - параметры
 * @param {number} options.maxWidth - максимальная ширина строки
 * @param {number} options.lineHeight - высота строки
 * @param {Object} options.style - стиль текста (fontSize, fontStyle, textColor)
 * @param {number} options.pageMarginBottom - нижний отступ страницы для авто-переноса
 * @param {number} options.pageHeight - высота страницы
 */
function writeWrappedText(doc, text, x, yRef, options = {}) {
  const {
    maxWidth = 180,
    lineHeight = 6,
    style = {},
    pageMarginBottom = 20,
    pageHeight = 297,
  } = options;

  const lines = doc.splitTextToSize(text, maxWidth);

  lines.forEach((line) => {
    if (yRef.value > pageHeight - pageMarginBottom) {
      doc.addPage();
      yRef.value = 20;
    }
    doc.setFontSize(style.fontSize || 10);
    doc.setFont("helvetica", style.fontStyle || "normal");
    if (style.textColor) {
      doc.setTextColor(...style.textColor);
    }
    doc.text(line, x, yRef.value);
    yRef.value += lineHeight;
  });
}

/**
 * Утилита: добавляет заголовок секции в PDF.
 */
function writeSectionTitle(doc, title, yRef, options = {}) {
  const { maxWidth = 180, pageHeight = 297, pageMarginBottom = 20 } = options;
  if (yRef.value > pageHeight - pageMarginBottom) {
    doc.addPage();
    yRef.value = 20;
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(20, 70, 90); // #14465a
  doc.text(title, 15, yRef.value);
  yRef.value += 8;
}

/**
 * Утилита: добавляет горизонтальный разделитель.
 */
function writeDivider(doc, yRef, options = {}) {
  const { pageHeight = 297, pageMarginBottom = 20 } = options;
  if (yRef.value > pageHeight - pageMarginBottom) {
    doc.addPage();
    yRef.value = 20;
  }
  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.5);
  doc.line(15, yRef.value, 195, yRef.value);
  yRef.value += 8;
}

/**
 * Форматирует дату из различных форматов (Firestore Timestamp, {seconds}, Date, строка).
 * @param {*} createdAt - дата создания результата
 * @returns {string} отформатированная строка даты
 */
function formatDate(createdAt) {
  if (!createdAt) return "Unknown date";
  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate().toLocaleString();
    }
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleString();
    }
    return new Date(createdAt).toLocaleString();
  } catch (error) {
    return "Unknown date";
  }
}

/**
 * Извлекает балл секции из данных результата.
 * Поддерживает структуру { score } и строку feedback с "Score: X".
 * @param {Object} sectionData - данные секции
 * @returns {number|null} балл или null
 */
function extractSectionScore(sectionData) {
  if (!sectionData) return null;
  if (typeof sectionData.score === "number") return sectionData.score;
  if (sectionData.score != null) return Number(sectionData.score);
  if (typeof sectionData.feedback === "string") {
    const match = sectionData.feedback.match(/Score:\s*(\d+(\.\d+)?)/);
    if (match) return parseFloat(match[1]);
  }
  return null;
}

/**
 * Генерирует и скачивает PDF-отчёт с результатами IELTS-теста.
 *
 * @param {Object} params - параметры экспорта
 * @param {string} params.testType - тип теста (full / academic / general / toefl)
 * @param {number} params.overallScore - общий балл
 * @param {Object} params.sections - объект секций { listening: { score, feedback }, ... }
 * @param {Object} [params.examples] - примеры ответов { listening, reading, writing, speaking }
 * @param {string|Array} [params.universityRecommendations] - рекомендации университетов
 * @param {*} [params.createdAt] - дата теста
 * @param {string} [params.fileName] - имя файла (по умолчанию IELTS_Test_Report.pdf)
 * @returns {Promise<void>}
 */
export async function exportResultsToPDF({
  testType,
  overallScore,
  sections = {},
  examples = {},
  universityRecommendations,
  createdAt,
  fileName = "IELTS_Test_Report.pdf",
}) {
  // Динамический импорт jspdf — только на клиенте.
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageHeight = 297;
  const pageMarginBottom = 20;
  const yRef = { value: 20 };

  // --- Заголовок отчёта ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(128, 1, 32); // #800120
  doc.text("IELTS Test Report", 15, yRef.value);
  yRef.value += 10;

  // --- Дата теста ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Test Date: ${formatDate(createdAt)}`, 15, yRef.value);
  yRef.value += 6;

  // --- Тип теста ---
  if (testType) {
    doc.text(`Test Type: ${testType}`, 15, yRef.value);
    yRef.value += 6;
  }

  writeDivider(doc, yRef, { pageHeight, pageMarginBottom });

  // --- Общий балл ---
  writeSectionTitle(doc, "Overall Score", yRef, { pageHeight, pageMarginBottom });
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(128, 1, 32);
  doc.text(`${overallScore != null ? overallScore : "N/A"} / 9`, 15, yRef.value);
  yRef.value += 10;

  writeDivider(doc, yRef, { pageHeight, pageMarginBottom });

  // --- Баллы по секциям ---
  writeSectionTitle(doc, "Section Scores", yRef, { pageHeight, pageMarginBottom });

  const sectionKeys = SECTION_ORDER.filter((key) => sections[key] != null);
  if (sectionKeys.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("No section scores available.", 15, yRef.value);
    yRef.value += 6;
  } else {
    sectionKeys.forEach((key) => {
      const label = SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
      const score = extractSectionScore(sections[key]);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 70, 90);
      doc.text(label, 15, yRef.value);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);
      doc.text(`${score != null ? score : "N/A"} / 9`, 80, yRef.value);
      yRef.value += 7;
    });
  }

  writeDivider(doc, yRef, { pageHeight, pageMarginBottom });

  // --- Рекомендации университетов ---
  if (universityRecommendations) {
    writeSectionTitle(doc, "University Recommendations", yRef, { pageHeight, pageMarginBottom });
    const text =
      typeof universityRecommendations === "string"
        ? universityRecommendations
        : JSON.stringify(universityRecommendations, null, 2);
    writeWrappedText(doc, text, 15, yRef, {
      maxWidth: 180,
      lineHeight: 5,
      style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
      pageHeight,
      pageMarginBottom,
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Примеры ответов ---
  const exampleKeys = SECTION_ORDER.filter((key) => examples[key]);
  if (exampleKeys.length > 0) {
    writeSectionTitle(doc, "Example Answers", yRef, { pageHeight, pageMarginBottom });

    exampleKeys.forEach((key) => {
      const label = SECTION_LABELS[key] || key.charAt(0).toUpperCase() + key.slice(1);
      writeSectionTitle(doc, `${label} Examples`, yRef, { pageHeight, pageMarginBottom });

      const content = examples[key];
      if (typeof content === "string") {
        writeWrappedText(doc, content, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      } else {
        writeWrappedText(doc, JSON.stringify(content, null, 2), 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }
      yRef.value += 4;
    });

    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Подвал ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by IELTS Trainer", 15, pageHeight - 10);

  doc.save(fileName);
}

/**
 * Утилита: выводит строку с переносом и возвращает новое значение Y.
 * Используется для компактного вывода списков в PDF.
 */
function writeBullet(doc, text, yRef, options = {}) {
  const {
    maxWidth = 180,
    lineHeight = 5,
    style = {},
    pageMarginBottom = 20,
    pageHeight = 297,
  } = options;

  const lines = doc.splitTextToSize(text, maxWidth);
  lines.forEach((line) => {
    if (yRef.value > pageHeight - pageMarginBottom) {
      doc.addPage();
      yRef.value = 20;
    }
    doc.setFontSize(style.fontSize || 10);
    doc.setFont("helvetica", style.fontStyle || "normal");
    if (style.textColor) {
      doc.setTextColor(...style.textColor);
    }
    doc.text(line, 15, yRef.value);
    yRef.value += lineHeight;
  });
}

/**
 * Генерирует и скачивает PDF-отчёт с персонализированным планом обучения.
 *
 * @param {Object} planData - данные плана обучения
 * @param {string} [planData.summary] - краткое резюме плана
 * @param {Array} [planData.weaknessAnalysis] - анализ слабых мест
 *   [{ section, currentBand, targetBand, analysis }]
 * @param {Array} [planData.weeklyPlan] - недельный план
 *   [{ week, focus, goals[], tasks[] }]
 * @param {Object} [planData.dailyRoutine] - ежедневная рутина { ключ: значение }
 * @param {Array} [planData.resources] - рекомендуемые ресурсы
 *   [{ name, type, why }]
 * @param {Array} [planData.milestones] - контрольные точки
 *   [{ week, checkpoint }]
 * @param {Array} [planData.recommendations] - рекомендации (строки)
 * @param {string} [planData.fileName] - имя файла (по умолчанию IELTS_Study_Plan.pdf)
 * @returns {Promise<void>}
 */
export async function exportStudyPlanToPDF(planData = {}) {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageHeight = 297;
  const pageMarginBottom = 20;
  const yRef = { value: 20 };

  const {
    summary,
    weaknessAnalysis = [],
    weeklyPlan = [],
    dailyRoutine,
    resources = [],
    milestones = [],
    recommendations = [],
    fileName = "IELTS_Study_Plan.pdf",
  } = planData;

  // --- Заголовок ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(128, 1, 32); // #800120
  doc.text("Personalized Study Plan", 15, yRef.value);
  yRef.value += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 15, yRef.value);
  yRef.value += 6;

  writeDivider(doc, yRef, { pageHeight, pageMarginBottom });

  // --- Резюме ---
  if (summary) {
    writeSectionTitle(doc, "Summary", yRef, { pageHeight, pageMarginBottom });
    writeWrappedText(doc, summary, 15, yRef, {
      maxWidth: 180,
      lineHeight: 5,
      style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
      pageHeight,
      pageMarginBottom,
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Анализ слабых мест ---
  if (weaknessAnalysis.length > 0) {
    writeSectionTitle(doc, "Weakness Analysis", yRef, { pageHeight, pageMarginBottom });
    weaknessAnalysis.forEach((w) => {
      const bandText =
        w.currentBand != null
          ? `Band ${w.currentBand}${w.targetBand != null ? ` → ${w.targetBand}` : ""}`
          : "N/A";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 70, 90);
      doc.text(`${w.section || "Section"} — ${bandText}`, 15, yRef.value);
      yRef.value += 6;
      if (w.analysis) {
        writeWrappedText(doc, w.analysis, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }
      yRef.value += 3;
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Недельный план ---
  if (weeklyPlan.length > 0) {
    writeSectionTitle(doc, "Weekly Plan", yRef, { pageHeight, pageMarginBottom });
    weeklyPlan.forEach((week) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(20, 70, 90);
      doc.text(`Week ${week.week != null ? week.week : ""}`, 15, yRef.value);
      yRef.value += 6;

      if (week.focus) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(128, 1, 32);
        doc.text(`Focus: ${week.focus}`, 15, yRef.value);
        yRef.value += 6;
      }

      if (week.goals && week.goals.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Goals:", 15, yRef.value);
        yRef.value += 5;
        week.goals.forEach((goal) => {
          writeBullet(doc, `• ${goal}`, yRef, {
            maxWidth: 175,
            lineHeight: 5,
            style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
            pageHeight,
            pageMarginBottom,
          });
        });
      }

      if (week.tasks && week.tasks.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.text("Tasks:", 15, yRef.value);
        yRef.value += 5;
        week.tasks.forEach((task) => {
          writeBullet(doc, `• ${task}`, yRef, {
            maxWidth: 175,
            lineHeight: 5,
            style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
            pageHeight,
            pageMarginBottom,
          });
        });
      }
      yRef.value += 3;
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Ежедневная рутина ---
  if (dailyRoutine && typeof dailyRoutine === "object") {
    writeSectionTitle(doc, "Daily Routine", yRef, { pageHeight, pageMarginBottom });
    Object.entries(dailyRoutine).forEach(([key, value]) => {
      const label = key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase());
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 70, 90);
      doc.text(label, 15, yRef.value);
      yRef.value += 5;
      writeWrappedText(doc, String(value), 15, yRef, {
        maxWidth: 180,
        lineHeight: 5,
        style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
        pageHeight,
        pageMarginBottom,
      });
      yRef.value += 2;
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Рекомендуемые ресурсы ---
  if (resources.length > 0) {
    writeSectionTitle(doc, "Recommended Resources", yRef, { pageHeight, pageMarginBottom });
    resources.forEach((res) => {
      const name = res.name || "Resource";
      const type = res.type ? ` [${res.type}]` : "";
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 70, 90);
      doc.text(`${name}${type}`, 15, yRef.value);
      yRef.value += 5;
      if (res.why) {
        writeWrappedText(doc, res.why, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }
      yRef.value += 2;
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Контрольные точки ---
  if (milestones.length > 0) {
    writeSectionTitle(doc, "Milestones", yRef, { pageHeight, pageMarginBottom });
    milestones.forEach((ms) => {
      const weekPrefix = ms.week != null ? `Week ${ms.week}: ` : "";
      writeBullet(doc, `• ${weekPrefix}${ms.checkpoint || ""}`, yRef, {
        maxWidth: 175,
        lineHeight: 5,
        style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
        pageHeight,
        pageMarginBottom,
      });
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Рекомендации ---
  if (recommendations.length > 0) {
    writeSectionTitle(doc, "Recommendations", yRef, { pageHeight, pageMarginBottom });
    recommendations.forEach((rec) => {
      writeBullet(doc, `• ${rec}`, yRef, {
        maxWidth: 175,
        lineHeight: 5,
        style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
        pageHeight,
        pageMarginBottom,
      });
    });
    writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
  }

  // --- Подвал ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by IELTS Trainer", 15, pageHeight - 10);

  doc.save(fileName);
}

/**
 * Генерирует и скачивает PDF-отчёт со словарём сохранённой лексики.
 *
 * @param {Array} words - массив слов [{ word, definition, translation, partOfSpeech, example, synonyms, bandLevel }]
 * @param {string} [fileName] - имя файла (по умолчанию IELTS_Vocabulary.pdf)
 * @returns {Promise<void>}
 */
export async function exportVocabularyToPDF(words = [], fileName = "IELTS_Vocabulary.pdf") {
  const { jsPDF } = await import("jspdf");

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageHeight = 297;
  const pageMarginBottom = 20;
  const yRef = { value: 20 };

  // --- Заголовок ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(128, 1, 32); // #800120
  doc.text("IELTS Vocabulary", 15, yRef.value);
  yRef.value += 10;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(80, 80, 80);
  doc.text(`Words: ${words.length}`, 15, yRef.value);
  yRef.value += 6;

  writeDivider(doc, yRef, { pageHeight, pageMarginBottom });

  if (words.length === 0) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    doc.text("No words saved yet.", 15, yRef.value);
    yRef.value += 6;
  } else {
    words.forEach((item, index) => {
      // --- Слово ---
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(128, 1, 32);
      const wordLabel = item.word || "Word";
      const pos = item.partOfSpeech ? ` (${item.partOfSpeech})` : "";
      const band = item.bandLevel ? ` — ${item.bandLevel}` : "";
      doc.text(`${index + 1}. ${wordLabel}${pos}${band}`, 15, yRef.value);
      yRef.value += 6;

      // --- Определение ---
      if (item.definition) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 70, 90);
        doc.text("Definition:", 15, yRef.value);
        yRef.value += 5;
        writeWrappedText(doc, item.definition, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }

      // --- Перевод ---
      if (item.translation) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 70, 90);
        doc.text("Translation (RU):", 15, yRef.value);
        yRef.value += 5;
        writeWrappedText(doc, item.translation, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }

      // --- Пример ---
      if (item.example) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 70, 90);
        doc.text("Example:", 15, yRef.value);
        yRef.value += 5;
        writeWrappedText(doc, item.example, 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "italic", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }

      // --- Синонимы ---
      if (item.synonyms && item.synonyms.length > 0) {
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        doc.setTextColor(20, 70, 90);
        doc.text("Synonyms:", 15, yRef.value);
        yRef.value += 5;
        writeWrappedText(doc, item.synonyms.join(", "), 15, yRef, {
          maxWidth: 180,
          lineHeight: 5,
          style: { fontSize: 10, fontStyle: "normal", textColor: [50, 50, 50] },
          pageHeight,
          pageMarginBottom,
        });
      }

      yRef.value += 4;
      writeDivider(doc, yRef, { pageHeight, pageMarginBottom });
    });
  }

  // --- Подвал ---
  doc.setFont("helvetica", "italic");
  doc.setFontSize(9);
  doc.setTextColor(150, 150, 150);
  doc.text("Generated by IELTS Trainer", 15, pageHeight - 10);

  doc.save(fileName);
}
