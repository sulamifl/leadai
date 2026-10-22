/**
 * IELTS Writing — задания с рубричной оценкой (kind: "rubric").
 *
 * Оценка ставится по четырём официальным критериям (Task Response,
 * Coherence & Cohesion, Lexical Resource, Grammatical Range & Accuracy,
 * 0–9 с шагом 0.5) — см. `lib/exams/rubrics.mjs`. Итоговый band считает
 * приложение, а не модель.
 */

const WRITING = [
  {
    id: "ielts-write-t2-urban",
    title: "Task 2: Cities and Green Space",
    task: 2,
    minutes: 40,
    minWords: 250,
    prompt:
      "Some people believe that city governments should spend money on public parks and green spaces rather than on sports facilities. To what extent do you agree or disagree with this view?",
    guidance: [
      "Займи чёткую позицию во введении — экзаменатор оценивает её наличие, а не «правильность».",
      "Один абзац — одна причина с примером; не смешивай две идеи в одном абзаце.",
      "Отведи отдельный абзац контраргументу, но не забывай возвращаться к своей позиции.",
    ],
  },
  {
    id: "ielts-write-t2-work",
    title: "Task 2: Remote Work and City Centres",
    task: 2,
    minutes: 40,
    minWords: 250,
    prompt:
      "The rise of remote work has reduced the number of people travelling to city centres each day. Do the advantages of this development outweigh the disadvantages?",
    guidance: [
      "Формулировка «outweigh» требует взвешенного вывода, а не простого списка плюсов и минусов.",
      "Назови критерий взвешивания (например, кто несёт издержки) — это признак band 7+.",
      "Не уходи в общие рассуждения о технологиях: держись городских центров и занятости.",
    ],
  },
  {
    id: "ielts-write-t2-history",
    title: "Task 2: Teaching Local History",
    task: 2,
    minutes: 40,
    minWords: 250,
    prompt:
      "In many countries, schools teach national history but give little attention to the history of the local area. Why might this be the case, and what could be done to change it?",
    guidance: [
      "Это задание двухчастное: причины + решения. Пропуск одной части ограничивает Task Response.",
      "Решения должны отвечать на названные причины, иначе ответ распадается на два списка.",
      "Конкретизируй: «местные архивы и интервью с жителями» сильнее, чем «больше внимания».",
    ],
  },
  {
    id: "ielts-write-t1-graph",
    title: "Task 1: Describing a Trend",
    task: 1,
    minutes: 20,
    minWords: 150,
    prompt:
      "The chart below shows the percentage of households in four countries with access to the internet in 2005, 2015 and 2025. Summarise the information by selecting and reporting the main features, and make comparisons where relevant.\n\nДанные для описания: Country A — 42%, 78%, 95%; Country B — 18%, 55%, 88%; Country C — 61%, 74%, 79%; Country D — 8%, 31%, 72%.",
    guidance: [
      "Не перечисляй все числа: выбери 3–4 главные особенности (общий рост, сближение показателей, лидер и аутсайдер).",
      "Обязательно сравнивай, а не описывай страны по очереди.",
      "Не добавляй причин роста — Task 1 требует только описания данных.",
    ],
  },
  {
    id: "ielts-write-t1-process",
    title: "Task 1: Describing a Process",
    task: 1,
    minutes: 20,
    minWords: 150,
    prompt:
      "The diagram shows the process by which used glass bottles are recycled into new containers. Summarise the information by selecting and reporting the main features.\n\nЭтапы: сбор → сортировка по цвету → промывка → дробление в стеклобой → плавление при 1500 °C → формование новых бутылок → охлаждение → упаковка и отправка.",
    guidance: [
      "Используй пассив и маркеры последовательности: first, once, after which, finally.",
      "Назови ключевые параметры (температура, этап сортировки по цвету) — они считаются «main features».",
      "Не описывай, зачем это делается: цель процесса — не часть задания.",
    ],
  },
  {
    id: "ielts-write-t1-letter",
    title: "Task 1 (General Training): Letter of Complaint",
    task: 1,
    minutes: 20,
    minWords: 150,
    prompt:
      "You recently stayed in a hotel that did not meet the standard advertised on its website. Write a letter to the hotel manager. In your letter: describe the problems you experienced; explain why these mattered to you; say what you would like the hotel to do.",
    guidance: [
      "Формальный регистр: без сокращений и разговорных выражений.",
      "Все три пункта задания должны быть явно закрыты — это и есть Task Achievement.",
      "Просьба в конце должна быть конкретной (возврат части стоимости, а не «примите меры»).",
    ],
  },
];

export default WRITING;
