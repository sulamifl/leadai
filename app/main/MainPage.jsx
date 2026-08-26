"use client";
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ReactGA from "react-ga4";
import ListeningSection from './ListeningSection';
import ReadingSection from './ReadingSection';
import WritingSection from './WritingSection';
import SpeakingSection from './SpeakingSection';
import Results from './results';
import Image from 'next/image';
import 'react-toastify/dist/ReactToastify.css';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n';
import ExamTimer from '../../components/ExamTimer';

// Реальный тайминг секций IELTS (в секундах)
const SECTION_DURATIONS = {
  listening: 30 * 60, // 30 минут (+10 минут на перенос ответов)
  reading: 60 * 60,   // 60 минут
  writing: 60 * 60,   // 60 минут
  speaking: 14 * 60,  // 11-14 минут (берём максимум)
};

const preparationOptions = [
  {
    id: 6,
    titleKey: "university_selection",
    desKey: "university_selection_des",
    img: "/unive.png",
    value: 'selection'
  },
  {
    id: 7,
    titleKey: "essay_assessment",
    desKey: "essay_assessment_des",
    img: "/pencil.png",
    value: 'essay'
  },
  {
    id: 8,
    titleKey: "speech_assessment",
    desKey: "speech_assessment_des",
    img: "/voice.png",
    value: 'voice'
  }
];

const ieltsOptions = [
  {
    id: 1,
    titleKey: "full_ielts_test",
    desKey: "full_ielts_test_des",
    img: "/full.png",
    value: 'full'
  },
  {
    id: 2,
    titleKey: "listening_section_one",
    desKey: "listening_section_des_one",
    img: "/mus.png",
    value: 'listening'
  },
  {
    id: 3,
    titleKey: "reading_section_one",
    desKey: "reading_section_des_one",
    img: "/books.png",
    value: 'reading'
  },
  {
    id: 4,
    titleKey: "writing_section_one",
    desKey: "writing_section_des_one",
    img: "/essa.png",
    value: 'writing'
  },
  {
    id: 5,
    titleKey: "speaking_section",
    desKey: "speaking_section_des_one",
    img: "/voc.png",
    value: 'speaking'
  },
  {
  id: 9,
  titleKey: "programming_learning",
  desKey: "programming_learning_des",
  img: "/pro.png",
  value: 'programming'
}
];

  const modeOptions = [
    {
      id: 1,
      titleKey: "timed_mode",
      desKey: "timed_mode_des",
      img: "/clock.png",
      value: true
    },
    {
      id: 2,
      titleKey: "untimed_mode",
      desKey: "untimed_mode_des",
      img: "/time3.png",
      value: false
    }
  ];

  const typeOptions = [
    {
      id: 1,
      titleKey: "academic_type",
      desKey: "academic_type_des",
      img: "/hats.png",
      value: 'academic'
    },
    {
      id: 2,
      titleKey: "general_training_type",
      desKey: "general_training_type_des",
      img: "/brie.png",
      value: 'general'
    }
  ];

