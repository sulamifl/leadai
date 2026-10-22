"use client";
import { aiFetch } from "@/lib/aiClient";

import { useState, useEffect, useRef, Suspense } from "react";
import styled from "styled-components";
import { PuffLoader } from "react-spinners";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { saveTestResult } from "@/lib/resultsService";

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

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  flex: 1;
  min-width: 180px;
  padding: 0.75rem 1rem;
  border: 2px solid ${(props) => (props.active ? "#800120" : "var(--app-input-border)")};
  background: ${(props) => (props.active ? "#800120" : "var(--app-card)")};
  color: ${(props) => (props.active ? "#ffffff" : "var(--app-secondary-text)")};
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &:hover {
    border-color: #800120;
  }
  @media (max-width: 640px) {
    min-width: 140px;
    font-size: 0.85rem;
  }
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
    border-color: #800120;
    box-shadow: 0 0 0 3px rgba(128, 1, 32, 0.1);
  }
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

const RecordButton = styled(Button)`
  background: ${(props) => (props.recording ? "#b91c1c" : "#14465a")};
  &:hover:not(:disabled) {
    background: ${(props) => (props.recording ? "#dc2626" : "#1b5a73")};
  }
`;

const TopicButton = styled(Button)`
  background: #14465a;
  &:hover:not(:disabled) {
    background: #1b5a73;
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
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

const ScoreBanner = styled.div`
  background: linear-gradient(135deg, #800120, #a30028);
  color: #fff;
  border-radius: 12px;
  padding: 1.25rem;
  text-align: center;
  margin-bottom: 1.5rem;
`;

const ScoreValue = styled.div`
  font-size: 2.5rem;
  font-weight: 800;
`;

const ScoreLabel = styled.div`
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
  background: #14465a;
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

const SectionTitle = styled.h2`
  font-size: 1.15rem;
  font-weight: 700;
  color: #800120;
  margin: 1.5rem 0 0.75rem;
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

const Improved = styled.blockquote`
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

const TopicBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #bae6fd;
  color: #0c4a6e;
  padding: 1rem;
  border-radius: 10px;
  margin-top: 1rem;
  font-style: italic;
  line-height: 1.5;
  .dark & {
    background: #0c1f2e;
    border-color: #1e3a5f;
    color: #bae6fd;
  }
`;

const TranscriptBox = styled.div`
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 10px;
  padding: 1rem;
  margin-bottom: 1rem;
  min-height: 60px;
  color: var(--app-subtext);
  line-height: 1.6;
`;

const BasicAnalysis = styled.div`
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--app-muted);
  border: 1px solid var(--app-border);
  border-radius: 12px;
