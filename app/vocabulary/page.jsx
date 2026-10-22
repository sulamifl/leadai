"use client";
import { aiFetch } from "@/lib/aiClient";

import React, { useState, useEffect, Suspense } from "react";
import styled from "styled-components";
import { useSearchParams } from "next/navigation";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { PuffLoader } from "react-spinners";
import { exportVocabularyToPDF } from "@/lib/pdfExport";

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

const SearchCard = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(20, 70, 90, 0.12);
  margin-bottom: 2rem;
  @media (max-width: 640px) {
    padding: 1rem;
  }
`;

const SearchRow = styled.div`
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 220px;
  padding: 0.85rem 1rem;
  border: 2px solid rgba(20, 70, 90, 0.25);
  border-radius: 10px;
  font-size: 1rem;
  color: var(--app-text);
  background: var(--app-card);
  outline: none;
  transition: border-color 0.2s ease;

  &:focus {
    border-color: ${PRIMARY};
  }

  &::placeholder {
    color: #9aa7ad;
  }
`;

const Button = styled.button`
  padding: 0.85rem 1.5rem;
  background: ${PRIMARY};
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
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

const DangerButton = styled(Button)`
  background: #c0392b;
  padding: 0.5rem 1rem;
  font-size: 0.85rem;
`;

const LoadingWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
`;

const ErrorText = styled.p`
  color: #c0392b;
  text-align: center;
  margin-top: 1rem;
  font-weight: 500;
`;

const WordCard = styled.div`
  background: var(--app-card);
  border-radius: 16px;
  padding: 1.75rem;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(20, 70, 90, 0.12);
  margin-bottom: 2rem;
  @media (max-width: 640px) {
    padding: 1.25rem;
  }
`;

const WordHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.25rem;
  border-bottom: 2px solid rgba(128, 1, 32, 0.15);
  padding-bottom: 1rem;
`;

const WordTitle = styled.h2`
  color: ${PRIMARY};
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0;
  .dark & {
    color: #e0526e;
  }
`;

const WordMeta = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const Badge = styled.span`
  background: rgba(20, 70, 90, 0.1);
  color: var(--app-secondary-text);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
`;

const BandBadge = styled(Badge)`
  background: ${PRIMARY};
  color: #ffffff;
`;

const Field = styled.div`
  margin-bottom: 1rem;
`;

const FieldLabel = styled.span`
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--app-secondary-text);
  font-weight: 700;
  margin-bottom: 0.25rem;
`;

const FieldValue = styled.p`
  margin: 0;
  color: var(--app-subtext);
  font-size: 1rem;
  line-height: 1.5;
`;

const List = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  color: var(--app-subtext);
  font-size: 1rem;
  line-height: 1.6;
`;

const SectionTitle = styled.h3`
  color: var(--app-secondary-text);
  font-size: 1.1rem;
  font-weight: 700;
  margin: 1.5rem 0 0.5rem;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const Tab = styled.button`
  padding: 0.6rem 1.25rem;
  border-radius: 10px;
  border: 2px solid rgba(20, 70, 90, 0.25);
  background: ${(props) => (props.active ? SECONDARY : "var(--app-card)")};
  color: ${(props) => (props.active ? "#ffffff" : "var(--app-secondary-text)")};
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: ${SECONDARY};
  }
`;

const FlashcardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 1.25rem;
`;

const Flashcard = styled.div`
  perspective: 1000px;
  height: 220px;
  cursor: pointer;
`;

const FlashcardInner = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${(props) => (props.flipped ? "rotateY(180deg)" : "rotateY(0deg)")};
`;

const FlashcardFace = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  border-radius: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 1.25rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FlashcardFront = styled(FlashcardFace)`
  background: linear-gradient(135deg, ${PRIMARY}, #a3002a);
  color: #ffffff;
`;

const FlashcardBack = styled(FlashcardFace)`
  background: linear-gradient(135deg, ${SECONDARY}, #1d5a76);
  color: #ffffff;
  transform: rotateY(180deg);
`;

