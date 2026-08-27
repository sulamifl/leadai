import { db, auth } from "@/lib/firebase";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  getDocs,
  query,
  orderBy,
  limit,
  serverTimestamp,
  increment,
} from "firebase/firestore";

const GAMIFICATION_COLLECTION = "userGamification";
const LEADERBOARD_COLLECTION = "leaderboard";

/**
 * Получить uid текущего пользователя или выбросить ошибку, если не авторизован.
 * @returns {string} uid пользователя
 */
function getCurrentUserId() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Пользователь не авторизован.");
  }
  return user.uid;
}

/**
 * Формула XP, необходимого для перехода на следующий уровень.
 * Каждый уровень требует на 50 XP больше предыдущего.
 * @param {number} level - текущий уровень (1-based)
 * @returns {number} XP, необходимое для перехода с level на level+1
 */
export function xpForLevel(level) {
  return 100 + (level - 1) * 50;
}

/**
 * Рассчитать уровень и прогресс по общему количеству XP.
 * @param {number} totalXp - общее количество XP
 * @returns {{level: number, currentLevelXp: number, nextLevelXp: number, progressPercent: number}}
 */
export function calculateLevel(totalXp) {
  let level = 1;
  let remaining = totalXp;
  while (remaining >= xpForLevel(level)) {
    remaining -= xpForLevel(level);
    level += 1;
  }
  const currentLevelXp = remaining;
  const nextLevelXp = xpForLevel(level);
  const progressPercent = Math.min(
    Math.round((currentLevelXp / nextLevelXp) * 100),
    100
  );
  return { level, currentLevelXp, nextLevelXp, progressPercent };
}

/**
 * Список всех достижений с условиями разблокировки.
 * Каждое достижение имеет id, иконку и функцию проверки на основе статистики.
 */
export const ACHIEVEMENTS = [
  {
    id: "first_test",
    icon: "🎯",
    check: (stats) => stats.totalTests >= 1,
  },
  {
    id: "five_tests",
    icon: "🏅",
    check: (stats) => stats.totalTests >= 5,
  },
  {
    id: "ten_tests",
    icon: "🥇",
    check: (stats) => stats.totalTests >= 10,
  },
  {
    id: "band6",
    icon: "📈",
    check: (stats) => stats.bestOverall >= 6,
  },
  {
    id: "band7",
    icon: "🚀",
    check: (stats) => stats.bestOverall >= 7,
  },
  {
    id: "all_sections",
    icon: "🧩",
    check: (stats) => stats.sectionsPracticed >= 4,
  },
  {
    id: "streak3",
    icon: "🔥",
    check: (stats) => stats.currentStreak >= 3,
  },
  {
    id: "streak7",
    icon: "⚡",
    check: (stats) => stats.currentStreak >= 7,
  },
  {
    id: "streak30",
    icon: "💎",
    check: (stats) => stats.currentStreak >= 30,
  },
  {
    id: "level5",
    icon: "⭐",
    check: (stats) => stats.level >= 5,
  },
  {
    id: "level10",
    icon: "👑",
    check: (stats) => stats.level >= 10,
  },
];

/**
 * Получить данные геймификации пользователя.
 * @returns {Promise<Object>} данные геймификации
 */
export async function getUserGamification() {
  const user = auth.currentUser;
  if (!user) {
    return {
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      achievements: [],
      totalTests: 0,
      bestOverall: 0,
      sectionsPracticed: 0,
    };
  }

  const docRef = doc(db, GAMIFICATION_COLLECTION, user.uid);
  const docSnap = await getDoc(docRef);

  if (!docSnap.exists()) {
    return {
      totalXp: 0,
      level: 1,
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      achievements: [],
      totalTests: 0,
      bestOverall: 0,
      sectionsPracticed: 0,
    };
  }

  const data = docSnap.data();
  const levelInfo = calculateLevel(data.totalXp || 0);
  return {
    totalXp: data.totalXp || 0,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressPercent: levelInfo.progressPercent,
    currentStreak: data.currentStreak || 0,
    longestStreak: data.longestStreak || 0,
    lastActiveDate: data.lastActiveDate || null,
    achievements: data.achievements || [],
    totalTests: data.totalTests || 0,
    bestOverall: data.bestOverall || 0,
    sectionsPracticed: data.sectionsPracticed || 0,
  };
}

/**
 * Получить сегодняшнюю дату в формате YYYY-MM-DD.
 * @returns {string}
 */
function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Получить вчерашнюю дату в формате YYYY-MM-DD.
 * @returns {string}
 */
function getYesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
}

/**
 * Обновить статистику геймификации после завершения теста.
 * Начисляет XP, обновляет streak, проверяет достижения.
 * @param {Object} options - параметры
 * @param {string} options.testType - тип теста
 * @param {number} options.overallScore - общий балл
 * @param {Array<string>} options.sections - список пройденных секций
 * @returns {Promise<Object>} результат: начисленные XP, новые достижения, уровень
 */
