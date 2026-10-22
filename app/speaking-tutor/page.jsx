"use client";
import { aiFetch } from "@/lib/aiClient";

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

const PartSelector = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const PartButton = styled.button`
  flex: 1;
  min-width: 120px;
  padding: 0.7rem 1rem;
  border: 2px solid ${(props) => (props.active ? PRIMARY : "var(--app-input-border)")};
  background: ${(props) => (props.active ? PRIMARY : "var(--app-card)")};
  color: ${(props) => (props.active ? "#ffffff" : "var(--app-secondary-text)")};
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: ${PRIMARY};
  }
`;

const ChatCard = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(20, 70, 90, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 60vh;
  min-height: 420px;
`;

const ChatHeader = styled.div`
  background: linear-gradient(135deg, ${PRIMARY} 0%, #a00130 100%);
  color: #ffffff;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const ChatHeaderTitle = styled.div`
  font-weight: 700;
  font-size: 1.1rem;
`;

const ChatHeaderStatus = styled.div`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const MessagesArea = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  background: var(--app-muted);
`;

const MessageRow = styled.div`
  display: flex;
  justify-content: ${(props) => (props.isUser ? "flex-end" : "flex-start")};
`;

const MessageBubble = styled.div`
  max-width: 78%;
  padding: 0.75rem 1rem;
  border-radius: 14px;
  font-size: 0.95rem;
  line-height: 1.55;
  white-space: pre-wrap;
  word-break: break-word;
  background: ${(props) => (props.isUser ? PRIMARY : "var(--app-card)")};
  color: ${(props) => (props.isUser ? "#ffffff" : "var(--app-text)")};
  border: ${(props) =>
    props.isUser ? "none" : "1px solid rgba(20, 70, 90, 0.15)"};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
`;

const InputRow = styled.div`
  display: flex;
  gap: 0.6rem;
  padding: 0.85rem 1.25rem;
  background: var(--app-card);
  border-top: 1px solid rgba(20, 70, 90, 0.1);
  flex-wrap: wrap;
`;

const Input = styled.textarea`
  flex: 1;
  min-width: 200px;
  padding: 0.7rem 0.9rem;
  border: 2px solid rgba(20, 70, 90, 0.25);
  border-radius: 10px;
  font-size: 0.95rem;
  color: var(--app-text);
  background: var(--app-card);
  outline: none;
  resize: none;
  font-family: inherit;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${PRIMARY};
  }

  &::placeholder {
    color: #9aa7ad;
  }
`;

const Button = styled.button`
  padding: 0.7rem 1.3rem;
  background: ${PRIMARY};
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s ease, transform 0.1s ease;

  &:hover {
    opacity: 0.9;
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: ${SECONDARY};
`;

const RecordButton = styled(Button)`
  background: ${(props) => (props.recording ? "#b91c1c" : SECONDARY)};
  &:hover {
    background: ${(props) => (props.recording ? "#dc2626" : "#1b5a73")};
  }
`;

const FeedbackButton = styled(Button)`
  background: #16a34a;
  &:hover {
    background: #15803d;
  }
`;

const LoadingDots = styled.span`
  &::after {
    content: " .";
    animation: dots 1s steps(5, end) infinite;
  }

  @keyframes dots {
    0%, 20% {
      content: " .";
    }
    40% {
      content: " ..";
    }
    60% {
      content: " ...";
    }
    80%, 100% {
      content: "";
    }
  }
`;

const FeedbackCard = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(20, 70, 90, 0.12);
  padding: 1.5rem;
  margin-top: 1.5rem;
`;

const FeedbackTitle = styled.h2`
  color: ${PRIMARY};
  font-size: 1.3rem;
  font-weight: 700;
  margin: 0 0 0.75rem;
  .dark & {
    color: #e0526e;
  }
`;

const OverallBand = styled.div`
  background: linear-gradient(135deg, ${PRIMARY} 0%, #a00130 100%);
  color: #ffffff;
  border-radius: 12px;
  padding: 1rem;
  text-align: center;
  margin-bottom: 1rem;
`;

const OverallBandValue = styled.div`
  font-size: 2.5rem;
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

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const SpeakingTutorContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  // Экзамен берём из query (?exam=toefl): от него зависит рубрика на бэкенде
  // (IELTS 4 критерия × 0–9, TOEFL 3 критерия × 0–4).
  const exam = searchParams.get("exam") === "toefl" ? "toefl" : "ielts";
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [part, setPart] = useState(1);
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFeedbackLoading, setIsFeedbackLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [error, setError] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);
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

  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      setSpeechSupported(true);
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = "en-US";
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setInput(transcript);
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);
      recognitionRef.current = recognition;
    }
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  const startRecording = () => {
    if (!recognitionRef.current) return;
    setError("");
    setIsRecording(true);
    try {
      recognitionRef.current.start();
    } catch {
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (!recognitionRef.current) return;
    setIsRecording(false);
    try {
      recognitionRef.current.stop();
    } catch {
      // ignore
    }
  };

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
      const response = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "speakingTutor",
          messages: updatedMessages,
          part,
          topic: topic || undefined,
          exam,
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
    if (messages.length === 0 || isFeedbackLoading) return;
    setIsFeedbackLoading(true);
    setError("");
    setFeedback(null);

    try {
      const response = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "speakingTutor",
          messages,
          part,
          topic: topic || undefined,
          exam,
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

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) return;
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = "en-US";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <PageContainer>
      <Content>
        <BackButton onClick={() => router.push("/cabinet")}>
          {t("back_to_dashboard")}
        </BackButton>

        <Title>{t("speaking_tutor_title")}</Title>
        <Subtitle>{t("speaking_tutor_subtitle")}</Subtitle>

        <PartSelector>
          {[1, 2, 3].map((p) => (
            <PartButton
              key={p}
              active={part === p}
              onClick={() => {
                setPart(p);
                setFeedback(null);
              }}
            >
              {t(`speaking_tutor_part_${p}`)}
            </PartButton>
          ))}
        </PartSelector>

        <ChatCard>
          <ChatHeader>
            <ChatHeaderTitle>{t("speaking_tutor_chat_title")}</ChatHeaderTitle>
            <ChatHeaderStatus>
              {isLoading ? t("thinking") : t("online")}
            </ChatHeaderStatus>
          </ChatHeader>

          <MessagesArea>
            {messages.length === 0 && (
              <MessageRow>
                <MessageBubble isUser={false}>
                  {t("speaking_tutor_welcome")}
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
              placeholder={t("speaking_tutor_placeholder")}
              rows={2}
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage(input)} disabled={isLoading}>
              {t("send")}
            </Button>
            {speechSupported && (
              <RecordButton
                recording={isRecording}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={isLoading}
              >
                {isRecording ? t("stop") : t("speak")}
              </RecordButton>
            )}
            <SecondaryButton onClick={handleSpeak} disabled={messages.length === 0}>
              {t("speaking_tutor_tts")}
            </SecondaryButton>
            <FeedbackButton
              onClick={handleFeedback}
              disabled={messages.length === 0 || isFeedbackLoading}
            >
              {isFeedbackLoading ? t("speaking_tutor_feedback_loading") : t("speaking_tutor_feedback")}
            </FeedbackButton>
            <SecondaryButton onClick={startNewSession} disabled={messages.length === 0}>
              {t("speaking_tutor_new")}
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
            <FeedbackTitle>{t("speaking_tutor_feedback_title")}</FeedbackTitle>
            <OverallBand>
              <OverallBandValue>
                {feedback.overall ?? feedback.overallBand ?? "—"}/
                {feedback.scaleMax ?? 9}
              </OverallBandValue>
              <OverallBandLabel>
                {t("speaking_tutor_overall_band")}
                {feedback.exam ? ` · ${String(feedback.exam).toUpperCase()}` : ""}
              </OverallBandLabel>
            </OverallBand>

            {(feedback.criteria || []).map((c, idx) => (
              <CriterionCard key={idx}>
                <CriterionHeader>
                  <CriterionName>{c.name ?? c.label ?? c.id}</CriterionName>
                  <CriterionBand>{c.score ?? c.band ?? "—"}</CriterionBand>
                </CriterionHeader>
                <CriterionComment>{c.comment}</CriterionComment>
                {c.evidence && <CriterionComment>{c.evidence}</CriterionComment>}
              </CriterionCard>
            ))}

            {feedback.strengths && feedback.strengths.length > 0 && (
              <>
                <SectionTitle>{t("speaking_tutor_strengths")}</SectionTitle>
                <List>
                  {feedback.strengths.map((s, idx) => <ListItem key={idx}>{s}</ListItem>)}
                </List>
              </>
            )}

            {feedback.weaknesses && feedback.weaknesses.length > 0 && (
              <>
                <SectionTitle>{t("speaking_tutor_weaknesses")}</SectionTitle>
                <List>
                  {feedback.weaknesses.map((w, idx) => <ListItem key={idx}>{w}</ListItem>)}
                </List>
              </>
            )}

            {feedback.recommendations && feedback.recommendations.length > 0 && (
              <>
                <SectionTitle>{t("speaking_tutor_recommendations")}</SectionTitle>
                <List>
                  {feedback.recommendations.map((r, idx) => <ListItem key={idx}>{r}</ListItem>)}
                </List>
              </>
            )}
          </FeedbackCard>
        )}
      </Content>
    </PageContainer>
  );
};

export default function SpeakingTutorPage() {
  return (
    <Suspense fallback={<LoadingContainer><PuffLoader color="#800120" size={40} /></LoadingContainer>}>
      <SpeakingTutorContent />
    </Suspense>
  );
}
