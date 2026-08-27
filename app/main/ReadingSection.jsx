import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import ieltsData from './ielts-data.json';
import TrueFalseQuestion from './TrueFalseQuestion';
import MatchingInformationQuestion from './MatchingInformationQuestion';
import SummaryCompletionQuestion from './SummaryCompletionQuestion';
import DiagramLabelingQuestion from './DiagramLabelingQuestion';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import { PulseLoader } from 'react-spinners';
import MatchingHeadingsQuestion from './MatchingHeadingsQuestion';
import FlowchartCompletionQuestion from './FlowchartCompletionQuestion';
import SentenceCompletionQuestion from './SentenceCompletionQuestion';
import TableCompletionQuestion from './TableCompletionQuestion';
import DiagramCompletionQuestion from './DiagramCompletionQuestion';
import ShortAnswerQuestion from './ShortAnswerQuestion';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
`;

const Title = styled.h1`
  color: #800120;
  text-align: center;
`;

const Section = styled.div`
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const Button = styled.button`
  background-color: #800120;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #14465a;
  }

  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #800120;
  text-align: center;
  margin-bottom: 20px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
`;

const TextSection = styled.div`
  margin-bottom: 20px;
  color: black;
`;

const QuestionsSection = styled.div`
  border-top: 2px solid #800120;
  color: black;
  font-weight: bold;
  padding-top: 20px;
`;

const InstructionSection = styled.div`
  border-radius: 8px;
  background-color: #800120;
  padding: 20px;
  margin-bottom: 20px;
`;

