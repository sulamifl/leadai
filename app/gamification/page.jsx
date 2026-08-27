"use client";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import { getUserGamification, ACHIEVEMENTS } from "@/lib/gamification";

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

const LevelHero = styled.div`
  background: linear-gradient(135deg, #800120 0%, #a00130 100%);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: #fff;
  margin-bottom: 1.5rem;
  box-shadow: 0 6px 20px rgba(128, 1, 32, 0.35);
  .dark & {
    background: linear-gradient(135deg, #e0526e 0%, #f06a84 100%);
  }
`;

const LevelBadge = styled.div`
  font-size: 4rem;
  font-weight: 800;
  line-height: 1;
  margin-bottom: 8px;
`;

const LevelLabel = styled.div`
  font-size: 1.1rem;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
  margin-bottom: 16px;
`;

const XpText = styled.div`
  font-size: 1rem;
  opacity: 0.95;
  margin-bottom: 12px;
`;

const ProgressTrack = styled.div`
  background-color: rgba(255, 255, 255, 0.25);
  border-radius: 999px;
  height: 14px;
  overflow: hidden;
  margin: 12px 0 8px;
`;

const ProgressFill = styled.div`
  background: linear-gradient(90deg, #ffd700, #ffb300);
  height: 100%;
  border-radius: 999px;
  transition: width 0.5s ease;
`;

const ProgressHint = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 18px;
  text-align: center;
`;

const StatValue = styled.div`
  color: #800120;
  font-size: 2rem;
  font-weight: 700;
  .dark & {
    color: #e0526e;
  }
`;

const StatLabel = styled.div`
  color: var(--app-secondary-text);
  font-size: 0.85rem;
  margin-top: 4px;
`;

const BadgeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 16px;
`;

const BadgeCard = styled.div`
  background-color: ${(props) => (props.unlocked ? "var(--app-muted)" : "rgba(0,0,0,0.03)")};
  border: 1px solid ${(props) => (props.unlocked ? "var(--app-border)" : "var(--app-border)")};
  border-radius: 12px;
  padding: 18px;
  text-align: center;
  opacity: ${(props) => (props.unlocked ? 1 : 0.45)};
  filter: ${(props) => (props.unlocked ? "none" : "grayscale(1)")};
`;

const BadgeIcon = styled.div`
  font-size: 2.5rem;
  margin-bottom: 8px;
`;

const BadgeName = styled.div`
  font-weight: 700;
  font-size: 0.9rem;
  margin-bottom: 4px;
`;

const BadgeDesc = styled.div`
  font-size: 0.75rem;
  color: var(--app-secondary-text);
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

function GamificationPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [gamification, setGamification] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const data = await getUserGamification();
        if (mounted) setGamification(data);
      } catch (err) {
        console.error("Error loading gamification:", err);
        if (mounted) setError(err.message || "network");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

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
        <BackLink href="/cabinet">{t("gam_back")}</BackLink>
        <EmptyState>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
          <p>{t("error_network")}</p>
          <EmptyLink href="/cabinet">{t("gam_back")}</EmptyLink>
        </EmptyState>
      </Container>
    );
  }

  if (!gamification) {
    return (
      <Container>
        <BackLink href="/cabinet">{t("gam_back")}</BackLink>
        <EmptyState>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🎮</div>
          <p>{t("gam_no_data")}</p>
          <EmptyLink href="/main">{t("gam_take_test")}</EmptyLink>
        </EmptyState>
      </Container>
    );
  }

  const unlockedIds = gamification.achievements || [];

  return (
    <Container>
      <BackLink href="/cabinet">{t("gam_back")}</BackLink>
      <Header>
        <Title>{t("gam_title")}</Title>
        <Subtitle>{t("gam_subtitle")}</Subtitle>
      </Header>

      {/* Уровень и XP */}
      <Card>
        <LevelHero>
          <LevelBadge>{gamification.level}</LevelBadge>
          <LevelLabel>{t("gam_level")}</LevelLabel>
          <XpText>
            {gamification.totalXp} {t("gam_xp")}
          </XpText>
          <ProgressTrack>
            <ProgressFill style={{ width: `${gamification.progressPercent}%` }} />
          </ProgressTrack>
          <ProgressHint>
            {t("gam_level_progress", {
              percent: gamification.progressPercent,
              current: gamification.currentLevelXp,
              next: gamification.nextLevelXp,
            })}
          </ProgressHint>
        </LevelHero>

        <StatGrid>
          <StatCard>
            <StatValue>{gamification.totalXp}</StatValue>
            <StatLabel>{t("gam_total_xp")}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{gamification.currentStreak}</StatValue>
            <StatLabel>{t("gam_current_streak")}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{gamification.longestStreak}</StatValue>
            <StatLabel>{t("gam_longest_streak")}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{gamification.totalTests}</StatValue>
            <StatLabel>{t("gam_total_tests")}</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{gamification.bestOverall || "—"}</StatValue>
            <StatLabel>{t("gam_best_band")}</StatLabel>
          </StatCard>
        </StatGrid>
      </Card>

      {/* Достижения */}
      <Card>
        <SectionTitle>{t("gam_achievements_title")}</SectionTitle>
        <SectionDesc>{t("gam_achievements_desc")}</SectionDesc>
        <BadgeGrid>
          {ACHIEVEMENTS.map((achievement) => {
            const unlocked = unlockedIds.includes(achievement.id);
            return (
              <BadgeCard key={achievement.id} unlocked={unlocked}>
                <BadgeIcon>{achievement.icon}</BadgeIcon>
                <BadgeName>{t(`gam_badge_${achievement.id}`)}</BadgeName>
                <BadgeDesc>{t(`gam_badge_${achievement.id}_desc`)}</BadgeDesc>
              </BadgeCard>
            );
          })}
        </BadgeGrid>
      </Card>
    </Container>
  );
}

export default function GamificationPage() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <GamificationPageContent />
    </Suspense>
  );
}
