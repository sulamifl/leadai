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
  min-height: 200px;
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

const Select = styled.select`
  width: 100%;
  padding: 0.75rem 1rem;
  border: 1px solid var(--app-input-border);
  border-radius: 10px;
  font-size: 1rem;
  background: var(--app-card);
  color: var(--app-text);
  &:focus {
    outline: none;
    border-color: ${PRIMARY};
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

const FeedbackButton = styled(Button)`
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
  min-height: 260px;
  max-height: 420px;
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

const OverallBand = styled.div`
  background: linear-gradient(135deg, ${PRIMARY}, #a30028);
  color: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1.25rem;
`;

const OverallBandValue = styled.div`
  font-size: 2.2rem;
  font-weight: 800;
`;

const OverallBandLabel = styled.div`
  font-size: 0.9rem;
  opacity: 0.9;
  margin-top: 0.25rem;
`;

const CriterionCard = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
  padding: 1rem;
  margin-bottom: 1rem;
`;

const CriterionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const CriterionName = styled.h3`
  font-size: 1rem;
  font-weight: 700;
  color: var(--app-secondary-text);
  margin: 0;
`;

const CriterionBand = styled.span`
  background: ${SECONDARY};
  color: #fff;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 700;
`;

const CriterionComment = styled.p`
  font-size: 0.95rem;
  color: var(--app-subtext);
  line-height: 1.5;
  margin: 0;
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

const Excerpt = styled.blockquote`
  background: #f0fdf4;
  border-left: 4px solid #16a34a;
  padding: 1rem;
  border-radius: 8px;
  font-style: italic;
  color: #14532d;
  line-height: 1.6;
  white-space: pre-wrap;
  .dark & {
    background: #0f2a1a;
    border-left-color: #22c55e;
    color: #bbf7d0;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const WritingTutorContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [essay, setEssay] = useState("");
  const [taskType, setTaskType] = useState(
    "Task 2 (Opinion / Discussion / Problem-Solution)"
  );
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
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

  const startNewSession = () => {
    setMessages([]);
    setFeedback(null);
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
          endpoint: "writingTutor",
          messages: updatedMessages,
          taskType,
          mode: "practice",
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

  const handleFeedback = async () => {
    if (!essay || essay.trim().length < 20 || isFeedbackLoading) return;
    setIsFeedbackLoading(true);
    setError("");
    setFeedback(null);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "writingTutor",
          essay,
          taskType,
          mode: "feedback",
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to get feedback");
      }
      setFeedback(data);
    } catch (err) {
      console.error("Error getting feedback:", err);
      setError(err.message || "Failed to get feedback");
    } finally {
      setIsFeedbackLoading(false);
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

        <Title>{t("writing_tutor_title")}</Title>
        <Subtitle>{t("writing_tutor_subtitle")}</Subtitle>

        <Card>
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("your_essay")}</Label>
            <TextArea
              value={essay}
              onChange={(e) => setEssay(e.target.value)}
              placeholder={t("writing_tutor_essay_placeholder")}
            />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("task_type")}</Label>
            <Select value={taskType} onChange={(e) => setTaskType(e.target.value)}>
              <option>{t("task_type_opinion")}</option>
              <option>{t("task_type_agree_disagree")}</option>
              <option>{t("task_type_advantages")}</option>
              <option>{t("task_type_two_part")}</option>
              <option>{t("task_type_academic_data")}</option>
            </Select>
          </div>
          <FeedbackButton
            onClick={handleFeedback}
            disabled={!essay || essay.trim().length < 20 || isFeedbackLoading}
          >
            {isFeedbackLoading
              ? t("writing_tutor_feedback_loading")
              : t("writing_tutor_feedback")}
          </FeedbackButton>
        </Card>

        <ChatCard>
          <ChatHeader>
            <ChatHeaderTitle>{t("writing_tutor_chat_title")}</ChatHeaderTitle>
            <ChatHeaderStatus>
              {isLoading ? t("thinking") : t("online")}
            </ChatHeaderStatus>
          </ChatHeader>

          <MessagesArea>
            {messages.length === 0 && (
              <MessageRow>
                <MessageBubble isUser={false}>
                  {t("writing_tutor_welcome")}
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
              placeholder={t("writing_tutor_placeholder")}
              rows={2}
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage(input)} disabled={isLoading}>
              {t("send")}
            </Button>
            <SecondaryButton onClick={startNewSession} disabled={messages.length === 0}>
              {t("writing_tutor_new")}
            </SecondaryButton>
          </InputRow>
        </ChatCard>

        {error && (
          <FeedbackCard>
            <p style={{ color: "#b91c1c", margin: 0 }}>{error}</p>
          </FeedbackCard>
        )}

        {feedback && (
          <FeedbackCard>
            <FeedbackTitle>{t("writing_tutor_feedback_title")}</FeedbackTitle>
            <OverallBand>
              <OverallBandValue>{feedback.overallBand ?? "—"}/9</OverallBandValue>
              <OverallBandLabel>{t("writing_tutor_overall_band")}</OverallBandLabel>
            </OverallBand>

            {(feedback.criteria || []).map((c, idx) => (
              <CriterionCard key={idx}>
                <CriterionHeader>
                  <CriterionName>{c.name}</CriterionName>
                  <CriterionBand>{c.band ?? "—"}</CriterionBand>
                </CriterionHeader>
                <CriterionComment>{c.comment}</CriterionComment>
              </CriterionCard>
            ))}

            {feedback.strengths && feedback.strengths.length > 0 && (
              <>
                <SectionTitle>{t("writing_tutor_strengths")}</SectionTitle>
                <List>
                  {feedback.strengths.map((s, idx) => <ListItem key={idx}>{s}</ListItem>)}
                </List>
              </>
            )}

            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <>
                <SectionTitle>{t("writing_tutor_weaknesses")}</SectionTitle>
                <List>
                  {feedback.weaknesses.map((w, idx) => <ListItem key={idx}>{w}</ListItem>)}
                </List>
              </>
            )}

            {feedback.recommendations && feedback.recommendations.length > 0 && (
              <>
                <SectionTitle>{t("writing_tutor_recommendations")}</SectionTitle>
                <List>
                  {feedback.recommendations.map((r, idx) => <ListItem key={idx}>{r}</ListItem>)}
                </List>
              </>
            )}

            {feedback.correctedExcerpt && (
              <>
                <SectionTitle>{t("improved_excerpt")}</SectionTitle>
                <Excerpt>{feedback.correctedExcerpt}</Excerpt>
              </>
            )}
          </FeedbackCard>
        )}
      </Content>
    </PageContainer>
  );
};

export default function WritingTutorPage() {
  return (
    <Suspense fallback={<LoadingContainer><PuffLoader color="#800120" size={40} /></LoadingContainer>}>
      <WritingTutorContent />
    </Suspense>
  );
}
