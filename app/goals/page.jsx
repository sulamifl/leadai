"use client";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import { getUserStats, getUserGoals, saveUserGoals } from "@/lib/resultsService";

const Container = styled.div`
  min-height: 100vh;
  padding: 2rem 1rem;
  max-width: 900px;
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

const GoalForm = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 1rem;
`;

const GoalField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const GoalLabel = styled.label`
  color: var(--app-secondary-text);
  font-size: 0.9rem;
  font-weight: 600;
`;

const GoalInput = styled.input`
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 8px;
  background-color: var(--app-bg);
  color: var(--app-text);
  font-size: 1rem;
  width: 100%;
  &:focus {
    outline: none;
    border-color: #800120;
  }
`;

const SaveButton = styled.button`
  padding: 12px 28px;
  background-color: #800120;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  &:hover {
    background-color: #a00130;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const CompareGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 1.5rem;
`;

const CompareCard = styled.div`
  background-color: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
`;

const CompareLabel = styled.div`
  color: var(--app-secondary-text);
  font-size: 0.85rem;
  margin-bottom: 8px;
  font-weight: 600;
`;

const CompareValue = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: ${(props) => (props.color ? props.color : "var(--app-text)")};
`;

const CompareHint = styled.div`
  font-size: 0.8rem;
  color: var(--app-secondary-text);
  margin-top: 6px;
`;

const GapBar = styled.div`
  background-color: var(--app-muted);
  border-radius: 999px;
  height: 12px;
  overflow: hidden;
  margin: 6px 0;
`;

const GapFill = styled.div`
  background-color: ${(props) => (props.color ? props.color : "#800120")};
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const RecommendationList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const RecommendationItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid var(--app-border);
  &:last-child {
    border-bottom: none;
  }
`;

const RecIcon = styled.span`
  font-size: 1.2rem;
  flex-shrink: 0;
`;

const RecText = styled.div`
  color: var(--app-text);
  font-size: 0.95rem;
  line-height: 1.4;
`;

const SuccessMsg = styled.div`
  background-color: #e8f5e9;
  color: #2e7d32;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 1rem;
  font-weight: 600;
  .dark & {
    background-color: #1b3a20;
    color: #81c784;
  }
