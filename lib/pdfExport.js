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
