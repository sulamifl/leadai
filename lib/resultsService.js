import { db, auth } from "@/lib/firebase";
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";

const RESULTS_COLLECTION = "testResults";

/**
 * Получить uid текущего пользователя или выбросить ошибку, если не авторизован.
 * @returns {string} uid пользователя
 */
function getCurrentUserId() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Пользователь не авторизован. Войдите в аккаунт, чтобы сохранить результат теста.");
  }
  return user.uid;
}

/**
 * Сохранить результат теста в Firestore.
 * @param {Object} resultData - данные результата
 * @param {string} resultData.testType - тип теста
 * @param {number} resultData.overallScore - общий балл
 * @param {Object} resultData.sections - объект секций с feedback/score
 * @param {Object} resultData.examples - объект с примерами (listening/speaking/reading/writing)
 * @param {Array} resultData.universityRecommendations - рекомендации университетов
 * @returns {Promise<string>} id созданного документа
 */
export async function saveTestResult(resultData) {
  const userId = getCurrentUserId();

  const docRef = await addDoc(collection(db, RESULTS_COLLECTION), {
    userId,
    testType: resultData.testType,
    overallScore: resultData.overallScore,
    sections: resultData.sections,
    examples: resultData.examples,
    universityRecommendations: resultData.universityRecommendations,
    createdAt: serverTimestamp(),
  });

  return docRef.id;
}

/**
 * Получить результаты текущего пользователя, отсортированные по createdAt по убыванию.
 * @param {number} limitCount - максимальное количество результатов (по умолчанию 50)
 * @returns {Promise<Array>} массив результатов с полем id
 */
export async function getUserResults(limitCount = 50) {
  const user = auth.currentUser;
  if (!user) {
    return [];
  }

  const q = query(
    collection(db, RESULTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);

  const results = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    // Фильтруем по userId на клиенте, т.к. запрос не содержит фильтра по пользователю
    if (data.userId === user.uid) {
      results.push({ id: docSnap.id, ...data });
    }
  });

  return results;
}

/**
 * Получить один результат по id.
 * @param {string} resultId - id документа
 * @returns {Promise<Object|null>} результат с полем id или null
 */
export async function getResultById(resultId) {
  const docRef = doc(db, RESULTS_COLLECTION, resultId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return null;
  }

  return { id: docSnap.id, ...docSnap.data() };
}

/**
 * Удалить результат по id, только если он принадлежит текущему пользователю.
 * @param {string} resultId - id документа
 * @returns {Promise<void>}
 */
export async function deleteResult(resultId) {
  const userId = getCurrentUserId();

  const docRef = doc(db, RESULTS_COLLECTION, resultId);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    throw new Error("Результат не найден.");
  }

  if (docSnap.data().userId !== userId) {
    throw new Error("Вы не можете удалить этот результат — он принадлежит другому пользователю.");
  }

  await deleteDoc(docRef);
}

/**
 * Получить агрегированную статистику по всем результатам пользователя.
 * @returns {Promise<Object>} статистика
 */
export async function getUserStats() {
  const user = auth.currentUser;
  if (!user) {
    return {
      totalTests: 0,
      averageOverall: 0,
      bestOverall: 0,
      latestOverall: 0,
      sectionAverages: { listening: 0, reading: 0, speaking: 0, writing: 0 },
    };
  }

  const q = query(
    collection(db, RESULTS_COLLECTION),
    orderBy("createdAt", "desc"),
    limit(1000)
  );

  const querySnapshot = await getDocs(q);

  const results = [];
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data.userId === user.uid) {
      results.push(data);
    }
  });

  if (results.length === 0) {
    return {
      totalTests: 0,
      averageOverall: 0,
      bestOverall: 0,
      latestOverall: 0,
      sectionAverages: { listening: 0, reading: 0, speaking: 0, writing: 0 },
    };
  }

  const overallScores = results
    .map((r) => Number(r.overallScore))
    .filter((score) => !Number.isNaN(score));

  const totalTests = results.length;
  const averageOverall =
    overallScores.length > 0
      ? overallScores.reduce((sum, score) => sum + score, 0) / overallScores.length
      : 0;
  const bestOverall = overallScores.length > 0 ? Math.max(...overallScores) : 0;
  const latestOverall = overallScores.length > 0 ? overallScores[0] : 0;

  // Средние баллы по каждой секции (только по результатам, где секция присутствует)
  const sectionKeys = ["listening", "reading", "speaking", "writing"];
  const sectionAverages = {};

  sectionKeys.forEach((key) => {
    const scores = results
      .filter((r) => r.sections && r.sections[key] && r.sections[key].score != null)
      .map((r) => Number(r.sections[key].score))
      .filter((score) => !Number.isNaN(score));

    sectionAverages[key] =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;
  });

  return {
    totalTests,
    averageOverall,
    bestOverall,
    latestOverall,
    sectionAverages,
  };
}
