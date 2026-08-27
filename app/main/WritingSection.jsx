import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styled from 'styled-components';
import ieltsData from './ielts-data.json';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend);

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
`;

const TitleStyled = styled.h1`
  color: #FFFFFF;
  text-align: center;
`;

const Section = styled.div`
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 20px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
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
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #800120;
  text-align: center;
  margin-bottom: 20px;
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
  background-color: white;
  color: black;
  height: 250px;
`;

const TaskTitle = styled.h3`
  color: #000000;
  font-weight: bold;
`;

const TaskDescription = styled.p`
  color: #000000;
`;

const InstructionSection = styled.div`
  border-radius: 8px;
  background-color: #800120;
  padding: 20px;
  margin-bottom: 20px;
`;

const WritingSection = ({ testType, onNext, timedMode }) => {
  const [task1, setTask1] = useState(null);
  const [task2, setTask2] = useState(null);
  const [answers, setAnswers] = useState(['', '']);
  const [timeLeft, setTimeLeft] = useState(60 * 60);
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    const selectRandomTasks = () => {
      if (testType === 'academic') {
        // Выбираем случайный график для Task 1
        const graphs = ieltsData.sections.writing.graphs.filter(g => g.type === 'bar' || g.type === 'line');
        const randomGraph = graphs[Math.floor(Math.random() * graphs.length)];
        setTask1(randomGraph);

        // Выбираем связанную тему эссе для Task 2
        const relatedEssays = ieltsData.sections.writing.essay_topics.filter(
          t => t.type === 'Academic' && t.title.toLowerCase().includes(randomGraph.title.toLowerCase().split(' ')[0])
        );
        const randomEssay = relatedEssays.length > 0 
          ? relatedEssays[Math.floor(Math.random() * relatedEssays.length)]
          : ieltsData.sections.writing.essay_topics.filter(t => t.type === 'Academic')[Math.floor(Math.random() * ieltsData.sections.writing.essay_topics.filter(t => t.type === 'Academic').length)];
        setTask2(randomEssay);
      } else {
        // Выбираем случайное письмо для Task 1
        const letters = ieltsData.sections.writing.letters;
        const randomLetter = letters[Math.floor(Math.random() * letters.length)];
        setTask1(randomLetter);

        // Выбираем связанную тему эссе для Task 2
        const relatedEssays = ieltsData.sections.writing.essay_topics.filter(
          t => t.type === 'General Training' && t.title.toLowerCase().includes(randomLetter.description.toLowerCase().split(' ')[0])
        );
        const randomEssay = relatedEssays.length > 0 
          ? relatedEssays[Math.floor(Math.random() * relatedEssays.length)]
          : ieltsData.sections.writing.essay_topics.filter(t => t.type === 'General Training')[Math.floor(Math.random() * ieltsData.sections.writing.essay_topics.filter(t => t.type === 'General Training').length)];
        setTask2(randomEssay);
      }
    };

    selectRandomTasks();
  }, [testType]);

  useEffect(() => {
  let timer;
  if (timedMode && timeLeft > 0) {
    timer = setInterval(() => {
      setTimeLeft((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);
  }
  return () => clearInterval(timer);
}, [timedMode, timeLeft]);

useEffect(() => {
  if (timedMode && timeLeft === 0) {
    handleSubmit();
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [timedMode, timeLeft]);

  const handleAnswerChange = (taskIndex, answer) => {
    const newAnswers = [...answers];
    newAnswers[taskIndex] = answer;
    setAnswers(newAnswers);
  };

  const handleSubmit = () => {
    if (Object.keys(answers).length > 0) {
      const sectionData = {
        section: 'writing',
        data: {
          task1: task1,
          task2: task2,
          answers: answers
        }
      };
      console.log('Writing section data:', sectionData);
      onNext(sectionData);
    } else {
      alert("Please complete at least one task before submitting.");
    }
  };    

  const handleNextPage = () => {
    setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    setCurrentPage(currentPage - 1);
  };

  return (
    <Container>
      <TitleStyled style={{ color: 'black' }}>Writing Section</TitleStyled>
      {timedMode && <Timer>Time left: {Math.floor(timeLeft / 60)}:{timeLeft % 60 < 10 ? '0' : ''}{timeLeft % 60}</Timer>}
        <InstructionSection>
          <h2>Instructions:</h2>
          <p>
            Please read the task carefully and complete the required writing tasks.
            Once you have completed writing your answers, click Next to proceed to the next task.
            You can navigate between tasks using the Previous and Next buttons.
            When you have finished all tasks, click Submit to finish.
          </p>
          {timedMode && (
            <p>
              You have 60 minutes for this section. Your responses will be automatically submitted when time runs out.
            </p>
          )}
        </InstructionSection>
      {currentPage === 0 && (
        <Section>
          <TaskTitle>Task 1</TaskTitle>
          {testType === 'academic' && task1 && (
            <>
              <TaskDescription>{task1.title}</TaskDescription>
              <div style={{ width: '100%', maxWidth: '600px', margin: '0 auto' }}>
                {task1.type === 'bar' && <Bar data={task1.data} options={{ maintainAspectRatio: true, responsive: true }} />}
                {task1.type === 'line' && <Line data={task1.data} options={{ maintainAspectRatio: true, responsive: true }} />}
              </div>
            </>
          )}
          {testType === 'general' && task1 && (
            <>
              <TaskDescription>{task1.description}</TaskDescription>
              <ul style={{ color: 'black' }}>
                {task1.bullet_points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </>
          )}
          <TextArea
            value={answers[0]}
            onChange={(e) => handleAnswerChange(0, e.target.value)}
            placeholder="Write your answer for Task 1 here..."
          />
          <Button onClick={handleNextPage}>Next</Button>
        </Section>
      )}

      {currentPage === 1 && (
        <Section>
          <TaskTitle>Task 2</TaskTitle>
          {task2 && <TaskDescription>{task2.title}</TaskDescription>}
          <TextArea
            value={answers[1]}
            onChange={(e) => handleAnswerChange(1, e.target.value)}
            placeholder="Write your essay for Task 2 here..."
          />
          <ButtonContainer>
            <Button onClick={handlePreviousPage}>Previous</Button>
            <Button onClick={handleSubmit}>Submit</Button>
          </ButtonContainer>
        </Section>
      )}
    </Container>
  );

};

export default WritingSection;
