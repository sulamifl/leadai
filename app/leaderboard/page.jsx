"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import Link from "next/link";
import { getLeaderboard, getUserRank } from "@/lib/gamification";

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

const RankRow = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 8px;
  border-bottom: 1px solid var(--app-border);
  background-color: ${(props) => (props.me ? "rgba(128,1,32,0.06)" : "transparent")};
  border-radius: 8px;
  &:last-child {
    border-bottom: none;
  }
  .dark & {
    background-color: ${(props) => (props.me ? "rgba(224,82,110,0.12)" : "transparent")};
  }
`;

const RankNumber = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 800;
  font-size: 1.1rem;
  background-color: ${(props) => {
    if (props.rank === 1) return "#ffd700";
    if (props.rank === 2) return "#c0c0c0";
    if (props.rank === 3) return "#cd7f32";
    return "var(--app-muted)";
  }};
  color: ${(props) => (props.rank <= 3 ? "#333" : "var(--app-secondary-text)")};
  flex-shrink: 0;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  border-radius: 50%;
  overflow: hidden;
  background-color: var(--app-muted);
  flex-shrink: 0;
  position: relative;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const UserInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const UserName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserMeta = styled.div`
  font-size: 0.8rem;
  color: var(--app-secondary-text);
  margin-top: 2px;
`;

const RightStats = styled.div`
  text-align: right;
  flex-shrink: 0;
`;

const XpValue = styled.div`
  font-weight: 700;
  color: #800120;
  .dark & {
    color: #e0526e;
  }
`;

const LevelTag = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: rgba(128, 1, 32, 0.12);
  color: #800120;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 4px;
  .dark & {
    background-color: rgba(224, 82, 110, 0.15);
    color: #e0526e;
  }
`;

const MeBadge = styled.span`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  background-color: #800120;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  margin-left: 6px;
  .dark & {
    background-color: #e0526e;
  }
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

function LeaderboardPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [myRank, setMyRank] = useState(null);
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
        const [data, rank] = await Promise.all([getLeaderboard(20), getUserRank()]);
        if (mounted) {
          setLeaderboard(data);
          setMyRank(rank);
        }
      } catch (err) {
        console.error("Error loading leaderboard:", err);
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
        <BackLink href="/cabinet">{t("leader_back")}</BackLink>
        <EmptyState>
          <div style={{ fontSize: "3rem", marginBottom: "12px" }}>⚠️</div>
          <p>{t("error_network")}</p>
          <EmptyLink href="/cabinet">{t("leader_back")}</EmptyLink>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <BackLink href="/cabinet">{t("leader_back")}</BackLink>
      <Header>
        <Title>{t("leader_title")}</Title>
        <Subtitle>{t("leader_subtitle")}</Subtitle>
      </Header>

      <Card>
        <SectionTitle>{t("leader_top_title")}</SectionTitle>
        <SectionDesc>{t("leader_top_desc")}</SectionDesc>

        {leaderboard.length === 0 ? (
          <EmptyState>
            <div style={{ fontSize: "3rem", marginBottom: "12px" }}>🏆</div>
            <p>{t("leader_empty")}</p>
            <EmptyLink href="/main">{t("leader_take_test")}</EmptyLink>
          </EmptyState>
        ) : (
          leaderboard.map((entry) => (
            <RankRow key={entry.id} me={entry.me}>
              <RankNumber rank={entry.rank}>{entry.rank}</RankNumber>
              <Avatar>
                {entry.photoURL ? (
                  <Image src={entry.photoURL} alt={entry.displayName} fill sizes="100%" />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                    }}
                  >
                    {entry.displayName?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                )}
              </Avatar>
              <UserInfo>
                <UserName>
                  {entry.displayName}
                  {entry.me && <MeBadge>{t("leader_you")}</MeBadge>}
                </UserName>
                <UserMeta>
                  {t("leader_tests", { count: entry.totalTests })} ·{" "}
                  {t("leader_best", { band: entry.bestOverall || "—" })} ·{" "}
                  {t("leader_streak", { streak: entry.currentStreak })}
                </UserMeta>
              </UserInfo>
              <RightStats>
                <XpValue>{entry.totalXp} XP</XpValue>
                <LevelTag>{t("leader_level", { level: entry.level })}</LevelTag>
              </RightStats>
            </RankRow>
          ))
        )}
      </Card>

      {myRank && (
        <Card>
          <SectionTitle>{t("leader_my_rank_title")}</SectionTitle>
          <SectionDesc>
            {t("leader_my_rank_desc", { rank: myRank })}
          </SectionDesc>
        </Card>
      )}
    </Container>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <LoadingContainer>
          <PuffLoader size={60} color="#800120" />
        </LoadingContainer>
      }
    >
      <LeaderboardPageContent />
    </Suspense>
  );
}