export async function recordTestActivity({ testType, overallScore, sections = [] }) {
  const userId = getCurrentUserId();
  const docRef = doc(db, GAMIFICATION_COLLECTION, userId);
  const docSnap = await getDoc(docRef);

  const today = getTodayKey();
  const yesterday = getYesterdayKey();

  const existing = docSnap.exists() ? docSnap.data() : {};
  const lastActiveDate = existing.lastActiveDate || null;

  // Обновляем streak
  let currentStreak = existing.currentStreak || 0;
  if (lastActiveDate === today) {
    // Уже занимались сегодня — streak не меняется
  } else if (lastActiveDate === yesterday) {
    currentStreak += 1;
  } else {
    currentStreak = 1;
  }
  const longestStreak = Math.max(existing.longestStreak || 0, currentStreak);

  // Начисляем XP: базовые 50 за тест + бонус за балл
  const baseXp = 50;
  const scoreBonus = Math.round((Number(overallScore) || 0) * 10);
  const xpGained = baseXp + scoreBonus;

  const newTotalXp = (existing.totalXp || 0) + xpGained;
  const levelInfo = calculateLevel(newTotalXp);

  // Обновляем статистику тестов
  const totalTests = (existing.totalTests || 0) + 1;
  const bestOverall = Math.max(existing.bestOverall || 0, Number(overallScore) || 0);
  const sectionsPracticed = Math.max(
    existing.sectionsPracticed || 0,
    new Set([...(existing.sectionKeys || []), ...sections]).size
  );

  // Проверяем достижения
  const stats = {
    totalTests,
    bestOverall,
    sectionsPracticed,
    currentStreak,
    level: levelInfo.level,
  };
  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => a.check(stats) && !(existing.achievements || []).includes(a.id)
  ).map((a) => a.id);

  const allAchievements = [...(existing.achievements || []), ...unlockedAchievements];

  const data = {
    userId,
    totalXp: newTotalXp,
    currentStreak,
    longestStreak,
    lastActiveDate: today,
    achievements: allAchievements,
    totalTests,
    bestOverall,
    sectionsPracticed,
    sectionKeys: [...new Set([...(existing.sectionKeys || []), ...sections])],
    updatedAt: serverTimestamp(),
  };

  await setDoc(docRef, data, { merge: true });

  // Обновляем таблицу лидеров
  await updateLeaderboard(userId, {
    totalXp: newTotalXp,
    totalTests,
    bestOverall,
    currentStreak,
  });

  return {
    xpGained,
    newTotalXp,
    level: levelInfo.level,
    currentLevelXp: levelInfo.currentLevelXp,
    nextLevelXp: levelInfo.nextLevelXp,
    progressPercent: levelInfo.progressPercent,
    currentStreak,
    longestStreak,
    unlockedAchievements,
  };
}

/**
 * Обновить запись в таблице лидеров.
 * @param {string} userId - id пользователя
 * @param {Object} stats - статистика
 * @returns {Promise<void>}
 */
async function updateLeaderboard(userId, stats) {
  const user = auth.currentUser;
  const displayName = user?.displayName || "User";
  const photoURL = user?.photoURL || null;

  const docRef = doc(db, LEADERBOARD_COLLECTION, userId);
  await setDoc(
    docRef,
    {
      userId,
      displayName,
      photoURL,
      totalXp: stats.totalXp,
      totalTests: stats.totalTests,
      bestOverall: stats.bestOverall,
      currentStreak: stats.currentStreak,
      updatedAt: serverTimestamp(),
    },
    { merge: true }
  );
}

/**
 * Получить таблицу лидеров (топ пользователей по XP).
 * @param {number} limitCount - количество записей
 * @returns {Promise<Array>} массив записей лидеров
 */
export async function getLeaderboard(limitCount = 20) {
  const user = auth.currentUser;
  const q = query(
    collection(db, LEADERBOARD_COLLECTION),
    orderBy("totalXp", "desc"),
    limit(limitCount)
  );

  const querySnapshot = await getDocs(q);
  const leaderboard = [];
  let rank = 1;
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const levelInfo = calculateLevel(data.totalXp || 0);
    leaderboard.push({
      id: docSnap.id,
      rank: rank++,
      displayName: data.displayName || "User",
      photoURL: data.photoURL || null,
      totalXp: data.totalXp || 0,
      totalTests: data.totalTests || 0,
      bestOverall: data.bestOverall || 0,
      currentStreak: data.currentStreak || 0,
      level: levelInfo.level,
      me: user ? docSnap.id === user.uid : false,
    });
  });

  return leaderboard;
}

/**
 * Получить текущий рейтинг пользователя в таблице лидеров.
 * @returns {Promise<number|null>} ранг пользователя или null
 */
export async function getUserRank() {
  const user = auth.currentUser;
  if (!user) return null;

  const leaderboard = await getLeaderboard(1000);
  const index = leaderboard.findIndex((entry) => entry.id === user.uid);
  return index === -1 ? null : index + 1;
}