const CardWord = styled.span`
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 0.5rem;
`;

const CardHint = styled.span`
  font-size: 0.8rem;
  opacity: 0.85;
`;

const CardDefinition = styled.span`
  font-size: 0.95rem;
  line-height: 1.4;
  margin-bottom: 0.5rem;
`;

const CardTranslation = styled.span`
  font-size: 0.85rem;
  opacity: 0.9;
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--app-secondary-text);
  padding: 3rem 1rem;
  background: var(--app-card);
  border-radius: 16px;
  border: 1px dashed rgba(20, 70, 90, 0.3);
`;

const SavedCard = styled.div`
  background: var(--app-card);
  border-radius: 14px;
  padding: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid rgba(20, 70, 90, 0.12);
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SavedCardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.5rem;
`;

const SavedWord = styled.span`
  font-weight: 700;
  color: ${PRIMARY};
  font-size: 1.05rem;
  .dark & {
    color: #e0526e;
  }
`;

const SavedDefinition = styled.p`
  margin: 0;
  color: var(--app-subtext);
  font-size: 0.9rem;
  line-height: 1.4;
`;

const SavedTranslation = styled.p`
  margin: 0;
  color: var(--app-secondary-text);
  font-size: 0.85rem;
  font-style: italic;
`;

const STORAGE_KEY = "ielts_my_words";

