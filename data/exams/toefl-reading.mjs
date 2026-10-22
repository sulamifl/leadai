/**
 * TOEFL iBT — Reading.
 *
 * Оригинальные академические тексты в стиле экзамена: 4 пассажа,
 * 10 вопросов на каждый, у каждого вопроса есть ключ (`answer`) и
 * объяснение (`explanation`) — поэтому секция проверяется детерминированно,
 * без участия модели.
 *
 * Формат вопроса:
 *   { id, type: "multiple_choice", prompt, options: string[], answer: number,
 *     explanation }
 *   { id, type: "true_false", prompt, options: ["True","False","Not given"],
 *     answer: number, explanation }
 */

const READING = [
  {
    id: "toefl-read-horse",
    title: "The Domestication of the Horse and the Steppe Economy",
    minutes: 18,
    passage: {
      title: "The Domestication of the Horse and the Steppe Economy",
      paragraphs: [
        "For most of human history, the horse was prey rather than partner. Bands of hunter-gatherers in the Eurasian steppe pursued wild horses for meat and hide, and the animals that survived were those most wary of people. Then, roughly five thousand years ago, a population of horses in the western steppe began to change in ways that archaeology can measure: their bones became more robust, their teeth showed wear consistent with the bit, and their genetic diversity narrowed sharply. Something had shifted from hunting to herding, and the consequences would reshape trade, warfare and agriculture across two continents.",
        "The earliest direct evidence of riding is indirect but persuasive. A horse's skeleton from a site in what is now Kazakhstan shows a pattern of stress on the vertebrae and the lower legs that is difficult to explain except by regular riding. Human burials from the same period contain bridle fittings made of antler and bone, and a few individuals show skeletal changes in the pelvis and thighs associated with a lifetime in the saddle. What is striking is how early these traces appear relative to the appearance of wheeled vehicles. Riding, in other words, did not wait for the invention of the chariot; it preceded it, and it may have made pastoral movement across enormous distances practical centuries before any wheel rolled.",
        "The economic logic of horse herding is peculiar. Horses cannot digest cellulose as efficiently as cattle or sheep, so they require better pasture and more of it. They also cannot be milked as heavily or as predictably. Yet horses offer something no other domestic animal of the steppe could match: speed. A rider can cover sixty to eighty kilometres in a day and arrive with the capacity to move again the next morning. That capacity turned the steppe from a barrier into a corridor. Herders who could reach distant pastures, markets and allies in days rather than weeks gained an advantage that no amount of additional livestock could offset.",
        "Linguistic evidence adds a further layer. Words reconstructed for the Proto-Indo-European vocabulary include terms for the horse, the bridle, the reins and the wagon, and the reconstructed forms suggest that these technologies were already bundled together when the language began to spread. Some scholars argue that mounted mobility explains the rapid diffusion of Indo-European languages more convincingly than a slow expansion of farmers. Others caution that the chronology is too loose to support a strong claim, and that a shared vocabulary of transport may reflect trade rather than migration.",
        "What remains contested is the timing of what might be called true domestication. A population that is managed but still largely wild is not the same as a herd bred for docility and strength. The genetic record suggests that the lineage that ultimately spread across the world originated in the lower Volga region and expanded only in the third millennium BCE, well after the first evidence of riding. In this reading, riding may have been invented and lost more than once, with the decisive and durable domestication arriving late. The horse, on this account, was not tamed in a single act of ingenuity but assembled gradually: first as a source of food, then as a mount, and only finally as the engine of an entire way of life.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt:
          "According to paragraph 1, what change in horse remains suggests a shift from hunting to herding?",
        options: [
          "Bones became more robust and teeth showed bit wear.",
          "Bones became smaller and more numerous.",
          "Horses began to be buried with their owners.",
          "Horse teeth became longer and more curved.",
        ],
        answer: 0,
        explanation:
          "Первый абзац прямо перечисляет «more robust» кости, следы удил на зубах и узкое генетическое разнообразие.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt:
          "Why does the author mention wheeled vehicles in paragraph 2?",
        options: [
          "To show that riding developed before the chariot appeared.",
          "To argue that wheels were invented in the steppe.",
          "To explain why riding replaced transport by cart.",
          "To date the earliest horse burials accurately.",
        ],
        answer: 0,
        explanation:
          "Автор подчёркивает: «Riding … did not wait for the invention of the chariot; it preceded it».",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt:
          "The word \u201cpeculiar\u201d in paragraph 3 is closest in meaning to:",
        options: ["unusual", "efficient", "profitable", "temporary"],
        answer: 0,
        explanation:
          "Далее автор объясняет, что экономика коневодства не похожа на экономику разведения других животных, — то есть она необычна.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt:
          "According to paragraph 3, what advantage did horses give steppe herders that other livestock could not?",
        options: [
          "They produced more milk than cattle.",
          "They digested cellulose better than sheep.",
          "They allowed people to cover large distances quickly.",
          "They required less pasture than other animals.",
        ],
        answer: 2,
        explanation:
          "Абзац утверждает обратное по трём пунктам и указывает единственное преимущество — скорость передвижения.",
      },
      {
        id: "q5",
        type: "true_false",
        prompt:
          "The passage states that horses digest cellulose more efficiently than cattle.",
        options: ["True", "False", "Not given"],
        answer: 1,
        explanation:
          "«Horses cannot digest cellulose as efficiently as cattle or sheep» — утверждение противоположно тексту.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "What does paragraph 4 say about the reconstructed Proto-Indo-European vocabulary?",
        options: [
          "It proves that Indo-European speakers invented the wagon.",
          "It indicates that horse-related technologies were already associated with each other.",
          "It shows that the language spread before horses were domesticated.",
          "It contains no words for transport.",
        ],
        answer: 1,
        explanation:
          "«…the reconstructed forms suggest that these technologies were already bundled together».",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt:
          "Which of the following best describes the sceptics' view in paragraph 4?",
        options: [
          "Mounted mobility was impossible before the wagon.",
          "Shared transport vocabulary may reflect trade rather than migration.",
          "Indo-European languages originated in the lower Volga region.",
          "Linguistic evidence is more reliable than genetic evidence.",
        ],
        answer: 1,
        explanation:
          "Скептики предупреждают, что общая лексика может отражать торговлю, а не миграцию.",
      },
      {
        id: "q8",
        type: "multiple_choice",
        prompt:
          "According to paragraph 5, why is the timing of domestication still debated?",
        options: [
          "Because no horse remains have been found from the relevant period.",
          "Because managed wild populations are not the same as bred domestic herds.",
          "Because the genetic evidence contradicts the archaeological evidence completely.",
          "Because riding was never practised in the lower Volga region.",
        ],
        answer: 1,
        explanation:
          "«A population that is managed but still largely wild is not the same as a herd bred for docility and strength».",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt:
          "The phrase \u201cassembled gradually\u201d at the end of the passage suggests that the horse was:",
        options: [
          "domesticated in a single deliberate experiment",
          "used for food before being used for transport",
          "tamed independently in many regions at once",
          "abandoned and then re-domesticated only once",
        ],
        answer: 1,
        explanation:
          "Автор перечисляет этапы: «first as a source of food, then as a mount, and only finally…».",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "Which sentence best summarises the passage?",
        options: [
          "Horse domestication was a single event that immediately produced chariot warfare.",
          "Riding and herding developed over a long period and together transformed steppe economies.",
          "Linguists have proved that horses spread Indo-European languages.",
          "Horses were poor domestic animals because they require better pasture.",
        ],
        answer: 1,
        explanation:
          "Главная мысль: постепенное одомашнивание и его экономические последствия для степи.",
      },
    ],
  },
  {
    id: "toefl-read-biolum",
    title: "Bioluminescence and the Ecology of the Deep Sea",
    minutes: 18,
    passage: {
      title: "Bioluminescence and the Ecology of the Deep Sea",
      paragraphs: [
        "Below roughly two hundred metres, sunlight fades to nothing. Yet the deep ocean is not dark in the way a cellar is dark. It is full of light that living organisms produce themselves. Estimates based on trawl surveys and submersible observations suggest that the great majority of animals in the open water column can emit light, and that bioluminescence has evolved independently dozens of times across unrelated groups. The chemistry is remarkably consistent: a light-emitting molecule, luciferin, is oxidised by an enzyme, luciferase, releasing energy as photons. What varies is the purpose.",
        "The most common function is defensive. A shrimp that releases a cloud of glowing fluid can blind a predator long enough to escape, in the same way that ink confuses a fish. Other animals use light as a decoy: some deep-sea squid eject luminous particles while jetting away in the opposite direction. Still others rely on counterillumination. An animal that swims at a depth where faint downwelling light still exists is silhouetted from below against the brighter surface. By producing light on its underside that matches the intensity of the background, it erases its own shadow and becomes nearly invisible to predators hunting upward.",
        "Counterillumination is a demanding trick. The animal must measure ambient light and adjust its output continuously as it moves. Some species have evolved elaborate light organs with filters and reflectors that shape the emission, and at least one squid hosts symbiotic bacteria that supply the glow. Because the match must be close, researchers have used this behaviour as evidence that deep-sea animals can perceive the direction and intensity of light far more precisely than was once assumed.",
        "Light is also used to find food. A predator may dangle a luminous lure in front of a waiting mouth, a strategy familiar from the anglerfish but widespread among dragonfish and viperfish as well. Some species produce a beam of red light, a wavelength that most deep-sea animals cannot see, and use it as a searchlight to illuminate prey without revealing their own position. This is a striking example of a private communication channel: the signal is visible to the sender and to a few species with the necessary receptors, but invisible to most of the community.",
        "Finally, light serves reproduction. In the mesopelagic zone, where individuals are sparse and encounters are rare, flashing patterns can advertise species, sex and readiness to mate. Because different species flash at different rhythms, the display also functions as a barrier against hybridisation. The result is a communication system that operates in a medium where visual signals would otherwise be impossible, and it exists at a scale that human observers rarely appreciate: a single sweep of a submersible's lights can reveal thousands of small flashes that were invisible a moment before.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the main purpose of paragraph 1?",
        options: [
          "To explain the chemistry of luciferin in detail.",
          "To establish that bioluminescence is widespread and chemically similar across groups.",
          "To argue that deep-sea animals cannot see light.",
          "To describe how submersibles are built.",
        ],
        answer: 1,
        explanation:
          "Первый абзац задаёт тезис: свечение массово и химически единообразно, различаются функции.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "The word \u201cdecoy\u201d in paragraph 2 is closest in meaning to:",
        options: ["a distraction", "a weapon", "a shelter", "a signal of danger"],
        answer: 0,
        explanation:
          "Далее идёт пример: кальмар выбрасывает светящиеся частицы и уходит в другую сторону — отвлечение.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "What problem does counterillumination solve?",
        options: [
          "It helps animals find mates in the dark.",
          "It makes an animal's silhouette visible from below.",
          "It removes an animal's silhouette against faint surface light.",
          "It allows animals to see red light.",
        ],
        answer: 2,
        explanation:
          "«…it erases its own shadow and becomes nearly invisible to predators hunting upward».",
      },
      {
        id: "q4",
        type: "true_false",
        prompt:
          "According to paragraph 3, counterillumination requires constant adjustment to ambient light.",
        options: ["True", "False", "Not given"],
        answer: 0,
        explanation:
          "«The animal must measure ambient light and adjust its output continuously as it moves».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "Why is red bioluminescence described as a \u201cprivate communication channel\u201d?",
        options: [
          "Because only deep-sea animals can produce red light.",
          "Because most deep-sea animals cannot see red light, so prey stay unaware.",
          "Because red light travels further than blue light.",
          "Because it is used only during reproduction.",
        ],
        answer: 1,
        explanation:
          "Абзац 4: красный свет невидим для большинства обитателей, поэтому работает как поисковый прожектор.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "According to paragraph 4, which animals use a luminous lure in front of the mouth?",
        options: [
          "Only the anglerfish.",
          "Anglerfish, dragonfish and viperfish.",
          "Only squid and shrimp.",
          "Bacteria living in the water column.",
        ],
        answer: 1,
        explanation:
          "«…a strategy familiar from the anglerfish but widespread among dragonfish and viperfish as well».",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt:
          "In paragraph 5, why do different species flash at different rhythms?",
        options: [
          "To conserve energy in a food-poor environment.",
          "To avoid being seen by predators.",
          "To advertise species identity and prevent hybridisation.",
          "To synchronise with the daylight cycle.",
        ],
        answer: 2,
        explanation:
          "«…the display also functions as a barrier against hybridisation».",
      },
      {
        id: "q8",
        type: "multiple_choice",
        prompt:
          "Which of the following can be inferred about the mesopelagic zone?",
        options: [
          "Animals there are densely packed together.",
          "Visual signals are useful because encounters between individuals are rare.",
          "No bioluminescent animals live there.",
          "Predators there hunt mostly by smell.",
        ],
        answer: 1,
        explanation:
          "Абзац 5: особи редки, встречи случайны — поэтому вспышки служат для рекламы себя.",
      },
      {
        id: "q9",
        type: "true_false",
        prompt:
          "The passage states that bioluminescence evolved only once in a single lineage.",
        options: ["True", "False", "Not given"],
        answer: 1,
        explanation:
          "«…bioluminescence has evolved independently dozens of times across unrelated groups».",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "Which sentence best expresses the main idea of the passage?",
        options: [
          "Deep-sea light is produced by bacteria alone.",
          "Bioluminescence serves defence, foraging and reproduction, and is extremely common in the deep ocean.",
          "Counterillumination is the only known function of bioluminescence.",
          "Human observers can easily see most deep-sea light displays.",
        ],
        answer: 1,
        explanation:
          "Пассаж перечисляет три функции и подчёркивает распространённость явления.",
      },
    ],
  },
  {
    id: "toefl-read-print",
    title: "Printing and the Standardisation of Written Language",
    minutes: 18,
    passage: {
      title: "Printing and the Standardisation of Written Language",
      paragraphs: [
        "Before mechanical printing, a manuscript was copied by hand, and every copy was a separate performance of the text. Scribes introduced variants, corrected what they took to be errors, and adapted spelling to local habit. Variation was not considered a fault; it was an ordinary consequence of manual reproduction. A reader in one town might encounter a word spelled three different ways in three different books and think nothing of it.",
        "Movable type changed the economics of variation. Setting a page in metal required a decision about each letterform, and once that decision was made it was repeated identically for every copy of the edition. A printer who had invested in a particular spelling of a common word had a financial reason to keep using it. Over a few generations, the accumulated choices of workshops in a handful of cities became a de facto standard that authors elsewhere were expected to follow.",
        "The effect on orthography was therefore less a matter of deliberate reform than of industrial inertia. English spelling, notoriously irregular, preserves many forms that were fixed by printers in the sixteenth and seventeenth centuries and that no longer match pronunciation. Some of these forms were introduced by compositors who were paid by the line and preferred longer spellings, and some by scholars who wished to signal Latin origins. The result was not a plan but a residue.",
        "Printing also changed what counted as a text. Because an edition was a single object reproduced many times, it became possible to speak of the same book being read simultaneously by people who had never met. Citation could assume that a page number meant the same thing to everyone. Scholarship began to depend on this shared grid, and the practice of referring to a specific edition became part of the machinery of argument.",
        "Yet standardisation was uneven. Regions at the periphery of the print trade continued to write in local forms for centuries, and handwriting retained flexibility that print did not. Nor did printing immediately displace manuscript circulation: political and religious authorities sometimes preferred handwritten copies precisely because they were harder to trace. The consequence is that the history of standardisation is best understood not as the victory of print over writing but as a long negotiation in which print supplied a reference point rather than a total system.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What does paragraph 1 say about variation in manuscripts?",
        options: [
          "It was regarded as an ordinary result of hand copying.",
          "It was punished by printers.",
          "It was eliminated by scribes.",
          "It appeared only in religious texts.",
        ],
        answer: 0,
        explanation:
          "«Variation was not considered a fault; it was an ordinary consequence of manual reproduction».",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Why did printers tend to keep using the same spellings?",
        options: [
          "Because authors demanded it.",
          "Because they had invested in the type.",
          "Because the government required it.",
          "Because spelling reform was popular.",
        ],
        answer: 1,
        explanation:
          "Абзац 2: типограф, вложившийся в написание, имел финансовый стимул его сохранять.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "The word \u201cinertia\u201d in paragraph 3 refers to:",
        options: [
          "deliberate government policy",
          "the tendency of established practice to persist",
          "the physical weight of metal type",
          "the resistance of authors to printing",
        ],
        answer: 1,
        explanation:
          "Автор противопоставляет «deliberate reform» и «industrial inertia» — инерцию практики.",
      },
      {
        id: "q4",
        type: "true_false",
        prompt:
          "According to the passage, English spelling was reformed systematically by scholars.",
        options: ["True", "False", "Not given"],
        answer: 1,
        explanation:
          "«The result was not a plan but a residue» — реформы как плана не было.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "What does paragraph 4 identify as a consequence of identical copies?",
        options: [
          "Readers could compare editions more easily than before.",
          "Authors stopped writing for a wide audience.",
          "Page references became meaningful across copies.",
          "Manuscripts disappeared within a decade.",
        ],
        answer: 2,
        explanation:
          "«Citation could assume that a page number meant the same thing to everyone».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "Why might authorities have preferred handwritten copies, according to paragraph 5?",
        options: [
          "They were cheaper to produce.",
          "They were harder to trace.",
          "They were more accurate.",
          "They could be printed later.",
        ],
        answer: 1,
        explanation:
          "«…precisely because they were harder to trace».",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "Which sentence best states the author's conclusion?",
        options: [
          "Print replaced handwriting completely by 1700.",
          "Standardisation was a negotiation in which print provided a reference point.",
          "Printing had no effect on scholarship.",
          "Local spelling was eliminated by law.",
        ],
        answer: 1,
        explanation:
          "Последний абзац формулирует вывод: «a long negotiation in which print supplied a reference point».",
      },
      {
        id: "q8",
        type: "true_false",
        prompt:
          "The passage claims that compositors sometimes preferred longer spellings for economic reasons.",
        options: ["True", "False", "Not given"],
        answer: 0,
        explanation:
          "«…compositors who were paid by the line and preferred longer spellings».",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt: "According to paragraph 2, how did workshop choices become a standard?",
        options: [
          "Through a single royal decree.",
          "Through accumulated choices repeated across editions.",
          "Through the invention of the dictionary.",
          "Through scribal correction.",
        ],
        answer: 1,
        explanation:
          "«…the accumulated choices of workshops in a handful of cities became a de facto standard».",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "The passage is primarily concerned with:",
        options: [
          "the technical details of casting metal type",
          "how printing shaped standards of written language and scholarship",
          "the biography of early printers",
          "why handwriting is superior to print",
        ],
        answer: 1,
        explanation:
          "Сквозная тема — влияние печати на стандартизацию языка и научную практику.",
      },
    ],
  },
  {
    id: "toefl-read-heat",
    title: "Urban Heat Islands and the Physics of Cool Roofs",
    minutes: 18,
    passage: {
      title: "Urban Heat Islands and the Physics of Cool Roofs",
      paragraphs: [
        "A city is usually warmer than the countryside around it, and the difference can reach several degrees at night. The phenomenon, known as the urban heat island, has several causes. Dark surfaces such as asphalt absorb solar radiation and release it slowly after sunset. Buildings trap heat in narrow streets and reduce the sky view that would otherwise let surfaces radiate to space. Vegetation, which cools the air by evaporation, is scarce. Vehicles and air conditioners add waste heat directly.",
        "The most straightforward intervention is to change the surface. A conventional dark roof may absorb more than eighty per cent of incoming sunlight. A cool roof, painted white or coated with a reflective material, can absorb less than thirty per cent and stay tens of degrees cooler at midday. Because the roof is the surface with the largest unobstructed exposure to the sky, its reflectivity has a disproportionate effect on the building's heat load and on the air above it.",
        "Reflectivity, however, is only half the story. A surface that reflects sunlight is not necessarily cool if it also radiates poorly in the infrared. The relevant property is the combination of solar reflectance and thermal emittance, and materials that score well on both are called cool roofs in the technical sense. A shiny metal roof, for example, may reflect visible light strongly yet trap heat because its emittance is low. Rating systems therefore report both values rather than a single number.",
        "There are trade-offs. Reflected sunlight has to go somewhere, and in a dense arrangement of tall buildings it may simply fall onto a neighbouring facade, raising its temperature instead. In winter, a reflective roof reduces the solar gain that would have helped heat the building, increasing fuel use in cold climates. Dust and biological growth gradually lower reflectance, so the benefit decays unless the roof is cleaned or recoated. And the effect on air temperature at street level is smaller than the effect on roof-level temperature, because the heat that is not absorbed at the roof is not automatically removed from the neighbourhood.",
        "None of this makes cool roofs useless; it makes them a partial instrument. Cities that have measured results report meaningful reductions in peak roof temperature and modest reductions in air temperature, with the largest benefits in low-rise districts with wide sky exposure. Where the goal is to protect vulnerable residents during heat waves, cool roofs are usually combined with shade trees, permeable surfaces and building insulation. The physics is simple; the urban design is not.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which of the following is NOT listed as a cause of the urban heat island?",
        options: [
          "Dark surfaces absorbing solar radiation",
          "Reduced sky view in narrow streets",
          "Waste heat from vehicles and air conditioners",
          "Increased evaporation from vegetation",
        ],
        answer: 3,
        explanation:
          "Растительность, наоборот, охлаждает воздух испарением; её нехватка — причина нагрева.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Why does a roof have a disproportionate effect on a building's heat load?",
        options: [
          "Because it is made of metal.",
          "Because it has the largest unobstructed exposure to the sky.",
          "Because it is usually the oldest part of a building.",
          "Because air conditioners are installed there.",
        ],
        answer: 1,
        explanation:
          "Абзац 2: крыша — поверхность с наибольшей незатенённой экспозицией к небу.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "According to paragraph 3, why can a shiny metal roof still be hot?",
        options: [
          "Because it absorbs visible light strongly.",
          "Because its thermal emittance is low.",
          "Because it reflects infrared radiation too well.",
          "Because it is always covered with dust.",
        ],
        answer: 1,
        explanation:
          "«…may reflect visible light strongly yet trap heat because its emittance is low».",
      },
      {
        id: "q4",
        type: "true_false",
        prompt:
          "Rating systems for cool roofs report solar reflectance and thermal emittance separately.",
        options: ["True", "False", "Not given"],
        answer: 0,
        explanation:
          "«Rating systems therefore report both values rather than a single number».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What is one disadvantage of reflective roofs mentioned in paragraph 4?",
        options: [
          "They increase dust accumulation on streets.",
          "Reflected light may heat a neighbouring facade.",
          "They cannot be painted white.",
          "They reduce thermal emittance permanently.",
        ],
        answer: 1,
        explanation:
          "«…it may simply fall onto a neighbouring facade, raising its temperature instead».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Why is the winter effect of cool roofs a concern?",
        options: [
          "They become brittle in cold weather.",
          "They reduce useful solar gain, increasing fuel use.",
          "They reflect snow into buildings.",
          "They prevent rain from reaching roofs.",
        ],
        answer: 1,
        explanation:
          "«In winter, a reflective roof reduces the solar gain that would have helped heat the building».",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt:
          "Which statement best reflects the author's view in the final paragraph?",
        options: [
          "Cool roofs are ineffective and should be abandoned.",
          "Cool roofs are useful but must be combined with other measures.",
          "Cool roofs alone can eliminate urban heat islands.",
          "Cool roofs work best in dense high-rise districts.",
        ],
        answer: 1,
        explanation:
          "«None of this makes cool roofs useless; it makes them a partial instrument» + перечень мер.",
      },
      {
        id: "q8",
        type: "true_false",
        prompt:
          "The passage states that the effect on street-level air temperature equals the effect on roof temperature.",
        options: ["True", "False", "Not given"],
        answer: 1,
        explanation:
          "«…the effect on air temperature at street level is smaller than the effect on roof-level temperature».",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt: "The word \u201cdecays\u201d in paragraph 4 is closest in meaning to:",
        options: ["improves gradually", "decreases over time", "doubles", "stabilises"],
        answer: 1,
        explanation:
          "Пыль и биологический налёт снижают отражательную способность — выгода со временем падает.",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "Which best describes the organisation of the passage?",
        options: [
          "A definition, then a solution, then its limits and conditions",
          "A chronology of inventions",
          "A comparison of two cities",
          "An argument against measurement",
        ],
        answer: 0,
        explanation:
          "Сначала явление, затем решение (cool roofs), затем ограничения и условия применения.",
      },
    ],
  },
];

export default READING;
