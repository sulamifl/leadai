import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { fetchResults } from './chatgpt';
import { Configuration, StreamingAvatarApi } from '@heygen/streaming-avatar';

const Container = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: 'Roboto', sans-serif;
  color: #ffffff;
`;

const Title = styled.h1`
  color: black;
  text-align: center;
`;

const Section = styled.div`
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(255, 255, 255, 0.1);
  padding: 20px;
  margin-bottom: 20px;
  background-color: #333333;
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
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const Question = styled.p`
  font-weight: bold;
  margin-bottom: 10px;
`;

const Transcript = styled.p`
  padding: 10px;
  border-radius: 4px;
  border: 1px solid #91d5ff;
  background-color: #444444;
`;

const Feedback = styled.div`
  margin-top: 20px;
  padding: 10px;
  border: 1px solid #91d5ff;
  border-radius: 4px;
  background-color: #444444;
`;

const Timer = styled.div`
  font-size: 24px;
  font-weight: bold;
  color: #800120;
  text-align: center;
  margin-bottom: 20px;
`;

const InstructionSection = styled.div`
  border-radius: 8px;
  background-color: #800120;
  padding: 20px;
  margin-bottom: 20px;
`;

const SpeakingSection = ({ onNext, timedMode }) => {
  const [currentPart, setCurrentPart] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [answers, setAnswers] = useState([]);
  const [feedback, setFeedback] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const recognitionRef = useRef(null);
  const [timeLeft, setTimeLeft] = useState(14 * 60);
  const [streamingAvatar, setStreamingAvatar] = useState(null);

  const parts = [
  {
    name: "Part 1: Introduction and Interview",
    questions: [
      "Can you tell me about your hometown?",
      "What do you like to do in your free time?",
      "Do you work or are you a student?",
      "What's your favorite season and why?",
      "How often do you travel?",
      "What kind of food do you enjoy eating?",
      "Describe a memorable birthday celebration.",
      "Do you prefer to live in a big city or a small town?",
      "What are the advantages and disadvantages of living abroad?",
      "How important is it for you to have friends who speak English?",
      "Do you believe in aliens?",
      "Describe a traditional dish from your country.",
      "What is your opinion on climate change?",
      "Discuss a recent news event that caught your attention.",
      "What are your thoughts on online shopping?",
      "Describe a hobby you enjoy.",
      "What are the benefits of learning a second language?",
      "Discuss the importance of art in society.",
      "Describe a recent technological advancement.",
      "What is your opinion on social media platforms?",
      "Discuss a famous historical figure.",
      "What do you think about the concept of virtual reality?",
      "Describe a recent concert or live performance you attended.",
      "What are your views on global warming?",
      "Discuss the impact of music on people's lives.",
      "Describe a sport you enjoy watching or playing.",
      "What is your opinion on genetically modified food?",
      "Discuss the importance of family in your culture.",
      "Describe a famous tourist attraction in your country.",
      "What are your thoughts on renewable energy sources?",
      "Discuss the benefits of volunteering.",
      "What is your opinion on space exploration?",
      "Describe a recent environmental issue in your area.",
      "Discuss the influence of celebrities on society.",
      "What are your views on gender equality?",
      "Describe a traditional festival or celebration in your culture.",
      "What do you think about the use of artificial intelligence?",
      "Discuss the importance of education in today's world.",
      "What are your views on sustainable living?",
      "Describe a place you would like to visit in the future.",
      "What is your opinion on government policies regarding healthcare?",
      "Discuss the impact of tourism on local communities.",
      "Describe a recent cultural event you attended.",
      "What are your thoughts on cultural diversity?",
      "Discuss the benefits of exercise.",
      "Describe a recent achievement or accomplishment.",
      "What is your opinion on the role of advertising in society?",
      "Discuss the impact of globalization.",
      "Describe a recent movie you watched.",
      "What are your views on privacy in the digital age?",
      "Discuss the importance of friendship.",
      "What do you think about the influence of fashion trends?",
      "Describe a recent scientific discovery.",
      "What are your views on online education?",
      "Discuss the role of government in supporting the arts.",
      "Describe a challenging experience you've had.",
      "What is your opinion on consumerism?",
      "Discuss the impact of smartphones on daily life.",
      "What are your thoughts on cultural appropriation?",
      "Describe a recent technological innovation.",
      "Discuss the benefits of traveling.",
      "What is your opinion on animal rights?",
      "Describe a traditional custom in your country.",
      "What are your views on the future of work?",
      "Discuss the importance of communication skills.",
      "Describe a recent social issue in your community.",
      "What is your opinion on the influence of advertising on children?",
      "Discuss the impact of social media on relationships.",
      "What are your thoughts on the role of government in environmental protection?",
      "Describe a recent fashion trend.",
      "What is your opinion on the use of technology in education?",
      "Discuss the benefits of cultural exchange programs.",
      "Describe a recent experience when you had to solve a problem.",
      "What are your views on sustainable fashion?",
      "Discuss the impact of music festivals on local economies.",
      "What is your opinion on the gig economy?",
      "Describe a recent political event.",
      "What are your thoughts on digital privacy issues?",
      "Discuss the importance of work-life balance.",
      "Describe a recent trend in social media usage.",
      "What is your opinion on the influence of celebrities on young people?",
      "Discuss the benefits of community service.",
      "What are your views on the role of technology in healthcare?",
      "Describe a recent trend in online shopping.",
      "What is your opinion on cultural preservation?",
      "Discuss the impact of social media influencers.",
      "Describe a recent development in artificial intelligence.",
      "What are your thoughts on the role of sports in society?",
      "Discuss the benefits of learning about different cultures.",
      "What is your opinion on the role of traditional media in the digital age?"
    ]
  },
  {
  "name": "Part 2: Long Turn (Cue Card)",
  "questions": [
    [
      "Describe a place you would like to visit in the future. You should say:",
      "- what place it is",
      "- where it is located",
      "- why you want to visit it",
      "- and explain what you would like to do there."
    ],
    [
      "Describe a book you have recently read. You should say:",
      "- what the book was",
      "- what it was about",
      "- why you decided to read it",
      "- and explain whether you would recommend it to other people."
    ],
    [
      "Describe a movie that made a strong impression on you. You should say:",
      "- what the movie was",
      "- what it was about",
      "- why it made a strong impression on you",
      "- and explain whether you would recommend it to other people."
    ],
    [
      "Talk about a skill you would like to learn in the future. You should say:",
      "- what skill it is",
      "- why you want to learn it",
      "- how you plan to learn it",
      "- and explain how it could benefit you."
    ],
    [
      "Describe a historical event that you find interesting. You should say:",
      "- what event it was",
      "- when and where it happened",
      "- why you find it interesting",
      "- and discuss its significance."
    ],
    [
      "Discuss a famous person from your country. You should say:",
      "- who the person is",
      "- what they are famous for",
      "- why they are important to your country",
      "- and explain their impact."
    ],
    [
      "Talk about a festival or celebration that you enjoy participating in. You should say:",
      "- what the festival/celebration is",
      "- when and where it takes place",
      "- why you enjoy participating in it",
      "- and discuss its cultural significance."
    ],
    [
      "Describe an important decision you made in your life. You should say:",
      "- what the decision was",
      "- when you made it",
      "- why it was important",
      "- and explain how it has affected your life."
    ]
  ]
},
  {
    name: "Part 3: Discussion",
    questions: [
      "Do you think reading habits have changed in recent years?",
      "How do you think technology will affect books in the future?",
      "What kinds of books are most popular in your country?",
      "Discuss the role of libraries in modern society.",
      "How does literature reflect the culture of a society?",
      "Should children be encouraged to read more books?",
      "What impact does reading have on personal development?",
      "Is it better to read fiction or non-fiction?",
      "Discuss the influence of social media on reading habits.",
      "What are the benefits of reading for pleasure?",
      "Do you think public libraries should offer more digital resources?",
      "What role should governments play in promoting reading?",
      "How can schools encourage a love of reading among students?",
      "Discuss the future of printed books versus e-books.",
      "Should authors be responsible for the moral messages in their books?",
      "What effect does reading have on language proficiency?",
      "Is it important for people to read books from other cultures?",
      "Discuss the impact of audiobooks on reading habits.",
      "What are the benefits of reading to children from a young age?",
      "Do you think reading enhances empathy and understanding?",
      "How can reading help in developing critical thinking skills?",
      "Discuss the importance of reading as a lifelong skill.",
      "What challenges do libraries face in the digital age?",
      "Should reading be considered a form of entertainment or education?",
      "What impact does reading literature have on creativity?",
      "Do you think book censorship is ever justified?",
      "Discuss the accessibility of books and reading materials.",
      "What are your thoughts on reading as a form of relaxation?",
      "How can parents encourage their children to read more?",
      "Discuss the benefits of reading diverse genres of literature.",
      "Do you think digital reading devices will replace printed books entirely?",
      "What role do book clubs play in promoting reading culture?",
      "How has your reading habit changed over the years?",
      "Discuss the relationship between reading and academic success.",
      "Should schools assign specific books for students to read?",
      "What role does storytelling play in preserving cultural heritage?",
      "Do you think reading can help in reducing stress and anxiety?",
      "Discuss the impact of reading on vocabulary development.",
      "What are the ethical implications of book piracy?",
      "Is it important for authors to reflect social issues in their writing?",
      "How can reading contribute to personal growth and self-improvement?",
      "Discuss the environmental impact of publishing books.",
      "Should reading be encouraged as a leisure activity?",
      "What are your thoughts on the portrayal of gender roles in literature?",
      "How has technology influenced the way we consume literature?",
      "Discuss the future of bookstores in the digital era.",
      "Do you think digital storytelling can be as effective as traditional storytelling?",
      "What role do book prizes and awards play in promoting literature?",
      "How can literature help in understanding different perspectives?",
      "Discuss the importance of reading reviews before choosing a book.",
      "What impact does reading have on mental health?",
      "Do you believe that reading can change people's attitudes and beliefs?",
      "How can reading contribute to career development?",
      "Discuss the impact of reading on social interaction and communication.",
      "What are the benefits of reading poetry?",
      "Is there a difference between reading for pleasure and reading for information?",
      "How can technology help in promoting literacy?",
      "Discuss the portrayal of diversity in contemporary literature.",
      "Do you think literature has the power to provoke social change?",
      "What are your views on reading adaptations of books into movies?",
      "How can reading help in developing empathy towards others?",
      "Discuss the impact of reading on decision-making skills.",
      "What role do book reviews play in influencing readers?",
      "How can reading classics contribute to cultural literacy?",
      "Discuss the influence of parents' reading habits on children.",
      "What are your thoughts on the popularity of self-help books?",
      "Do you think reading can help in developing resilience?",
      "How has the digital age affected the publishing industry?",
      "Discuss the relationship between reading and imagination.",
      "What impact does reading literature in a foreign language have on language learning?",
      "Should schools allocate more time for reading activities?",
      "How can libraries attract more young readers?",
      "Discuss the portrayal of ethical dilemmas in literature.",
      "What role does reading play in preserving oral traditions?",
      "Do you believe that reading can improve emotional intelligence?",
      "How can reading influence career choices?",
      "Discuss the representation of marginalized communities in literature.",
      "What are the benefits of reading biographies and memoirs?",
      "Is it important for authors to incorporate diverse characters in their books?",
      "How can reading help in understanding historical contexts?",
      "Discuss the impact of graphic novels on reading habits.",
      "What are your views on reading adaptations of books into TV series?",
      "Do you think literature has the power to shape cultural identity?",
      "How can reading enhance problem-solving skills?",
      "What role does reading play in promoting cultural exchange?",
      "Discuss the evolution of reading habits in the digital era.",
      "What impact does reading aloud have on language development?",
      "Should schools promote reading challenges among students?",
      "How can reading enhance mindfulness and focus?",
      "Discuss the role of audiobooks in the accessibility of literature."
    ]
  }
];

  useEffect(() => {
    if (currentPart < parts.length && selectedQuestions.length > 0) {
      speakQuestion(selectedQuestions[currentPart][currentQuestionIndex]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPart, currentQuestionIndex, selectedQuestions]);

  useEffect(() => {
    const randomQuestions = getRandomQuestions();
    setSelectedQuestions(randomQuestions);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (timedMode) {
      const timer = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime > 0) {
            return prevTime - 1;
          } else {
            clearInterval(timer);
            handleTimeUp();
            return 0;
          }
        });
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timedMode]);

  useEffect(() => {
    const initializeAvatar = async () => {
      try {
        const avatarApi = new StreamingAvatarApi(
          new Configuration({accessToken: 'OTExOGIyZGUzMTcxNDMzNGE3MTdmYjliZmI3NDg0ZTQtMTcyMTEyMTg4OQ=='})
        );
        setStreamingAvatar(avatarApi);
        console.log('Avatar API initialized successfully');
      } catch (error) {
        console.error('Error initializing Avatar API:', error);
      }
    };

    initializeAvatar();
  }, []);

  useEffect(() => {
  if (timedMode && timeLeft === 0) {
    handleSubmit();
  }
}, [timedMode, timeLeft]);

  const getRandomQuestions = () => {
  const randomQuestions = [];
  
  // Part 1: 5 random questions
  const part1Questions = shuffleArray([...parts[0].questions]).slice(0, 5);
  randomQuestions.push(part1Questions);
  
  // Part 2: 1 random topic
  const part2QuestionIndex = Math.floor(Math.random() * parts[1].questions.length);
  const part2Question = parts[1].questions[part2QuestionIndex];
  randomQuestions.push([part2Question]);
  
  // Part 3: 5 random questions
  const part3Questions = shuffleArray([...parts[2].questions]).slice(0, 5);
  randomQuestions.push(part3Questions);
  
  return randomQuestions;
};

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleTimeUp = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    onNext({
      section: 'speaking',
      data: {
        questions: parts.flatMap(part => part.questions),
        answers: answers
      }
    });
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const speakQuestion = (text) => {
  const utterance = new SpeechSynthesisUtterance(Array.isArray(text) ? text.join('. ') : text);
  const voices = speechSynthesis.getVoices();
  const englishVoice = voices.find(voice => voice.lang.startsWith('en-'));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  utterance.rate = 0.9;
  utterance.pitch = 1;
  speechSynthesis.speak(utterance);
};

  const startAvatar = async (text) => {
    if (!streamingAvatar) {
      console.error('Streaming avatar not initialized');
      return;
    }
  
    try {
      const startResponse = await streamingAvatar.createStartAvatar({
        newSessionRequest: {
          quality: "low",
          avatarName: "josh_lite3_20230714",
          voice: {voiceId: "077ab11b14f04ce0b49b5f6e5cc20979"}
        }
      });
      console.log('Avatar started successfully:', startResponse);
  
      const talkResponse = await streamingAvatar.createTalk({
        talkRequest: {text: text}
      });
      console.log('Avatar talk initiated:', talkResponse);
  
      if (talkResponse.videoUrl) {
        setVideoUrl(talkResponse.videoUrl);
      } else {
        console.error('No video URL received from the API');
      }
    } catch (error) {
      console.error("Error starting avatar:", error);
      if (error.response) {
        console.error("API response:", error.response.data);
      }
    }
  };

  const startRecording = () => {
    setIsRecording(true);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;

    recognition.lang = 'en-US';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const transcript = event.results[current][0].transcript;
      setTranscript(transcript);
    };

    recognition.start();
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setIsLoading(true);

    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }

    if (transcript.trim() === '') {
      alert("No speech detected. Please try again.");
      setIsLoading(false);
      return;
    }

    const newAnswers = [...answers, {
  question: Array.isArray(selectedQuestions[currentPart]) 
    ? selectedQuestions[currentPart].join('\n') 
    : selectedQuestions[currentPart][currentQuestionIndex],
  answer: transcript
}];
    setAnswers(newAnswers);

    if (streamingAvatar) {
      await startAvatar(transcript);
    } else {
      console.error('Streaming avatar not initialized');
    }

    const data = {
  questions: [selectedQuestions[currentPart][currentQuestionIndex]],
  answers: [transcript]
};

    try {
      const result = await fetchResults('speaking', data, 'partial');
      if (typeof result === 'object' && result.feedback) {
        setFeedback(`${result.feedback}\nScore: ${result.score}`);
      } else {
        setFeedback(result.toString());
      }
    } catch (error) {
      console.error("Error fetching results:", error);
      setFeedback("Sorry, there was an error evaluating your answer. Please try again.");
    }

    setIsLoading(false);

    if (currentQuestionIndex < selectedQuestions[currentPart].length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentPart < selectedQuestions.length - 1) {
      setCurrentPart(currentPart + 1);
      setCurrentQuestionIndex(0);
    } else {
      onNext({
        section: 'speaking',
        data: {
          questions: selectedQuestions.flat(),
          answers: newAnswers
        }
      });
    }
  };

  return (
  <Container>
    <Title>Speaking Section</Title>
    {timedMode && <Timer>Time left: {formatTime(timeLeft)}</Timer>}
    <InstructionSection>
      <h2>Instructions:</h2>
      <p>
        Listen carefully to each question and respond.
    Your answers will be automatically recorded and evaluated.
    After each answer, you will receive feedback.
    Continue answering the questions until the test is complete.
      </p>
      {timedMode && (
        <p>
          You have 14 minutes for this section. Your responses will be automatically submitted when time runs out.
        </p>
      )}
    </InstructionSection>
    {currentPart < selectedQuestions.length ? (
      <Section>
        <h3>{parts[currentPart].name}</h3>
        {currentPart === 1 ? (
          <>
            <Question>{selectedQuestions[currentPart][0][0]}</Question>
            {selectedQuestions[currentPart][0].slice(1).map((instruction, index) => (
              <p key={index}>{instruction}</p>
            ))}
          </>
        ) : (
          <Question>{selectedQuestions[currentPart][currentQuestionIndex]}</Question>
        )}
        <Button onClick={isRecording ? stopRecording : startRecording} disabled={isLoading}>
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>
        {transcript && <Transcript>Your answer: {transcript}</Transcript>}
        {isLoading && <p>Evaluating your answer...</p>}
        {feedback && (
          <Feedback>
            <h3>Feedback:</h3>
            <p>{feedback}</p>
          </Feedback>
        )}
        {videoUrl && (
          <video 
            src={videoUrl} 
            autoPlay 
            playsInline 
            controls 
            style={{width: '100%', maxWidth: '400px', marginTop: '20px'}}
          />
        )}
      </Section>
    ) : (
      <p>All parts completed. Your responses have been recorded.</p>
    )}
  </Container>
);
};

export default SpeakingSection;