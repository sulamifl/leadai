"use client";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserResults, getUserGoals, getUserStats } from "@/lib/resultsService";
import { exportStudyPlanToPDF } from "@/lib/pdfExport";
import { PuffLoader } from "react-spinners";

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

const Card = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  @media (max-width: 640px) {
    padding: 1rem;
  }
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--app-secondary-text);
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-input-border);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--app-card);
  color: var(--app-text);
  &:focus {
    outline: none;
    border-color: #800120;
    box-shadow: 0 0 0 3px rgba(128, 1, 32, 0.1);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 0.9rem;
  background: #800120;
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 1.05rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
  &:hover:not(:disabled) {
    background: #a30028;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const LoadingBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--app-secondary-text);
`;

const ErrorBox = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #b91c1c;
  padding: 1rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  color: #800120;
  margin: 1.5rem 0 0.75rem;
  .dark & {
    color: #e0526e;
  }
`;

const Summary = styled.p`
  font-size: 1rem;
  color: var(--app-subtext);
  line-height: 1.6;
  margin: 0;
`;

const WeaknessCard = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WeaknessHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const WeaknessName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--app-secondary-text);
  margin: 0;
`;

const BandBadge = styled.span`
  background: #14465a;
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
`;

const WeaknessText = styled.p`
  font-size: 0.95rem;
  color: var(--app-subtext);
  line-height: 1.5;
  margin: 0;
`;

const WeekCard = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const WeekTitle = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--app-secondary-text);
  margin: 0 0 0.5rem;
`;

const WeekFocus = styled.p`
  font-size: 0.95rem;
  color: #800120;
  font-weight: 600;
  margin: 0 0 0.75rem;
  .dark & {
    color: #e0526e;
  }
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
`;

const ListItem = styled.li`
  font-size: 0.95rem;
  color: var(--app-subtext);
  line-height: 1.6;
  margin-bottom: 0.4rem;
`;

const RoutineGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
`;

const RoutineItem = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
`;

const RoutineName = styled.h4`
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--app-secondary-text);
  margin: 0 0 0.5rem;
  text-transform: capitalize;
`;

const RoutineText = styled.p`
  font-size: 0.9rem;
  color: var(--app-subtext);
  line-height: 1.5;
  margin: 0;
`;

const ResourceCard = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
`;

const ResourceName = styled.h4`
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--app-secondary-text);
  margin: 0 0 0.25rem;
`;

const ResourceType = styled.span`
  display: inline-block;
  background: #800120;
  color: #fff;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const ResourceWhy = styled.p`
  font-size: 0.9rem;
  color: var(--app-subtext);
  line-height: 1.5;
  margin: 0;
`;

const MilestoneCard = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  .dark & {
    background: #0f2a1a;
    border-color: #166534;
  }
`;

const MilestoneWeek = styled.span`
  display: inline-block;
  background: #16a34a;
  color: #fff;
  padding: 0.15rem 0.6rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
`;

const MilestoneText = styled.p`
  font-size: 0.95rem;
  color: #14532d;
  line-height: 1.5;
  margin: 0;
  .dark & {
    color: #bbf7d0;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 1.6rem;
  font-weight: 800;
  color: #800120;
  .dark & {
    color: #e0526e;
  }
`;

const StatLabel = styled.div`
  font-size: 0.8rem;
  color: var(--app-secondary-text);
  font-weight: 600;
  margin-top: 0.25rem;
  text-transform: capitalize;
`;

const GoalInfoBox = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-top: 1rem;
`;

const GoalInfoTitle = styled.div`
  font-size: 0.9rem;
  font-weight: 700;
  color: #800120;
  margin-bottom: 0.5rem;
  .dark & {
    color: #e0526e;
  }
`;

const GoalInfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
`;

const GoalInfoItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  color: var(--app-subtext);
`;

const GoalInfoValue = styled.span`
  font-weight: 700;
  color: ${(props) => (props.reached ? "#16a34a" : "#800120")};
  .dark & {
    color: ${(props) => (props.reached ? "#4ade80" : "#e0526e")};
  }
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--app-subtext);
  padding: 2rem;
  background-color: var(--app-muted);
  border-radius: 12px;
`;

const SECTION_KEYS = ["listening", "reading", "speaking", "writing"];

function StudyPlanPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [results, setResults] = useState([]);
  const [sectionAverages, setSectionAverages] = useState({});
  const [weakestSections, setWeakestSections] = useState([]);
  const [historySummary, setHistorySummary] = useState("");

  const [targetScore, setTargetScore] = useState("");
  const [sectionGoals, setSectionGoals] = useState({});
  const [currentOverall, setCurrentOverall] = useState(null);
  const [weeks, setWeeks] = useState(8);
  const [dailyMinutes, setDailyMinutes] = useState("");

  const [plan, setPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        try {
          const [userResults, userGoals, userStats] = await Promise.all([
            getUserResults(50),
            getUserGoals(),
            getUserStats(),
          ]);
          setResults(userResults);
          computeStats(userResults);

          // Интеграция с /goals: предзаполняем целевой балл из сохранённых целей
          if (userGoals) {
            if (userGoals.overall) {
              setTargetScore(String(userGoals.overall));
            }
            if (userGoals.sections) {
              setSectionGoals({
                listening: userGoals.sections.listening || 0,
                reading: userGoals.sections.reading || 0,
                writing: userGoals.sections.writing || 0,
                speaking: userGoals.sections.speaking || 0,
              });
            }
          }

          // Интеграция с /progress: текущий средний общий балл
          if (userStats && userStats.averageOverall) {
            setCurrentOverall(userStats.averageOverall);
          }
        } catch (err) {
          setError(t("error_load_history") + err.message);
        }
      } else {
        setError(t("error_login"));
      }
      setLoading(false);
    });

    return () => unsubscribe();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const computeStats = (userResults) => {
    const averages = {};
    SECTION_KEYS.forEach((key) => {
      const scores = userResults
        .filter((r) => r.sections && r.sections[key] && r.sections[key].score != null)
        .map((r) => Number(r.sections[key].score))
        .filter((score) => !Number.isNaN(score));
      averages[key] =
        scores.length > 0
          ? scores.reduce((sum, score) => sum + score, 0) / scores.length
          : null;
    });

    setSectionAverages(averages);

    // Слабые секции: те, у которых есть средний балл, отсортированные по возрастанию
    const withScores = SECTION_KEYS.filter((key) => averages[key] != null);
    const sorted = [...withScores].sort((a, b) => averages[a] - averages[b]);
    setWeakestSections(sorted);

    // Краткое резюме истории для AI
    if (userResults.length > 0) {
      const summary = userResults
        .slice(0, 10)
        .map((r, i) => {
          const sections = SECTION_KEYS.map(
            (key) =>
              `${key}: ${
                r.sections && r.sections[key] && r.sections[key].score != null
                  ? r.sections[key].score
                  : "N/A"
              }`
          ).join(", ");
          return `Test ${i + 1} (${r.testType || "unknown"}): overall ${r.overallScore ?? "N/A"} | ${sections}`;
        })
        .join("\n");
      setHistorySummary(summary);
    } else {
      setHistorySummary("No test history available yet.");
    }
  };

  const handleDownloadPlan = async () => {
    if (!plan) return;
    try {
      await exportStudyPlanToPDF(plan);
    } catch (err) {
      setError(t("error_download_plan") + err.message);
    }
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setError("");
    setPlan(null);
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "personalizedStudyPlan",
          targetScore,
          weeks,
          dailyMinutes,
          sectionAverages,
          sectionGoals,
          weakestSections,
          historySummary,
          currentOverall,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate the study plan");
      }
      setPlan(data);
    } catch (err) {
      setError(err.message || "An error occurred while generating the study plan.");
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <LoadingBox>
          <PuffLoader color="#800120" size={50} />
          <p>{t("loading_test_history")}</p>
        </LoadingBox>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>{t("personalized_study_plan")}</Title>
        <Subtitle>{t("study_plan_subtitle")}</Subtitle>
      </Header>

      {error && <ErrorBox>{error}</ErrorBox>}

      {user && (
        <>
          <Card>
            <SectionTitle>{t("performance_overview")}</SectionTitle>
            {results.length === 0 ? (
              <EmptyState>
                <p>{t("no_saved_results")}</p>
              </EmptyState>
            ) : (
              <>
                <StatsGrid>
                  {SECTION_KEYS.map((key) => (
                    <StatCard key={key}>
                      <StatValue>
                        {sectionAverages[key] != null
                          ? sectionAverages[key].toFixed(1)
                          : "—"}
                      </StatValue>
                      <StatLabel>{key}</StatLabel>
                    </StatCard>
                  ))}
                </StatsGrid>
                {Object.keys(sectionGoals).some((k) => sectionGoals[k] > 0) && (
                  <GoalInfoBox>
                    <GoalInfoTitle>{t("study_plan_goals_title")}</GoalInfoTitle>
                    <GoalInfoGrid>
                      {SECTION_KEYS.map((key) => {
                        const goal = sectionGoals[key] || 0;
                        const current = sectionAverages[key];
                        const reached =
                          current != null && goal > 0 && current >= goal;
                        return (
                          <GoalInfoItem key={key}>
                            <span>{key}</span>
                            <GoalInfoValue reached={reached}>
                              {current != null ? current.toFixed(1) : "—"} /{" "}
                              {goal > 0 ? goal.toFixed(1) : "—"}
                            </GoalInfoValue>
                          </GoalInfoItem>
                        );
                      })}
                    </GoalInfoGrid>
                  </GoalInfoBox>
                )}
                {weakestSections.length > 0 && (
                  <p style={{ color: "#374151", fontSize: "0.95rem" }}>
                    <strong style={{ color: "#800120" }}>{t("weakest_sections")}</strong>{" "}
                    {weakestSections.join(", ")}
                  </p>
                )}
              </>
            )}
          </Card>

          <Card>
            <SectionTitle>{t("plan_settings")}</SectionTitle>
            <form onSubmit={handleGenerate}>
              <Grid>
                <div>
                  <Label>{t("target_score")}</Label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0"
                    max="9"
                    value={targetScore}
                    onChange={(e) => setTargetScore(e.target.value)}
                    placeholder={t("target_score_placeholder")}
                    required
                  />
                </div>
                <div>
                  <Label>{t("number_of_weeks")}</Label>
                  <Input
                    type="number"
                    min="1"
                    max="52"
                    value={weeks}
                    onChange={(e) => setWeeks(e.target.value)}
                  />
                </div>
                <div>
                  <Label>{t("minutes_per_day")}</Label>
                  <Input
                    type="number"
                    min="1"
                    value={dailyMinutes}
                    onChange={(e) => setDailyMinutes(e.target.value)}
                    placeholder={t("minutes_per_day_placeholder")}
                  />
                </div>
              </Grid>
              <Button
                type="submit"
                disabled={isGenerating || results.length === 0}
              >
                {isGenerating ? t("generating") : t("generate_personalized_plan")}
              </Button>
              {plan && !isGenerating && (
                <Button
                  type="button"
                  onClick={handleDownloadPlan}
                  style={{ marginTop: "0.75rem", background: "#14465a" }}
                >
                  {t("download_plan_pdf")}
                </Button>
              )}
            </form>
          </Card>

          {isGenerating && (
            <Card>
              <LoadingBox>
                <PuffLoader color="#800120" size={50} />
                <p>{t("analyzing_weaknesses")}</p>
              </LoadingBox>
            </Card>
          )}

          {plan && !isGenerating && (
            <>
              {plan.summary && (
                <Card>
                  <SectionTitle>{t("summary")}</SectionTitle>
                  <Summary>{plan.summary}</Summary>
                </Card>
              )}

              {plan.weaknessAnalysis?.length > 0 && (
                <Card>
                  <SectionTitle>{t("weakness_analysis")}</SectionTitle>
                  {plan.weaknessAnalysis.map((w, idx) => (
                    <WeaknessCard key={idx}>
                      <WeaknessHeader>
                        <WeaknessName>{w.section}</WeaknessName>
                        <BandBadge>
                          {w.currentBand != null ? `${t("band")} ${w.currentBand}` : "N/A"}
                          {w.targetBand != null ? ` → ${w.targetBand}` : ""}
                        </BandBadge>
                      </WeaknessHeader>
                      <WeaknessText>{w.analysis}</WeaknessText>
                    </WeaknessCard>
                  ))}
                </Card>
              )}

              {plan.weeklyPlan?.length > 0 && (
                <Card>
                  <SectionTitle>{t("weekly_plan")}</SectionTitle>
                  {plan.weeklyPlan.map((week, idx) => (
                    <WeekCard key={idx}>
                      <WeekTitle>{t("week")} {week.week}</WeekTitle>
                      {week.focus && <WeekFocus>{t("focus")} {week.focus}</WeekFocus>}
                      {week.goals?.length > 0 && (
                        <>
                          <Label>{t("goals")}</Label>
                          <List>
                            {week.goals.map((goal, gi) => (
                              <ListItem key={gi}>{goal}</ListItem>
                            ))}
                          </List>
                        </>
                      )}
                      {week.tasks?.length > 0 && (
                        <>
                          <Label>{t("tasks")}</Label>
                          <List>
                            {week.tasks.map((task, ti) => (
                              <ListItem key={ti}>{task}</ListItem>
                            ))}
                          </List>
                        </>
                      )}
                    </WeekCard>
                  ))}
                </Card>
              )}

              {plan.dailyRoutine && (
                <Card>
                  <SectionTitle>{t("daily_routine")}</SectionTitle>
                  <RoutineGrid>
                    {Object.entries(plan.dailyRoutine).map(([key, value]) => (
                      <RoutineItem key={key}>
                        <RoutineName>{key.replace(/([A-Z])/g, " $1")}</RoutineName>
                        <RoutineText>{value}</RoutineText>
                      </RoutineItem>
                    ))}
                  </RoutineGrid>
                </Card>
              )}

              {plan.resources?.length > 0 && (
                <Card>
                  <SectionTitle>{t("recommended_resources")}</SectionTitle>
                  {plan.resources.map((res, idx) => (
                    <ResourceCard key={idx}>
                      <ResourceName>{res.name}</ResourceName>
                      {res.type && <ResourceType>{res.type}</ResourceType>}
                      {res.why && <ResourceWhy>{res.why}</ResourceWhy>}
                    </ResourceCard>
                  ))}
                </Card>
              )}

              {plan.milestones?.length > 0 && (
                <Card>
                  <SectionTitle>{t("milestones")}</SectionTitle>
                  {plan.milestones.map((ms, idx) => (
                    <MilestoneCard key={idx}>
                      {ms.week != null && <MilestoneWeek>{t("week")} {ms.week}</MilestoneWeek>}
                      <MilestoneText>{ms.checkpoint}</MilestoneText>
                    </MilestoneCard>
                  ))}
                </Card>
              )}

              {plan.recommendations?.length > 0 && (
                <Card>
                  <SectionTitle>{t("recommendations")}</SectionTitle>
                  <List>
                    {plan.recommendations.map((rec, idx) => (
                      <ListItem key={idx}>{rec}</ListItem>
                    ))}
                  </List>
                </Card>
              )}
            </>
          )}
        </>
      )}
    </Container>
  );
}

export default function StudyPlanPage() {
  return (
    <Suspense fallback={null}>
      <StudyPlanPageContent />
    </Suspense>
  );
}
