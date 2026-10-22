"use client";

/**
 * Раннер экзамена: один компонент на все три экзамена и оба типа секций.
 *
 * - kind: "auto"   — вопросы с эталонами: ответы проверяются на клиенте
 *                    детерминированно (`lib/exams/grade.mjs`), балл секции
 *                    считается по официальной шкале (`lib/exams/scoring.mjs`).
 * - kind: "rubric" — задание на продукцию: текст уходит в `/api/ai`, модель
 *                    ставит баллы только по критериям, итог считает сервер
 *                    (`lib/exams/rubrics.mjs` → `calibrateRubric`).
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import Link from "next/link";
import { gradeSet } from "@/lib/exams/grade.mjs";
import {
  ieltsBandFromRaw,
  toeflSectionScore,
  satSectionScore,
} from "@/lib/exams/scoring.mjs";
import { aiFetch } from "@/lib/aiClient";
import { saveTestResult } from "@/lib/resultsService";

const PRIMARY = "#800120";
const SECONDARY = "#14465a";

const CHOICE_TYPES = new Set([
  "multiple_choice",
  "true_false",
  "true_false_not_given",
  "matching_headings",
]);

function sectionScore(examId, correct, total) {
  if (examId === "ielts") return ieltsBandFromRaw(correct, total);
  if (examId === "toefl") return toeflSectionScore(correct, total);
  if (examId === "sat") return satSectionScore(correct, total);
  return null;
}

function scoreLabel(examId, score) {
  if (score === null || score === undefined) return "—";
  if (examId === "ielts") return `Band ${score}`;
  if (examId === "toefl") return `${score} / 30`;
  if (examId === "sat") return `${score} / 800`;
  return String(score);
}

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, var(--app-bg) 0%, var(--app-bg-alt) 100%);
  padding: 2rem 1rem 4rem;
  display: flex;
  justify-content: center;
  @media (max-width: 640px) {
    padding: 1.25rem 0.75rem 3rem;
  }
`;

const Content = styled.div`
  width: 100%;
  max-width: 880px;
`;

const BackLink = styled(Link)`
  display: inline-block;
  padding: 0.55rem 1.1rem;
  border: 1px solid ${SECONDARY};
  border-radius: 10px;
  color: ${SECONDARY};
  font-size: 0.85rem;
  font-weight: 600;
  text-decoration: none;
  margin-bottom: 1.25rem;
  &:hover {
    background: ${SECONDARY};
    color: #fff;
  }
  .dark & {
    color: #7fb3d5;
    border-color: #7fb3d5;
  }
`;

const Title = styled.h1`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${PRIMARY};
  margin: 0 0 0.35rem;
  .dark & {
    color: #e0526e;
  }
`;

const Meta = styled.p`
  margin: 0 0 1.25rem;
  color: var(--app-secondary-text);
  font-size: 0.9rem;
`;

const SetTabs = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.25rem;
`;

const SetTab = styled.button`
  padding: 0.45rem 0.9rem;
  border-radius: 999px;
  border: 1px solid ${({ $active }) => ($active ? PRIMARY : "var(--app-border, #d7dbe0)")};
  background: ${({ $active }) => ($active ? PRIMARY : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "var(--app-text, #1f2937)")};
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
`;

const Panel = styled.section`
  background: var(--app-card, #fff);
  border: 1px solid var(--app-border, #e5e7eb);
  border-radius: 16px;
  padding: 1.35rem;
  margin-bottom: 1.25rem;
  box-shadow: 0 2px 10px rgba(15, 23, 42, 0.04);
`;

const PanelTitle = styled.h2`
  font-size: 1.05rem;
  font-weight: 700;
  color: ${SECONDARY};
  margin: 0 0 0.75rem;
  .dark & {
    color: #7fb3d5;
  }
`;

const Paragraph = styled.p`
  margin: 0 0 0.85rem;
  line-height: 1.65;
  font-size: 0.95rem;
  color: var(--app-text, #1f2937);
`;

const Transcript = styled.details`
  margin-top: 0.75rem;
  font-size: 0.9rem;
  color: var(--app-secondary-text);
  & summary {
    cursor: pointer;
    font-weight: 600;
  }
  & p {
    white-space: pre-wrap;
    line-height: 1.6;
  }
`;

const Guidance = styled.ul`
  margin: 0.5rem 0 0;
  padding-left: 1.1rem;
  color: var(--app-secondary-text);
  font-size: 0.9rem;
  line-height: 1.6;
`;

const QuestionCard = styled.div`
  border-top: 1px solid var(--app-border, #eef0f3);
  padding: 1rem 0;
  &:first-of-type {
    border-top: none;
  }
`;

const QuestionNumber = styled.span`
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 700;
  color: ${PRIMARY};
  margin-right: 0.4rem;
`;

const QuestionPrompt = styled.p`
  margin: 0 0 0.6rem;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.5;
  color: var(--app-text, #1f2937);
  white-space: pre-wrap;
`;

const OptionLabel = styled.label`
  display: flex;
  gap: 0.55rem;
  align-items: flex-start;
  padding: 0.4rem 0.55rem;
  border-radius: 9px;
  font-size: 0.9rem;
  line-height: 1.45;
  color: var(--app-text, #1f2937);
  cursor: pointer;
  background: ${({ $state }) =>
    $state === "correct"
      ? "rgba(22, 163, 74, 0.12)"
      : $state === "wrong"
        ? "rgba(190, 18, 60, 0.1)"
        : "transparent"};
  &:hover {
    background: rgba(20, 70, 90, 0.07);
  }
`;

const TextInput = styled.input`
  width: 100%;
  max-width: 280px;
  padding: 0.5rem 0.7rem;
  border: 1px solid var(--app-border, #d7dbe0);
  border-radius: 9px;
  font-size: 0.92rem;
  background: var(--app-card, #fff);
  color: var(--app-text, #1f2937);
`;

const Textarea = styled.textarea`
  width: 100%;
  min-height: 220px;
  padding: 0.75rem 0.9rem;
  border: 1px solid var(--app-border, #d7dbe0);
  border-radius: 12px;
  font-size: 0.95rem;
  line-height: 1.6;
  background: var(--app-card, #fff);
  color: var(--app-text, #1f2937);
  resize: vertical;
`;

const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.65rem;
  align-items: center;
  margin-top: 1rem;
`;

const Button = styled.button`
  padding: 0.6rem 1.2rem;
  border: none;
  border-radius: 10px;
  background: ${PRIMARY};
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  &:disabled {
    opacity: 0.55;
    cursor: not-allowed;
  }
`;

const GhostButton = styled(Button)`
  background: transparent;
  color: ${SECONDARY};
  border: 1px solid ${SECONDARY};
`;

const StatusText = styled.p`
  margin: 0.75rem 0 0;
  font-size: 0.88rem;
  color: ${({ $error }) => ($error ? "#b91c1c" : SECONDARY)};
`;

const ScoreBanner = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 0.75rem;
  padding: 1rem 1.15rem;
  border-radius: 14px;
  background: rgba(20, 70, 90, 0.08);
  margin-bottom: 1rem;
`;

const ScoreValue = styled.span`
  font-size: 1.6rem;
  font-weight: 800;
  color: ${SECONDARY};
`;

const ScoreCaption = styled.span`
  font-size: 0.88rem;
  color: var(--app-secondary-text);
`;

const Explanation = styled.p`
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  line-height: 1.6;
  color: var(--app-secondary-text);
`;

const CriterionCard = styled.div`
  border: 1px solid var(--app-border, #e5e7eb);
  border-radius: 12px;
  padding: 0.8rem 0.95rem;
  margin-bottom: 0.65rem;
`;

const CriterionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 0.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  color: var(--app-text, #1f2937);
`;

const CriterionScore = styled.span`
  color: ${PRIMARY};
  white-space: nowrap;
`;

const Empty = styled.p`
  color: var(--app-secondary-text);
  font-size: 0.92rem;
`;

export default function ExamRunner({ exam, section }) {
  const [setIndex, setSetIndex] = useState(0);
  const set = section?.sets?.[setIndex] ?? null;
  const isRubric = section?.kind === "rubric";

  // auto-режим
  const [answers, setAnswers] = useState({});
  const [graded, setGraded] = useState(null);
  const [saveState, setSaveState] = useState({ status: "idle", message: "" });

  // rubric-режим
  const [draft, setDraft] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [rubricState, setRubricState] = useState({ status: "idle", message: "" });

  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  useEffect(() => {
    setAnswers({});
    setGraded(null);
    setSaveState({ status: "idle", message: "" });
    setDraft("");
    setFeedback(null);
    setRubricState({ status: "idle", message: "" });
  }, [setIndex]);

  const questions = useMemo(
    () => (Array.isArray(set?.questions) ? set.questions : []),
    [set]
  );

  const answeredCount = questions.filter((q) => {
    const value = answers[q.id];
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value !== "";
  }).length;

  const setAnswer = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const toggleMulti = (questionId, index) => {
    setAnswers((prev) => {
      const current = Array.isArray(prev[questionId]) ? [...prev[questionId]] : [];
      const at = current.indexOf(index);
      if (at >= 0) current.splice(at, 1);
      else current.push(index);
      return { ...prev, [questionId]: current.sort((a, b) => a - b) };
    });
  };

  const handleGrade = () => {
    if (!set) return;
    const result = gradeSet(set, answers);
    const score = sectionScore(exam.id, result.correct, result.total);
    setGraded({ ...result, score });
    setSaveState({ status: "idle", message: "" });
  };

  const handleSave = async () => {
    if (!graded) return;
    setSaveState({ status: "saving", message: "" });
    try {
      await saveTestResult({
        testType: exam.id,
        exam: exam.id,
        overallScore:
          graded.total > 0 ? Math.round((graded.correct / graded.total) * 100) : 0,
        sections: {
          [section.id]: {
            score: graded.score,
            correct: graded.correct,
            total: graded.total,
            scale: section.scale,
          },
        },
        examples: { [section.id]: answers },
      });
      if (mountedRef.current) {
        setSaveState({ status: "saved", message: "Результат сохранён в истории." });
      }
    } catch (err) {
      if (mountedRef.current) {
        setSaveState({
          status: "error",
          message: err?.message || "Не удалось сохранить результат.",
        });
      }
    }
  };

  const handleRubric = async () => {
    const text = draft.trim();
    if (text.length < 20) {
      setRubricState({
        status: "error",
        message: "Слишком короткий ответ: нужно минимум 20 символов.",
      });
      return;
    }
    const skill = section.id === "speaking" ? "speaking" : "writing";
    const endpoint = skill === "speaking" ? "speechFeedback" : "essayFeedback";
    setRubricState({ status: "loading", message: "" });
    setFeedback(null);
    try {
      const payload =
        skill === "speaking"
          ? { endpoint, exam: exam.id, skill, speech: text, question: set?.prompt }
          : {
              endpoint,
              exam: exam.id,
              skill,
              essay: text,
              taskType: set?.title || set?.prompt,
            };
      const response = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || "Оценка не удалась.");
      if (!mountedRef.current) return;
      setFeedback(data);
      setRubricState({ status: "done", message: "" });
    } catch (err) {
      if (mountedRef.current) {
        setRubricState({
          status: "error",
          message: err?.message || "Оценка не удалась.",
        });
      }
    }
  };

  if (!section || !set) {
    return (
      <PageContainer>
        <Content>
          <Empty>Секция не найдена.</Empty>
          <BackLink href="/exams">← Ко всем экзаменам</BackLink>
        </Content>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Content>
        <BackLink href={`/exams/${exam.id}`}>← {exam.title}</BackLink>

        <Title>
          {exam.emoji} {section.title}
        </Title>
        <Meta>
          {exam.short} · {section.minutes} мин · {section.sets.length} наборов ·{" "}
          {isRubric ? "оценка по рубрике" : "детерминированная проверка"}
        </Meta>

        <SetTabs>
          {section.sets.map((item, index) => (
            <SetTab
              key={item.id}
              type="button"
              $active={index === setIndex}
              onClick={() => setSetIndex(index)}
            >
              {item.title}
            </SetTab>
          ))}
        </SetTabs>

        {set.passage && (
          <Panel>
            <PanelTitle>{set.passage.title}</PanelTitle>
            {(set.passage.paragraphs || []).map((text, index) => (
              <Paragraph key={index}>{text}</Paragraph>
            ))}
            {set.passage.text && <Paragraph>{set.passage.text}</Paragraph>}
          </Panel>
        )}

        {set.reading && (
          <Panel>
            <PanelTitle>{set.reading.title || "Text"}</PanelTitle>
            {set.reading.text && <Paragraph>{set.reading.text}</Paragraph>}
            {(set.reading.paragraphs || []).map((text, index) => (
              <Paragraph key={index}>{text}</Paragraph>
            ))}
          </Panel>
        )}

        {set.audioText && (
          <Panel>
            <PanelTitle>Транскрипт трека</PanelTitle>
            <Paragraph>
              Прослушайте смысл текста, затем ответьте на вопросы. Транскрипт можно
              открыть — он не влияет на подсчёт баллов.
            </Paragraph>
            <Transcript>
              <summary>Показать транскрипт</summary>
              <p>{set.audioText}</p>
            </Transcript>
          </Panel>
        )}

        {isRubric ? (
          <>
            <Panel>
              <PanelTitle>{set.title}</PanelTitle>
              <Paragraph style={{ whiteSpace: "pre-wrap" }}>{set.prompt}</Paragraph>
              {Array.isArray(set.guidance) && set.guidance.length > 0 && (
                <Guidance>
                  {set.guidance.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </Guidance>
              )}
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder={
                  section.id === "speaking"
                    ? "Наговорите ответ (распознавание речи) или введите транскрипт здесь…"
                    : "Напишите ответ здесь…"
                }
              />
              <Actions>
                <Button
                  type="button"
                  onClick={handleRubric}
                  disabled={rubricState.status === "loading"}
                >
                  {rubricState.status === "loading" ? "Проверяем…" : "Оценить по рубрике"}
                </Button>
                <ScoreCaption>
                  {draft.trim() ? `${draft.trim().split(/\s+/).length} слов` : "0 слов"}
                </ScoreCaption>
              </Actions>
              {rubricState.message && (
                <StatusText $error={rubricState.status === "error"}>
                  {rubricState.message}
                </StatusText>
              )}
            </Panel>

            {feedback && (
              <Panel>
                <ScoreBanner>
                  <ScoreValue>
                    {feedback.overall ?? feedback.overallBand ?? "—"}
                    {feedback.scaleMax ? `/${feedback.scaleMax}` : ""}
                  </ScoreValue>
                  <ScoreCaption>
                    {String(feedback.exam || exam.id).toUpperCase()} ·{" "}
                    {feedback.criteria?.length ?? 0} критериев
                  </ScoreCaption>
                </ScoreBanner>

                {(feedback.criteria || []).map((criterion, index) => (
                  <CriterionCard key={criterion.id || index}>
                    <CriterionHeader>
                      <span>{criterion.label || criterion.name || criterion.id}</span>
                      <CriterionScore>
                        {criterion.score ?? criterion.band ?? "—"}
                        {feedback.scaleMax ? `/${feedback.scaleMax}` : ""}
                      </CriterionScore>
                    </CriterionHeader>
                    {criterion.comment && <Explanation>{criterion.comment}</Explanation>}
                    {criterion.evidence && <Explanation>«{criterion.evidence}»</Explanation>}
                  </CriterionCard>
                ))}

                {Array.isArray(feedback.strengths) && feedback.strengths.length > 0 && (
                  <>
                    <PanelTitle style={{ marginTop: "1rem" }}>Сильные стороны</PanelTitle>
                    <Guidance>
                      {feedback.strengths.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </Guidance>
                  </>
                )}

                {Array.isArray(feedback.weaknesses) && feedback.weaknesses.length > 0 && (
                  <>
                    <PanelTitle style={{ marginTop: "1rem" }}>Что снижает балл</PanelTitle>
                    <Guidance>
                      {feedback.weaknesses.map((item, index) => (
                        <li key={index}>{item}</li>
                      ))}
                    </Guidance>
                  </>
                )}

                {Array.isArray(feedback.recommendations) &&
                  feedback.recommendations.length > 0 && (
                    <>
                      <PanelTitle style={{ marginTop: "1rem" }}>Что делать дальше</PanelTitle>
                      <Guidance>
                        {feedback.recommendations.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </Guidance>
                    </>
                  )}

                {feedback.correctedExcerpt && (
                  <>
                    <PanelTitle style={{ marginTop: "1rem" }}>Улучшенный фрагмент</PanelTitle>
                    <Paragraph>{feedback.correctedExcerpt}</Paragraph>
                  </>
                )}
              </Panel>
            )}
          </>
        ) : (
          <>
            <Panel>
              <PanelTitle>
                {set.title} · {questions.length} вопросов
              </PanelTitle>

              {questions.map((question, index) => {
                const detail = graded?.details?.find((item) => item.id === question.id);
                const given = answers[question.id];
                return (
                  <QuestionCard key={question.id}>
                    <QuestionPrompt>
                      <QuestionNumber>{index + 1}.</QuestionNumber>
                      {question.prompt}
                    </QuestionPrompt>

                    {CHOICE_TYPES.has(question.type) &&
                      (question.options || []).map((option, optionIndex) => {
                        const isChosen = Number(given) === optionIndex;
                        let state;
                        if (detail) {
                          if (optionIndex === Number(detail.expected)) state = "correct";
                          else if (isChosen) state = "wrong";
                        }
                        return (
                          <OptionLabel key={optionIndex} $state={state}>
                            <input
                              type="radio"
                              name={`q-${question.id}`}
                              checked={isChosen}
                              onChange={() => setAnswer(question.id, optionIndex)}
                            />
                            <span>{option}</span>
                          </OptionLabel>
                        );
                      })}

                    {question.type === "multiple_answer" &&
                      (question.options || []).map((option, optionIndex) => {
                        const chosen = Array.isArray(given) && given.includes(optionIndex);
                        return (
                          <OptionLabel key={optionIndex}>
                            <input
                              type="checkbox"
                              checked={chosen}
                              onChange={() => toggleMulti(question.id, optionIndex)}
                            />
                            <span>{option}</span>
                          </OptionLabel>
                        );
                      })}

                    {(question.type === "short_answer" ||
                      question.type === "numeric" ||
                      !question.type) && (
                      <TextInput
                        type="text"
                        value={given ?? ""}
                        onChange={(event) => setAnswer(question.id, event.target.value)}
                        placeholder={
                          question.type === "numeric" ? "Число" : "Короткий ответ"
                        }
                      />
                    )}

                    {detail && (
                      <>
                        <Explanation>
                          {detail.correct ? "✅ Верно. " : "❌ Неверно. "}
                          Эталон: {String(detail.expected)}
                          {Array.isArray(detail.accept) && detail.accept.length > 0
                            ? ` (допустимо: ${detail.accept.join(", ")})`
                            : ""}
                        </Explanation>
                        {detail.explanation && (
                          <Explanation>{detail.explanation}</Explanation>
                        )}
                      </>
                    )}
                  </QuestionCard>
                );
              })}

              <Actions>
                <Button type="button" onClick={handleGrade}>
                  Проверить ответы
                </Button>
                <ScoreCaption>
                  Отвечено {answeredCount} из {questions.length}
                </ScoreCaption>
              </Actions>
            </Panel>

            {graded && (
              <Panel>
                <ScoreBanner>
                  <ScoreValue>{scoreLabel(exam.id, graded.score)}</ScoreValue>
                  <ScoreCaption>
                    Верно {graded.correct} из {graded.total} (
                    {Math.round(graded.accuracy * 100)}%)
                  </ScoreCaption>
                </ScoreBanner>
                <Actions>
                  <GhostButton type="button" onClick={handleSave}>
                    Сохранить результат
                  </GhostButton>
                  <GhostButton
                    type="button"
                    onClick={() => {
                      setAnswers({});
                      setGraded(null);
                      setSaveState({ status: "idle", message: "" });
                    }}
                  >
                    Пройти заново
                  </GhostButton>
                </Actions>
                {saveState.message && (
                  <StatusText $error={saveState.status === "error"}>
                    {saveState.message}
                  </StatusText>
                )}
              </Panel>
            )}
          </>
        )}
      </Content>
    </PageContainer>
  );
}
