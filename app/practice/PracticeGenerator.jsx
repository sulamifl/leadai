"use client";
import { aiFetch } from "@/lib/aiClient";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import styled from "styled-components";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { PuffLoader } from "react-spinners";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

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
  margin-bottom: 10px;
  @media (max-width: 640px) {
    font-size: 1.8em;
  }
  .dark & {
    color: #e0526e;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--app-subtext);
  margin-bottom: 30px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const FormCard = styled.div`
  background-color: var(--app-muted);
  border-radius: 8px;
  padding: 25px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const FieldGroup = styled.div`
  margin-bottom: 18px;
`;

const Label = styled.label`
  display: block;
  font-weight: bold;
  color: var(--app-secondary-text);
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  font-size: 15px;
  background-color: var(--app-card);
  color: var(--app-text);

  &:focus {
    outline: none;
    border-color: #800120;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  font-size: 15px;
  background-color: var(--app-card);
  color: var(--app-text);

  &:focus {
    outline: none;
    border-color: #800120;
  }
`;

const Button = styled.button`
  background-color: #800120;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 15px;
  font-weight: bold;
  width: 100%;

  &:hover {
    background-color: #a00130;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  &:disabled {
    background-color: #aaa;
    cursor: not-allowed;
    transform: none;
  }
`;

const BackButton = styled(Button)`
  background-color: #555;
  margin-bottom: 20px;
  width: auto;

  &:hover {
    background-color: #777;
  }
`;

const ErrorBox = styled.div`
  background-color: #fdecea;
  color: #b00020;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
  padding: 15px;
  margin-bottom: 20px;
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

const ResultMeta = styled.div`
  color: var(--app-subtext);
  font-size: 14px;
`;

const QuestionBlock = styled.div`
  background-color: var(--app-card);
  border: 1px solid var(--app-border);
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 14px;
`;

const QuestionText = styled.p`
  font-weight: bold;
  color: var(--app-text);
  margin-bottom: 10px;
  line-height: 1.5;
`;

const OptionsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 10px 0;
`;

const OptionItem = styled.li`
  padding: 8px 12px;
  border: 1px solid var(--app-border);
  border-radius: 4px;
  margin-bottom: 6px;
  color: var(--app-text);
  background-color: var(--app-muted);
`;

const AnswerToggle = styled.button`
  background-color: #14465a;
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #1a5a74;
  }
`;

const AnswerBox = styled.div`
  margin-top: 12px;
  padding: 12px;
  background-color: #e8f4f8;
  border-left: 4px solid #14465a;
  border-radius: 4px;
  .dark & {
    background-color: #0c1f2e;
    border-left-color: #2b6f8f;
  }
`;

const AnswerText = styled.p`
  color: #14465a;
  font-weight: bold;
  margin-bottom: 6px;
  .dark & {
    color: #7fb3d5;
  }
`;

const ExplanationText = styled.p`
  color: var(--app-subtext);
  line-height: 1.5;
  white-space: pre-wrap;
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

const PracticeGenerator = () => {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [section, setSection] = useState("listening");
  const [level, setLevel] = useState("medium");
  const [count, setCount] = useState(5);
  const [topic, setTopic] = useState("");

  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [test, setTest] = useState(null);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const toggleAnswer = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError("");
    setTest(null);
    setExpanded({});
    setGenerating(true);

    try {
      const res = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "practiceTest",
          section,
          level,
          count: parseInt(count, 10) || 5,
          topic: topic.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to generate practice test");
      }

      setTest(data);
    } catch (err) {
      console.error("Error generating practice test:", err);
      setError(err.message || "An error occurred while generating the practice test.");
    } finally {
      setGenerating(false);
    }
  };

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
          <h1 style={{ color: "#800120", marginBottom: "20px" }}>{t("please_log_in")}</h1>
          <p style={{ marginBottom: "20px" }}>
            {t("login_required_practice")}
          </p>
          <Link href="/login" passHref>
            <AuthLink>{t("go_to_login")}</AuthLink>
          </Link>
        </AuthMessage>
      </Container>
    );
  }

  return (
    <Container>
      <BackButton onClick={() => (window.location.href = "/cabinet")}>
        {t("back_to_dashboard")}
      </BackButton>
      <Title>{t("ai_practice_test_generator")}</Title>
      <Subtitle>
        {t("practice_subtitle")}
      </Subtitle>

      <FormCard>
        <form onSubmit={handleGenerate}>
          <FieldGroup>
            <Label htmlFor="section">{t("section")}</Label>
            <Select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="listening">{t("listening")}</option>
              <option value="reading">{t("reading")}</option>
              <option value="writing">{t("writing")}</option>
              <option value="speaking">{t("speaking")}</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="level">{t("difficulty_level")}</Label>
            <Select
              id="level"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="easy">{t("easy_band")}</option>
              <option value="medium">{t("medium_band")}</option>
              <option value="hard">{t("hard_band")}</option>
            </Select>
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="count">{t("number_of_questions")}</Label>
            <Input
              id="count"
              type="number"
              min="1"
              max="20"
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </FieldGroup>

          <FieldGroup>
            <Label htmlFor="topic">{t("topic_optional")}</Label>
            <Input
              id="topic"
              type="text"
              placeholder={t("topic_placeholder")}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </FieldGroup>

          <Button type="submit" disabled={generating}>
            {generating ? t("generating") : t("generate")}
          </Button>
        </form>
      </FormCard>

      {error && <ErrorBox>{error}</ErrorBox>}

      {generating && (
        <div style={{ textAlign: "center", padding: "40px 0" }}>
          <PuffLoader size={60} color="#800120" />
          <p style={{ color: "var(--app-subtext)", marginTop: "15px" }}>
            {t("generating_practice")}
          </p>
        </div>
      )}

      {test && !generating && (
        <ResultCard>
          <ResultHeader>
            <div>
              <h2 style={{ color: "#800120", marginBottom: "5px" }}>
                {test.section ? test.section.charAt(0).toUpperCase() + test.section.slice(1) : t("practice_test")} {t("test")}
              </h2>
              <ResultMeta>
                {t("level")} {test.level || "medium"} · {t("questions")} {test.questions.length}
                {test.topic ? ` · ${t("topic")} ${test.topic}` : ""}
              </ResultMeta>
            </div>
          </ResultHeader>

          {test.questions.map((q, index) => (
            <QuestionBlock key={q.id || index}>
              <QuestionText>
                {index + 1}. {q.question}
              </QuestionText>

              {Array.isArray(q.options) && q.options.length > 0 && (
                <OptionsList>
                  {q.options.map((opt, i) => (
                    <OptionItem key={i}>{opt}</OptionItem>
                  ))}
                </OptionsList>
              )}

              <AnswerToggle onClick={() => toggleAnswer(q.id || index)}>
                {expanded[q.id || index] ? t("hide_answer") : t("show_answer")}
              </AnswerToggle>

              {expanded[q.id || index] && (
                <AnswerBox>
                  {q.correctAnswer && (
                    <AnswerText>{t("correct_answer")} {q.correctAnswer}</AnswerText>
                  )}
                  {q.explanation && (
                    <ExplanationText>{q.explanation}</ExplanationText>
                  )}
                </AnswerBox>
              )}
            </QuestionBlock>
          ))}
        </ResultCard>
      )}
    </Container>
  );
};

export default PracticeGenerator;
