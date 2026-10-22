/**
 * Digital SAT — Reading & Writing.
 *
 * Шесть модулей по 6 вопросов (36 всего). Типы заданий соответствуют
 * официальному Digital SAT: Words in Context, Text Structure and Purpose,
 * Cross-Text Connections, Command of Evidence (текстовые и количественные),
 * Inferences, Boundaries (пунктуация), Transitions, Rhetorical Synthesis.
 *
 * Все ответы проверяются детерминированно по полю `answer` (индекс варианта).
 * Тексты оригинальные, написанные под формат экзамена.
 */

const RW = [
  {
    id: "sat-rw-urban-trees",
    title: "Module 1: Words in Context & Sentence Boundaries",
    minutes: 12,
    passage: {
      text: `City trees are often described as infrastructure, and the description is more than a metaphor. A mature street tree intercepts rainfall before it reaches the pavement, and it cools the air immediately around it through evaporation from its leaves. Neither effect is dramatic at the scale of a single tree. Multiplied across a district, however, the two together can ______ the load on storm drains and on the electricity grid during a heat wave.

Municipal foresters therefore argue that a tree should be assessed the way a pipe or a transformer is assessed — by the service it provides and the cost of replacing it. The comparison has a practical consequence. A street tree that is removed for a road-widening project is rarely replaced at the same size, and the services it supplied do not return for decades.`,
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which choice completes the text with the most logical and precise word or phrase?",
        options: ["eliminate", "measurably reduce", "redistribute", "conceal"],
        answer: 1,
        explanation:
          "Контекст говорит, что эффект одного дерева невелик, но в масштабе района он заметен. «Measurably reduce» точно передаёт частичное, но измеримое снижение нагрузки. «Eliminate» слишком сильно, «redistribute» и «conceal» не подходят по смыслу.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Which choice best describes the function of the underlined sentence «A street tree that is removed … for decades» in the passage?",
        options: [
          "It provides a specific illustration of a general claim about replacement costs",
          "It concedes that road-widening projects are usually necessary",
          "It introduces a counterargument to the main claim",
          "It defines a technical term used earlier in the passage",
        ],
        answer: 0,
        explanation:
          "Предложение конкретизирует общий тезис «дерево надо оценивать как инфраструктуру»: приводит пример, показывающий цену утраты.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text so that it conforms to the conventions of Standard English? «Municipal foresters therefore argue that a tree should be assessed the way a pipe or a transformer ______ — by the service it provides.»",
        options: ["is assessed", "are assessed", "assesses", "assessing"],
        answer: 0,
        explanation:
          "Подлежащее сравнения — «a tree» (единственное число), поэтому «the way a pipe or a transformer is assessed».",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text with the most logical transition? «Neither effect is dramatic at the scale of a single tree. ______, multiplied across a district, the two together can measurably reduce the load on storm drains.»",
        options: ["Nevertheless", "For example", "In addition", "Similarly"],
        answer: 0,
        explanation:
          "Между предложениями противопоставление: по отдельности эффект мал, но в масштабе района — значим. Нужен уступительный переход «Nevertheless».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "The passage most strongly suggests that the author views the description of trees as infrastructure as",
        options: [
          "rhetorically useful but factually unsupported",
          "literally accurate in the sense that trees provide measurable services",
          "an exaggeration that foresters have been forced to defend",
          "a claim that applies only to newly planted trees",
        ],
        answer: 1,
        explanation:
          "Автор прямо говорит: «the description is more than a metaphor», и далее объясняет, какие измеримые услуги оказывает дерево.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "According to the passage, why does replacing a removed street tree not restore the services it provided?",
        options: [
          "Replacement trees are usually of a different species",
          "The services depend on the size of the tree, which takes decades to reach",
          "Storm drains are redesigned when roads are widened",
          "Municipal foresters are not required to replant",
        ],
        answer: 1,
        explanation:
          "«A street tree that is removed … is rarely replaced at the same size, and the services it supplied do not return for decades» — ключ в размере дерева и времени.",
      },
    ],
  },
  {
    id: "sat-rw-restitution",
    title: "Module 2: Cross-Text Connections",
    minutes: 12,
    passage: {
      text: `**Text 1** — Museum ethics has shifted from the question of how an object was acquired to the question of what an object is for. A bronze that has spent a century in a European gallery has been conserved, catalogued and studied. Returned to its place of origin, it may be displayed in a smaller institution with fewer resources. Defenders of retention argue that the cosmopolitan museum performs a service no single national collection can: it places objects from different traditions side by side, where visitors can see connections that no single culture's narrative would produce.

**Text 2** — The cosmopolitan argument would be more persuasive if the cosmopolitan museum were the only place such comparisons happen. In practice, loans, touring exhibitions and digital surrogates now allow objects to be seen together without permanent removal from the communities that made them. What the retention argument actually protects is not comparison but the accumulation of title. A collection that cannot be lent has become a collection that cannot be questioned.`,
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which choice best states the main relationship between the two texts?",
        options: [
          "Text 2 restates Text 1's position in more concrete terms",
          "Text 1 offers a defence of a practice that Text 2 argues is no longer justified by its own stated rationale",
          "Text 1 and Text 2 describe different historical periods of museum practice",
          "Text 2 provides statistical evidence supporting Text 1's claim",
        ],
        answer: 1,
        explanation:
          "Текст 1 защищает удержание объектов ссылкой на «космополитическую» пользу сравнения. Текст 2 утверждает, что эта польза достижима иначе, значит заявленное обоснование больше не работает.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Text 2 responds to Text 1's cosmopolitan argument mainly by",
        options: [
          "denying that comparisons between traditions have any value",
          "showing that the benefit described can be obtained without permanent retention",
          "arguing that smaller institutions lack qualified staff",
          "claiming that European galleries acquired objects legally",
        ],
        answer: 1,
        explanation:
          "Текст 2 не отрицает ценность сравнений — он говорит, что её обеспечивают loans, touring exhibitions и цифровые копии.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Based on the texts, both authors would most likely agree that",
        options: [
          "the circumstances under which an object was acquired are relevant to museum ethics",
          "smaller institutions cannot adequately conserve important objects",
          "digital surrogates are an adequate substitute for original objects",
          "permanent collections should be abolished",
        ],
        answer: 0,
        explanation:
          "Текст 1 фиксирует сдвиг от вопроса о происхождении к вопросу о назначении — то есть происхождение уже признано релевантным. Текст 2 говорит о сообществах, создавших объект. Оба не отрицают значимость происхождения. Остальные варианты ни один из авторов не поддерживает.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text with the most logical transition? «In practice, loans, touring exhibitions and digital surrogates now allow objects to be seen together ______ permanent removal from the communities that made them.»",
        options: ["in spite of", "without", "as a result of", "in exchange for"],
        answer: 1,
        explanation:
          "Смысл: сравнение возможно без постоянного изъятия. Нужен предлог «without».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "The phrase «the accumulation of title» in Text 2 most nearly means",
        options: [
          "the growth of academic publication about objects",
          "the piling up of legal ownership claims by museums",
          "the acquisition of noble titles by museum donors",
          "the cataloguing of objects by curators",
        ],
        answer: 1,
        explanation:
          "«Title» в юридическом смысле — право собственности. Речь о накоплении музеем прав владения, а не о публикациях или титулах.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Which statement from Text 1 would Text 2 most directly challenge?",
        options: [
          "«Museum ethics has shifted from the question of how an object was acquired…»",
          "«…the cosmopolitan museum performs a service no single national collection can…»",
          "«…it may be displayed in a smaller institution with fewer resources.»",
          "«Defenders of retention argue that…»",
        ],
        answer: 1,
        explanation:
          "Именно тезис об уникальной услуге «космополитического» музея Текст 2 и оспаривает, показывая альтернативные способы сравнения.",
      },
    ],
  },
  {
    id: "sat-rw-commute",
    title: "Module 3: Command of Evidence (Quantitative)",
    minutes: 12,
    passage: {
      text: `A transport authority surveyed how residents of four districts travelled to work before and after a new light-rail line opened. Researchers hypothesised that the line would reduce car commuting most in the district with the highest pre-existing car share.`,
      table: {
        caption: "Share of commuters using each mode, before and after the light-rail line",
        headers: ["District", "Car before", "Car after", "Rail after", "Distance to nearest station"],
        rows: [
          ["A", "72%", "51%", "18%", "0.4 km"],
          ["B", "68%", "63%", "9%", "1.9 km"],
          ["C", "55%", "49%", "14%", "1.1 km"],
          ["D", "61%", "42%", "22%", "0.6 km"],
        ],
      },
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which choice best describes the data in the table?",
        options: [
          "The largest absolute fall in car share occurred in the district with the highest initial car share",
          "The largest absolute fall in car share occurred in District D",
          "Car share fell by the same amount in all four districts",
          "Rail use was highest in the district farthest from a station",
        ],
        answer: 1,
        explanation:
          "Абсолютные падения: A 21, B 5, C 6, D 19 процентных пунктов. Наибольшее — в D (19), а не в A, где исходная доля выше.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt:
          "Which choice most effectively uses data from the table to complete the sentence? «The researchers' hypothesis was only partly supported, because ______»",
        options: [
          "District A had the highest initial car share but not the largest absolute reduction",
          "District B had the smallest reduction in car share despite being closest to a station",
          "all districts saw some increase in rail use",
          "District C had the lowest initial car share of the four",
        ],
        answer: 0,
        explanation:
          "Гипотеза предсказывала наибольшее сокращение там, где исходная автомобильная доля максимальна (район A, 72%). Но наибольшее абсолютное падение — в D. Значит поддержка лишь частичная.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "A student claims that distance to a station alone explains the change in car use. Which row most weakens that claim?",
        options: [
          "District A",
          "District B",
          "District C",
          "District D",
        ],
        answer: 2,
        explanation:
          "Если бы дистанция определяла всё, падение росло бы по мере приближения к станции. Этого нет: в районе C станция в 1.1 км, а падение всего 6 п.п., тогда как в D при 0.6 км — 19 п.п., а в B при 1.9 км — 5 п.п. Район C ближе к станции, чем B, но выигрыш почти нулевой, поэтому одной дистанцией различие не объяснить.",
      },
      {
        id: "q4",
        type: "true_false",
        prompt: "In every district, the share of commuters using rail after the line opened was smaller than the fall in car share.",
        options: ["True", "False"],
        answer: 1,
        explanation:
          "Утверждение неверно. В районе B падение автомобильной доли — 5 п.п., а рельсовая доля — 9%, то есть рельс больше падения. (Для сравнения: в A 21 п.п. против 18%.)",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text with the most logical transition? «Car use fell in all four districts. ______, the size of the fall varied by a factor of more than three.»",
        options: ["Therefore", "However", "Likewise", "In other words"],
        answer: 1,
        explanation:
          "Второе предложение ограничивает первое: падение есть везде, но величина сильно различается. Нужен противительный переход.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Which additional piece of evidence would best help explain the difference between Districts A and B?",
        options: [
          "The number of bus routes serving each district before the line opened",
          "The total population of each district",
          "The average age of the rolling stock used on the line",
          "The name of the contractor that built the line",
        ],
        answer: 0,
        explanation:
          "Чтобы объяснить, почему в A отказ от машины велик, а в B мал, нужны альтернативы: автобусное сообщение — наиболее релевантный фактор. Возраст подвижного состава одинаков для всей линии и не различает районы.",
      },
    ],
  },
  {
    id: "sat-rw-pencil",
    title: "Module 4: Text Structure and Purpose",
    minutes: 12,
    passage: {
      text: `The pencil is a small assembly of industries. Graphite from one continent is milled and mixed with clay; the mixture is fired, impregnated with wax, and sandwiched between slats of cedar that must be cut so the grain runs straight, or the pencil snaps when it is sharpened. The ferrule — the metal band holding the eraser — is stamped from sheet steel; the eraser is a compounded rubber. A single pencil can involve a dozen suppliers on four continents, and none of them needs to know what the others are doing.

This is why the pencil became a favourite example for economists writing about coordination. The point is not that a pencil is complicated. The point is that no one who makes one knows how to make one. There is no pencil authority, no central plan, and yet the object arrives in a shop for a few cents. Order, in this case, is an outcome rather than an intention.`,
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which choice best states the main purpose of the passage?",
        options: [
          "To explain the manufacturing steps of a pencil in chronological order",
          "To use a familiar object to illustrate a claim about coordination without central direction",
          "To argue that pencil manufacturers should be regulated",
          "To compare the cost of pencils in different countries",
        ],
        answer: 1,
        explanation:
          "Первый абзац описывает производство, второй прямо формулирует тезис: порядок — результат, а не намерение. Объект служит иллюстрацией.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "The phrase «no one who makes one knows how to make one» functions mainly to",
        options: [
          "criticise the skill level of factory workers",
          "emphasise that the knowledge required is distributed rather than held by any individual",
          "suggest that pencils are manufactured incorrectly",
          "introduce a historical claim about craft production",
        ],
        answer: 1,
        explanation:
          "Фраза подчёркивает распределённость знания: никто не держит весь процесс, но результат возникает.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "According to the passage, why must the cedar slats be cut with the grain running straight?",
        options: [
          "To reduce the cost of the wood",
          "So that the pencil does not break when sharpened",
          "To allow the graphite to be inserted more quickly",
          "Because the wax impregnation requires it",
        ],
        answer: 1,
        explanation:
          "«…or the pencil snaps when it is sharpened» — прямое указание причины.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text with the most logical transition? «There is no pencil authority, no central plan, ______ the object arrives in a shop for a few cents.»",
        options: ["because", "and yet", "so that", "unless"],
        answer: 1,
        explanation:
          "Между отсутствием центрального плана и наличием дешёвого товара — логическое напряжение; нужен «and yet».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "The passage suggests that the author regards the pencil example as valuable because it is",
        options: [
          "unusually complex and therefore impressive",
          "ordinary, and therefore hard to dismiss as exceptional",
          "historically important to the development of economics",
          "cheap enough to be studied experimentally",
        ],
        answer: 1,
        explanation:
          "«The point is not that a pencil is complicated» — ценность в обыденности: пример нельзя отмахнуться как на исключение. Это следует из контраста «not complicated… yet order emerges».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Which statement would the author be most likely to agree with?",
        options: [
          "Complex products require a coordinating authority",
          "Coordination can arise from independent actors pursuing their own tasks",
          "Manufacturing knowledge is best centralised in a single firm",
          "Consumers should know how the products they buy are made",
        ],
        answer: 1,
        explanation:
          "Тезис пассажа: «Order, in this case, is an outcome rather than an intention» — координация возникает без центрального плана.",
      },
    ],
  },
  {
    id: "sat-rw-octopus",
    title: "Module 5: Inferences",
    minutes: 12,
    passage: {
      text: `Octopuses show two distinct sleep-like states. In one, the skin stays pale and the animal is still. In the other, the skin cycles rapidly through patterns — dark bands, mottled patches, sudden blanching — while the eyes move beneath closed lids. Researchers filming captive animals noticed that the colour patterns displayed during this active state sometimes resemble patterns the same individual uses while hunting or hiding.

That resemblance is suggestive but not decisive. Skin pattern is controlled by chromatophores, and chromatophores can fire in patterns that carry no information at all. To argue that an octopus is replaying a memory, it is not enough to show that the display looks familiar; one must show that the display is correlated with the context in which the original behaviour occurred, and that blocking the replay impairs later performance. Neither has yet been demonstrated convincingly.`,
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which choice best describes the overall structure of the passage?",
        options: [
          "It presents an observation and then explains why the observation does not yet establish a conclusion",
          "It describes two competing theories and endorses the second",
          "It reports an experiment and then describes its replication",
          "It defines a term and then applies it to a new species",
        ],
        answer: 0,
        explanation:
          "Первый абзац — наблюдение, второй — почему сходство узоров ещё не доказывает «проигрывание памяти».",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "It can most reasonably be inferred that the author would consider the resemblance between sleep patterns and hunting patterns to be",
        options: [
          "conclusive evidence of memory replay",
          "irrelevant to the question of memory replay",
          "consistent with memory replay but insufficient to establish it",
          "evidence that octopuses do not sleep",
        ],
        answer: 2,
        explanation:
          "«That resemblance is suggestive but not decisive» — совместимо с гипотезой, но недостаточно.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "According to the passage, which of the following would strengthen the memory-replay hypothesis?",
        options: [
          "Showing that chromatophores can fire without information",
          "Showing that the display correlates with the context of the original behaviour",
          "Showing that the active state occupies most of the night",
          "Showing that other cephalopods lack the active state",
        ],
        answer: 1,
        explanation:
          "Автор прямо перечисляет необходимые условия: корреляция с контекстом и нарушение последующего исполнения при блокировке.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "The author mentions chromatophores primarily in order to",
        options: [
          "explain the mechanism by which octopuses change colour",
          "identify a reason the observed resemblance might be misleading",
          "argue that octopus skin is more complex than previously thought",
          "introduce a comparison with vertebrate sleep",
        ],
        answer: 1,
        explanation:
          "Хроматофоры упомянуты как альтернативное объяснение: узоры могут возникать без информационного содержания.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text so that it conforms to the conventions of Standard English? «Neither ______ yet been demonstrated convincingly.»",
        options: ["have", "has", "having", "were"],
        answer: 1,
        explanation:
          "«Neither» в роли подлежащего с двумя упомянутыми условиями в современном стандартном английском согласуется в единственном числе: «Neither has yet been demonstrated».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Which choice best states the function of the final sentence of the passage?",
        options: [
          "It summarises the evidence presented earlier",
          "It specifies what evidence is still missing",
          "It concedes that the hypothesis has been refuted",
          "It proposes a new experiment in detail",
        ],
        answer: 1,
        explanation:
          "Последнее предложение перечисляет, что ещё не показано — то есть каких доказательств не хватает.",
      },
    ],
  },
  {
    id: "sat-rw-antibiotics",
    title: "Module 6: Rhetorical Synthesis & Transitions",
    minutes: 12,
    passage: {
      text: `**Notes for a student essay on antibiotic resistance**

• Resistance emerges when a bacterial population is exposed to a drug long enough for resistant variants to survive and multiply.
• In human medicine, incomplete courses of antibiotics are a well-documented contributor.
• In agriculture, antibiotics are used at low doses to promote growth in livestock; this practice exposes large bacterial populations continuously.
• Sweden banned growth-promoting antibiotics in 1986; the European Union followed in 2006.
• After the EU ban, the prevalence of resistant bacteria in livestock fell in several member states, though the size of the decline varied.
• Prescribing behaviour in human medicine changed much more slowly over the same period.`,
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt:
          "The student wants to emphasise that reducing agricultural use produced measurable results. Which choice most effectively uses the notes to accomplish this goal?",
        options: [
          "Antibiotics are used at low doses in livestock, exposing large bacterial populations continuously.",
          "Sweden banned growth-promoting antibiotics in 1986, and the European Union followed in 2006.",
          "After the EU ban, the prevalence of resistant bacteria in livestock fell in several member states, though the decline varied in size.",
          "Prescribing behaviour in human medicine changed much more slowly over the same period.",
        ],
        answer: 2,
        explanation:
          "Цель — показать измеримый результат. Только вариант C сообщает о снижении распространённости резистентности после запрета.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt:
          "The student wants to contrast two sources of resistance. Which choice most effectively uses the notes to accomplish this goal?",
        options: [
          "Resistance emerges when a bacterial population is exposed to a drug long enough for resistant variants to survive.",
          "Incomplete courses in human medicine contribute to resistance, while continuous low-dose use in livestock exposes far larger populations.",
          "Sweden banned growth-promoting antibiotics in 1986.",
          "Prescribing behaviour in human medicine changed slowly.",
        ],
        answer: 1,
        explanation:
          "Контраст требует сопоставления двух источников — human medicine и agriculture — в одном предложении.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text with the most logical transition? «The EU ban reduced resistant bacteria in livestock in several member states. ______, prescribing behaviour in human medicine changed much more slowly.»",
        options: ["Similarly", "In contrast", "Therefore", "For instance"],
        answer: 1,
        explanation:
          "Сопоставляются быстрый эффект в животноводстве и медленное изменение в медицине — противительный переход.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt:
          "Which choice completes the text so that it conforms to the conventions of Standard English? «Resistance emerges when a bacterial population ______ exposed to a drug long enough for resistant variants to survive.»",
        options: ["is", "are", "being", "have been"],
        answer: 0,
        explanation:
          "Подлежащее «a bacterial population» — единственное число, поэтому «is exposed».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "Which conclusion is best supported by the notes as a whole?",
        options: [
          "Agricultural use is the only source of antibiotic resistance",
          "Restricting antibiotic use can reduce resistance, but the effect depends on which use is restricted",
          "The EU ban failed because the decline varied between states",
          "Human prescribing has no effect on resistance",
        ],
        answer: 1,
        explanation:
          "Заметки показывают эффект запрета в животноводстве и одновременно медленное изменение практики в медицине — значит результат зависит от того, какое использование ограничивают.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "Which choice most effectively combines the two sentences? «Sweden banned growth-promoting antibiotics in 1986. The European Union followed in 2006.»",
        options: [
          "Sweden banned growth-promoting antibiotics in 1986, and the European Union followed in 2006.",
          "Sweden banned growth-promoting antibiotics in 1986; the European Union, following in 2006.",
          "Sweden banned growth-promoting antibiotics in 1986, the European Union followed in 2006.",
          "Sweden banned growth-promoting antibiotics in 1986 the European Union followed in 2006.",
        ],
        answer: 0,
        explanation:
          "Вариант B — фрагмент (нет сказуемого в второй части), C — comma splice, D — отсутствует разделитель. Верный вариант — A.",
      },
    ],
  },
];

export default RW;
