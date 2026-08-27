"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { getUserResults, deleteResult } from "@/lib/resultsService";
import { exportResultsToPDF } from "@/lib/pdfExport";
import { PuffLoader } from "react-spinners";

const Container = styled.div`
  padding: 20px;
  max-width: 1000px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
  min-height: 100vh;
  color: var(--app-text);
  background: var(--app-bg);
  @media (max-width: 640px) {
    padding: 12px;
  }
`;

const Title = styled.h1`
  text-align: center;
  color: #800120;
  font-weight: bold;
  font-size: 2.5em;
  margin-bottom: 30px;
  @media (max-width: 640px) {
    font-size: 1.8em;
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultCard = styled.div`
  background-color: var(--app-muted);
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 15px;
`;

const ResultDate = styled.span`
  color: var(--app-subtext);
  font-size: 14px;
`;

const OverallScore = styled.span`
  color: #800120;
  font-weight: bold;
  font-size: 1.3em;
`;

const SectionScores = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 15px;
`;

const SectionScore = styled.div`
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
`;

const SectionName = styled.span`
  color: var(--app-secondary-text);
  font-weight: bold;
  text-transform: capitalize;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  background-color: #800120;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 14px;
  font-weight: bold;

  &:hover {
    background-color: #a00130;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ViewButton = styled(Button)`
  background-color: #14465a;

  &:hover {
    background-color: #1a5a74;
  }
`;

const DeleteButton = styled(Button)`
  background-color: #b00020;

  &:hover {
    background-color: #d00030;
  }