const Page = () => {
  const [selectedTest, setSelectedTest] = useState(null);
  const [testType, setTestType] = useState(null);
  const [currentSection, setCurrentSection] = useState(null);
  const [answers, setAnswers] = useState({});
  const [timedMode, setTimedMode] = useState(null);
  // Ключ для сброса таймера при переходе между секциями
  const [timerKey, setTimerKey] = useState(0);
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const lang = searchParams.get('lang') || 'en';
    i18n.changeLanguage(lang);
  }, [searchParams]);

  useEffect(() => {
    ReactGA.initialize("G-TBSYZ03L8M");
    
    ReactGA.send({ hitType: "pageview", page: "/main" });
    
  }, []);

  const handleTestSelection = (test, type = null) => {
  setSelectedTest(test);
  setTestType(type);
  setTimedMode(null);

  ReactGA.event({
    category: "Test Selection",
    action: "Selected Test",
    label: test
  });

  if (test === 'selection') {
    router.push('/univer');
  } else if (test === 'essay') {
    router.push('/essay');
  } else if (test === 'voice') {
    router.push('/voice');
  } else if (test === 'programming') {
    router.push('/programming');
  }
};

  const handleModeSelection = (isTimed) => {
    setTimedMode(isTimed);
    if (selectedTest === 'full') {
      setCurrentSection('listening');
    } else {
      setCurrentSection(selectedTest);
    }

    ReactGA.event({
      category: "Mode Selection",
      action: "Selected Mode",
      label: isTimed ? "Timed" : "Untimed"
    });
  };

  const handleSectionComplete = (sectionData) => {
    setAnswers(prev => ({ ...prev, [currentSection]: sectionData }));
    if (selectedTest === 'full') {
      const sections = ['listening', 'reading', 'writing', 'speaking'];
      const currentIndex = sections.indexOf(currentSection);
      if (currentIndex < sections.length - 1) {
        setCurrentSection(sections[currentIndex + 1]);
      } else {
        setCurrentSection('results');
      }
    } else {
      setCurrentSection('results');
    }

    // Сбрасываем таймер при переходе к следующей секции
    setTimerKey(prev => prev + 1);

    ReactGA.event({
      category: "Section Completion",
      action: "Completed Section",
      label: currentSection
    });
  };

  // Автозавершение секции по истечении времени таймера реального экзамена.
  // Вызываем handleSectionComplete без данных — секция завершается и переходим дальше.
  const handleTimeUp = () => {
    handleSectionComplete({ section: currentSection, data: null });
  };

  const renderCards = (options, handleClick, sectionTitle) => (
  <section className="pt-20 pb-12 px-4" style={{ backgroundColor: 'white' }}>
    <h2 className="text-3xl text-black font-bold text-center mb-8">{t(sectionTitle)}</h2>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {options.map((option) => (
        <div
          key={option.id}
          className="cursor-pointer transform hover:scale-105 transition-transform duration-300 p-6 rounded-lg shadow-lg"
          style={{
            backgroundColor: option.id === 2 || option.id === 4 || option.id === 9 ? "#000000" : "#810021",
            height: "15em",
          }}
          onClick={() => handleClick(option.value)}
        >
          <Image src={option.img} alt={t(option.titleKey)} width={300} height={200} className="mb-4 w-20 h-20 object-cover rounded-lg mx-auto" />
          <h3 className="text-2xl font-semibold mb-2 text-center text-white">{t(option.titleKey)}</h3>
          <p className="text-sm text-center text-white">{t(option.desKey)}</p>
        </div>
      ))}
    </div>
  </section>
);

  const renderSection = () => {
    switch (currentSection) {
      case 'listening':
        return <ListeningSection onNext={handleSectionComplete} timedMode={timedMode} />;
      case 'reading':
        return <ReadingSection onNext={handleSectionComplete} testType={testType} timedMode={timedMode} />;
      case 'writing':
        return <WritingSection onNext={handleSectionComplete} testType={testType} timedMode={timedMode} />;
      case 'speaking':
        return <SpeakingSection onNext={handleSectionComplete} timedMode={timedMode} />;
      case 'results':
        return <Results answers={answers} testType={selectedTest} />;
    default:
      return null;
    }
  };

  if (!selectedTest) {
    return (
      <div style={{ backgroundColor: 'white' }}>
        {renderCards(ieltsOptions, handleTestSelection, "ielts_tests")}
        {renderCards(preparationOptions, handleTestSelection, "preparation_options")}
      </div>
    );
  }

  if (['full', 'reading', 'writing'].includes(selectedTest) && !testType) {
    return (
      <section className="pt-20 pb-12 px-4" style={{ backgroundColor: 'white' }}>
        <h2 className="text-3xl text-black font-bold text-center mb-8">{t("select_test_type")}</h2>
        {renderCards(typeOptions, (type) => handleTestSelection(selectedTest, type))}
      </section>
    );
  }

  if (timedMode === null) {
    return (
      <section className="pt-20 pb-12 px-4" style={{ backgroundColor: 'white' }}>
        <h2 className="text-3xl text-black font-bold text-center mb-8">{t("select_mode")}</h2>
        {renderCards(modeOptions, handleModeSelection)}
      </section>
    );
  }

  // Показываем таймер реального экзамена только в режиме "Timed" и во время активной секции
  const showExamTimer = timedMode && currentSection && currentSection !== 'results';
  const sectionDuration = SECTION_DURATIONS[currentSection];

  return (
    <div style={{ backgroundColor: 'white' }}>
      {showExamTimer && sectionDuration && (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '20px' }}>
          <ExamTimer
            key={timerKey}
            duration={sectionDuration}
            onTimeUp={handleTimeUp}
          />
        </div>
      )}
      {renderSection()}
    </div>
  );
};

export default Page;