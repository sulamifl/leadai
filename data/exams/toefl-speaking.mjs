/**
 * TOEFL Speaking — задания, оцениваемые по рубрике (kind: "rubric").
 *
 * Оценка ставится не «одним числом от модели», а по трём критериям TOEFL
 * (Delivery / Language Use / Topic Development, 0–4) — см. `lib/exams/rubrics.mjs`.
 * Тайминги соответствуют реальному формату: 15 с подготовки, 45 с ответа
 * (для заданий 2–4 — 30 с подготовки, 60 с ответа).
 *
 * Аудиоматериал заданий 2–4 озвучивается на клиенте (`speechSynthesis`),
 * поэтому контент полностью офлайновый.
 */

const SPEAKING = [
  {
    id: "toefl-speak-1-study",
    title: "Task 1 (Independent): Studying Alone or in Groups",
    type: "independent",
    prepSeconds: 15,
    responseSeconds: 45,
    prompt:
      "Some students prefer to study alone; others prefer to study in a group. Which do you prefer, and why? Use specific reasons and examples to support your answer.",
    guidance: [
      "Дай тезис в первом предложении и держи его до конца — 45 секунд не хватит на две позиции.",
      "Один конкретный пример из своего опыта сильнее списка общих причин.",
      "Следи за темпом: лучше договорить мысль, чем оборваться на середине.",
    ],
  },
  {
    id: "toefl-speak-1-technology",
    title: "Task 1 (Independent): A Technology You Would Give Up",
    type: "independent",
    prepSeconds: 15,
    responseSeconds: 45,
    prompt:
      "Name one modern technology that you would be willing to give up, and explain why. Include details and examples in your explanation.",
    guidance: [
      "Выбери неожиданный, но защитимый вариант — шаблонный ответ слышно сразу.",
      "Структура: что именно → почему → что изменится в твоей жизни.",
      "Не пытайся перечислить все минусы технологии — выбери один решающий.",
    ],
  },
  {
    id: "toefl-speak-2-library-hours",
    title: "Task 2 (Read + Listen): Extending Library Hours",
    type: "campus",
    prepSeconds: 30,
    responseSeconds: 60,
    prompt:
      "The woman expresses her opinion about the university's plan. State her opinion and explain the reasons she gives for holding that opinion.",
    reading: {
      title: "University Announcement: Extended Library Hours",
      text: "Beginning next term, the main library will remain open until 2 a.m. on weekdays, two hours later than at present. The university expects the change to benefit students preparing for examinations. To offset staffing costs, the library will reduce weekend opening hours from twelve to eight hours.",
    },
    listening:
      "The woman says she supports the later weekday hours, because she works until nine in the evening and the current closing time means she can never use the library on workdays. She is, however, strongly against the cut to weekend hours. She points out that many students who live off campus rely on the library on Saturdays precisely because they cannot come during the week, and that the students who benefit from late weeknights are a smaller group than the students who lose weekend access. She also questions the framing of the announcement, arguing that the university presents the change as a net gain when it is really a trade of one group's access for another's.",
    guidance: [
      "Сначала одной фразой назови позицию, затем два её основания — это ядро задания.",
      "Обязательно упомяни, что мнение неоднозначное: поддерживает одно, возражает против другого.",
      "Не пересказывай объявление — экзаменатор уже его читал.",
    ],
  },
  {
    id: "toefl-speak-3-emergent",
    title: "Task 3 (Read + Listen): Emergent Behaviour",
    type: "academic",
    prepSeconds: 30,
    responseSeconds: 60,
    prompt:
      "Explain how the example of the ant colony illustrates the concept of emergent behaviour.",
    reading: {
      title: "Emergent Behaviour",
      text: "Emergent behaviour is a pattern produced by many simple individuals following local rules, even though no individual possesses a plan or an overview of the whole. The pattern exists only at the level of the group. Importantly, emergent outcomes can be highly adaptive — efficient foraging, robust structures, reliable division of labour — without any central controller.",
    },
    listening:
      "The professor describes how a colony of ants finds the shortest path to food. Each ant lays a chemical trail as it returns from a food source. Trails that are shorter are traversed more often per unit time, so they accumulate more of the chemical, which attracts still more ants. No ant measures distance, and no ant knows the layout of the terrain. The colony nevertheless converges on the shortest available route within a relatively short period. When the professor places an obstacle in the middle of that route, the traffic initially splits evenly around it, and within minutes the shorter detour collects the traffic — again without any individual ant choosing it. The professor notes that the same logic explains the foraging efficiency of slime moulds and the nest architecture of termites.",
    guidance: [
      "Начни с определения концепции в одно предложение.",
      "Затем свяжи пример с определением: где именно видно «нет плана, но есть результат».",
      "60 секунд хватает на определение + пример + один вывод. Не расписывай все детали лекции.",
    ],
  },
  {
    id: "toefl-speak-4-keystone",
    title: "Task 4 (Listen Only): Keystone Species",
    type: "lecture",
    prepSeconds: 20,
    responseSeconds: 60,
    prompt:
      "Using points and examples from the lecture, explain what a keystone species is and why its removal changes an entire ecosystem.",
    listening:
      "The professor begins by noting that abundance and importance are not the same thing. A keystone species is one whose influence on its community is disproportionate to its numbers. She gives two examples. The first is a sea otter population on a rocky coast. Otters eat sea urchins. When otters were hunted nearly to extinction, urchin numbers exploded, urchins grazed the kelp forest to bare rock, and the entire kelp community collapsed, taking with it fish and invertebrates that had nothing to do with otters directly. When otters returned, the kelp returned. Her second example is a large grazing mammal on a grassland: by trampling and grazing, it prevents any single plant species from dominating, and when the grazers were removed, a few tall grasses outcompeted the rest and the diversity of the meadow fell sharply. She stresses that in both cases the keystone species was never the most numerous organism present.",
    guidance: [
      "Сформулируй определение, затем разбери оба примера — они оба нужны для полного балла.",
      "Обязательно передай различие между численностью и влиянием.",
      "Закончи обобщением: почему такие виды важны для управления экосистемами.",
    ],
  },
  {
    id: "toefl-speak-2-cafeteria",
    title: "Task 2 (Read + Listen): A Single Campus Dining Hall",
    type: "campus",
    prepSeconds: 30,
    responseSeconds: 60,
    prompt:
      "The man expresses his opinion about the university's plan. State his opinion and explain the reasons he gives for holding that opinion.",
    reading: {
      title: "University Announcement: Consolidated Dining Services",
      text: "To reduce operating costs, the university will close the two smaller dining halls and expand the central hall, which will operate longer hours and add two new food stations. Administrators note that the change will allow a wider menu and more consistent opening times across the week.",
    },
    listening:
      "The man is opposed to the plan, though he accepts the argument about the menu. His first objection is distance: the two closing halls serve the science campus, and the walk to the central hall is about fifteen minutes each way, which is most of a short break between laboratory sessions. His second objection concerns queues. He says the central hall already has a queue at peak times, and that consolidating students will not be solved by adding two stations, because the bottleneck is seating rather than serving counters. He also notes that the longer opening hours do not help the students who are affected, since their problem is that they cannot leave a laboratory long enough to make the walk, not that the hall closes too early.",
    guidance: [
      "Назови позицию (против), затем два возражения — по одному предложению каждому.",
      "Покажи, что́ он признаёт: это делает ответ точнее и выше ценится.",
      "Не путай его возражения: расстояние и очередь — разные аргументы.",
    ],
  },
];

export default SPEAKING;