const VocabularyPageContent = () => {
  const searchParams = useSearchParams();
  const { t } = useTranslation();
  const [word, setWord] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("explain");
  const [savedWords, setSavedWords] = useState([]);
  const [flipped, setFlipped] = useState({});

  useEffect(() => {
    const lang = searchParams.get("lang") || "en";
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedWords(JSON.parse(stored));
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  const persistSavedWords = (words) => {
    setSavedWords(words);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(words));
    } catch {
      // ignore storage errors
    }
  };

  const handleExplain = async () => {
    const trimmed = word.trim();
    if (!trimmed) {
      setError(t("error_enter_word"));
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const res = await aiFetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ endpoint: "vocabulary", word: trimmed }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || t("error_something_went_wrong"));
        return;
      }

      setResult(data);
    } catch {
      setError(t("error_network"));
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => {
    if (!result) return;

    const alreadySaved = savedWords.some(
      (item) => item.word.toLowerCase() === result.word.toLowerCase()
    );

    if (alreadySaved) {
      setError(t("error_already_saved"));
      return;
    }

    persistSavedWords([...savedWords, result]);
    setError("");
  };

  const handleDelete = (index) => {
    const next = savedWords.filter((_, i) => i !== index);
    persistSavedWords(next);
  };

  const handleDownload = async () => {
    if (savedWords.length === 0) return;
    try {
      await exportVocabularyToPDF(savedWords);
    } catch {
      setError(t("error_download_vocabulary"));
    }
  };

  const toggleFlip = (index) => {
    setFlipped((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  return (
    <PageContainer>
      <Content>
        <Title>{t("vocabulary_tracker")}</Title>
        <Subtitle>{t("vocabulary_subtitle")}</Subtitle>

        <Tabs>
          <Tab active={activeTab === "explain"} onClick={() => setActiveTab("explain")}>
            {t("explain_word")}
          </Tab>
          <Tab active={activeTab === "mywords"} onClick={() => setActiveTab("mywords")}>
            {t("my_words")} ({savedWords.length})
          </Tab>
        </Tabs>

        {activeTab === "explain" && (
          <>
            <SearchCard>
              <SearchRow>
                <Input
                  type="text"
                  placeholder={t("enter_word_placeholder")}
                  value={word}
                  onChange={(e) => setWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleExplain();
                  }}
                />
                <Button onClick={handleExplain} disabled={loading}>
                  {t("explain_word")}
                </Button>
              </SearchRow>
              {error && <ErrorText>{error}</ErrorText>}
            </SearchCard>

            {loading && (
              <LoadingWrapper>
                <PuffLoader size={60} color={PRIMARY} />
              </LoadingWrapper>
            )}

            {!loading && result && (
              <WordCard>
                <WordHeader>
                  <div>
                    <WordTitle>{result.word}</WordTitle>
                    <WordMeta>
                      {result.partOfSpeech && <Badge>{result.partOfSpeech}</Badge>}
                      {result.pronunciation && <Badge>{result.pronunciation}</Badge>}
                      {result.bandLevel && <BandBadge>{result.bandLevel}</BandBadge>}
                    </WordMeta>
                  </div>
                  <SecondaryButton onClick={handleSave}>{t("save_to_my_words")}</SecondaryButton>
                </WordHeader>

                {result.definition && (
                  <Field>
                    <FieldLabel>{t("definition")}</FieldLabel>
                    <FieldValue>{result.definition}</FieldValue>
                  </Field>
                )}

                {result.translation && (
                  <Field>
                    <FieldLabel>{t("translation_ru")}</FieldLabel>
                    <FieldValue>{result.translation}</FieldValue>
                  </Field>
                )}

                {result.example && (
                  <Field>
                    <FieldLabel>{t("ielts_example")}</FieldLabel>
                    <FieldValue>{result.example}</FieldValue>
                  </Field>
                )}

                {result.synonyms && result.synonyms.length > 0 && (
                  <>
                    <SectionTitle>{t("synonyms")}</SectionTitle>
                    <List>
                      {result.synonyms.map((syn, i) => (
                        <li key={i}>{syn}</li>
                      ))}
                    </List>
                  </>
                )}

                {result.collocations && result.collocations.length > 0 && (
                  <>
                    <SectionTitle>{t("collocations")}</SectionTitle>
                    <List>
                      {result.collocations.map((col, i) => (
                        <li key={i}>{col}</li>
                      ))}
                    </List>
                  </>
                )}
              </WordCard>
            )}
          </>
        )}

        {activeTab === "mywords" && (
          <>
            {savedWords.length === 0 ? (
              <EmptyState>
                <p>{t("no_saved_words")}</p>
                <p>{t("no_saved_words_hint")}</p>
              </EmptyState>
            ) : (
              <>
                <SectionTitle>{t("flashcards_click_to_flip")}</SectionTitle>
                <FlashcardGrid>
                  {savedWords.map((item, index) => (
                    <Flashcard key={index} onClick={() => toggleFlip(index)}>
                      <FlashcardInner flipped={flipped[index]}>
                        <FlashcardFront>
                          <CardWord>{item.word}</CardWord>
                          <CardHint>{t("click_to_reveal")}</CardHint>
                        </FlashcardFront>
                        <FlashcardBack>
                          <CardDefinition>{item.definition}</CardDefinition>
                          {item.translation && (
                            <CardTranslation>{item.translation}</CardTranslation>
                          )}
                        </FlashcardBack>
                      </FlashcardInner>
                    </Flashcard>
                  ))}
                </FlashcardGrid>

                <SectionTitle>{t("saved_words")}</SectionTitle>
                <SecondaryButton
                  onClick={handleDownload}
                  style={{ marginBottom: "1rem" }}
                >
                  {t("download_my_words_pdf")}
                </SecondaryButton>
                <FlashcardGrid>
                  {savedWords.map((item, index) => (
                    <SavedCard key={`saved-${index}`}>
                      <SavedCardHeader>
                        <SavedWord>{item.word}</SavedWord>
                        <DangerButton onClick={() => handleDelete(index)}>
                          {t("delete")}
                        </DangerButton>
                      </SavedCardHeader>
                      {item.definition && (
                        <SavedDefinition>{item.definition}</SavedDefinition>
                      )}
                      {item.translation && (
                        <SavedTranslation>{item.translation}</SavedTranslation>
                      )}
                    </SavedCard>
                  ))}
                </FlashcardGrid>
              </>
            )}
          </>
        )}
      </Content>
    </PageContainer>
  );
};

export default function VocabularyPage() {
  return (
    <Suspense fallback={null}>
      <VocabularyPageContent />
    </Suspense>
  );
}