const ReadingSection = ({ onNext, testType, timedMode }) => {
  const [answers, setAnswers] = useState({});
  const [currentPassage, setCurrentPassage] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes in seconds
  const [passages, setPassages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [currentTextPage, setCurrentTextPage] = useState(0);
  const itemsPerPage = 1; // Number of questions per page
  const textItemsPerPage = 3; // Number of text paragraphs per page
  const [randomizedTexts, setRandomizedTexts] = useState([]);
  const [selectedPassages, setSelectedPassages] = useState([]);
  const [selectedTexts, setSelectedTexts] = useState([]);

  useEffect(() => {
    const loadData = () => {
      if (!ieltsData || !ieltsData.sections || !ieltsData.sections.reading) {
        setError('Invalid data structure in ielts-data.json');
        setIsLoading(false);
        return;
      }

      const data = ieltsData.sections.reading[testType];

      if (data && data.texts && data.questionSets) {
        // Create an array of indices
        const indices = Array.from({ length: data.texts.length }, (_, i) => i);
        // Shuffle the indices
        const shuffledIndices = shuffleArray(indices);
        // Select the first 3 indices
        const selectedIndices = shuffledIndices.slice(0, 3);

        // Create new passages with selected texts and corresponding question sets
        const formattedPassages = selectedIndices.map(index => ({
          text: data.texts[index],
          questions: data.questionSets[index].questions
        }));

        setSelectedPassages(formattedPassages);
        setPassages(formattedPassages);
      } else {
        setError(`Invalid data format for test type: ${testType}`);
      }
      setIsLoading(false);
    };

    loadData();
  }, [testType]);

  useEffect(() => {
    if (timedMode) {
      const timer = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timer);
            handleSubmit();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode]);

  useEffect(() => {
    if (timedMode && timeLeft === 0) {
      handleSubmit();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode, timeLeft]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleAnswerChange = (questionId, answer) => {
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionId]: answer,
    }));
  };

  const handleSubmit = () => {
    if (Object.values(answers).some(answer => answer !== undefined && answer !== null)) {
      const sectionData = {
        section: 'reading',
        data: {
          questions: passages.flatMap(passage => passage.questions),
          answers: answers,
          passages: passages
        }
      };
      onNext(sectionData);
    } else {
      alert("Please answer at least one question before submitting.");
    }
  };

  const renderQuestion = (question) => {
    if (!question || !question.type) {
      console.error('Invalid question structure:', question);
      return null;
    }

    switch (question.type) {
      case 'multiple_choice':
        return <MultipleChoiceQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'true_false':
        return <TrueFalseQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'matching_information':
        return <MatchingInformationQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'summary_completion':
        return <SummaryCompletionQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'diagram_labeling':
        return <DiagramLabelingQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'matching_headings':
        return <MatchingHeadingsQuestion
          key={question.id}
          question={{ ...question, options: question.options.map(opt => opt.statement) }}
          onAnswerChange={handleAnswerChange}
        />;
      case 'flowchart_completion':
        return <FlowchartCompletionQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'sentence_completion':
        return <SentenceCompletionQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'table_completion':
        return <TableCompletionQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'diagram_completion':
        return <DiagramCompletionQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      case 'short_answer':
        return <ShortAnswerQuestion key={question.id} question={question} onAnswerChange={handleAnswerChange} />;
      default:
        console.warn(`Unsupported question type: ${question.type}`);
        return null;
    }
  };

  const renderPassage = (passage) => {
    if (!passage || !passage.text || !passage.questions) {
      console.error('Invalid passage structure:', passage);
      return <div>Error: Invalid passage data</div>;
    }

    const currentTextItem = passage.text;

    const startIndex = currentPage * itemsPerPage;
    const currentItems = passage.questions.slice(startIndex, startIndex + itemsPerPage);

    return (
      <Section>
        <TextSection>
          <div>
            <h3>{currentTextItem.title}</h3>
            <p>{currentTextItem.content}</p>
          </div>
        </TextSection>
        <QuestionsSection>
          {currentItems.map(renderQuestion)}
        </QuestionsSection>
      </Section>
    );
  };

  if (isLoading) {
    return (
      <Container>
        <InstructionSection>
          <h2 style={{ color: '#FFFFFF' }}>Instructions:</h2>
          <InstructionSection>
  <h2>Instructions:</h2>
  <p>
    Please read the passage carefully and answer the following questions.
    You may navigate between questions using the Previous and Next buttons.
    You can also navigate between passages using the Next Passage button.
    Once you have completed all questions and are ready to submit, click Finish.
    You have 60 minutes for each section. After 60 minutes, your results will be automatically submitted.
  </p>
</InstructionSection>
        </InstructionSection>
        <div className="flex items-center justify-center min-h-screen">
          <PulseLoader color="#800120" />
          <h1 className="text-center mt-4" style={{ color: '#FFFFFF' }}><b>Preparing your results...</b></h1>
        </div>
      </Container>
    );
  }

  if (error) {
    return <Container><p>Error: {error}</p></Container>;
  }

  if (!passages || passages.length === 0) {
    return <Container><p>No passages available.</p></Container>;
  }

  const handlePreviousPage = () => {
    if (currentTextPage > 0) {
      setCurrentTextPage(currentTextPage - 1);
    } else {
      setCurrentPage((prevPage) => Math.max(prevPage - 1, 0));
    }
  };

  const handleNextPage = () => {
    const totalTextPages = passages[currentPassage].text ? 1 : 0;
    const totalQuestionPages = Math.ceil(passages[currentPassage].questions.length / itemsPerPage);

    if (currentPage < totalQuestionPages - 1) {
      setCurrentPage(currentPage + 1);
    } else if (currentTextPage < totalTextPages - 1) {
      setCurrentTextPage(currentTextPage + 1);
      setCurrentPage(0);
    } else if (currentPassage < passages.length - 1) {
      setCurrentPassage(currentPassage + 1);
      setCurrentTextPage(0);
      setCurrentPage(0);
    } else {
      handleSubmit();
    }
  };

  return (
    <Container>
      <Title>Reading Section ({testType})</Title>
      {timedMode && (
        <Timer>
          Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}
          {timeLeft % 60}
        </Timer>
      )}
      <InstructionSection>
        <h2>Instructions:</h2>
        <p>
          Please read the passage carefully and answer the following questions.
          You may navigate between questions using the Previous and Next buttons.
          You can also navigate between passages using the Next Passage button.
          Once you have completed all questions and are ready to submit, click Finish.
        </p>
        {timedMode && (
          <p>
            You have 60 minutes for each section. After 60 minutes, your results will be automatically submitted.
          </p>
        )}
      </InstructionSection>
      {selectedPassages.length > 0 && renderPassage(selectedPassages[currentPassage])}
      <Pagination>
        <Button onClick={handlePreviousPage} disabled={currentPage === 0 && currentPassage === 0}>
          Previous
        </Button>
        <Button onClick={handleNextPage}>
          {currentPage < Math.ceil(selectedPassages[currentPassage]?.questions.length / itemsPerPage) - 1 ? 'Next Questions' :
            currentPassage < selectedPassages.length - 1 ? 'Next Passage' : 'Finish'}
        </Button>
      </Pagination>
    </Container>
  );
};

export default ReadingSection;