`;

const BackButton = styled(Button)`
  background-color: #555;
  margin-bottom: 20px;

  &:hover {
    background-color: #777;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
`;

const Modal = styled.div`
  background-color: var(--app-card);
  color: var(--app-text);
  border-radius: 8px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const ModalTitle = styled.h2`
  color: #800120;
  margin-bottom: 20px;
  .dark & {
    color: #e0526e;
  }
`;

const ModalSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: var(--app-muted);
  border-radius: 4px;
`;

const ModalSectionTitle = styled.h3`
  color: var(--app-secondary-text);
  margin-bottom: 10px;
  text-transform: capitalize;
`;

const ModalFeedback = styled.p`
  color: var(--app-subtext);
  line-height: 1.6;
  white-space: pre-wrap;
`;

const CloseButton = styled(Button)`
  background-color: #555;
  margin-top: 10px;

  &:hover {
    background-color: #777;
  }
`;

const AuthMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: var(--app-subtext);
`;

const AuthLink = styled.a`
  color: #800120;
  font-weight: bold;
  text-decoration: underline;

  &:hover {
    color: #a00130;
  }
`;

function HistoryPageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadResults = async () => {
    try {
      const data = await getUserResults();
      setResults(data);
      setError(null);
    } catch (err) {
      console.error("Error loading results:", err);
      setError(err.message || "network");
    }
  };

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user]);

  const formatDate = (createdAt) => {
    if (!createdAt) return t("hist_unknown_date");
    try {
      if (typeof createdAt.toDate === "function") {
        return createdAt.toDate().toLocaleString();
      }
      if (createdAt.seconds) {
        return new Date(createdAt.seconds * 1000).toLocaleString();
      }
      return new Date(createdAt).toLocaleString();
    } catch (error) {
      return t("hist_unknown_date");
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteResult(id);
      setResults((prev) => prev.filter((r) => r.id !== id));
      if (selectedResult && selectedResult.id === id) {
        setSelectedResult(null);
      }
    } catch (error) {
      console.error("Error deleting result:", error);
      alert(t("hist_delete_error"));
    }
  };

  const handleDownloadPDF = async (result) => {
    try {
      await exportResultsToPDF({
        testType: result.testType,
        overallScore: result.overallScore,
        sections: result.sections || {},
        examples: result.examples || {},
        universityRecommendations: result.universityRecommendations,
        createdAt: result.createdAt,
        fileName: `IELTS_Test_Report_${result.id || Date.now()}.pdf`,
      });
    } catch (error) {
      console.error("Error exporting PDF:", error);
      alert(t("hist_pdf_error"));
    }
  };

  const sectionKeys = ["listening", "reading", "speaking", "writing"];

  if (loading) {
    return (
      <LoadingContainer>
        <PuffLoader size={60} color="#800120" />
      </LoadingContainer>
    );
  }

  if (!user) {
    return (
      <Container>
        <AuthMessage>
          <h1 style={{ color: "#800120", marginBottom: "20px" }}>{t("hist_login_title")}</h1>
          <p style={{ marginBottom: "20px" }}>
            {t("hist_login_desc")}
          </p>
          <Link href="/login" passHref>
            <AuthLink>{t("hist_login_btn")}</AuthLink>
          </Link>
        </AuthMessage>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <BackButton onClick={() => (window.location.href = "/cabinet")}>
          {t("hist_back")}
        </BackButton>
        <EmptyState>
          <h2 style={{ color: "#800120", marginBottom: "15px" }}>{t("hist_error_title")}</h2>
          <p style={{ marginBottom: "20px" }}>
            {t("hist_error_desc")}
          </p>
          <Button onClick={loadResults}>{t("hist_try_again")}</Button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => (window.location.href = "/cabinet")}>
        {t("hist_back")}
      </BackButton>
      <Title>{t("hist_title")}</Title>

      {results.length === 0 ? (
        <EmptyState>
          <h2 style={{ color: "#800120", marginBottom: "15px" }}>{t("hist_empty_title")}</h2>
          <p>{t("hist_empty_desc")}</p>
        </EmptyState>
      ) : (
        results.map((result) => (
          <ResultCard key={result.id}>
            <ResultHeader>
              <div>
                <ResultDate>{formatDate(result.createdAt)}</ResultDate>
                <div style={{ marginTop: "5px" }}>
                  <span style={{ color: "var(--app-secondary-text)", fontWeight: "bold", textTransform: "capitalize" }}>
                    {result.testType}
                  </span>
                </div>
              </div>
              <OverallScore>{t("hist_overall", { score: result.overallScore })}</OverallScore>
            </ResultHeader>
            <SectionScores>
              {sectionKeys.map((section) => {
                const sectionData = result.sections && result.sections[section];
                if (!sectionData) return null;
                return (
                  <SectionScore key={section}>
                    <SectionName>{section}:</SectionName> {sectionData.score}/9
                  </SectionScore>
                );
              })}
            </SectionScores>
            <ButtonGroup>
              <ViewButton onClick={() => setSelectedResult(result)}>{t("hist_view")}</ViewButton>
              <ViewButton onClick={() => handleDownloadPDF(result)}>{t("hist_download_pdf")}</ViewButton>
              <DeleteButton onClick={() => handleDelete(result.id)}>{t("hist_delete")}</DeleteButton>
            </ButtonGroup>
          </ResultCard>
        ))
      )}

      {selectedResult && (
        <ModalOverlay onClick={() => setSelectedResult(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {selectedResult.testType} — {t("hist_overall", { score: selectedResult.overallScore })}
            </ModalTitle>
            <p style={{ color: "var(--app-subtext)", marginBottom: "20px" }}>
              {formatDate(selectedResult.createdAt)}
            </p>
            {sectionKeys.map((section) => {
              const sectionData = selectedResult.sections && selectedResult.sections[section];
              if (!sectionData) return null;
              return (
                <ModalSection key={section}>
                  <ModalSectionTitle>
                    {section} — {t("hist_score", { score: sectionData.score })}
                  </ModalSectionTitle>
                  <ModalFeedback>{sectionData.feedback}</ModalFeedback>
                </ModalSection>
              );
            })}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <ViewButton onClick={() => handleDownloadPDF(selectedResult)}>
                {t("hist_download_pdf")}
              </ViewButton>
              <CloseButton onClick={() => setSelectedResult(null)}>{t("hist_close")}</CloseButton>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
}

const HistoryPage = () => (
  <Suspense fallback={null}>
    <HistoryPageContent />
  </Suspense>
);

export default HistoryPage;
