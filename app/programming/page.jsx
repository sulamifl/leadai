'use client';

import React, { useState, useEffect, useRef, Suspense, lazy } from 'react';
import Image from 'next/image';
import { FaPaperPlane, FaRobot } from 'react-icons/fa';

// Ленивая загрузка тяжёлого синтаксического подсветчика для ускорения начальной загрузки
const SyntaxHighlighter = lazy(() =>
  import('react-syntax-highlighter').then((mod) => ({ default: mod.Prism }))
);
const solarizedlight = lazy(() =>
  import('react-syntax-highlighter/dist/esm/styles/prism').then((mod) => mod.solarizedlight)
);

const topics = [
  'Android Development',
  'Web Development',
  'iOS Development',
  'PC Software Development',
  'Cross-platform Development (Flutter)',
  'Python',
  'JavaScript',
  'Website Layout',
  'PHP',
  'Java + Kotlin',
  'C#',
  'C + C++',
  'Go',
  'Ruby'
];

const durations = [
  { name: 'Ultra Bullet', time: '1 week' },
  { name: 'Bullet', time: '2 weeks' },
  { name: 'Blitz', time: '1 month' },
  { name: 'Rapid', time: '2 months' },
  { name: 'Medium', time: '3 months' },
  { name: 'Classic', time: '6 months' },
  { name: 'Full', time: '9 months' }
];

