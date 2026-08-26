"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
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
`;

const Title = styled.h1`
  text-align: center;
  color: #800120;
  font-weight: bold;
  font-size: 2.5em;
  margin-bottom: 30px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const EmptyState = styled.div`
  text-align: center;
  color: #555;
  padding: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const ResultCard = styled.div`
  background-color: #f9f9f9;
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
  color: #555;
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
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 14px;
`;

const SectionName = styled.span`
  color: #14465a;
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
  background-color: white;
  border-radius: 8px;
  padding: 30px;
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h2`
  color: #800120;
  margin-bottom: 20px;
`;

const ModalSection = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 4px;
`;

const ModalSectionTitle = styled.h3`
  color: #14465a;
  margin-bottom: 10px;
  text-transform: capitalize;
`;

const ModalFeedback = styled.p`
  color: #333;
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
  color: #555;
`;

const AuthLink = styled.a`
  color: #800120;
  font-weight: bold;
  text-decoration: underline;

  &:hover {
    color: #a00130;
  }
`;

const HistoryPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState([]);
  const [selectedResult, setSelectedResult] = useState(null);

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
    } catch (error) {
      console.error("Error loading results:", error);
    }
  };

  useEffect(() => {
    if (user) {
      loadResults();
    }
  }, [user]);

  const formatDate = (createdAt) => {
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
      alert("Failed to delete result. Please try again.");
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
      alert("Failed to export PDF. Please try again.");
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
          <h1 style={{ color: "#800120", marginBottom: "20px" }}>Please log in</h1>
          <p style={{ marginBottom: "20px" }}>
            You need to be logged in to view your IELTS test history.
          </p>
          <Link href="/login" passHref>
            <AuthLink>Go to Login</AuthLink>
          </Link>
        </AuthMessage>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => (window.location.href = "/cabinet")}>
        Back to Dashboard
      </BackButton>
      <Title>Test History</Title>

      {results.length === 0 ? (
        <EmptyState>
          <h2 style={{ color: "#800120", marginBottom: "15px" }}>No results yet</h2>
          <p>You have not completed any IELTS tests yet. Take a test to see your results here.</p>
        </EmptyState>
      ) : (
        results.map((result) => (
          <ResultCard key={result.id}>
            <ResultHeader>
              <div>
                <ResultDate>{formatDate(result.createdAt)}</ResultDate>
                <div style={{ marginTop: "5px" }}>
                  <span style={{ color: "#14465a", fontWeight: "bold", textTransform: "capitalize" }}>
                    {result.testType}
                  </span>
                </div>
              </div>
              <OverallScore>Overall: {result.overallScore}/9</OverallScore>
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
              <ViewButton onClick={() => setSelectedResult(result)}>View</ViewButton>
              <ViewButton onClick={() => handleDownloadPDF(result)}>Download PDF</ViewButton>
              <DeleteButton onClick={() => handleDelete(result.id)}>Delete</DeleteButton>
            </ButtonGroup>
          </ResultCard>
        ))
      )}

      {selectedResult && (
        <ModalOverlay onClick={() => setSelectedResult(null)}>
          <Modal onClick={(e) => e.stopPropagation()}>
            <ModalTitle>
              {selectedResult.testType} — Overall: {selectedResult.overallScore}/9
            </ModalTitle>
            <p style={{ color: "#555", marginBottom: "20px" }}>
              {formatDate(selectedResult.createdAt)}
            </p>
            {sectionKeys.map((section) => {
              const sectionData = selectedResult.sections && selectedResult.sections[section];
              if (!sectionData) return null;
              return (
                <ModalSection key={section}>
                  <ModalSectionTitle>
                    {section} — Score: {sectionData.score}/9
                  </ModalSectionTitle>
                  <ModalFeedback>{sectionData.feedback}</ModalFeedback>
                </ModalSection>
              );
            })}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <ViewButton onClick={() => handleDownloadPDF(selectedResult)}>
                Download PDF
              </ViewButton>
              <CloseButton onClick={() => setSelectedResult(null)}>Close</CloseButton>
            </div>
          </Modal>
        </ModalOverlay>
      )}
    </Container>
  );
};

export default HistoryPage;
