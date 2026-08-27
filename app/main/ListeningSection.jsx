import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import GapFillingQuestion from './GapFillingQuestion';
import MatchingQuestion from './MatchingQuestion';

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
    background-color: #cccccc;
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

const InstructionSection = styled.div`
  border-radius: 8px;
  background-color: #800120;
  padding: 20px;
  margin-bottom: 20px;
  color: white;
`;

const ListeningSection = ({ onNext, timedMode }) => {
  const [timeLeft, setTimeLeft] = useState(30 * 60);
  const [hasPlayed, setHasPlayed] = useState(false);
  const [audioTexts, setAudioTexts] = useState([]);
  const [questionSets, setQuestionSets] = useState([]);
  const [currentPart, setCurrentPart] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStartedPlaying, setHasStartedPlaying] = useState(false);
  const [utterance, setUtterance] = useState(null);
  const [isAudioFinished, setIsAudioFinished] = useState(false);

  useEffect(() => {
  const loadedData = [
  {
    type: "daily_life_conversation",
    audioText: `
    Woman: Excuse me, do you know where I can find the whole wheat bread?
    Man: Sure, it's in aisle 3, next to the pastries. I'm actually heading there myself to grab some multigrain bread.
    Woman: Oh, great! I'll follow you. By the way, do you know if they have any organic fruits here?
    Man: Yes, they do. The organic section is near the entrance. I just picked up some organic apples for a fruit salad I'm making.
    Woman: That sounds delicious. I should get some fruit too. Maybe I'll grab some berries.
    Man: Good idea. Oh, here we are at the bread section. Look, they have a special offer on whole wheat bread today.
    Woman: Perfect timing! I'll take two loaves. Do you need anything else while we're here?
    Man: Actually, yes. I need to get some milk. Do you know if they have lactose-free options?
    Woman: I believe they do. Let's check the dairy section after this.
    Man: Sounds good. Shopping is always easier with some company!
    Woman: Agreed. Oh, before I forget, I need to pick up some eggs too.
    Man: Eggs are usually near the dairy section, so we can get those at the same time.
    Woman: Great, thanks for your help. This store layout can be a bit confusing sometimes.
    Man: No problem at all. I come here often, so I've gotten used to it. Do you shop here regularly?
    Woman: Not really, it's my first time. I usually go to the smaller store near my house, but I heard this place has better prices.
    Man: That's true. They often have good deals, especially on weekends. 
    Woman: Good to know. I'll have to start coming here more often then.
    Man: Definitely worth it. Oh, look at that, they have a sale on fresh vegetables too.
    Woman: Oh, wonderful! I should pick up some bell peppers and tomatoes for a salad.
    Man: Great idea. I think I'll do the same. Nothing beats fresh vegetables in a salad.
    `,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What type of bread is the woman looking for?",
        options: [
          "Whole wheat bread",
          "Multigrain bread",
          "White bread"
        ]
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the following items with their locations in the store:",
        options: [
          { item: "Whole wheat bread", location: "Aisle 3" },
          { item: "Organic fruits", location: "Near the entrance" },
          { item: "Milk", location: "Dairy section" }
        ]
      },
      {
        id: "q3",
        type: "gap_filling",
        question: "The man is making a _______ salad.",
        answer: "fruit"
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "How many loaves of bread does the woman decide to buy?",
        options: [
          "Two loaves",
          "One loaf",
          "Three loaves"
        ]
      },
      {
        id: "q5",
        type: "gap_filling",
        question: "The man needs to buy ______-free milk.",
        answer: "lactose"
      },
      {
        id: "q6",
        type: "matching",
        question: "Match the following items with their characteristics mentioned in the conversation:",
        options: [
          { item: "Whole wheat bread", characteristic: "On special offer" },
          { item: "Vegetables", characteristic: "On sale" },
          { item: "Store", characteristic: "Has better prices" }
        ]
      },
      {
        id: "q7",
        type: "multiple_choice",
        question: "What does the woman need to pick up in addition to bread?",
        options: [
          "Eggs",
          "Cheese",
          "Yogurt"
        ]
      },
      {
        id: "q8",
        type: "gap_filling",
        question: "The woman usually shops at a _______ store near her house.",
        answer: "smaller"
      },
      {
        id: "q9",
        type: "multiple_choice",
        question: "What does the man say about shopping with company?",
        options: [
          "It's easier.",
          "It's harder.",
          "It takes longer."
        ]
      },
      {
        id: "q10",
        type: "gap_filling",
        question: "The woman decides to start coming to this store more often because it has better _______.",
        answer: "prices"
      }
    ]
  },
  {
    type: "academic_lecture",
    audioText: `
    Good morning, everyone. Today we'll be discussing the fundamental principles of quantum mechanics and their applications in modern technology. Quantum mechanics is a branch of physics that deals with the behavior of matter and energy at the molecular, atomic, nuclear, and even smaller microscopic levels.

    One of the key principles in quantum mechanics is the concept of superposition. This principle states that a quantum system can exist in multiple states simultaneously until it is observed or measured. This leads us to the famous thought experiment of Schrödinger's cat, which illustrates the paradoxical nature of quantum superposition.

    Another crucial concept is quantum entanglement. This phenomenon occurs when pairs or groups of particles interact in such a way that the quantum state of each particle cannot be described independently, even when the particles are separated by a large distance. Einstein referred to this as "spooky action at a distance."

    These principles have far-reaching implications in the field of quantum computing. Unlike classical computers that use bits, quantum computers use quantum bits or qubits. These qubits can exist in a superposition of states, allowing quantum computers to perform certain calculations exponentially faster than classical computers.

    The potential applications of quantum computing are vast, ranging from cryptography and drug discovery to optimization problems and artificial intelligence. However, building practical quantum computers presents significant challenges, including maintaining quantum coherence and minimizing errors.

    One area where quantum computing shows particular promise is in the field of cryptography. Quantum computers could potentially break many of the encryption methods we rely on today for secure communication. However, they also offer the possibility of quantum cryptography, which could provide unbreakable encryption.

    In the field of drug discovery, quantum computers could simulate complex molecular interactions far more efficiently than classical computers. This could dramatically speed up the process of identifying new drugs and understanding their effects on biological systems.

    Optimization problems, which are crucial in fields like logistics and finance, could also benefit greatly from quantum computing. Quantum algorithms could solve certain types of optimization problems exponentially faster than classical algorithms.

    As we continue to advance our understanding of quantum mechanics, we open up new possibilities for technological innovation. The development of quantum sensors, for instance, could revolutionize fields like medical imaging and environmental monitoring.

    In our next lecture, we'll delve deeper into the mathematics behind these concepts, exploring the wave function and the Schrödinger equation. Thank you for your attention, and I look forward to our continued exploration of this fascinating field.
    `,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is one of the key principles of quantum mechanics mentioned in the lecture?",
        options: [
          "Superposition",
          "Relativity",
          "Thermodynamics"
        ]
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the following quantum concepts with their descriptions:",
        options: [
          { concept: "Superposition", description: "A quantum system existing in multiple states simultaneously" },
          { concept: "Entanglement", description: "Particles interacting in a way that their quantum states cannot be described independently" },
          { concept: "Qubit", description: "The basic unit of information in quantum computing" }
        ]
      },
      {
        id: "q3",
        type: "gap_filling",
        question: "Einstein referred to quantum entanglement as '_______ action at a distance'.",
        answer: "spooky"
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "What is a potential application of quantum computing in drug discovery?",
        options: [
          "Simulating complex molecular interactions",
          "Manufacturing drugs",
          "Distributing drugs"
        ]
      },
      {
        id: "q5",
        type: "gap_filling",
        question: "Quantum computers use _______ instead of classical bits.",
        answer: "qubits"
      },
      {
        id: "q6",
        type: "matching",
        question: "Match the following fields with their potential quantum computing applications:",
        options: [
          { field: "Cryptography", application: "Unbreakable encryption" },
          { field: "Optimization", application: "Solving complex logistics problems" },
          { field: "Artificial Intelligence", application: "Enhanced machine learning algorithms" }
        ]
      },
      {
        id: "q7",
        type: "multiple_choice",
        question: "What is one of the challenges in building practical quantum computers?",
        options: [
          "Maintaining quantum coherence",
          "Increasing their size",
          "Cooling them to room temperature"
        ]
      },
      {
        id: "q8",
        type: "gap_filling",
        question: "Quantum algorithms could solve certain types of _______ problems exponentially faster than classical algorithms.",
        answer: "optimization"
      },
      {
        id: "q9",
        type: "multiple_choice",
        question: "What field could be revolutionized by quantum sensors according to the lecture?",
        options: [
          "Medical imaging",
          "Construction",
          "Education"
        ]
      },
      {
        id: "q10",
        type: "gap_filling",
        question: "The lecture mentioned the _______ equation as a topic for the next class.",
        answer: "Schrödinger"
      }
    ]
  },
  {
    type: "historical_speech",
    audioText: `
    Four score and seven years ago our fathers brought forth on this continent, a new nation, conceived in Liberty, and dedicated to the proposition that all men are created equal.

    Now we are engaged in a great civil war, testing whether that nation, or any nation so conceived and so dedicated, can long endure. We are met on a great battle-field of that war. We have come to dedicate a portion of that field, as a final resting place for those who here gave their lives that that nation might live. It is altogether fitting and proper that we should do this.

    But, in a larger sense, we can not dedicate—we can not consecrate—we can not hallow—this ground. The brave men, living and dead, who struggled here, have consecrated it, far above our poor power to add or detract. The world will little note, nor long remember what we say here, but it can never forget what they did here. It is for us the living, rather, to be dedicated here to the unfinished work which they who fought here have thus far so nobly advanced. It is rather for us to be here dedicated to the great task remaining before us—that from these honored dead we take increased devotion to that cause for which they gave the last full measure of devotion—that we here highly resolve that these dead shall not have died in vain—that this nation, under God, shall have a new birth of freedom—and that government of the people, by the people, for the people, shall not perish from the earth.
    `,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What historical event is being referred to in this speech?",
        options: [
          "The Civil War",
          "The American Revolution",
          "World War I"
        ]
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the following phrases with their meanings in the context of the speech:",
        options: [
          { phrase: "Four score and seven years ago", meaning: "87 years ago" },
          { phrase: "Conceived in Liberty", meaning: "Founded on the principle of freedom" },
          { phrase: "Last full measure of devotion", meaning: "Ultimate sacrifice" }
        ]
      },
      {
        id: "q3",
        type: "gap_filling",
        question: "The speech was delivered at the dedication of a _______.",
        answer: "battle-field"
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "According to the speech, who has consecrated the ground?",
        options: [
          "The brave men who struggled there",
          "The speakers",
          "The audience"
        ]
      },
      {
        id: "q5",
        type: "gap_filling",
        question: "The speech emphasizes the importance of a government of the people, by the people, and for the _______.",
        answer: "people"
      },
      {
        id: "q6",
        type: "matching",
        question: "Match the following terms with their significance in the speech:",
        options: [
          { term: "New birth of freedom", significance: "Renewal of national commitment to liberty" },
          { term: "Unfinished work", significance: "Continuing efforts to preserve the nation" },
          { term: "Hallow", significance: "Honor as holy" }
        ]
      },
      {
        id: "q7",
        type: "multiple_choice",
        question: "What does the speaker hope the nation will achieve as a result of the sacrifices made?",
        options: [
          "A new birth of freedom",
          "An end to the war",
          "International recognition"
        ]
      },
      {
        id: "q8",
        type: "gap_filling",
        question: "The world will little note, nor long remember what we say here, but it can never forget what they _______ here.",
        answer: "did"
      },
      {
        id: "q9",
        type: "multiple_choice",
        question: "What does the speaker mean by 'last full measure of devotion'?",
        options: [
          "Ultimate sacrifice",
          "Loyalty",
          "Bravery"
        ]
      },
      {
        id: "q10",
        type: "gap_filling",
        question: "The speech was delivered by _______.",
        answer: "Abraham Lincoln"
      }
    ]
  },
  {
    type: "expert_panel_discussion",
    audioText: `
    Moderator: Welcome, everyone, to today's panel discussion on climate change. We have two esteemed experts with us: Dr. Chen, a climate scientist, and Professor Thompson, an environmental policy expert. Let's start with Dr. Chen. Could you give us an overview of the current state of global climate change?

    Dr. Chen: Certainly. The Earth's climate is changing at an unprecedented rate, primarily due to human activities such as the burning of fossil fuels, deforestation, and industrial processes. These activities release large amounts of greenhouse gases, including carbon dioxide and methane, into the atmosphere, which trap heat and lead to global warming.

    Moderator: Thank you, Dr. Chen. Professor Thompson, how are governments around the world responding to this crisis?

    Professor Thompson: Responses vary widely. Some countries have implemented aggressive policies to reduce carbon emissions and promote renewable energy. For example, the European Union has set ambitious targets for reducing greenhouse gas emissions and increasing the share of renewable energy in its energy mix. On the other hand, some countries are still heavily reliant on fossil fuels and have been slower to adopt sustainable practices.

    Moderator: Dr. Chen, what are the potential consequences if we fail to address climate change effectively?

    Dr. Chen: The consequences are severe and multifaceted. We can expect more frequent and intense heatwaves, droughts, and storms. Rising sea levels could inundate coastal areas, displacing millions of people. Additionally, climate change can disrupt ecosystems, leading to the loss of biodiversity and negatively impacting agriculture and food security.

    Moderator: Professor Thompson, what role do international agreements, like the Paris Agreement, play in combating climate change?

    Professor Thompson: International agreements are crucial for coordinating global efforts. The Paris Agreement, for instance, aims to limit global warming to well below 2 degrees Celsius above pre-industrial levels. It encourages countries to set their own climate goals, known as nationally determined contributions, and provides a framework for monitoring and reporting progress. While not legally binding, the agreement fosters international cooperation and accountability.

    Moderator: Dr. Chen, what technological advancements hold the most promise for mitigating climate change?

    Dr. Chen: There are several promising technologies. Renewable energy sources such as solar and wind power are becoming more efficient and cost-effective. Advances in energy storage, like batteries, are essential for integrating these renewable sources into the grid. Additionally, carbon capture and storage technologies can help reduce emissions from industrial processes.

    Moderator: Professor Thompson, what can individuals do to contribute to the fight against climate change?

    Professor Thompson: Individuals can make a significant impact through lifestyle changes. Reducing energy consumption, using public transportation, adopting a plant-based diet, and supporting policies and companies that prioritize sustainability are all important steps. Collective action and advocacy are also crucial. By raising awareness and demanding change, individuals can influence policymakers and drive larger systemic changes.

    Moderator: Thank you both for your insights. This has been a very enlightening discussion. Before we close, do you have any final thoughts?

    Dr. Chen: I would just like to emphasize the urgency of the situation. We need immediate and sustained action at all levels—individual, local, national, and global—to mitigate the effects of climate change and secure a sustainable future.

    Professor Thompson: I agree. It's important to remember that while the challenges are immense, so are the opportunities. By embracing innovation and cooperation, we can build a more resilient and sustainable world.

    Moderator: Thank you, Dr. Chen and Professor Thompson, for your valuable contributions. And thank you to our audience for joining us. Together, we can make a difference.
    `,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        question: "What is one of the main causes of global climate change mentioned by Dr. Chen?",
        options: [
          "Burning of fossil fuels",
          "Natural climate cycles",
          "Volcanic eruptions"
        ]
      },
      {
        id: "q2",
        type: "matching",
        question: "Match the following entities with their responses to climate change:",
        options: [
          { entity: "European Union", response: "Aggressive policies to reduce emissions" },
          { entity: "Some countries", response: "Slow adoption of sustainable practices" },
          { entity: "Paris Agreement", response: "International cooperation framework" }
        ]
      },
      {
        id: "q3",
        type: "gap_filling",
        question: "Dr. Chen mentions that rising sea levels could _______ coastal areas.",
        answer: "inundate"
      },
      {
        id: "q4",
        type: "multiple_choice",
        question: "What is a potential consequence of failing to address climate change effectively?",
        options: [
          "Increased biodiversity",
          "More frequent heatwaves",
          "Stable sea levels"
        ]
      },
      {
        id: "q5",
        type: "gap_filling",
        question: "The Paris Agreement aims to limit global warming to well below _______ degrees Celsius above pre-industrial levels.",
        answer: "2"
      },
      {
        id: "q6",
        type: "matching",
        question: "Match the following technologies with their roles in mitigating climate change:",
        options: [
          { technology: "Solar power", role: "Renewable energy source" },
          { technology: "Energy storage", role: "Integrating renewable sources" },
          { technology: "Carbon capture", role: "Reducing industrial emissions" }
        ]
      },
      {
        id: "q7",
        type: "multiple_choice",
        question: "According to Professor Thompson, what is one way individuals can contribute to the fight against climate change?",
        options: [
          "Increasing energy consumption",
          "Using public transportation",
          "Supporting fossil fuel companies"
        ]
      },
      {
        id: "q8",
        type: "gap_filling",
        question: "Dr. Chen emphasizes the _______ of the situation regarding climate change.",
        answer: "urgency"
      },
      {
        id: "q9",
        type: "multiple_choice",
        question: "What role do international agreements play in combating climate change?",
        options: [
          "Fostering international cooperation",
          "Legal enforcement of policies",
          "Providing financial aid"
        ]
      },
      {
        id: "q10",
        type: "gap_filling",
        question: "Professor Thompson mentions that embracing _______ and cooperation can help build a more resilient world.",
        answer: "innovation"
      }
    ]
  }
]

  const shuffledData = shuffleArray([...loadedData]);
  const selectedData = shuffledData.slice(0, 4);

  setAudioTexts(selectedData.map(item => item.audioText));
  setQuestionSets(selectedData.map(item => item.questions));
}, []);

