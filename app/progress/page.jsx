"use client";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";
import { getUserResults, getUserStats } from "@/lib/resultsService";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 1100px;
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

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
`;

const StatLabel = styled.div`
  color: var(--app-secondary-text);
  font-size: 0.85rem;
  margin-bottom: 6px;
`;

const StatValue = styled.div`
  color: #800120;
  font-size: 1.8rem;
  font-weight: 700;
  .dark & {
    color: #e0526e;
  }
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

const ChartWrap = styled.div`
  width: 100%;
  height: 300px;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 16px;
`;

const Badge = styled.div`
  background-color: var(--app-muted);
  border: 2px solid ${(props) => (props.earned ? "#800120" : "var(--app-border)")};
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  opacity: ${(props) => (props.earned ? 1 : 0.5)};
  filter: ${(props) => (props.earned ? "none" : "grayscale(1)")};
  .dark & {
    border-color: ${(props) => (props.earned ? "#e0526e" : "var(--app-border)")};
  }
`;

const BadgeIcon = styled.div`
  font-size: 2.2rem;
  margin-bottom: 8px;
`;

const BadgeName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--app-text);
  margin-bottom: 4px;
`;

const BadgeDesc = styled.div`
  font-size: 0.8rem;
  color: var(--app-secondary-text);
