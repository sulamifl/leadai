"use client";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import { getUserResults } from "@/lib/resultsService";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 1000px;
  margin: 0 auto;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: var(--app-text);
  background: var(--app-bg);
  @media (max-width: 640px) {
    padding: 1.25rem 0.75rem;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: 700;
  color: #800120;
  margin-bottom: 0.5rem;
  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
  .dark & {
    color: #e0526e;
  }
`;

const Subtitle = styled.p`
  color: var(--app-secondary-text);
  font-size: 1rem;
  max-width: 680px;
  margin: 0 auto;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-bottom: 1.5rem;
  color: #800120;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
  .dark & {
    color: #e0526e;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const Card = styled.div`
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 2rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const SectionTitle = styled.h2`
  color: #800120;
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 1rem;
  .dark & {
    color: #e0526e;
  }
`;

const SectionDesc = styled.p`
  color: var(--app-secondary-text);
  font-size: 0.9rem;
  margin-bottom: 1.25rem;
`;

const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid var(--app-border);
  &:last-child {
    border-bottom: none;
  }
  @media (max-width: 560px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const RowLabel = styled.div`
  font-weight: 600;
  font-size: 0.95rem;
`;

const RowHint = styled.div`
  font-size: 0.8rem;
  color: var(--app-secondary-text);
  margin-top: 2px;
`;

const Toggle = styled.button`
  width: 52px;
  height: 28px;
  border-radius: 999px;
  border: none;
  cursor: pointer;
  position: relative;
  background-color: ${(props) => (props.active ? "#800120" : "var(--app-border)")};
  transition: background-color 0.3s ease;
  flex-shrink: 0;
  .dark & {
    background-color: ${(props) => (props.active ? "#e0526e" : "var(--app-border)")};
  }
  &::after {
    content: "";
    position: absolute;
    top: 3px;
    left: ${(props) => (props.active ? "26px" : "3px")};
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background-color: #fff;
    transition: left 0.3s ease;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background-color: var(--app-card);
  color: var(--app-text);
  font-size: 0.9rem;
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: #800120;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border-radius: 8px;
  border: 1px solid var(--app-border);
  background-color: var(--app-card);
  color: var(--app-text);
  font-size: 0.9rem;
  &:focus {
    outline: none;
    border-color: #800120;
  }
`;

const TimeInput = styled(Input)`
  width: 110px;
`;

const PrimaryButton = styled.button`
  padding: 10px 22px;
  background-color: #800120;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: #a00130;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .dark & {
    background-color: #e0526e;
    &:hover {
      background-color: #f06a84;
    }
  }
`;

const SecondaryButton = styled.button`
  padding: 10px 22px;
  background-color: transparent;
  color: #800120;
  border: 1px solid #800120;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  &:hover {
    background-color: rgba(128, 1, 32, 0.08);
  }
  .dark & {
    color: #e0526e;
    border-color: #e0526e;
    &:hover {
      background-color: rgba(224, 82, 110, 0.12);
    }
  }
`;

const StatusBadge = styled.span`
  display: inline-block;
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 0.8rem;
  font-weight: 600;
  background-color: ${(props) => (props.success ? "rgba(34,197,94,0.15)" : "rgba(239,68,68,0.15)")};
  color: ${(props) => (props.success ? "#16a34a" : "#dc2626")};
  margin-left: 8px;
`;

const GoalGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 1.5rem;
`;

const GoalCard = styled.div`
  background-color: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
`;

const GoalValue = styled.div`
  color: #800120;
  font-size: 2rem;
  font-weight: 700;
  .dark & {
    color: #e0526e;
  }
`;

const GoalLabel = styled.div`
  color: var(--app-secondary-text);
  font-size: 0.85rem;
  margin-top: 4px;
`;

const ProgressTrack = styled.div`
  background-color: var(--app-border);
  border-radius: 999px;
  height: 14px;
  overflow: hidden;
  margin: 12px 0 8px;
`;

const ProgressFill = styled.div`
  background: linear-gradient(90deg, #800120, #a00130);
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
  .dark & {
    background: linear-gradient(90deg, #e0526e, #f06a84);
  }
`;

const ProgressHint = styled.div`
  font-size: 0.85rem;
  color: var(--app-secondary-text);
  text-align: center;
`;

const WeekGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  margin-top: 12px;
`;

const DayCell = styled.div`
  background-color: ${(props) => (props.active ? "#800120" : "var(--app-muted)")};
  color: ${(props) => (props.active ? "#fff" : "var(--app-secondary-text)")};
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 10px 4px;
  text-align: center;
  font-size: 0.75rem;
  .dark & {
    background-color: ${(props) => (props.active ? "#e0526e" : "var(--app-muted)")};
  }
`;

const DayName = styled.div`
  font-weight: 700;
  margin-bottom: 4px;
`;

const DayDot = styled.div`
  font-size: 1rem;
`;

const NotifPermission = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 8px;
`;

const HintText = styled.p`
  font-size: 0.85rem;
  color: var(--app-secondary-text);
  margin-top: 10px;
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--app-subtext);
  padding: 40px;
  background-color: var(--app-muted);
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const EmptyLink = styled(Link)`
  display: inline-block;
  margin-top: 16px;
  padding: 10px 24px;
  background-color: #800120;
  color: #fff;
  border-radius: 8px;
  font-weight: 600;
  text-decoration: none;
  &:hover {
    background-color: #a00130;
  }
`;

const STORAGE_KEY = "ielts_reminder_settings";
const GOAL_KEY = "ielts_daily_goal";
const HISTORY_KEY = "ielts_practice_history";

const getTodayKey = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
};

const getDateKey = (createdAt) => {
  if (!createdAt) return "";
  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate().toISOString().slice(0, 10);
    }
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toISOString().slice(0, 10);
    }
    return new Date(createdAt).toISOString().slice(0, 10);
  } catch (error) {
    return "";
  }
};