useEffect(() => {
  return () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setHasStartedPlaying(false);
    setUtterance(null);
    setIsAudioFinished(true);
  };
}, []);

  useEffect(() => {
    if (timedMode) {
      const timer = setInterval(() => {
        if (timeLeft > 0 && currentPart < 4) {
          setTimeLeft(prevTime => prevTime - 1);
        } else {
          clearInterval(timer);
          handleSubmit();
        }
      }, 1000);
      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft, currentPart, timedMode]);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

const handleAnswerChange = (partIndex, questionIndex, answer) => {
  setAnswers(prev => ({
    ...prev,
    [partIndex]: {
      ...(prev[partIndex] || {}),
      [questionIndex]: answer
    }
  }));
};

const handleSubmit = () => {
  const allAnswers = Object.values(answers).flatMap(partAnswers => Object.values(partAnswers));
  const answeredQuestions = allAnswers.filter(answer => 
    answer !== '' && answer !== undefined && answer !== '{}' && answer !== null
  ).length;

  if (answeredQuestions > 0) {
    const sectionData = {
      section: 'listening',
      data: {
        answers: answers,
        questions: questionSets,
        audioTexts: audioTexts
      }
    };
    onNext(sectionData);
  } else {
    alert("Please answer at least one question before submitting.");
  }
};

const playCurrentAudio = () => {
  if (!isPlaying) {
    if (!hasStartedPlaying || isAudioFinished) {
      // Create a new utterance if we haven't started playing yet or if the audio has finished
      const newUtterance = new SpeechSynthesisUtterance(audioTexts[currentPart]);
      newUtterance.lang = 'en-US';
      newUtterance.rate = 0.8;

      newUtterance.onstart = () => {
        setIsPlaying(true);
        setHasStartedPlaying(true);
        setIsAudioFinished(false);
      };

      newUtterance.onend = () => {
        setIsPlaying(false);
        setUtterance(null);
        setIsAudioFinished(true);
      };

      setUtterance(newUtterance);
      window.speechSynthesis.speak(newUtterance);
    } else {
      // Resume playing if we've already started and not finished
      window.speechSynthesis.resume();
      setIsPlaying(true);
    }
  } else {
    // Pause the audio if it's currently playing
    window.speechSynthesis.pause();
    setIsPlaying(false);
  }
};

const stopAudio = () => {
  window.speechSynthesis.cancel();
  setIsPlaying(false);
  setHasStartedPlaying(false);
  setUtterance(null);
  setIsAudioFinished(true);
};

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const renderQuestions = () => {
  if (!questionSets || !questionSets[currentPart]) {
    return <p>Loading questions...</p>;
  }
  return questionSets[currentPart].map((question, index) => (
    <Section key={`${currentPart}-${index}`}>
      <p style={{ color: "#000000" }}>Question {index + 1} of 10</p>
      {renderQuestion(question, index)}
    </Section>
  ));
};

  const renderQuestion = (question, questionIndex) => {
  const savedAnswer = answers[currentPart]?.[questionIndex];
  switch (question.type) {
    case 'multiple_choice':
      return <MultipleChoiceQuestion 
        key={`${currentPart}-${questionIndex}`}
        question={question} 
        savedAnswer={savedAnswer}
        onAnswerChange={(answer) => handleAnswerChange(currentPart, questionIndex, answer)} 
      />;
    case 'gap_filling':
      return <GapFillingQuestion 
        key={`${currentPart}-${questionIndex}`}
        question={question} 
        savedAnswer={savedAnswer}
        onAnswerChange={(answer) => handleAnswerChange(currentPart, questionIndex, answer)} 
      />;
    case 'matching':
      return <MatchingQuestion 
        key={`${currentPart}-${questionIndex}`}
        question={question} 
        savedAnswer={savedAnswer}
        onAnswerChange={(answer) => handleAnswerChange(currentPart, questionIndex, answer)} 
      />;
    default:
      return null;
  }
};

  return (
    <Container>
      <Title>Listening Section - Part {currentPart + 1}</Title>
      {timedMode && <Timer>Time left: {formatTime(timeLeft)}</Timer>}
      <InstructionSection>
        <h2>Instructions:</h2>
        <p>
          You will hear a recording. Listen carefully and answer the questions.
          You can navigate between questions using the Next and Previous buttons.
          Once you have completed all questions and are ready to submit, click Finish.
        </p>
        {timedMode && (
          <p>
            You have 30 minutes for this section. After 30 minutes, your results will be automatically submitted.
          </p>
        )}
      </InstructionSection>
      <Section>
        <Button onClick={playCurrentAudio}>
  {isPlaying ? 'Pause' : (isAudioFinished ? 'Play Audio' : (hasStartedPlaying ? 'Resume' : 'Play Audio'))}
</Button>
      </Section>
      {renderQuestions()}
      <Pagination>
        <Button onClick={() => setCurrentPart(prev => Math.max(0, prev - 1))} disabled={currentPart === 0}>
          Previous Part
        </Button>
        <Button onClick={() => {
          if (currentPart < 3) {
            setCurrentPart(prev => prev + 1);
            setHasPlayed(false);
          } else {
            handleSubmit();
          }
        }}>
          {currentPart === 3 ? 'Finish' : 'Next Part'}
        </Button>
      </Pagination>
    </Container>
  );
};

export default ListeningSection;