`;

const LevelCard = styled.div`
  background: linear-gradient(135deg, #800120 0%, #a00130 100%);
  border-radius: 12px;
  padding: 24px;
  color: #fff;
  margin-bottom: 2rem;
  box-shadow: 0 6px 20px rgba(128, 1, 32, 0.35);
`;

const LevelLabel = styled.div`
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  opacity: 0.9;
  margin-bottom: 6px;
`;

const LevelName = styled.div`
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 12px;
`;

const ProgressTrack = styled.div`
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  height: 14px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  background-color: #fff;
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const LevelHint = styled.div`
  font-size: 0.85rem;
  opacity: 0.95;
`;

const SectionGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const SectionChartCard = styled(Card)`
  margin-bottom: 0;
`;

const formatDate = (createdAt) => {
  if (!createdAt) return "";
  try {
    if (typeof createdAt.toDate === "function") {
      return createdAt.toDate().toLocaleDateString();
    }
    if (createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleDateString();
    }
    return new Date(createdAt).toLocaleDateString();
  } catch (error) {
    return "";
  }
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

function ProgressPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

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
        console.error("Progress page error:", err);
        if (mounted) setError(t("progress_error_load"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [t]);

  if (loading) {
    return (
      <LoadingContainer>
        <PuffLoader size={60} color="#800120" />
      </LoadingContainer>
    );
  }

  if (error) {
    return (
      <Container>
        <EmptyState>{error}</EmptyState>
      </Container>
    );
  }

  if (!stats || stats.totalTests === 0) {
    return (
      <Container>
        <BackLink href="/cabinet">{t("progress_back")}</BackLink>
        <Header>
          <Title>{t("progress_title")}</Title>
          <Subtitle>{t("progress_subtitle")}</Subtitle>
        </Header>
        <EmptyState>
          <h2 style={{ color: "#800120", marginBottom: "15px" }}>
            {t("progress_no_results")}
          </h2>
          <p>{t("progress_no_results_hint")}</p>
          <EmptyLink href="/main">{t("progress_take_test")}</EmptyLink>
        </EmptyState>
      </Container>
    );
  }

  // Сортируем результаты от старых к новым для графиков
  const ordered = results.slice().reverse();

  // Данные для общего band-графика
  const overallData = ordered.map((r, index) => ({
    name: `${t("progress_test")} ${index + 1}`,
    score: Number(r.overallScore) || 0,
  }));

  // Данные по каждой секции
  const sectionKeys = ["listening", "reading", "writing", "speaking"];
  const sectionData = sectionKeys.map((key) => ({
    name: t(`progress_section_${key}`),
    data: ordered.map((r, index) => ({
      name: `${t("progress_test")} ${index + 1}`,
      score:
        r.sections && r.sections[key] && r.sections[key].score != null
          ? Number(r.sections[key].score)
          : null,
    })),
  }));

  // Вычисление бейджей
  const totalTests = stats.totalTests;
  const bestOverall = stats.bestOverall;
  const practicedSections = new Set();
  results.forEach((r) => {
    if (r.sections) {
      sectionKeys.forEach((key) => {
        if (r.sections[key] && r.sections[key].score != null) {
          practicedSections.add(key);
        }
      });
    }
  });
  const allSectionsPracticed = practicedSections.size === 4;

  const uniqueDays = new Set();
  results.forEach((r) => {
    const key = getDateKey(r.createdAt);
    if (key) uniqueDays.add(key);
  });
  const consistentLearner = uniqueDays.size >= 3;

  const badges = [
    {
      key: "first_test",
      icon: "🎯",
      earned: totalTests >= 1,
      name: t("progress_badge_first_test"),
      desc: t("progress_badge_first_test_desc"),
    },
    {
      key: "five_tests",
      icon: "📚",
      earned: totalTests >= 5,
      name: t("progress_badge_five_tests"),
      desc: t("progress_badge_five_tests_desc"),
    },
    {
      key: "ten_tests",
      icon: "🏆",
      earned: totalTests >= 10,
      name: t("progress_badge_ten_tests"),
      desc: t("progress_badge_ten_tests_desc"),
    },
    {
      key: "band6",
      icon: "🥉",
      earned: bestOverall >= 6,
      name: t("progress_badge_band6"),
      desc: t("progress_badge_band6_desc"),
    },
    {
      key: "band7",
      icon: "🥈",
      earned: bestOverall >= 7,
      name: t("progress_badge_band7"),
      desc: t("progress_badge_band7_desc"),
    },
    {
      key: "all_sections",
      icon: "🧩",
      earned: allSectionsPracticed,
      name: t("progress_badge_all_sections"),
      desc: t("progress_badge_all_sections_desc"),
    },
    {
      key: "consistent",
      icon: "🔥",
      earned: consistentLearner,
      name: t("progress_badge_consistent"),
      desc: t("progress_badge_consistent_desc"),
    },
  ];

  const earnedCount = badges.filter((b) => b.earned).length;

  // Уровень пользователя
  let levelKey = "beginner";
  let levelName = t("progress_level_beginner");
  let nextLevelName = t("progress_level_intermediate");
  let levelProgress = 0;

  if (totalTests >= 10 && stats.averageOverall >= 6.5) {
    levelKey = "advanced";
    levelName = t("progress_level_advanced");
    nextLevelName = null;
    levelProgress = 100;
  } else if (totalTests >= 5 && stats.averageOverall >= 5.5) {
    levelKey = "intermediate";
    levelName = t("progress_level_intermediate");
    nextLevelName = t("progress_level_advanced");
    // Прогресс от intermediate к advanced
    const testsProgress = Math.min(totalTests / 10, 1);
    const scoreProgress = Math.min(stats.averageOverall / 6.5, 1);
    levelProgress = Math.round(((testsProgress + scoreProgress) / 2) * 100);
  } else {
    levelKey = "beginner";
    levelName = t("progress_level_beginner");
    nextLevelName = t("progress_level_intermediate");
    const testsProgress = Math.min(totalTests / 5, 1);
    const scoreProgress = Math.min(stats.averageOverall / 5.5, 1);
    levelProgress = Math.round(((testsProgress + scoreProgress) / 2) * 100);
  }

  const statCards = [
    { label: t("progress_stat_total"), value: stats.totalTests },
    { label: t("progress_stat_average"), value: stats.averageOverall.toFixed(1) },
    { label: t("progress_stat_best"), value: stats.bestOverall.toFixed(1) },
    { label: t("progress_stat_latest"), value: stats.latestOverall.toFixed(1) },
  ];

  const chartTooltipStyle = {
    backgroundColor: "var(--app-card)",
    border: "1px solid var(--app-border)",
    borderRadius: "8px",
    color: "var(--app-text)",
  };

  return (
    <Container>
      <BackLink href="/cabinet">{t("progress_back")}</BackLink>
      <Header>
        <Title>{t("progress_title")}</Title>
        <Subtitle>{t("progress_subtitle")}</Subtitle>
      </Header>

      {/* Статистика */}
      <StatGrid>
        {statCards.map((card) => (
          <StatCard key={card.label}>
            <StatLabel>{card.label}</StatLabel>
            <StatValue>{card.value}</StatValue>
          </StatCard>
        ))}
      </StatGrid>

      {/* Уровень пользователя */}
      <LevelCard>
        <LevelLabel>{t("progress_level_label")}</LevelLabel>
        <LevelName>{levelName}</LevelName>
        {nextLevelName ? (
          <>
            <ProgressTrack>
              <ProgressFill style={{ width: `${levelProgress}%` }} />
            </ProgressTrack>
            <LevelHint>
              {t("progress_level_progress", {
                percent: levelProgress,
                next: nextLevelName,
              })}
            </LevelHint>
          </>
        ) : (
          <LevelHint>{t("progress_level_max")}</LevelHint>
        )}
      </LevelCard>

      {/* Общий band-график */}
      <Card>
        <SectionTitle>{t("progress_overall_chart")}</SectionTitle>
        <ChartWrap>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={overallData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
              <XAxis dataKey="name" stroke="var(--app-secondary-text)" />
              <YAxis domain={[0, 9]} stroke="var(--app-secondary-text)" />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Legend />
              <Line
                type="monotone"
                dataKey="score"
                name={t("progress_overall_band")}
                stroke="#800120"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrap>
      </Card>

      {/* Графики по секциям */}
      <SectionTitle>{t("progress_sections_chart")}</SectionTitle>
      <SectionGrid>
        {sectionData.map((section) => (
          <SectionChartCard key={section.name}>
            <SectionTitle>{section.name}</SectionTitle>
            <ChartWrap>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={section.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--app-border)" />
                  <XAxis dataKey="name" stroke="var(--app-secondary-text)" />
                  <YAxis domain={[0, 9]} stroke="var(--app-secondary-text)" />
                  <Tooltip contentStyle={chartTooltipStyle} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="score"
                    name={t("progress_overall_band")}
                    stroke="#14465a"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          </SectionChartCard>
        ))}
      </SectionGrid>

      {/* Достижения / бейджи */}
      <Card>
        <SectionTitle>
          {t("progress_badges_title")} ({earnedCount}/{badges.length})
        </SectionTitle>
        <BadgeGrid>
          {badges.map((badge) => (
            <Badge key={badge.key} earned={badge.earned}>
              <BadgeIcon>{badge.icon}</BadgeIcon>
              <BadgeName>{badge.name}</BadgeName>
              <BadgeDesc>{badge.desc}</BadgeDesc>
            </Badge>
          ))}
        </BadgeGrid>
      </Card>
    </Container>
  );
}

export default function ProgressPage() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <ProgressPageContent />
    </Suspense>
  );
}