`;

const sectionKeys = ["listening", "reading", "writing", "speaking"];

function GoalsPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [stats, setStats] = useState(null);
  const [goals, setGoals] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Форма целей
  const [overallGoal, setOverallGoal] = useState(7);
  const [sectionGoals, setSectionGoals] = useState({
    listening: 7,
    reading: 7,
    writing: 7,
    speaking: 7,
  });

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        const [statsData, goalsData] = await Promise.all([
          getUserStats(),
          getUserGoals(),
        ]);
        if (!mounted) return;
        setStats(statsData);
        setGoals(goalsData);
        if (goalsData) {
          setOverallGoal(Number(goalsData.overall) || 7);
          setSectionGoals({
            listening: Number(goalsData.sections?.listening) || 7,
            reading: Number(goalsData.sections?.reading) || 7,
            writing: Number(goalsData.sections?.writing) || 7,
            speaking: Number(goalsData.sections?.speaking) || 7,
          });
        }
      } catch (err) {
        console.error("Goals page error:", err);
        if (mounted) setError(t("goals_error_load"));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [t]);

  const handleSectionGoalChange = (key, value) => {
    setSectionGoals((prev) => ({ ...prev, [key]: Number(value) || 0 }));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      await saveUserGoals({
        overall: overallGoal,
        sections: sectionGoals,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Save goals error:", err);
      setError(t("goals_error_save"));
    } finally {
      setSaving(false);
    }
  };

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
        <BackLink href="/cabinet">{t("goals_back")}</BackLink>
        <Header>
          <Title>{t("goals_title")}</Title>
          <Subtitle>{t("goals_subtitle")}</Subtitle>
        </Header>
        <EmptyState>
          <h2 style={{ color: "#800120", marginBottom: "15px" }}>
            {t("goals_no_results")}
          </h2>
          <p>{t("goals_no_results_hint")}</p>
          <EmptyLink href="/main">{t("goals_take_test")}</EmptyLink>
        </EmptyState>
      </Container>
    );
  }

  const currentOverall = stats.averageOverall;
  const bestOverall = stats.bestOverall;
  const overallGap = Math.max(0, Number(overallGoal) - currentOverall);

  // Разрыв по секциям
  const sectionGaps = sectionKeys.map((key) => {
    const current = stats.sectionAverages[key] || 0;
    const goal = sectionGoals[key] || 0;
    return {
      key,
      current,
      goal,
      gap: Math.max(0, goal - current),
    };
  });

  // Рекомендации: секции с наибольшим отставанием
  const weakSections = sectionGaps
    .filter((s) => s.gap > 0)
    .sort((a, b) => b.gap - a.gap);

  const overallPercent = Math.min(
    100,
    Math.round((currentOverall / (Number(overallGoal) || 1)) * 100)
  );

  return (
    <Container>
      <BackLink href="/cabinet">{t("goals_back")}</BackLink>
      <Header>
        <Title>{t("goals_title")}</Title>
        <Subtitle>{t("goals_subtitle")}</Subtitle>
      </Header>

      {saved && <SuccessMsg>{t("goals_saved")}</SuccessMsg>}

      {/* Форма целей */}
      <Card>
        <SectionTitle>{t("goals_set_title")}</SectionTitle>
        <GoalForm>
          <GoalField>
            <GoalLabel>{t("goals_overall")}</GoalLabel>
            <GoalInput
              type="number"
              min="0"
              max="9"
              step="0.5"
              value={overallGoal}
              onChange={(e) => setOverallGoal(Number(e.target.value) || 0)}
            />
          </GoalField>
          {sectionKeys.map((key) => (
            <GoalField key={key}>
              <GoalLabel>{t(`goals_section_${key}`)}</GoalLabel>
              <GoalInput
                type="number"
                min="0"
                max="9"
                step="0.5"
                value={sectionGoals[key]}
                onChange={(e) => handleSectionGoalChange(key, e.target.value)}
              />
            </GoalField>
          ))}
        </GoalForm>
        <SaveButton onClick={handleSave} disabled={saving}>
          {saving ? t("goals_saving") : t("goals_save")}
        </SaveButton>
      </Card>

      {/* Сравнение с целевым баллом */}
      <Card>
        <SectionTitle>{t("goals_compare_title")}</SectionTitle>
        <CompareGrid>
          <CompareCard>
            <CompareLabel>{t("goals_current_overall")}</CompareLabel>
            <CompareValue>{currentOverall.toFixed(1)}</CompareValue>
            <CompareHint>{t("goals_average")}</CompareHint>
          </CompareCard>
          <CompareCard>
            <CompareLabel>{t("goals_target_overall")}</CompareLabel>
            <CompareValue color="#800120">{Number(overallGoal).toFixed(1)}</CompareValue>
            <CompareHint>{t("goals_target")}</CompareHint>
          </CompareCard>
          <CompareCard>
            <CompareLabel>{t("goals_gap")}</CompareLabel>
            <CompareValue color={overallGap > 0 ? "#c62828" : "#2e7d32"}>
              {overallGap > 0 ? `-${overallGap.toFixed(1)}` : "0.0"}
            </CompareValue>
            <CompareHint>
              {overallGap > 0 ? t("goals_gap_remaining") : t("goals_gap_reached")}
            </CompareHint>
          </CompareCard>
          <CompareCard>
            <CompareLabel>{t("goals_best_overall")}</CompareLabel>
            <CompareValue>{bestOverall.toFixed(1)}</CompareValue>
            <CompareHint>{t("goals_best")}</CompareHint>
          </CompareCard>
        </CompareGrid>

        {/* Прогресс к цели */}
        <CompareLabel>{t("goals_progress_to_target")}</CompareLabel>
        <GapBar>
          <GapFill style={{ width: `${overallPercent}%` }} />
        </GapBar>
        <CompareHint>
          {t("goals_progress_percent", { percent: overallPercent })}
        </CompareHint>
      </Card>

      {/* Разрыв по секциям */}
      <Card>
        <SectionTitle>{t("goals_sections_title")}</SectionTitle>
        {sectionGaps.map((s) => {
          const percent = Math.min(
            100,
            Math.round((s.current / (s.goal || 1)) * 100)
          );
          const reached = s.gap <= 0;
          return (
            <div key={s.key} style={{ marginBottom: "16px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "4px",
                }}
              >
                <CompareLabel style={{ marginBottom: 0 }}>
                  {t(`goals_section_${s.key}`)}
                </CompareLabel>
                <CompareHint style={{ marginTop: 0 }}>
                  {s.current.toFixed(1)} / {s.goal.toFixed(1)}
                  {reached ? " ✅" : ` (-${s.gap.toFixed(1)})`}
                </CompareHint>
              </div>
              <GapBar>
                <GapFill
                  color={reached ? "#2e7d32" : "#800120"}
                  style={{ width: `${percent}%` }}
                />
              </GapBar>
            </div>
          );
        })}
      </Card>

      {/* Рекомендации */}
      <Card>
        <SectionTitle>{t("goals_recommendations_title")}</SectionTitle>
        {weakSections.length === 0 ? (
          <RecommendationList>
            <RecommendationItem>
              <RecIcon>🎉</RecIcon>
              <RecText>{t("goals_all_reached")}</RecText>
            </RecommendationItem>
          </RecommendationList>
        ) : (
          <RecommendationList>
            {weakSections.map((s) => (
              <RecommendationItem key={s.key}>
                <RecIcon>📈</RecIcon>
                <RecText>
                  {t("goals_recommendation", {
                    section: t(`goals_section_${s.key}`),
                    gap: s.gap.toFixed(1),
                  })}
                </RecText>
              </RecommendationItem>
            ))}
            <RecommendationItem>
              <RecIcon>💡</RecIcon>
              <RecText>{t("goals_tip")}</RecText>
            </RecommendationItem>
          </RecommendationList>
        )}
      </Card>
    </Container>
  );
}

export default function GoalsPage() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <GoalsPageContent />
    </Suspense>
  );
}
