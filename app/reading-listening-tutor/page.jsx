"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";

const PRIMARY = "#800120";
const SECONDARY = "#14465a";

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--app-bg) 0%, var(--app-bg-alt) 100%);
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  @media (max-width: 640px) {
    padding: 1.25rem 0.75rem;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 860px;
`;

const Title = styled.h1`
  text-align: center;
  color: ${PRIMARY};
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
  @media (max-width: 640px) {
    font-size: 1.5rem;
  }
  .dark & {
    color: #e0526e;
  }
`;

const Subtitle = styled.p`
  text-align: center;
  color: var(--app-secondary-text);
  font-size: 1rem;
  margin-bottom: 1.5rem;
`;

const BackButton = styled.button`
  padding: 0.6rem 1.2rem;
  background: transparent;
  border: 1px solid ${SECONDARY};
  color: ${SECONDARY};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  margin-bottom: 1.5rem;
  transition: all 0.2s;

  &:hover {
    background: ${SECONDARY};
    color: #ffffff;
  }

  .dark & {
    color: #7fb3d5;
    border-color: #7fb3d5;
    &:hover {
      background: ${SECONDARY};
      color: #ffffff;
    }
  }
`;

const SkillSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
`;

const SkillButton = styled.button`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 2px solid ${(props) => (props.active ? PRIMARY : "var(--app-input-border)")};
  background: ${(props) => (props.active ? PRIMARY : "var(--app-card)")};
  color: ${(props) => (props.active ? "#ffffff" : "var(--app-secondary-text)")};
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${PRIMARY};
  }
  @media (max-width: 640px) {
    font-size: 0.85rem;
  }
`;

const Card = styled.div`
  background: var(--app-card);
  border: 1px solid var(--app-border);
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

const TextArea = styled.textarea`
  width: 100%;
  min-height: 160px;
  padding: 1rem;
  border: 1px solid var(--app-input-border);
  border-radius: 10px;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
  background: var(--app-card);
  color: var(--app-text);
  &:focus {
    outline: none;
    border-color: ${PRIMARY};
    box-shadow: 0 0 0 3px rgba(128, 1, 32, 0.1);
  }
`;

const Button = styled.button`
  padding: 0.75rem 1.25rem;
  background: ${PRIMARY};
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
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

const SecondaryButton = styled.button`
  padding: 0.75rem 1.25rem;
  background: transparent;
  border: 1px solid ${SECONDARY};
  color: ${SECONDARY};
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover:not(:disabled) {
    background: ${SECONDARY};
    color: #ffffff;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .dark & {
    color: #7fb3d5;
    border-color: #7fb3d5;
    &:hover:not(:disabled) {
      background: ${SECONDARY};
      color: #ffffff;
    }
  }
`;

const AnalyzeButton = styled(Button)`
  background: ${SECONDARY};
  &:hover:not(:disabled) {
    background: #1b5a73;
  }
`;

const ChatCard = styled(Card)`
  display: flex;
  flex-direction: column;
  padding: 0;
  overflow: hidden;
`;

const ChatHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  background: ${PRIMARY};
  color: #fff;
`;

const ChatHeaderTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  margin: 0;
`;

const ChatHeaderStatus = styled.span`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const MessagesArea = styled.div`
  padding: 1.25rem;
  min-height: 200px;
  max-height: 360px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div`
  max-width: 80%;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.5;
  white-space: pre-wrap;
  background: ${(props) => (props.isUser ? PRIMARY : "var(--app-muted)")};
  color: ${(props) => (props.isUser ? "#fff" : "var(--app-text)")};
  border: ${(props) => (props.isUser ? "none" : "1px solid var(--app-border)")};
`;

const LoadingDots = styled.span`
  &::after {
    content: "...";
    animation: dots 1.2s steps(4, end) infinite;
  }
  @keyframes dots {
    0% { content: ""; }
    25% { content: "."; }
    50% { content: ".."; }
    75% { content: "..."; }
  }
`;

const InputRow = styled.div`
  display: flex;
  gap: 0.5rem;
  padding: 1rem 1.25rem;
  border-top: 1px solid var(--app-border);
  flex-wrap: wrap;
`;

const Input = styled.textarea`
  flex: 1;
  min-width: 200px;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-input-border);
  border-radius: 10px;
  font-size: 0.95rem;
  line-height: 1.5;
  resize: vertical;
  background: var(--app-card);
  color: var(--app-text);
  &:focus {
    outline: none;
    border-color: ${PRIMARY};
  }
`;

const FeedbackCard = styled(Card)``;

const FeedbackTitle = styled.h2`
  font-size: 1.3rem;
  font-weight: 800;
  color: ${PRIMARY};
  margin: 0 0 1rem;
  .dark & {
    color: #e0526e;
  }
`;

const SummaryBox = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1.25rem;
  font-size: 0.95rem;
  line-height: 1.6;
  color: var(--app-subtext);
`;

const QuestionItem = styled.div`
  background: var(--app-muted);
  border: 1px solid ${(props) => (props.correct ? "#16a34a" : "#b91c1c")};
  border-left: 4px solid ${(props) => (props.correct ? "#16a34a" : "#b91c1c")};
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const QuestionText = styled.div`
  font-weight: 700;
  color: var(--app-text);
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
`;

const QuestionDetail = styled.div`
  font-size: 0.9rem;
  color: var(--app-subtext);
  line-height: 1.5;
  margin-bottom: 0.25rem;
`;

const QuestionExplanation = styled.div`
  font-size: 0.95rem;
  color: var(--app-text);
  line-height: 1.6;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed var(--app-border);
`;

const SectionTitle = styled.h3`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${SECONDARY};
  margin: 1rem 0 0.5rem;
  .dark & {
    color: #7fb3d5;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const ReadingListeningTutorContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [skill, setSkill] = useState("reading");
  const [passage, setPassage] = useState("");
  const [questions, setQuestions] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const handleAnalyze = async () => {
    if (!passage || passage.trim().length < 10 || !questions || questions.trim().length < 5) {
      setError(t("reading_listening_tutor_validation"));
      return;
    }
    setIsAnalyzing(true);
    setError("");
    setAnalysis(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "readingListeningTutor",
          mode: "analyze",
          skill,
          passage,
          questions,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze");
      }
      setAnalysis(data);
    } catch (err) {
      console.error("Error analyzing:", err);
      setError(err.message || "Failed to analyze");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNewSession = () => {
    setMessages([]);
    setError("");
    setInput("");
  };

  const sendMessage = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "readingListeningTutor",
          mode: "practice",
          skill,
          messages: updatedMessages,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage = { role: "assistant", content: data.reply };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      console.error("Error getting AI response:", err);
      setError(err.message || "Failed to get response");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <PageContainer>
      <Content>
        <BackButton onClick={() => router.push("/cabinet")}>
          {t("back_to_dashboard")}
        </BackButton>

        <Title>{t("reading_listening_tutor_title")}</Title>
        <Subtitle>{t("reading_listening_tutor_subtitle")}</Subtitle>

        <SkillSelector>
          <SkillButton active={skill === "reading"} onClick={() => { setSkill("reading"); setAnalysis(null); }}>
            {t("reading")}
          </SkillButton>
          <SkillButton active={skill === "listening"} onClick={() => { setSkill("listening"); setAnalysis(null); }}>
            {t("listening")}
          </SkillButton>
        </SkillSelector>

        <Card>
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("reading_listening_tutor_passage_label")}</Label>
            <TextArea
              value={passage}
              onChange={(e) => setPassage(e.target.value)}
              placeholder={t("reading_listening_tutor_passage_placeholder")}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("reading_listening_tutor_questions_label")}</Label>
            <TextArea
              value={questions}
              onChange={(e) => setQuestions(e.target.value)}
              placeholder={t("reading_listening_tutor_questions_placeholder")}
            />
          </div>
          <AnalyzeButton onClick={handleAnalyze} disabled={isAnalyzing}>
            {isAnalyzing ? t("reading_listening_tutor_analyzing") : t("reading_listening_tutor_analyze")}
          </AnalyzeButton>
        </Card>

        <ChatCard>
          <ChatHeader>
            <ChatHeaderTitle>{t("reading_listening_tutor_chat_title")}</ChatHeaderTitle>
            <ChatHeaderStatus>
              {isLoading ? t("thinking") : t("online")}
            </ChatHeaderStatus>
          </ChatHeader>

          <MessagesArea>
            {messages.length === 0 && (
              <MessageRow>
                <MessageBubble isUser={false}>
                  {t("reading_listening_tutor_welcome")}
                </MessageBubble>
              </MessageRow>
            )}

            {messages.map((msg, index) => (
              <MessageRow key={index} isUser={msg.role === "user"}>
                <MessageBubble isUser={msg.role === "user"}>
                  {msg.content}
                </MessageBubble>
              </MessageRow>
            ))}

            {isLoading && (
              <MessageRow>
                <MessageBubble isUser={false}>
                  {t("thinking")}<LoadingDots />
                </MessageBubble>
              </MessageRow>
            )}
            <div ref={messagesEndRef} />
          </MessagesArea>

          <InputRow>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("reading_listening_tutor_placeholder")}
              rows={2}
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage(input)} disabled={isLoading}>
              {t("send")}
            </Button>
            <SecondaryButton onClick={startNewSession} disabled={messages.length === 0}>
              {t("reading_listening_tutor_new")}
            </SecondaryButton>
          </InputRow>
        </ChatCard>

        {error && (
          <FeedbackCard>
            <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
          </FeedbackCard>
        )}

        {analysis && (
          <FeedbackCard>
            <FeedbackTitle>{t("reading_listening_tutor_analysis_title")}</FeedbackTitle>
            {analysis.summary && <SummaryBox>{analysis.summary}</SummaryBox>}

            {(analysis.questionAnalysis || []).map((q, idx) => (
              <QuestionItem key={idx} correct={q.isCorrect}>
                <QuestionText>{q.question}</QuestionText>
                {q.questionType && <QuestionDetail><strong>Type:</strong> {q.questionType}</QuestionDetail>}
                {q.userAnswer != null && <QuestionDetail><strong>{t("reading_listening_tutor_your_answer")}</strong> {String(q.userAnswer)}</QuestionDetail>}
                {q.correctAnswer != null && <QuestionDetail><strong>{t("reading_listening_tutor_correct_answer")}</strong> {String(q.correctAnswer)}</QuestionDetail>}
                {q.explanation && <QuestionExplanation>{q.explanation}</QuestionExplanation>}
              </QuestionItem>
            ))}

            {analysis.commonMistakes && analysis.commonMistakes.length > 0 && (
              <>
                <SectionTitle>{t("reading_listening_tutor_common_mistakes")}</SectionTitle>
                <List>
                  {analysis.commonMistakes.map((m, idx) => <ListItem key={idx}>{m}</ListItem>)}
                </List>
              </>
            )}

            {analysis.strategies && analysis.strategies.length > 0 && (
              <>
                <SectionTitle>{t("reading_listening_tutor_strategies")}</SectionTitle>
                <List>
                  {analysis.strategies.map((s, idx) => <ListItem key={idx}>{s}</ListItem>)}
                </List>
              </>
            )}

            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <>
                <SectionTitle>{t("reading_listening_tutor_recommendations")}</SectionTitle>
                <List>
                  {analysis.recommendations.map((r, idx) => <ListItem key={idx}>{r}</ListItem>)}
                </List>
              </>
            )}
          </FeedbackCard>
        )}
      </Content>
    </PageContainer>
  );
};

export default function ReadingListeningTutorPage() {
  return (
    <Suspense fallback={<LoadingContainer><PuffLoader color="#800120" size={40} /></LoadingContainer>}>
      <ReadingListeningTutorContent />
    </Suspense>
  );
}