export default function ProgrammingPage() {
  const [stage, setStage] = useState('topic');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentDay, setCurrentDay] = useState(1);
  const [currentModule, setCurrentModule] = useState(1);
  const chatEndRef = useRef(null);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('programmingChatState');
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        if (parsedState && typeof parsedState === 'object') {
          const { stage, selectedTopic, selectedDuration, messages, currentDay, currentModule } = parsedState;
          setStage(stage || 'topic');
          setSelectedTopic(selectedTopic || null);
          setSelectedDuration(selectedDuration || null);
          setMessages(messages || [{
            role: 'assistant',
            content: "Hello, I'm Leader! What do you want to learn?"
          }]);
          setCurrentDay(currentDay || 1);
          setCurrentModule(currentModule || 1);
        } else {
          throw new Error('Invalid saved state');
        }
      } else {
        setMessages([{
          role: 'assistant',
          content: "Hello, I'm Leader! What do you want to learn?"
        }]);
      }
    } catch (error) {
      console.error('Error loading saved state:', error);
      setStage('topic');
      setMessages([{
        role: 'assistant',
        content: "Hello, I'm Leader! What do you want to learn?"
      }]);
    }
  }, []);

  useEffect(() => {
    const saveStateTimer = setTimeout(() => {
      const stateToSave = { stage, selectedTopic, selectedDuration, messages, currentDay, currentModule };
      localStorage.setItem('programmingChatState', JSON.stringify(stateToSave));
    }, 300);

    return () => clearTimeout(saveStateTimer);
  }, [stage, selectedTopic, selectedDuration, messages, currentDay, currentModule]);

  const appendMessage = (role, content) => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setMessages(prevMessages => [...prevMessages, { role, content, timestamp }]);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
    setStage('duration');
    appendMessage('assistant', `Great! You've chosen ${topic}. Now select the learning duration.`);
  };

  const handleDurationSelect = (duration) => {
    setSelectedDuration(duration);
    setStage('plan');
    generatePlan(selectedTopic, duration);
  };

  const generatePlan = async (topic, duration) => {
    setIsLoading(true);
    try {
      const response = await aiFetch('/api/codeAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          selectedTopic: topic,
          selectedDuration: duration,
          userMessage: "Create a detailed learning plan for the selected topic and duration. Break it down into modules and days."
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from API');
      }

      const data = await response.json();
      appendMessage('assistant', data.content);
      appendMessage('assistant', "If you're ready to start learning, type 'Ready to start'.");
    } catch (error) {
      console.error('Error generating plan:', error);
      appendMessage('assistant', 'Sorry, there was an error creating the plan. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startLearning = async () => {
    setIsLoading(true);
    try {
      const response = await aiFetch('/api/codeAI', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages,
          selectedTopic,
          selectedDuration,
          currentDay,
          currentModule,
          userMessage: "Start the learning process. Provide theory, practical tasks, and explanations for the current day and module."
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from API');
      }

      const data = await response.json();
      appendMessage('assistant', data.content);
    } catch (error) {
      console.error('Error starting learning:', error);
      appendMessage('assistant', 'Sorry, there was an error starting the learning process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    appendMessage('user', input);
    setInput('');
    setIsLoading(true);
    setIsTyping(true);

    if (input.toLowerCase() === 'ready to start' && stage === 'plan') {
      setStage('learning');
      await startLearning();
    } else {
      try {
        const response = await aiFetch('/api/codeAI', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages,
            selectedTopic,
            selectedDuration,
            currentDay,
            currentModule,
            userMessage: input
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch from API');
        }

        const data = await response.json();
        appendMessage('assistant', data.content);

        if (data.nextDay) {
          setCurrentDay(prevDay => prevDay + 1);
        }
        if (data.nextModule) {
          setCurrentModule(prevModule => prevModule + 1);
          setCurrentDay(1);
        }
        if (data.isTest) {
          appendMessage('assistant', "Now let's take a short test on the material we've covered.");
        }
        if (data.isInterview) {
          appendMessage('assistant', "Let's conduct a mini-interview to reinforce your knowledge.");
        }
      } catch (error) {
        console.error('Error sending message:', error);
        appendMessage('assistant', 'Sorry, there was an error processing your message. Please try again.');
      } finally {
        setIsLoading(false);
        setIsTyping(false);
      }
    }
  };

  const OptionButton = ({ children, onClick }) => (
    <button
      className="m-2 px-4 py-2 bg-[#800120] text-white rounded-full shadow-lg hover:bg-[#600010] transition-all transform hover:scale-105"
      onClick={onClick}
    >
      {children}
    </button>
  );

  const renderMessageContent = (content) => {
    if (content.startsWith('```') && content.endsWith('```')) {
      const codeContent = content.slice(3, -3).trim();
      return (
        <Suspense fallback={<div className="my-2 p-3 bg-gray-100 rounded-lg text-sm text-gray-500">Loading code...</div>}>
          <SyntaxHighlighter language="javascript" style={solarizedlight} className="rounded-lg shadow-md my-2">
            {codeContent}
          </SyntaxHighlighter>
        </Suspense>
      );
    }
    return content.split('\n').map((line, i) => (
      <p key={i} className="my-1">{line}</p>
    ));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <div className="bg-[#800120] text-white p-4 shadow-md flex items-center">
        <Image
          src="/favicon.png"
          alt="Leader Avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
        <h1 className="text-xl font-bold ml-6" style={{ color: "#800120" }}>Leader - Your Programming Assistant</h1>
      </div>
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-lg ${
                    message.role === 'user' 
                      ? 'bg-[#DCF8C6] text-black' 
                      : 'bg-white text-black border border-gray-300'
                  } message-bubble`}
                >
                  <div className="flex items-center justify-between mb-1">
                    {message.role === 'assistant' && (
                      <Image
                        src="/favicon.png"
                        alt="Leader Avatar"
                        width={24}
                        height={24}
                        className="rounded-full mr-2"
                      />
                    )}
                    {message.role === 'user' && (
                      <Image
                        src="/usr.png"
                        alt="User Avatar"
                        width={24}
                        height={24}
                        className="rounded-full ml-2 mr-2"
                      />
                    )}
                    <span className="text-xs text-gray-500">
                      {message.timestamp}
                    </span>
                  </div>
                  <div className="text-sm mt-2">
                    {renderMessageContent(message.content)}
                  </div>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-black border border-gray-300 rounded-lg p-3 message-bubble">
                  <div className="flex items-center">
                    <Image
                      src="/favicon.png"
                      alt="Leader Avatar"
                      width={24}
                      height={24}
                      className="rounded-full mr-2"
                    />
                    <span className="typing-animation">
                      <span className="dot"></span>
                      <span className="dot"></span>
                      <span className="dot"></span>
                    </span>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className="p-2 bg-[#F0F0F0] shadow-inner">
        <div className="flex items-center bg-white rounded-full overflow-hidden shadow-md border border-gray-300">
          <input
            type="text"
            className="flex-1 px-3 py-2 focus:outline-none bg-white text-black placeholder-gray-500"
            placeholder="Enter a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#800120] text-white hover:bg-[#600010] focus:outline-none flex-shrink-0"
            disabled={isLoading}
          >
            <FaPaperPlane style={{ color: "#800120" }}/>
          </button>
        </div>
      </form>

      <style jsx global>{`
        .message-bubble {
          position: relative;
          word-wrap: break-word;
          overflow-wrap: break-word;
        }

        .message-bubble::before {
          content: '';
          position: absolute;
          top: 0;
          width: 0;
          height: 0;
          border: 10px solid transparent;
        }

        .user .message-bubble::before {
          right: -10px;
          border-left-color: #DCF8C6;
          border-right: 0;
        }

        .assistant .message-bubble::before {
          left: -10px;
          border-right-color: #ffffff;
          border-left: 0;
        }

        .typing-animation {
          display: inline-flex;
          align-items: center;
        }

        .dot {
          width: 8px;
          height: 8px;
          margin: 0 3px;
          background: #800120;
          border-radius: 50%;
          opacity: 0;
          animation: typingAnimation 1.4s infinite ease-in-out;
        }

        .dot:nth-child(2) {
          animation-delay: 0.2s;
        }

        .dot:nth-child(3) {
          animation-delay: 0.4s;
        }

        @keyframes typingAnimation {
          0% { opacity: 0.2; transform: translateY(0); }
          20% { opacity: 1; transform: translateY(-5px); }
          40%, 100% { opacity: 0.2; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}