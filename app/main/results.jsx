import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PulseLoader from 'react-spinners/PulseLoader';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { fetchResults, fetchListeningExamples, fetchSpeakingExamples, fetchReadingExamples, fetchWritingExamples, fetchUniversityRecommendations } from './chatgpt';
import { saveTestResult } from '@/lib/resultsService';
import { recordTestActivity } from '@/lib/gamification';
import { exportResultsToPDF } from '@/lib/pdfExport';
import AIAssistant from './AIAssistant';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
  font-family: Arial, sans-serif;
`;

const Title = styled.h1`
  text-align: center;
  color: #800120;
  font-weight: bold;
  font-size: 2.5em;
  margin-bottom: 30px;
`;

const Section = styled.div`
  margin-top: 40px;
  background-color: #f9f9f9;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const ScoreChart = styled.div`
  width: 100%;
  height: 400px;
  margin-bottom: 40px;
`;

const OverallBandCard = styled.div`
  background: linear-gradient(135deg, #800120 0%, #a00130 100%);
  border-radius: 12px;
  padding: 30px;
  text-align: center;
  color: #ffffff;
  margin-bottom: 30px;
  box-shadow: 0 6px 20px rgba(128, 1, 32, 0.35);
`;

const OverallBandLabel = styled.div`
  font-size: 1.1em;
  text-transform: uppercase;
  letter-spacing: 2px;
  opacity: 0.9;
  margin-bottom: 8px;
`;

const OverallBandValue = styled.div`
  font-size: 4.5em;
  font-weight: bold;
  line-height: 1;
`;

const OverallBandSub = styled.div`
  margin-top: 10px;
  font-size: 1em;
  opacity: 0.95;
`;

const SectionBandGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
`;

const SectionBandCard = styled.div`
  background-color: #ffffff;
  border: 2px solid #14465a;
  border-radius: 10px;
  padding: 18px;
  text-align: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
`;

const SectionBandName = styled.div`
  color: #14465a;
  font-weight: bold;
  text-transform: capitalize;
  margin-bottom: 8px;
`;

const SectionBandScore = styled.div`
  color: #800120;
  font-size: 2.2em;
  font-weight: bold;
`;

const Feedback = styled.div`
  margin-bottom: 30px;
  color: #333;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 40px;
`;

const Button = styled.button`
  background-color: #800120;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s, transform 0.1s;
  font-size: 16px;
  font-weight: bold;

  &:hover {
    background-color: #a00130;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const DownloadButton = styled(Button)`
  margin-left: 20px;
  background-color: #14465a;

  &:hover {
    background-color: #1a5a74;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
`;

const AudioButton = styled(Button)`
  background-color: #800120;
  margin-top: 10px;

  &:hover {
    background-color: #14465a;
  }
`;

const ExampleContainer = styled.div`
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  margin-top: 20px;
`;

const ExampleTitle = styled.h4`
  color: #800120;
  margin-bottom: 10px;
`;

const ExampleText = styled.p`
  margin-bottom: 15px;
`;

const UniversityRecommendations = styled.div`
  margin-top: 40px;
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const RecommendationTitle = styled.h3`
  color: #14465a;
  margin-bottom: 20px;
`;

const University = styled.div`
  margin-bottom: 20px;
  padding: 15px;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
`;

const UniversityName = styled.h4`
  color: #800120;
  margin-bottom: 5px;
`;

const UniversityLocation = styled.p`
  font-style: italic;
  color: #555;
  margin-bottom: 10px;
`;

const UniversityLink = styled.a`
  color: #14465a;
  text-decoration: underline;
  &:hover {
    text-decoration: none;
    color: #1a5a74;
  }
`;

const ErrorAnalysisContainer = styled.div`
  margin-top: 40px;
  background: linear-gradient(135deg, #14465a 0%, #0d2f3d 100%);
  border-radius: 12px;
  padding: 24px;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(20, 70, 90, 0.3);
`;

const ErrorAnalysisHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const ErrorAnalysisTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-weight: bold;
`;

const AnalyzeButton = styled(Button)`
  background-color: #800120;
  &:hover {
    background-color: #a00130;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorAnalysisSummary = styled.div`
  background-color: rgba(255, 255, 255, 0.08);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  line-height: 1.6;
`;

const ErrorSection = styled.div`
  background-color: #ffffff;
  color: #333;
  border-radius: 8px;
  padding: 18px;
  margin-bottom: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
`;

const ErrorSectionTitle = styled.h4`
  color: #14465a;
  margin: 0 0 12px 0;
  font-weight: bold;
  text-transform: capitalize;
`;

const QuestionItem = styled.div`
  border-left: 4px solid ${(props) => (props.correct ? "#16a34a" : "#800120")};
  background-color: #f9f9f9;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 10px;
`;

const QuestionText = styled.p`
  margin: 0 0 6px 0;
  font-weight: bold;
  color: #333;
`;

const QuestionDetail = styled.p`
  margin: 2px 0;
  font-size: 0.95em;
  color: #555;
`;

const QuestionExplanation = styled.p`
  margin: 8px 0 0 0;
  font-size: 0.95em;
  color: #333;
  line-height: 1.5;
`;

const MistakeList = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  color: #555;
`;

const RecommendationList = styled.ul`
  margin: 10px 0;
  padding-left: 20px;
  color: #333;
`;

const OverallRecommendations = styled.div`
  background-color: #f0f8ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 12px;
`;

const OverallRecommendationsTitle = styled.h4`
  color: #14465a;
  margin: 0 0 8px 0;
  font-weight: bold;
`;

const GamificationContainer = styled.div`
  margin-top: 40px;
  background: linear-gradient(135deg, #800120 0%, #a00130 100%);
  border-radius: 12px;
  padding: 24px;
  color: #ffffff;
  box-shadow: 0 6px 20px rgba(128, 1, 32, 0.35);
`;

const GamificationHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 16px;
`;

const GamificationTitle = styled.h3`
  color: #ffffff;
  margin: 0;
  font-weight: bold;
  font-size: 1.3rem;
`;

const XpBadge = styled.div`
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 999px;
  padding: 8px 18px;
  font-weight: bold;
  font-size: 1.1rem;
`;

const GamificationStats = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const GamStat = styled.div`
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 8px;
  padding: 12px;
  text-align: center;
`;

const GamStatValue = styled.div`
  font-size: 1.6rem;
  font-weight: bold;
`;

const GamStatLabel = styled.div`
  font-size: 0.8rem;
  opacity: 0.9;
  margin-top: 4px;
`;

const AchievementBadges = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
`;

const AchievementBadge = styled.div`
  background-color: rgba(255, 215, 0, 0.2);
  border: 1px solid rgba(255, 215, 0, 0.5);
  border-radius: 999px;
  padding: 6px 14px;
  font-size: 0.9rem;
  font-weight: 600;
`;

const Results = ({ answers, testType }) => {
  const { t } = useTranslation();

  const [result, setResult] = useState({});
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [listeningExamples, setListeningExamples] = useState(null);
  const [speakingExamples, setSpeakingExamples] = useState(null);
  const [readingExamples, setReadingExamples] = useState(null);
  const [writingExamples, setWritingExamples] = useState(null);
  const [universityRecommendations, setUniversityRecommendations] = useState(null);
  const [resultsLoadCount, setResultsLoadCount] = useState(0);
  const [savedResultId, setSavedResultId] = useState(null);
  const [errorAnalysis, setErrorAnalysis] = useState(null);
  const [errorAnalysisLoading, setErrorAnalysisLoading] = useState(false);
  const [errorAnalysisError, setErrorAnalysisError] = useState(null);
  const [gamification, setGamification] = useState(null);

  useEffect(() => {
  const fetchResultsLoadCount = async () => {
    try {
      const response = await fetch('/api/results/main');
      const data = await response.json();
      setResultsLoadCount(data.count);
    } catch (error) {
      console.error("Error fetching results load count:", error);
    }
  };

  fetchResultsLoadCount();
}, []);

  useEffect(() => {
    const getResults = async () => {
      try {
        setLoading(true);
        setError(null);
      const sections = testType === 'full'
        ? ['listening', 'reading', 'writing', 'speaking']
        : [testType];

      const newResults = {};
      let totalScore = 0;
      let validSections = 0;

      for (const section of sections) {
      if (answers[section] && answers[section].data) {
        try {
          const sectionResult = await fetchResults(section, answers[section].data, testType);
          const score = parseScore(sectionResult, section);
          if (score > 0) {
            totalScore += score;
            validSections++;
          }
          newResults[section] = { feedback: sectionResult, score: score };

            // Fetch examples based on the section and score
            if (section === 'listening' || testType === 'full') {
  const listening = await fetchListeningExamples(score);
  setListeningExamples(listening);
}
            if (section === 'speaking' || testType === 'full') {
              const speaking = await fetchSpeakingExamples();
              setSpeakingExamples(speaking);
            }
            if (section === 'reading' || testType === 'full') {
              const reading = await fetchReadingExamples(score);
              setReadingExamples(reading);
            }
            if (section === 'writing' || testType === 'full') {
              const writingTopic = answers[section]?.data?.topics?.task2 || 'general writing topic';
              const writing = await fetchWritingExamples(score, writingTopic);
              setWritingExamples(writing);
            }
          } catch (error) {
          console.error(`Error processing ${section}:`, error);
          setError(`Error fetching ${section}.message}`);
        }
      } else {
        console.warn(`Missing data for ${section} section`);
      }
      }

      const averageScore = validSections > 0 ? totalScore / validSections : 0;
const overallScore = roundIELTSScore(averageScore);
setResult({ ...newResults, overallScore });

      try {
        const resultId = await saveTestResult({
          testType,
          overallScore,
          sections: newResults,
          examples: {
            listening: listeningExamples,
            speaking: speakingExamples,
            reading: readingExamples,
            writing: writingExamples,
          },
          universityRecommendations,
        });
        setSavedResultId(resultId);
      } catch (saveError) {
        console.error('Error saving test result:', saveError);
      }

      // Начисляем XP и обновляем геймификацию
      try {
        const sectionKeys = Object.keys(newResults).filter((key) => key !== 'overallScore');
        const gamificationResult = await recordTestActivity({
          testType,
          overallScore,
          sections: sectionKeys,
        });
        setGamification(gamificationResult);
      } catch (gamError) {
        console.error('Error recording gamification:', gamError);
      }

      await updateResultsLoadCount();

      if (testType === 'full') {
        const recommendations = await fetchUniversityRecommendations(overallScore);
        setUniversityRecommendations(recommendations);
      }
    } catch (err) {
        console.error('Error in getResults:', err);
        setError(`General: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    getResults();
    // eslint-disable-next-line react-hooks/exhaustive-deps
}, [answers, testType]);

  const downloadResults = () => {
    let content = `IELTS Test Results\n\n`;
    content += `Overall Score: ${result.overallScore}/9\n\n`;
  
    Object.entries(result).forEach(([section, data]) => {
      if (section !== 'overallScore') {
        content += `${section.charAt(0).toUpperCase() + section.slice(1)} Feedback:\n${data.feedback}\n\n`;
      }
    });
  
    if (listeningExamples) {
      content += `Listening Practice Materials:\n${listeningExamples}\n\n`;
    }
    if (speakingExamples) {
      content += `Speaking Practice Materials:\n${speakingExamples}\n\n`;
    }
    if (readingExamples) {
      content += `Reading Practice Materials:\n${readingExamples}\n\n`;
    }
    if (writingExamples) {
      content += `Writing Practice Materials:\n${writingExamples}\n\n`;
    }
  
    if (universityRecommendations) {
      content += `University Recommendations:\n${universityRecommendations}\n\n`;
    }
  
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'IELTS_Test_Results.txt';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const downloadPDF = async () => {
    try {
      const sections = {};
      Object.entries(result).forEach(([section, data]) => {
        if (section !== 'overallScore') {
          sections[section] = {
            score: data.score,
            feedback: data.feedback,
          };
        }
      });

      const examples = {};
      if (listeningExamples) examples.listening = listeningExamples;
      if (speakingExamples) examples.speaking = speakingExamples;
      if (readingExamples) examples.reading = readingExamples;
      if (writingExamples) examples.writing = writingExamples;

      await exportResultsToPDF({
        testType,
        overallScore: result.overallScore,
        sections,
        examples,
        universityRecommendations,
        createdAt: new Date(),
        fileName: 'IELTS_Test_Report.pdf',
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Failed to export PDF. Please try again.');
    }
  };

  const handleErrorAnalysis = async () => {
    setErrorAnalysisLoading(true);
    setErrorAnalysisError(null);
    setErrorAnalysis(null);

    try {
      const sections = Object.entries(result)
        .filter(([key]) => key !== 'overallScore')
        .map(([key, data]) => ({
          section: key,
          score: data.score,
          questions: answers[key]?.questions || [],
          answers: answers[key]?.answers || {},
          feedback: data.feedback || '',
        }));

      const response = await aiFetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'errorAnalysis',
          sections,
          overallScore: result.overallScore,
          testType,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze errors');
      }

      setErrorAnalysis(data);
    } catch (err) {
      console.error('Error analyzing test errors:', err);
      setErrorAnalysisError(err.message || 'Failed to analyze errors');
    } finally {
      setErrorAnalysisLoading(false);
    }
  };

  const renderErrorAnalysis = () => {
    if (!errorAnalysis) return null;

    return (
      <ErrorAnalysisContainer>
        <ErrorAnalysisHeader>
          <ErrorAnalysisTitle>{t("error_analysis_title")}</ErrorAnalysisTitle>
        </ErrorAnalysisHeader>
        {errorAnalysis.summary && (
          <ErrorAnalysisSummary>{errorAnalysis.summary}</ErrorAnalysisSummary>
        )}
        {(errorAnalysis.sections || []).map((section, idx) => (
          <ErrorSection key={idx}>
            <ErrorSectionTitle>
              {section.section} {section.score != null ? `- ${section.score}/9` : ''}
            </ErrorSectionTitle>
            {(section.questionAnalysis || []).map((q, qIdx) => (
              <QuestionItem key={qIdx} correct={q.isCorrect}>
                <QuestionText>{q.question}</QuestionText>
                {q.questionType && <QuestionDetail><strong>Type:</strong> {q.questionType}</QuestionDetail>}
                {q.userAnswer != null && <QuestionDetail><strong>Your answer:</strong> {String(q.userAnswer)}</QuestionDetail>}
                {q.correctAnswer != null && <QuestionDetail><strong>Correct answer:</strong> {String(q.correctAnswer)}</QuestionDetail>}
                {q.explanation && <QuestionExplanation>{q.explanation}</QuestionExplanation>}
              </QuestionItem>
            ))}
            {section.commonMistakes && section.commonMistakes.length > 0 && (
              <>
                <strong>Common mistakes:</strong>
                <MistakeList>
                  {section.commonMistakes.map((m, mIdx) => <li key={mIdx}>{m}</li>)}
                </MistakeList>
              </>
            )}
            {section.recommendations && section.recommendations.length > 0 && (
              <>
                <strong>Recommendations:</strong>
                <RecommendationList>
                  {section.recommendations.map((r, rIdx) => <li key={rIdx}>{r}</li>)}
                </RecommendationList>
              </>
            )}
          </ErrorSection>
        ))}
        {errorAnalysis.overallRecommendations && errorAnalysis.overallRecommendations.length > 0 && (
          <OverallRecommendations>
            <OverallRecommendationsTitle>{t("error_analysis_overall")}</OverallRecommendationsTitle>
            <RecommendationList>
              {errorAnalysis.overallRecommendations.map((r, rIdx) => <li key={rIdx}>{r}</li>)}
            </RecommendationList>
          </OverallRecommendations>
        )}
      </ErrorAnalysisContainer>
    );
  };

  const roundIELTSScore = (score) => {
    const decimalPart = score % 1;
    if (decimalPart < 0.25) return Math.floor(score);
    if (decimalPart < 0.75) return Math.floor(score) + 0.5;
    return Math.ceil(score);
  };

  const updateResultsLoadCount = async () => {
  try {
    const response = await fetch('/api/results/main', { method: 'POST' });
    const data = await response.json();
    setResultsLoadCount(data.count);
  } catch (error) {
    console.error("Error updating results load count:", error);
  }
};

  const convertRawScore = (rawScore, section) => {
  const listeningTable = [
    [39, 9], [37, 8.5], [35, 8], [32, 7.5], [30, 7], [26, 6.5], [23, 6],
    [18, 5.5], [16, 5], [13, 4.5], [10, 4], [7, 3.5], [5, 3], [3, 2.5], [1, 2], [0, 1]
  ];

  const readingAcademicTable = [
    [39, 9], [37, 8.5], [35, 8], [33, 7.5], [30, 7], [27, 6.5], [23, 6],
    [19, 5.5], [15, 5], [13, 4.5], [10, 4], [8, 3.5], [6, 3], [3, 2.5], [1, 2], [0, 1]
  ];

  const readingGeneralTable = [
    [40, 9], [39, 8.5], [37, 8], [36, 7.5], [34, 7], [32, 6.5], [30, 6],
    [27, 5.5], [23, 5], [19, 4.5], [15, 4], [12, 3.5], [9, 3], [6, 2.5], [3, 2], [0, 1]
  ];

  const table = section === 'listening' ? listeningTable :
                (testType === 'academic' ? readingAcademicTable : readingGeneralTable);

  for (let [threshold, score] of table) {
    if (rawScore >= threshold) return score;
  }
  return 0;
};

const parseScore = (content, section) => {
  if (!content) return 0;
  let scoreMatch;
  if (section === 'listening' || section === 'reading') {
    scoreMatch = content.match(/Converted Score: (\d+(\.\d+)?)/);
  } else {
    scoreMatch = content.match(/Score: (\d+(\.\d+)?)/);
  }
  if (!scoreMatch) return 0;
  
  const score = parseFloat(scoreMatch[1]);
  return Math.min(Math.max(score, 0), 9); // Ensure score is between 0 and 9
};

  const playAudio = (text) => {
    const speech = new SpeechSynthesisUtterance(text);
    speech.lang = 'en-US';
    window.speechSynthesis.speak(speech);
  };

  const formatListeningExamples = (examples) => {
    if (!examples) return null;
    const passages = examples.split(/Passage \d+:/);
    return (
      <div>
        {passages.slice(1).map((passage, index) => (
          <ExampleContainer key={index}>
            <ExampleTitle>Passage {index + 1}</ExampleTitle>
            <ExampleText>{passage.trim()}</ExampleText>
            <AudioButton onClick={() => playAudio(passage.trim())}>Play Audio</AudioButton>
          </ExampleContainer>
        ))}
      </div>
    );
  };

  const formatSpeakingExamples = (examples) => {
    if (!examples) return null;
    const parts = examples.split(/Part \d+:/);
    return (
      <div>
        {parts.slice(1).map((part, index) => (
          <ExampleContainer key={index}>
            <ExampleTitle>Part {index + 1}</ExampleTitle>
            <ExampleText>{part.trim()}</ExampleText>
            <AudioButton onClick={() => playAudio(part.trim())}>Play Audio</AudioButton>
          </ExampleContainer>
        ))}
      </div>
    );
  };

  const formatReadingExamples = (examples) => {
    if (!examples) return null;
    return <ExampleContainer dangerouslySetInnerHTML={{ __html: examples }} />;
  };

  const formatWritingExamples = (examples) => {
    if (!examples) return null;
    return <ExampleContainer dangerouslySetInnerHTML={{ __html: examples }} />;
  };

  const renderUniversityRecommendations = () => {
    if (!universityRecommendations) return null;
  
    const recommendations = universityRecommendations.split('\n\n').map(recommendation => {
      const [name, location, url, ...details] = recommendation.split('\n');
      return { name, location, url, details: details.join(' ') };
    });
  
    return (
      <UniversityRecommendations>
        <RecommendationTitle>Recommended Universities</RecommendationTitle>
        {recommendations.map((uni, index) => (
          <University key={index}>
            <UniversityName>{uni.name}</UniversityName>
            <UniversityLocation>{uni.location}</UniversityLocation>
            {uni.url && <UniversityLink href={uni.url} target="_blank" rel="noopener noreferrer">Visit Website</UniversityLink>}
            <p>{uni.details}</p>
          </University>
        ))}
      </UniversityRecommendations>
    );
  };

  const renderBandSummary = () => {
    const sectionEntries = Object.entries(result).filter(([key]) => key !== 'overallScore');
    if (sectionEntries.length === 0) return null;

    return (
      <>
        <OverallBandCard>
          <OverallBandLabel>Overall Band Score</OverallBandLabel>
          <OverallBandValue>{result.overallScore}/9</OverallBandValue>
          <OverallBandSub>
            Calculated from {sectionEntries.length} sections
            {testType === 'full' ? ' (Listening, Reading, Writing, Speaking)' : ''}
          </OverallBandSub>
        </OverallBandCard>
        <SectionBandGrid>
          {sectionEntries.map(([section, data]) => (
            <SectionBandCard key={section}>
              <SectionBandName>{section}</SectionBandName>
              <SectionBandScore>{data.score}/9</SectionBandScore>
            </SectionBandCard>
          ))}
        </SectionBandGrid>
      </>
    );
  };

  const renderFeedback = (section) => {
    const sectionResult = result[section];
    if (!sectionResult) return null;
  
    const score = parseScore(sectionResult.feedback, section);
    
    const feedbackContent = sectionResult.feedback
      .replace(/### Detailed Feedback and Score/g, '<h3>Detailed Feedback and Score</h3>')
      .replace(/- \*\*/g, '<li><strong>')
      .replace(/\*\* \- /g, '</strong> - ')
      .replace(/<li><strong>/g, '<ul><li><strong>')
      .replace(/<\/strong> - ([^<]+)(\n|$)/g, '</strong> - $1</li>')
      .replace(/Materials to Improve Listening Skills:/g, '<h3>Materials to Improve Listening Skills:</h3>')
      .replace(/### Reading Practice Material/g, '<h3>Reading Practice Material</h3>')
      .replace(/### Listening Practice Script/g, '<h3>Listening Practice Script</h3>')
      .replace(/### Writing Practice Material/g, '<h3>Writing Practice Material</h3>')
      .replace(/### Speaking Practice Material/g, '<h3>Speaking Practice Material</h3>')
      .replace(/\*\*Text:\*\*/g, '<h4>Text:</h4>')
      .replace(/\*\*Comprehension Questions:\*\*/g, '<h4>Comprehension Questions:</h4>')
      .replace(/\*\*Script:\*\*/g, '<h4>Script:</h4>')
      .replace(/\*\*Questions:\*\*/g, '<h4>Questions:</h4>')
      .replace(/\*\*Essay Example:\*\*/g, '<h4>Essay Example:</h4>')
      .replace(/\*\*Letter Example:\*\*/g, '<h4>Letter Example:</h4>')
      .replace(/\*\*Dialogue Example:\*\*/g, '<h4>Dialogue Example:</h4>')
      .replace(/_/g, '')
      .replace(/\n/g, '<br/>');

      let exampleContent = null;
      switch(section) {
        case 'listening':
          exampleContent = formatListeningExamples(listeningExamples);
          break;
        case 'speaking':
          exampleContent = formatSpeakingExamples(speakingExamples);
          break;
        case 'reading':
          exampleContent = formatReadingExamples(readingExamples);
          break;
        case 'writing':
          exampleContent = formatWritingExamples(writingExamples);
          break;
      }

      return (
    <Feedback key={section}>
      <h2>{section.charAt(0).toUpperCase() + section.slice(1)} Feedback</h2>
      <p><strong>Score: {score}/9</strong></p>
          <div dangerouslySetInnerHTML={{ __html: feedbackContent }} />
          {exampleContent && (
            <div>
              <h3>Practice Materials</h3>
              {exampleContent}
            </div>
          )}
        </Feedback>
      );
    };

  if (loading) {
    return (
      <LoadingContainer className="flex flex-col items-center justify-center mt-">
        <PulseLoader color="#800120" size={15} />
        <h1 className="text-center mt-4" style={{ color: '#000000' }}><b>Preparing your results...</b></h1>
      </LoadingContainer>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
  <Container>
    <Title>{testType === 'IELTS'} Test Results</Title>
    {testType === 'toefl' ? (
      renderTOEFLResults()
    ) : (
      <>
        {renderBandSummary()}
        <ScoreChart>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={Object.entries(result).filter(([key]) => key !== 'overallScore').map(([key, value]) => ({ name: key, score: value.score }))}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 9]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="score" fill="#800120" />
            </BarChart>
          </ResponsiveContainer>
        </ScoreChart>
        <Section>
          <h2 style={{ color: '#800120', textAlign: 'center' }}><b>Overall Score: {result.overallScore}/9</b></h2>
          {Object.keys(result).filter((section) => section !== 'overallScore').map(renderFeedback)}
        </Section>
      </>
    )}
    {testType === 'full' && renderUniversityRecommendations()}
    <AIAssistant result={result} />
    <ErrorAnalysisContainer>
      <ErrorAnalysisHeader>
        <ErrorAnalysisTitle>{t("error_analysis_title")}</ErrorAnalysisTitle>
        <AnalyzeButton onClick={handleErrorAnalysis} disabled={errorAnalysisLoading}>
          {errorAnalysisLoading ? t("error_analysis_loading") : t("error_analysis_button")}
        </AnalyzeButton>
      </ErrorAnalysisHeader>
      {errorAnalysisError && (
        <ErrorAnalysisSummary style={{ color: '#ffcccc' }}>
          {errorAnalysisError}
        </ErrorAnalysisSummary>
      )}
      {errorAnalysisLoading && (
        <ErrorAnalysisSummary>{t("error_analysis_loading_hint")}</ErrorAnalysisSummary>
      )}
      {renderErrorAnalysis()}
    </ErrorAnalysisContainer>
    {gamification && (
      <GamificationContainer>
        <GamificationHeader>
          <GamificationTitle>{t("gam_reward_title")}</GamificationTitle>
          <XpBadge>+{gamification.xpGained} XP</XpBadge>
        </GamificationHeader>
        <GamificationStats>
          <GamStat>
            <GamStatValue>{gamification.level}</GamStatValue>
            <GamStatLabel>{t("gam_level")}</GamStatLabel>
          </GamStat>
          <GamStat>
            <GamStatValue>{gamification.newTotalXp}</GamStatValue>
            <GamStatLabel>{t("gam_total_xp")}</GamStatLabel>
          </GamStat>
          <GamStat>
            <GamStatValue>{gamification.currentStreak}🔥</GamStatValue>
            <GamStatLabel>{t("gam_current_streak")}</GamStatLabel>
          </GamStat>
          <GamStat>
            <GamStatValue>{gamification.longestStreak}</GamStatValue>
            <GamStatLabel>{t("gam_longest_streak")}</GamStatLabel>
          </GamStat>
        </GamificationStats>
        {gamification.unlockedAchievements && gamification.unlockedAchievements.length > 0 && (
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '8px' }}>
              {t("gam_new_achievements")}
            </div>
            <AchievementBadges>
              {gamification.unlockedAchievements.map((id) => (
                <AchievementBadge key={id}>🏆 {t(`gam_badge_${id}`)}</AchievementBadge>
              ))}
            </AchievementBadges>
          </div>
        )}
      </GamificationContainer>
    )}
    <ButtonContainer>
      <Button onClick={() => window.location.href = '/main'}>{t("back_to_dashboard")}</Button>
      <DownloadButton onClick={downloadResults}>{t("download_results_txt")}</DownloadButton>
      <DownloadButton onClick={downloadPDF}>{t("download_pdf")}</DownloadButton>
    </ButtonContainer>
  </Container>
);
};

export default Results;