`;

function VoicePageContent() {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState("feedback");
  // Рубрика зависит от экзамена: IELTS (band 0–9) или TOEFL (0–4).
  const exam = searchParams.get("exam") === "toefl" ? "toefl" : "ielts";

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  // Shared state
  const [speech, setSpeech] = useState("");
  const [topic, setTopic] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recognitionRef = useRef(null);

  // Basic analysis state
  const [analysis, setAnalysis] = useState(null);

  // IELTS feedback state
  const [question, setQuestion] = useState("");
  const [feedback, setFeedback] = useState(null);

  // Save result state
  const [saveMessage, setSaveMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveResult = async () => {
    if (!feedback) return;
    setIsSaving(true);
    setSaveMessage("");
    try {
      const overallScore =
        feedback.overallScore != null
          ? Number(feedback.overallScore)
          : Number(feedback.overall ?? feedback.overallBand) * 10;
      await saveTestResult({
        testType: "speech",
        overallScore,
        sections: {
          speaking: {
            score: overallScore,
            band: feedback.overall ?? feedback.overallBand,
            exam: feedback.exam ?? exam,
            scaleMax: feedback.scaleMax ?? 9,
            feedback: {
              criteria: feedback.criteria,
              strengths: feedback.strengths,
              weaknesses: feedback.weaknesses,
              recommendations: feedback.recommendations,
            },
          },
        },
        examples: { speaking: speech },
      });
      setSaveMessage(t("result_saved"));
    } catch (err) {
      setSaveMessage(err.message || t("error_save_result"));
    } finally {
      setIsSaving(false);
    }
  };

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
        setSpeech(transcript);
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

  const handleTopicGenerate = async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await aiFetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task: "generate" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t("error_generate_topic"));
      }
      setTopic(data.result);
    } catch (err) {
      setError(err.message || t("error_generate_topic"));
    } finally {
      setIsLoading(false);
    }
  };

  const handleBasicAnalysis = async () => {
    setIsLoading(true);
    setError("");
    setAnalysis(null);
    try {
      const response = await aiFetch("/api/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: speech, task: "analyze" }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze the speech");
      }
      setAnalysis(data.result);
    } catch (err) {
      setError(err.message || "An error occurred while analyzing the speech.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleIeltsFeedback = async () => {
    setIsLoading(true);
    setError("");
    setFeedback(null);
    try {
      const response = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          endpoint: "speechFeedback",
          speech,
          question: question || undefined,
          exam,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to analyze the speech");
      }
      setFeedback(data);
    } catch (err) {
      setError(err.message || "An error occurred while analyzing the speech.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Header>
        <Title>{t("speech_analysis")}</Title>
        <Subtitle>{t("speech_subtitle")}</Subtitle>
      </Header>

      <Tabs>
        <Tab active={activeTab === "feedback"} onClick={() => setActiveTab("feedback")}>
          {t("ielts_feedback")}
        </Tab>
        <Tab active={activeTab === "basic"} onClick={() => setActiveTab("basic")}>
          {t("basic_analysis")}
        </Tab>
      </Tabs>

      <Card>
        <div style={{ marginBottom: "1rem" }}>
          <Label>{t("your_response")}</Label>
          {speechSupported ? (
            <>
              <ButtonRow>
                <RecordButton
                  type="button"
                  recording={isRecording}
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isLoading}
                >
                  {isRecording ? t("stop_recording") : t("start_recording")}
                </RecordButton>
              </ButtonRow>
              <TranscriptBox>
                {speech || t("speech_transcript_placeholder")}
              </TranscriptBox>
            </>
          ) : (
            <TextArea
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              placeholder={t("speech_textarea_placeholder")}
              required
            />
          )}
        </div>

        {speechSupported && (
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("edit_response_label")}</Label>
            <TextArea
              value={speech}
              onChange={(e) => setSpeech(e.target.value)}
              placeholder={t("edit_response_placeholder")}
            />
          </div>
        )}

        {activeTab === "feedback" && (
          <div style={{ marginBottom: "1rem" }}>
            <Label>{t("speaking_question")}</Label>
            <Input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder={t("speaking_question_placeholder")}
            />
          </div>
        )}

        {activeTab === "feedback" ? (
          <Button
            type="button"
            onClick={handleIeltsFeedback}
            disabled={isLoading || speech.trim().length < 10}
          >
            {isLoading ? t("analyzing") : t("get_ielts_feedback")}
          </Button>
        ) : (
          <Button
            type="button"
            onClick={handleBasicAnalysis}
            disabled={isLoading || speech.trim().length < 10}
          >
            {isLoading ? t("analyzing") : t("analyze_speech")}
          </Button>
        )}
      </Card>

      <Card>
        <Label>{t("need_topic")}</Label>
        <TopicButton type="button" onClick={handleTopicGenerate} disabled={isLoading}>
          {isLoading ? t("generating") : t("generate_topic")}
        </TopicButton>
        {topic && <TopicBox>{t("topic")} {topic}</TopicBox>}
      </Card>

      {isLoading && (
        <Card>
          <LoadingBox>
            <PuffLoader color="#800120" size={50} />
            <p>{t("processing")}</p>
          </LoadingBox>
        </Card>
      )}

      {error && <ErrorBox>{error}</ErrorBox>}

      {activeTab === "basic" && analysis && (
        <Card>
          <BasicAnalysis>
            <SectionTitle>{t("speech_analysis")}</SectionTitle>
            {analysis.split("\n\n").map((paragraph, index) => (
              <p
                key={index}
                style={{ whiteSpace: "pre-wrap", lineHeight: 1.6, color: "#374151" }}
              >
                {paragraph}
              </p>
            ))}
          </BasicAnalysis>
        </Card>
      )}

      {activeTab === "feedback" && feedback && (
        <>
          <ScoreBanner>
            <ScoreValue>
              {feedback.overall != null
                ? `${feedback.overall}/${feedback.scaleMax ?? 9}`
                : feedback.overallBand != null
                  ? `${t("band")} ${feedback.overallBand}`
                  : "N/A"}
            </ScoreValue>
            <ScoreLabel>
              {feedback.exam ? String(feedback.exam).toUpperCase() : t("overall_score")}
            </ScoreLabel>
          </ScoreBanner>

          <Card>
            <Button type="button" onClick={handleSaveResult} disabled={isSaving}>
              {isSaving ? t("saving") : t("save_result_to_history")}
            </Button>
            {saveMessage && (
              <p style={{ marginTop: "0.75rem", color: "#14465a", fontSize: "0.95rem" }}>
                {saveMessage}
              </p>
            )}
          </Card>

          <Card>
            <SectionTitle>{t("assessment_criteria")}</SectionTitle>
            {feedback.criteria.map((criterion, idx) => (
              <CriterionCard key={idx}>
                <CriterionHeader>
                  <CriterionName>{criterion.name ?? criterion.label ?? criterion.id}</CriterionName>
                  <CriterionBand>
                    {criterion.score ?? criterion.band ?? "N/A"}
                    {feedback.scaleMax ? `/${feedback.scaleMax}` : ""}
                  </CriterionBand>
                </CriterionHeader>
                <CriterionComment>{criterion.comment}</CriterionComment>
              </CriterionCard>
            ))}
          </Card>

          {feedback.strengths?.length > 0 && (
            <Card>
              <SectionTitle>{t("strengths")}</SectionTitle>
              <List>
                {feedback.strengths.map((item, idx) => (
                  <ListItem key={idx}>{item}</ListItem>
                ))}
              </List>
            </Card>
          )}

          {feedback.weaknesses?.length > 0 && (
            <Card>
              <SectionTitle>{t("areas_to_improve")}</SectionTitle>
              <List>
                {feedback.weaknesses.map((item, idx) => (
                  <ListItem key={idx}>{item}</ListItem>
                ))}
              </List>
            </Card>
          )}

          {feedback.recommendations?.length > 0 && (
            <Card>
              <SectionTitle>{t("recommendations")}</SectionTitle>
              <List>
                {feedback.recommendations.map((item, idx) => (
                  <ListItem key={idx}>{item}</ListItem>
                ))}
              </List>
            </Card>
          )}

          {feedback.improvedResponse && (
            <Card>
              <SectionTitle>{t("improved_response")}</SectionTitle>
              <Improved>{feedback.improvedResponse}</Improved>
            </Card>
          )}
        </>
      )}
    </Container>
  );
}

export default function VoicePage() {
  return (
    <Suspense fallback={null}>
      <VoicePageContent />
    </Suspense>
  );
}
