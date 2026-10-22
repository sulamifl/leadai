/**
 * IELTS Speaking — задания с рубричной оценкой (kind: "rubric").
 *
 * Оценка по четырём официальным критериям: Fluency & Coherence,
 * Lexical Resource, Grammatical Range & Accuracy, Pronunciation (0–9, шаг 0.5).
 * Итоговый band считает приложение (`calibrateRubric`), а не модель.
 *
 * Три части формата:
 *  - Part 1 — короткие вопросы о себе (2–3 минуты суммарно);
 *  - Part 2 — cue card с 1 минутой подготовки и 2 минутами ответа;
 *  - Part 3 — обсуждение абстрактных вопросов по теме Part 2.
 */

const SPEAKING = [
  {
    id: "ielts-speak-p1-hometown",
    title: "Part 1: Hometown and Daily Routine",
    part: 1,
    prepSeconds: 0,
    responseSeconds: 120,
    prompt:
      "Answer the following questions. Speak for 20–30 seconds on each.\n\n1. Where is your hometown, and what is it known for?\n2. Has it changed much in recent years?\n3. What part of your daily routine do you enjoy most?\n4. Do you prefer to plan your day or take it as it comes?",
    guidance: [
      "Part 1 — это разминка: короткие ответы с одной причиной или примером, без длинных монологов.",
      "Не отвечай одним словом: добавляй «because…» или конкретную деталь.",
      "Держи естественный темп — беглость оценивается отдельно от сложности лексики.",
    ],
  },
  {
    id: "ielts-speak-p1-study",
    title: "Part 1: Work, Study and Free Time",
    part: 1,
    prepSeconds: 0,
    responseSeconds: 120,
    prompt:
      "Answer the following questions.\n\n1. Do you work or are you a student?\n2. What do you find most difficult about it?\n3. How do you usually spend your weekends?\n4. Is there a hobby you would like to take up?",
    guidance: [
      "Избегай заученных ответов: экзаменатор слышит шаблон сразу и снижает Fluency.",
      "Один конкретный пример (название курса, вид спорта) делает ответ убедительнее.",
      "Не бойся паузы-хезитации, но не заменяй ею содержание.",
    ],
  },
  {
    id: "ielts-speak-p2-place",
    title: "Part 2: A Place You Go to Relax",
    part: 2,
    prepSeconds: 60,
    responseSeconds: 120,
    prompt:
      "Describe a place where you go to relax. You should say:\n\n• where it is\n• how often you go there\n• what you do there\n\nand explain why this place helps you relax.",
    guidance: [
      "Используй всю минуту подготовки: запиши 4–5 слов-опор, не полный текст.",
      "Структура: что за место → детали → почему это работает для тебя.",
      "2 минуты — это долго: обязательно добавь историю или пример, иначе кончишь на 60-й секунде.",
    ],
  },
  {
    id: "ielts-speak-p2-skill",
    title: "Part 2: A Skill You Learned Recently",
    part: 2,
    prepSeconds: 60,
    responseSeconds: 120,
    prompt:
      "Describe a skill you have learned recently. You should say:\n\n• what the skill is\n• why you decided to learn it\n• how you learned it\n\nand explain how you felt when you had learned it.",
    guidance: [
      "Прошедшие времена — основная зона ошибок: держи их под контролем.",
      "Покажи прогресс: «at first…, then…, eventually…» — это признак связности.",
      "Эмоциональная часть («how you felt») часто пропускается — не забывай её.",
    ],
  },
  {
    id: "ielts-speak-p3-technology",
    title: "Part 3: Technology and Free Time",
    part: 3,
    prepSeconds: 0,
    responseSeconds: 180,
    prompt:
      "Discuss the following questions. Give reasons and examples.\n\n1. How has technology changed the way people relax?\n2. Do you think people are more or less sociable than before? \n3. Should governments regulate the amount of time young people spend online?\n4. Is boredom valuable?",
    guidance: [
      "Part 3 требует обобщений, а не личного опыта: говори о людях, обществе, тенденциях.",
      "Структура ответа: тезис → обоснование → пример → вывод (30–40 секунд на вопрос).",
      "Допустимо не соглашаться с посылкой вопроса — но объясни, почему.",
    ],
  },
  {
    id: "ielts-speak-p3-education",
    title: "Part 3: Education and Assessment",
    part: 3,
    prepSeconds: 0,
    responseSeconds: 180,
    prompt:
      "Discuss the following questions.\n\n1. Are examinations a fair way to measure ability?\n2. What alternatives to exams exist, and what are their weaknesses?\n3. Should all education be free at the point of use?\n4. How might schools change in the next twenty years?",
    guidance: [
      "Оценивают способность рассуждать, а не знание фактов: опирайся на логику.",
      "Покажи обе стороны, прежде чем сделать вывод — это сильный ход для band 7+.",
      "Модальные глаголы (might, could, is likely to) уместны в прогнозах.",
    ],
  },
  {
    id: "ielts-speak-p2-object",
    title: "Part 2: Something You Own That Matters to You",
    part: 2,
    prepSeconds: 60,
    responseSeconds: 120,
    prompt:
      "Describe something you own that is important to you. You should say:\n\n• what it is\n• how long you have had it\n• how you got it\n\nand explain why it is important to you.",
    guidance: [
      "Вещь не обязана быть дорогой: история важнее стоимости.",
      "Полезно вставить относительные придаточные (which, that) — это работает на Grammatical Range.",
      "Не сбивайся в описание внешнего вида: главное — почему это важно.",
    ],
  },
  {
    id: "ielts-speak-p3-cities",
    title: "Part 3: Cities and Public Space",
    part: 3,
    prepSeconds: 0,
    responseSeconds: 180,
    prompt:
      "Discuss the following questions.\n\n1. Why do people move to large cities?\n2. What problems do cities face as they grow?\n3. Should city centres be closed to private cars?\n4. Do public spaces make a city better, or are they a luxury?",
    guidance: [
      "Связывай ответы с конкретными механизмами (аренда, транспорт, рабочие места), а не с клише.",
      "Если пример трудно вспомнить — используй гипотетический: «take a city like…».",
      "Следи за произношением многосложных слов: они чаще всего искажаются.",
    ],
  },
];

export default SPEAKING;