const defaultSettings = {
  pushEnabled: false,
  emailEnabled: false,
  frequency: "daily",
  time: "19:00",
  dailyGoalMinutes: 30,
};

function NotificationsPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [settings, setSettings] = useState(defaultSettings);
  const [todayMinutes, setTodayMinutes] = useState(0);
  const [weekHistory, setWeekHistory] = useState({});
  const [notifPermission, setNotifPermission] = useState("default");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    // Загружаем настройки из localStorage
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSettings({ ...defaultSettings, ...JSON.parse(stored) });
      }
      const goal = localStorage.getItem(GOAL_KEY);
      if (goal) {
        setTodayMinutes(Number(goal) || 0);
      }
      const history = localStorage.getItem(HISTORY_KEY);
      if (history) {
        setWeekHistory(JSON.parse(history));
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }

    // Проверяем статус разрешения на уведомления
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotifPermission(Notification.permission);
    }

    // Загружаем результаты для подсчёта практики
    let mounted = true;
    const loadResults = async () => {
      try {
        const data = await getUserResults(100);
        if (mounted) setResults(data);
      } catch (error) {
        console.error("Error loading results:", error);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadResults();

    return () => {
      mounted = false;
    };
  }, []);

  // Подсчёт минут практики за сегодня на основе результатов
  useEffect(() => {
    if (results.length === 0) return;
    const today = getTodayKey();
    const minutes = results
      .filter((r) => getDateKey(r.createdAt) === today)
      .reduce((sum, r) => {
        // Каждый тест примерно 30 минут практики
        return sum + 30;
      }, 0);
    setTodayMinutes((prev) => Math.max(prev, minutes));
  }, [results]);

  const saveSettings = (newSettings) => {
    setSettings(newSettings);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const toggleSetting = (key) => {
    saveSettings({ ...settings, [key]: !settings[key] });
  };

  const handleEnablePush = async () => {
    if (!("Notification" in window)) {
      alert(t("notif_not_supported"));
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setNotifPermission(permission);
      if (permission === "granted") {
        saveSettings({ ...settings, pushEnabled: true });
        // Отправляем тестовое уведомление
        new Notification(t("notif_test_title"), {
          body: t("notif_test_body"),
          icon: "/logo.png",
        });
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
    }
  };

  const handleTestNotification = () => {
    if (!("Notification" in window)) {
      alert(t("notif_not_supported"));
      return;
    }
    if (Notification.permission !== "granted") {
      alert(t("notif_need_permission"));
      return;
    }
    new Notification(t("notif_test_title"), {
      body: t("notif_test_body"),
      icon: "/logo.png",
    });
  };

  const handleAddMinutes = (minutes) => {
    const newTotal = todayMinutes + minutes;
    setTodayMinutes(newTotal);
    try {
      localStorage.setItem(GOAL_KEY, String(newTotal));
      // Обновляем историю за неделю
      const today = getTodayKey();
      const newHistory = { ...weekHistory, [today]: newTotal };
      setWeekHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleResetToday = () => {
    setTodayMinutes(0);
    try {
      localStorage.setItem(GOAL_KEY, "0");
      const today = getTodayKey();
      const newHistory = { ...weekHistory, [today]: 0 };
      setWeekHistory(newHistory);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
    } catch (error) {
      console.error("Error resetting goal:", error);
    }
  };

  const goalMinutes = Number(settings.dailyGoalMinutes) || 30;
  const goalProgress = Math.min((todayMinutes / goalMinutes) * 100, 100);
  const goalReached = todayMinutes >= goalMinutes;

  // Строим неделю (последние 7 дней)
  const weekDays = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
      d.getDate()
    ).padStart(2, "0")}`;
    const minutes = weekHistory[key] || 0;
    weekDays.push({
      key,
      name: d.toLocaleDateString(undefined, { weekday: "short" }),
      active: minutes >= goalMinutes,
      minutes,
    });
  }

  const streak = weekDays.filter((d) => d.active).length;

  if (loading) {
    return (
      <LoadingContainer>
        <PuffLoader size={60} color="#800120" />
      </LoadingContainer>
    );
  }

  return (
    <Container>
      <BackLink href="/cabinet">{t("notif_back")}</BackLink>
      <Header>
        <Title>{t("notif_title")}</Title>
        <Subtitle>{t("notif_subtitle")}</Subtitle>
      </Header>

      {/* Ежедневные цели */}
      <Card>
        <SectionTitle>{t("notif_goals_title")}</SectionTitle>
        <SectionDesc>{t("notif_goals_desc")}</SectionDesc>

        <GoalGrid>
          <GoalCard>
            <GoalValue>{todayMinutes}</GoalValue>
            <GoalLabel>{t("notif_goal_today_min")}</GoalLabel>
          </GoalCard>
          <GoalCard>
            <GoalValue>{goalMinutes}</GoalValue>
            <GoalLabel>{t("notif_goal_target")}</GoalLabel>
          </GoalCard>
          <GoalCard>
            <GoalValue>{streak}/7</GoalValue>
            <GoalLabel>{t("notif_goal_streak")}</GoalLabel>
          </GoalCard>
        </GoalGrid>

        <ProgressTrack>
          <ProgressFill style={{ width: `${goalProgress}%` }} />
        </ProgressTrack>
        <ProgressHint>
          {goalReached
            ? t("notif_goal_reached")
            : t("notif_goal_progress", {
                percent: Math.round(goalProgress),
                remaining: Math.max(goalMinutes - todayMinutes, 0),
              })}
        </ProgressHint>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "16px" }}>
          <PrimaryButton onClick={() => handleAddMinutes(15)}>
            +15 {t("notif_min")}
          </PrimaryButton>
          <PrimaryButton onClick={() => handleAddMinutes(30)}>
            +30 {t("notif_min")}
          </PrimaryButton>
          <PrimaryButton onClick={() => handleAddMinutes(60)}>
            +60 {t("notif_min")}
          </PrimaryButton>
          <SecondaryButton onClick={handleResetToday}>{t("notif_goal_reset")}</SecondaryButton>
        </div>

        <HintText>{t("notif_goal_hint")}</HintText>

        <WeekGrid>
          {weekDays.map((day) => (
            <DayCell key={day.key} active={day.active}>
              <DayName>{day.name}</DayName>
              <DayDot>{day.active ? "✅" : "○"}</DayDot>
              <div>{day.minutes}m</div>
            </DayCell>
          ))}
        </WeekGrid>
      </Card>

      {/* Настройки напоминаний */}
      <Card>
        <SectionTitle>{t("notif_settings_title")}</SectionTitle>
        <SectionDesc>{t("notif_settings_desc")}</SectionDesc>

        <Row>
          <div>
            <RowLabel>{t("notif_push_label")}</RowLabel>
            <RowHint>{t("notif_push_hint")}</RowHint>
          </div>
          <Toggle active={settings.pushEnabled} onClick={() => toggleSetting("pushEnabled")} />
        </Row>

        {settings.pushEnabled && (
          <NotifPermission>
            {notifPermission === "granted" ? (
              <>
                <StatusBadge success>{t("notif_permission_granted")}</StatusBadge>
                <SecondaryButton onClick={handleTestNotification}>
                  {t("notif_test_button")}
                </SecondaryButton>
              </>
            ) : (
              <>
                <StatusBadge>{t("notif_permission_denied")}</StatusBadge>
                <PrimaryButton onClick={handleEnablePush}>
                  {t("notif_enable_button")}
                </PrimaryButton>
              </>
            )}
          </NotifPermission>
        )}

        <Row>
          <div>
            <RowLabel>{t("notif_email_label")}</RowLabel>
            <RowHint>{t("notif_email_hint")}</RowHint>
          </div>
          <Toggle active={settings.emailEnabled} onClick={() => toggleSetting("emailEnabled")} />
        </Row>

        <Row>
          <div>
            <RowLabel>{t("notif_frequency_label")}</RowLabel>
            <RowHint>{t("notif_frequency_hint")}</RowHint>
          </div>
          <Select
            value={settings.frequency}
            onChange={(e) => saveSettings({ ...settings, frequency: e.target.value })}
          >
            <option value="daily">{t("notif_freq_daily")}</option>
            <option value="every_other_day">{t("notif_freq_every_other")}</option>
            <option value="weekly">{t("notif_freq_weekly")}</option>
          </Select>
        </Row>

        <Row>
          <div>
            <RowLabel>{t("notif_time_label")}</RowLabel>
            <RowHint>{t("notif_time_hint")}</RowHint>
          </div>
          <TimeInput
            type="time"
            value={settings.time}
            onChange={(e) => saveSettings({ ...settings, time: e.target.value })}
          />
        </Row>

        <Row>
          <div>
            <RowLabel>{t("notif_goal_min_label")}</RowLabel>
            <RowHint>{t("notif_goal_min_hint")}</RowHint>
          </div>
          <Select
            value={settings.dailyGoalMinutes}
            onChange={(e) => saveSettings({ ...settings, dailyGoalMinutes: Number(e.target.value) })}
          >
            <option value={15}>15</option>
            <option value={30}>30</option>
            <option value={45}>45</option>
            <option value={60}>60</option>
            <option value={90}>90</option>
            <option value={120}>120</option>
          </Select>
        </Row>

        {saved && <StatusBadge success>{t("notif_saved")}</StatusBadge>}
      </Card>

      {/* Информация о напоминаниях */}
      <Card>
        <SectionTitle>{t("notif_info_title")}</SectionTitle>
        <SectionDesc>{t("notif_info_desc")}</SectionDesc>
        <HintText>{t("notif_info_note")}</HintText>
      </Card>
    </Container>
  );
}

export default function NotificationsPage() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <NotificationsPageContent />
    </Suspense>
  );
}
