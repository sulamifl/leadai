/**
 * IELTS Academic Reading — новый контент-пак с ключами ответов.
 *
 * В отличие от `app/main/ielts-data.json` (где у вопросов нет поля `answer`
 * и проверка возможна только через ИИ), здесь каждый вопрос имеет эталон,
 * поэтому результат считается детерминированно.
 *
 * Поддерживаемые типы:
 *  - "multiple_choice"      — индекс варианта;
 *  - "true_false_not_given" — варианты True / False / Not Given;
 *  - "matching_headings"    — выбор заголовка абзаца (индекс);
 *  - "short_answer"         — короткий ответ, `accept` — допустимые записи.
 */

const READING = [
  {
    id: "ielts-read-coral",
    title: "Passage 1: Coral Bleaching and the Symbiosis Trade-off",
    minutes: 20,
    passage: {
      title: "Coral Bleaching and the Symbiosis Trade-off",
      paragraphs: [
        "A reef looks like a single organism and is in fact an arrangement. The coral animal, a polyp, builds a limestone cup and inside its tissues houses single-celled algae called zooxanthellae. The algae photosynthesise and pass most of what they produce to the polyp; in return they receive shelter and nutrients from the polyp's waste. This partnership is the reason tropical reefs exist in waters that are otherwise too poor to support such dense life.",
        "The arrangement is, however, temperature-sensitive. When water warms by one or two degrees above the summer maximum and stays there for several weeks, the algae begin to produce damaging forms of oxygen. The polyp responds by expelling them. Since the algae supply both the coral's colour and the bulk of its energy, the colony turns white and begins to starve. This is bleaching. A bleached coral is not dead, and it can recover if the temperature falls and algae return within a few weeks. Prolonged bleaching, though, is usually fatal.",
        "The standard explanation treats bleaching as a failure of the partnership. Recent work suggests something more uncomfortable: the expulsion may be a form of damage control. Once the algae become harmful, a polyp that keeps them suffers cellular injury. Expelling them buys time, at the cost of energy. On this reading, bleaching is a gamble — the coral trades certain short-term damage for a chance of recovery, and the wager is lost when conditions do not improve.",
        "Heat is not the only stressor, and this matters for how reefs are managed. Sediment runoff from cleared land smothers polyps and blocks light. Overfishing removes the herbivores that control algae on the reef surface, so the algae that compete with coral for space are released from grazing. Nutrient pollution from agriculture favours those same competitors. A reef that is already strained by these pressures has less margin when a heat event arrives, which is why two reefs experiencing the same temperature anomaly can fare very differently.",
        "The practical consequence is that local management is not irrelevant just because the climate is warming. Reducing runoff, protecting herbivore populations and controlling nutrient discharge do not lower ocean temperature, but they raise the threshold at which a heat wave becomes a mortality event. That is a modest claim and an unpopular one, because it implies that the work available to a coastal community is genuinely worth doing even though the largest driver lies outside its control.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What do the zooxanthellae provide to the coral polyp?",
        options: [
          "Limestone for building the reef structure",
          "Shelter and protection from predators",
          "Photosynthesis products, which supply most of the polyp's energy",
          "Nutrients drawn from the surrounding water",
        ],
        answer: 2,
        explanation:
          "«The algae photosynthesise and pass most of what they produce to the polyp» — именно продукты фотосинтеза дают полипу энергию.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "According to the passage, what triggers the expulsion of algae?",
        options: [
          "A drop in water temperature",
          "Sustained warming of one or two degrees above the summer maximum",
          "Increased sediment in the water",
          "The absence of herbivorous fish",
        ],
        answer: 1,
        explanation:
          "«When water warms by one or two degrees above the summer maximum and stays there for several weeks» — это триггер.",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        prompt: "A bleached coral is always dead.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation:
          "В тексте прямо сказано: «A bleached coral is not dead, and it can recover». Утверждение ложно.",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "The passage states that bleaching always leads to the death of the colony within two weeks.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation:
          "Сказано обратное: восстановление возможно за несколько недель, если температура упадёт. Срок «две недели» как гарантия смерти не заявлен.",
      },
      {
        id: "q5",
        type: "true_false_not_given",
        prompt: "The author reports that researchers have measured the recovery rate of bleached corals on the Great Barrier Reef.",
        options: ["True", "False", "Not Given"],
        answer: 2,
        explanation:
          "В тексте нет данных о Большом Барьерном рифе и нет измерений скорости восстановления — информация отсутствует.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What is the newer interpretation of bleaching described in the third paragraph?",
        options: [
          "It is a failure of the symbiotic partnership",
          "It is a form of damage control that trades short-term harm for a chance to recover",
          "It is caused entirely by pollution rather than heat",
          "It is evidence that corals prefer cooler water",
        ],
        answer: 1,
        explanation:
          "«The expulsion may be a form of damage control… bleaching is a gamble» — новая трактовка.",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "How does overfishing affect a reef according to the passage?",
        options: [
          "It removes herbivores, allowing competing algae to grow unchecked",
          "It directly bleaches coral tissue",
          "It increases the number of zooxanthellae",
          "It raises the temperature of the water",
        ],
        answer: 0,
        explanation:
          "«Overfishing removes the herbivores that control algae on the reef surface» — конкуренты выходят из-под контроля.",
      },
      {
        id: "q8",
        type: "multiple_choice",
        prompt: "Why can two reefs with the same temperature anomaly fare differently?",
        options: [
          "Because one of them may be deeper",
          "Because local pressures such as runoff and overfishing reduce the reef's margin",
          "Because temperature anomalies are never equal",
          "Because coral species cannot be compared",
        ],
        answer: 1,
        explanation:
          "«A reef that is already strained by these pressures has less margin when a heat event arrives, which is why two reefs experiencing the same temperature anomaly can fare very differently.»",
      },
      {
        id: "q9",
        type: "short_answer",
        prompt:
          "Which agricultural pollutant is mentioned as favouring algae that compete with coral? Answer in ONE WORD.",
        answer: "nutrient",
        accept: ["nutrient", "nutrients"],
        explanation:
          "«Nutrient pollution from agriculture favours those same competitors» — искомое слово nutrient(s).",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "What is the author's overall position on local reef management?",
        options: [
          "It is pointless because ocean warming is outside local control",
          "It cannot lower temperature but raises the threshold for mortality, so it is worth doing",
          "It is more important than reducing global emissions",
          "It should be replaced by large-scale geoengineering",
        ],
        answer: 1,
        explanation:
          "Финал: местные меры «do not lower ocean temperature, but they raise the threshold» — скромная, но реальная польза.",
      },
    ],
  },
  {
    id: "ielts-read-tea",
    title: "Passage 2: Tea and the Making of a Global Commodity",
    minutes: 20,
    passage: {
      title: "Tea and the Making of a Global Commodity",
      paragraphs: [
        "For most of its long history tea was a regional product. It was consumed in south-west China, pressed into bricks, sometimes used as currency in exchange for horses. The transformation of a local leaf into a global commodity depended on three things that had little to do with the plant itself: a demand that could be created, a supply that could be controlled, and a vehicle that could move both.",
        "The demand was created in Britain, and it was created slowly. In the seventeenth century tea was an expensive novelty sold in coffee houses, taxed heavily and treated with suspicion by commentators who considered it an indulgence. What changed the economics was not persuasion but smuggling. So much tea entered the country illegally that the government, facing a collapse in revenue, cut the duty dramatically in 1784. The price fell, consumption climbed, and the habit became national within a generation.",
        "The supply was a problem of botany and espionage. China controlled production and prohibited the export of seeds and skilled workers. The British response was to send a botanist, Robert Fortune, into the interior in disguise, and to establish plantations in territories where the climate was suitable — first in the Himalayan foothills, later in Ceylon and Assam at scale. Once production existed outside China, the commodity could be priced by the buyer rather than by the producer.",
        "The vehicle was the clipper, and then the steamship. Speed mattered because tea deteriorates in the hold, and because the first shipments of a season commanded a premium. The clipper races of the 1860s were commercially meaningful, not merely sporting. When the Suez Canal opened in 1869 and steamers took over the route, the races ended within a decade. Speed had become routine, and the premium disappeared.",
        "The story is often told as an illustration of free trade. It is a poor one. Every stage — the tax cut that created mass demand, the plantations established through access obtained by disguise, the canal that shortened the route — was the product of state action or state-granted privilege. What the tea trade demonstrates is not that markets emerge spontaneously, but how thoroughly they can be constructed.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "matching_headings",
        prompt: "Which heading best fits the second paragraph?",
        options: [
          "How taxation and smuggling created mass demand",
          "The botany of the tea plant",
          "The end of the clipper races",
          "Tea as currency in China",
        ],
        answer: 0,
        explanation:
          "Второй абзац целиком о создании спроса: налог, контрабанда, снижение пошлины в 1784 году.",
      },
      {
        id: "q2",
        type: "matching_headings",
        prompt: "Which heading best fits the fourth paragraph?",
        options: [
          "The role of the state in creating demand",
          "Why speed mattered and how it stopped mattering",
          "The establishment of plantations in Assam",
          "Criticism of tea as an indulgence",
        ],
        answer: 1,
        explanation:
          "Четвёртый абзац — о скорости: клиперы, премия за первый урожай, затем пароходы и исчезновение премии.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Why did the British government cut the duty on tea in 1784?",
        options: [
          "To improve public health",
          "Because smuggling had reduced tax revenue",
          "To support plantations in India",
          "Because the Chinese government requested it",
        ],
        answer: 1,
        explanation:
          "«So much tea entered the country illegally that the government, facing a collapse in revenue, cut the duty dramatically in 1784.»",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "China permitted the export of tea seeds and skilled workers before the nineteenth century.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation:
          "«China controlled production and prohibited the export of seeds and skilled workers» — запрещала, а не разрешала.",
      },
      {
        id: "q5",
        type: "true_false_not_given",
        prompt: "Robert Fortune entered the Chinese interior in disguise.",
        options: ["True", "False", "Not Given"],
        answer: 0,
        explanation: "«to send a botanist, Robert Fortune, into the interior in disguise» — прямо сказано.",
      },
      {
        id: "q6",
        type: "true_false_not_given",
        prompt: "The passage states that Robert Fortune was paid by a private trading company.",
        options: ["True", "False", "Not Given"],
        answer: 2,
        explanation:
          "В тексте не указано, кто именно его нанял и оплачивал — эта деталь отсутствует.",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "What happened to the clipper races after the Suez Canal opened?",
        options: [
          "They became more popular",
          "They ended within about ten years because steamers took the route",
          "They moved to the Pacific",
          "They were banned by the government",
        ],
        answer: 1,
        explanation:
          "«When the Suez Canal opened in 1869 and steamers took over the route, the races ended within a decade.»",
      },
      {
        id: "q8",
        type: "short_answer",
        prompt:
          "Which canal is named as the reason clipper races ended? Answer in ONE WORD.",
        answer: "Suez",
        accept: ["suez", "Suez"],
        explanation: "«the Suez Canal opened in 1869» — именно он сделал маршрут пароходным.",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt: "Why does the author say the tea story is a poor illustration of free trade?",
        options: [
          "Because tea was never actually traded internationally",
          "Because every stage depended on state action or state-granted privilege",
          "Because the plant could not be grown outside China",
          "Because consumers did not benefit from lower prices",
        ],
        answer: 1,
        explanation:
          "Финал: «Every stage … was the product of state action or state-granted privilege».",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "Which statement best summarises the passage's argument?",
        options: [
          "Tea became global because of the plant's natural advantages",
          "Markets can be deliberately constructed rather than arising spontaneously",
          "Smuggling is beneficial in all historical cases",
          "The clipper was the most important invention of the nineteenth century",
        ],
        answer: 1,
        explanation:
          "«What the tea trade demonstrates is not that markets emerge spontaneously, but how thoroughly they can be constructed.»",
      },
    ],
  },
  {
    id: "ielts-read-sleep",
    title: "Passage 3: Sleep, Memory and the Cost of Interruption",
    minutes: 20,
    passage: {
      title: "Sleep, Memory and the Cost of Interruption",
      paragraphs: [
        "The claim that sleep is for the brain rather than merely for the body is now widely accepted, but the mechanism has taken decades to clarify. Early work focused on the idea that sleep simply protects memories from interference: an animal that is awake keeps receiving new input, and new input overwrites old traces. On this account, sleep is a kind of quiet room. Later research suggested something more active, in which the sleeping brain replays and reorganises what it learned.",
        "The evidence for replay is largely electrophysiological. Recordings from the hippocampus of rodents show that sequences of place-cell activity which occurred while the animal ran a maze reappear during subsequent slow-wave sleep, compressed in time. The replays are not identical: they are faster, and they sometimes run in reverse. Blocking these replays, or disrupting sleep at the moments they occur, impairs later performance on the same maze.",
        "In humans the picture is complicated by the fact that sleep stages differ in function. Slow-wave sleep, concentrated in the first half of the night, appears to favour the consolidation of declarative facts — what you know. Rapid eye movement sleep, which predominates in the second half, has been linked to procedural and emotional material — how you do things, and how you feel about them. The practical implication is that cutting sleep short does not cost all functions equally: a short night truncates REM disproportionately, so skills and emotional regulation may suffer before factual recall does.",
        "This has an uncomfortable consequence for institutions that treat sleep as a negotiable resource. medical training is the clearest case. Traditional schedules required residents to work shifts of thirty hours or more, on the assumption that the cost was mainly subjective fatigue. Once performance studies showed specific deficits in procedural tasks and in the recognition of deteriorating patients, the argument shifted: the risk was not to the trainee's comfort but to the patient's safety.",
        "What remains contested is the size of the effect outside the laboratory. Some researchers argue that the impairments measured in controlled settings are real but modest, and that practitioners compensate with checklists, supervision and experience. Others reply that compensation is itself a limited resource, and that the studies which fail to find large effects are often the ones conducted on people who are already adapted to chronic restriction. The disagreement is not about whether sleep matters. It is about how much of the deficit institutions can absorb before the word 'safe' stops applying.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What was the earlier explanation of sleep's role in memory?",
        options: [
          "Sleep actively replays and reorganises memories",
          "Sleep protects memories by reducing new input",
          "Sleep has no function for memory",
          "Sleep consolidates only procedural skills",
        ],
        answer: 1,
        explanation:
          "«an animal that is awake keeps receiving new input … On this account, sleep is a kind of quiet room» — защита от интерференции.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "What does the passage say about the replays observed in rodents?",
        options: [
          "They reproduce the running sequence exactly",
          "They occur only in REM sleep",
          "They are faster than the original sequences and may run in reverse",
          "They occur while the animal is running the maze",
        ],
        answer: 2,
        explanation:
          "«The replays are not identical: they are faster, and they sometimes run in reverse.»",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        prompt: "Disrupting sleep at the moments when replays occur impairs later maze performance.",
        options: ["True", "False", "Not Given"],
        answer: 0,
        explanation:
          "«Blocking these replays, or disrupting sleep at the moments they occur, impairs later performance on the same maze.»",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "Slow-wave sleep is concentrated in the second half of the night.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation:
          "Наоборот: медленноволновой сон преобладает в первой половине ночи, а REM — во второй.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "Why does a short night potentially harm skills more than factual recall?",
        options: [
          "Because factual memory is not affected by sleep",
          "Because short sleep truncates REM, which is linked to procedural material",
          "Because skills are learned only at night",
          "Because facts are consolidated during wakefulness",
        ],
        answer: 1,
        explanation:
          "«A short night truncates REM disproportionately, so skills and emotional regulation may suffer before factual recall does.»",
      },
      {
        id: "q6",
        type: "short_answer",
        prompt:
          "In which brain structure were the place-cell recordings made? Answer in ONE WORD.",
        answer: "hippocampus",
        accept: ["hippocampus", "Hippocampus"],
        explanation: "«Recordings from the hippocampus of rodents show…»",
      },
      {
        id: "q7",
        type: "multiple_choice",
        prompt: "Why does the passage mention medical training?",
        options: [
          "To show that doctors sleep more than other workers",
          "As an example of an institution that treated sleep as negotiable",
          "To argue that checklists are unnecessary",
          "To illustrate how memory consolidation works in students",
        ],
        answer: 1,
        explanation:
          "«institutions that treat sleep as a negotiable resource. Medical training is the clearest case.»",
      },
      {
        id: "q8",
        type: "multiple_choice",
        prompt: "What shifted the argument about residents' schedules?",
        options: [
          "Complaints from trainees about fatigue",
          "Evidence of specific performance deficits affecting patient safety",
          "Changes in hospital funding",
          "New regulations on working hours",
        ],
        answer: 1,
        explanation:
          "«Once performance studies showed specific deficits … the argument shifted: the risk was … to the patient's safety.»",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt: "What do researchers disagree about, according to the final paragraph?",
        options: [
          "Whether sleep affects memory at all",
          "The size of the effect outside the laboratory",
          "Whether REM sleep exists in humans",
          "Whether place cells are found in rodents",
        ],
        answer: 1,
        explanation:
          "«What remains contested is the size of the effect outside the laboratory.»",
      },
      {
        id: "q10",
        type: "multiple_choice",
        prompt: "Which of the following best describes the author's stance?",
        options: [
          "Sleep matters; the open question is how much deficit institutions can absorb",
          "Sleep research is inconclusive and should be ignored by policymakers",
          "Medical training schedules are already optimal",
          "Laboratory studies overstate the importance of sleep",
        ],
        answer: 0,
        explanation:
          "«The disagreement is not about whether sleep matters. It is about how much of the deficit institutions can absorb.»",
      },
    ],
  },
  {
    id: "ielts-read-bridges",
    title: "Passage 4: Why Suspension Bridges Fail",
    minutes: 20,
    passage: {
      title: "Why Suspension Bridges Fail",
      paragraphs: [
        "A suspension bridge is an exercise in transferring load. The deck hangs from cables, the cables hang from towers, and the towers push the whole assembly into the ground. Because the main cables are in tension rather than compression, the structure can span distances that no beam of comparable weight could cross. This is why suspension bridges dominate the list of the longest spans ever built.",
        "The same property that makes the form efficient makes it vulnerable. A structure held in tension has very little inherent damping: once it begins to move, it tends to keep moving. Wind does not need to be strong to be dangerous. What matters is not the wind's speed but the way it sheds vortices alternately from either side of the deck, pushing the span first one way and then the other at a frequency close to the structure's own.",
        "The most famous failure is not the most instructive one. The Tacoma Narrows bridge collapsed in 1940 in a moderate wind, and the event is often described as resonance. Technically it was something subtler: aeroelastic flutter, in which the deck's twisting motion altered the airflow, which in turn fed the twisting. The distinction matters, because resonance can be calculated from a static design, while flutter depends on the interaction between a moving shape and the air around it. A deck that behaves well at rest can be unstable once it starts to move.",
        "The engineering response was not to abandon long spans but to change the cross-section. The solid plate girder of Tacoma Narrows was replaced, in later designs, by stiffening trusses with open voids through which air can pass, and by decks whose edges are shaped to break up the regular shedding of vortices. The second response was to add damping deliberately, with tuned mass dampers — heavy masses on springs that move out of phase with the bridge and absorb its energy.",
        "There is a lesson here that extends beyond bridges. In any system where the response to a disturbance feeds back into the disturbance itself, the safe design question is not 'how strong is it?' but 'what happens when it starts to move?'. Strength resists a known load. Stability is a property of a relationship between a structure and its environment, and it can fail at loads far below the ones the structure was designed to resist.",
      ],
    },
    questions: [
      {
        id: "q1",
        type: "matching_headings",
        prompt: "Which heading best fits the third paragraph?",
        options: [
          "A failure often mislabelled",
          "How damping is added",
          "The economics of long spans",
          "Vortex shedding in water",
        ],
        answer: 0,
        explanation:
          "Третий абзац посвящён тому, что катастрофу в Такоме часто неверно называют резонансом — на самом деле это флаттер.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Why can a suspension bridge span distances a beam cannot?",
        options: [
          "Because its main cables are in tension rather than compression",
          "Because it is made of lighter steel",
          "Because it does not need towers",
          "Because wind loads are smaller at long spans",
        ],
        answer: 0,
        explanation:
          "«Because the main cables are in tension rather than compression, the structure can span distances…»",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "According to the passage, what property makes a tension structure vulnerable?",
        options: [
          "It has very little inherent damping",
          "It cannot be built over water",
          "It requires more concrete",
          "It has too much mass at the centre",
        ],
        answer: 0,
        explanation: "«A structure held in tension has very little inherent damping». ",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "The passage states that only strong winds endanger suspension bridges.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation:
          "Наоборот: «Wind does not need to be strong to be dangerous» — важна частота срыва вихрей, а не скорость.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "Why is the distinction between resonance and flutter important?",
        options: [
          "Resonance can be calculated from a static design, while flutter depends on interaction with airflow",
          "Flutter occurs only in very strong wind",
          "Resonance only affects buildings, not bridges",
          "Flutter can be prevented by increasing the deck's weight",
        ],
        answer: 0,
        explanation:
          "«resonance can be calculated from a static design, while flutter depends on the interaction between a moving shape and the air around it».",
      },
      {
        id: "q6",
        type: "true_false_not_given",
        prompt: "The Tacoma Narrows bridge collapsed in a hurricane.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation: "«collapsed in 1940 in a moderate wind» — не ураган.",
      },
      {
        id: "q7",
        type: "short_answer",
        prompt:
          "What device, added to later bridges, moves out of phase with the structure to absorb energy? Answer in up to THREE WORDS.",
        answer: "tuned mass dampers",
        accept: ["tuned mass dampers", "tuned mass damper", "mass dampers"],
        explanation: "«tuned mass dampers — heavy masses on springs that move out of phase with the bridge».",
      },
      {
        id: "q8",
        type: "multiple_choice",
        prompt: "How did later designs change the deck cross-section?",
        options: [
          "They made it solid and heavier",
          "They used open trusses and shaped edges to break up vortex shedding",
          "They removed the stiffening trusses",
          "They replaced steel with concrete",
        ],
        answer: 1,
        explanation:
          "«stiffening trusses with open voids through which air can pass, and by decks whose edges are shaped to break up the regular shedding of vortices».",
      },
      {
        id: "q9",
        type: "multiple_choice",
        prompt: "What is the broader lesson the author draws?",
        options: [
          "Bridges should be built shorter",
          "Stability is a relationship between structure and environment, not just strength against a known load",
          "Wind tunnels are unnecessary",
          "All long spans are inherently unsafe",
        ],
        answer: 1,
        explanation:
          "Финал: «Strength resists a known load. Stability is a property of a relationship between a structure and its environment».",
      },
      {
        id: "q10",
        type: "true_false_not_given",
        prompt: "The passage reports that vortex shedding was first described by a bridge engineer.",
        options: ["True", "False", "Not Given"],
        answer: 2,
        explanation:
          "В тексте нет сведений о том, кто впервые описал срыв вихрей, — информации нет.",
      },
    ],
  },
];

export default READING;
