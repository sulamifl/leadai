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
  margin-bottom: 2rem;
`;

const ChatCard = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(20, 70, 90, 0.12);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 70vh;
  min-height: 480px;
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

const QuickQuestions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--app-card);
  border-top: 1px solid rgba(20, 70, 90, 0.1);
`;

const QuickChip = styled.button`
  background: rgba(20, 70, 90, 0.1);
  color: ${SECONDARY};
  border: 1px solid rgba(20, 70, 90, 0.2);
  border-radius: 20px;
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${SECONDARY};
    color: #ffffff;
  }

  .dark & {
    color: #7fb3d5;
    background: rgba(127, 179, 213, 0.12);
    border-color: rgba(127, 179, 213, 0.25);
    &:hover {
      background: ${SECONDARY};
      color: #ffffff;
    }
  }
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

const BackButton = styled(Button)`
  background: transparent;
  border: 1px solid ${SECONDARY};
  color: ${SECONDARY};
  margin-bottom: 1.5rem;

  &:hover {
    background: ${SECONDARY};
    color: #ffffff;
    opacity: 1;
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

const QUICK_QUESTION_KEYS = [
  "quick_q_band_score",
  "quick_q_writing_tips",
  "quick_q_listening_score",
  "quick_q_university_band",
  "quick_q_speaking_format",
  "quick_q_reading_speed",
];

const STORAGE_KEY = "ielts_assistant_history";

const AssistantPageContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setMessages(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Error loading chat history:", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
    } catch (e) {
      console.error("Error saving chat history:", e);
    }
  }, [messages]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isLoading]);

  const sendMessage = async (text) => {
    const trimmed = (text || "").trim();
    if (!trimmed || isLoading) return;

    const userMessage = { role: "user", content: trimmed };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "chatAssistant",
          messages: updatedMessages,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get response");
      }

      const assistantMessage = { role: "assistant", content: data.result };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error getting AI response:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: t("assistant_error_message"),
        },
      ]);
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

  const handleSpeak = () => {
    if (!("speechSynthesis" in window)) {
      alert(t("assistant_tts_not_supported"));
      return;
    }
    const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
    if (!lastAssistant) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(lastAssistant.content);
    utterance.lang = "en-US";
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const handleStopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const clearHistory = () => {
    setMessages([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error("Error clearing history:", e);
    }
  };

  return (
    <PageContainer>
      <Content>
        <BackButton onClick={() => router.push("/cabinet")}>
          {t("back_to_dashboard")}
        </BackButton>

        <Title>{t("ielts_coach")}</Title>
        <Subtitle>{t("assistant_subtitle")}</Subtitle>

        <ChatCard>
          <ChatHeader>
            <ChatHeaderTitle>{t("assistant_chat_title")}</ChatHeaderTitle>
            <ChatHeaderStatus>
              {isLoading ? t("thinking") : t("online")}
            </ChatHeaderStatus>
          </ChatHeader>

          <MessagesArea>
            {messages.length === 0 && (
              <MessageRow>
                <MessageBubble isUser={false}>
                  {t("assistant_welcome")}
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

          <QuickQuestions>
            {QUICK_QUESTION_KEYS.map((key) => (
              <QuickChip key={key} onClick={() => sendMessage(t(key))}>
                {t(key)}
              </QuickChip>
            ))}
          </QuickQuestions>

          <InputRow>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t("ask_placeholder")}
              rows={2}
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage(input)} disabled={isLoading}>
              {t("send")}
            </Button>
            <SecondaryButton
              onClick={isSpeaking ? handleStopSpeaking : handleSpeak}
              disabled={isLoading}
            >
              {isSpeaking ? t("stop") : t("speak")}
            </SecondaryButton>
            <SecondaryButton onClick={clearHistory} disabled={messages.length === 0}>
              {t("clear")}
            </SecondaryButton>
          </InputRow>
        </ChatCard>
      </Content>
    </PageContainer>
  );
};

export default function AssistantPage() {
  return (
    <Suspense fallback={null}>
      <AssistantPageContent />
    </Suspense>
  );
}
