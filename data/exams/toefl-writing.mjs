/**
 * TOEFL Writing — задания, оцениваемые по рубрике (kind: "rubric").
 *
 * Контент здесь не имеет «правильного ответа»: он даёт материал для письма,
 * а оценку выставляет рубричный движок (`lib/exams/rubrics.mjs` +
 * `lib/exams/scoring.mjs`) по четырём критериям TOEFL Writing 0–5.
 *
 * Типы заданий:
 *  - "integrated"          — чтение + лекция, нужно сопоставить позиции;
 *  - "academic_discussion" — короткий ответ в дискуссии с профессором и двумя студентами.
 */

const WRITING = [
  {
    id: "toefl-write-integrated-roads",
    title: "Integrated: Road Pricing in City Centres",
    type: "integrated",
    minutes: 20,
    minWords: 150,
    prompt:
      "Summarise the points made in the lecture, being sure to explain how they cast doubt on the specific points made in the reading passage.",
    reading: {
      title: "Why Congestion Charges Work",
      paragraphs: [
        "Several European cities have introduced charges on vehicles entering the central district during working hours. The stated aim is to reduce congestion, and the reported results appear impressive: traffic volumes in the charged zone have fallen by roughly a fifth, average speeds have risen, and revenues have funded public transport improvements.",
        "Supporters offer three arguments. First, a charge makes drivers confront the cost their journey imposes on others, which economists call internalising an externality. Second, the revenue is recycled into buses and cycling infrastructure, so alternatives improve at the same time as driving becomes more expensive. Third, because the charge is continuous rather than a one-off tax, it shapes habitual behaviour rather than merely raising money once.",
        "The policy also appears to be popular in retrospect. In cities where a charge was introduced, surveys a few years later report majority support, which suggests that opposition before implementation is largely a projection of feared inconvenience rather than a settled preference.",
      ],
    },
    listening:
      "The lecturer accepts that measured traffic inside the zone fell, but argues that the reading mistakes a local measurement for a system-wide result. She notes that in at least two cities, traffic on the ring roads just outside the boundary increased, because drivers diverted rather than disappeared. Emissions, which do not respect a charging boundary, therefore fell less than the zone figures imply. The lecturer then turns to the revenue argument. She points out that the money is not new: in most cases it was reallocated from existing transport budgets, so the net increase in public transport spending was small. Her third point concerns the survey evidence. She argues that retrospective support is a poor test, because people who were strongly opposed may have moved out of the city or stopped driving, so the remaining population is not the same population that was polled before. She concludes that the policy may still be justified, but not on the grounds the reading offers.",
    guidance: [
      "Не пересказывай чтение и лекцию по отдельности — строй ответ вокруг трёх конкретных возражений.",
      "Явно используй связки противопоставления: whereas, in contrast, the lecturer disputes.",
      "Не добавляй собственное мнение: это задание на точность передачи, а не на аргументацию.",
    ],
  },
  {
    id: "toefl-write-integrated-zoos",
    title: "Integrated: The Case Against Zoos as Conservation",
    type: "integrated",
    minutes: 20,
    minWords: 150,
    prompt:
      "Summarise the points made in the lecture, being sure to explain how they cast doubt on the specific points made in the reading passage.",
    reading: {
      title: "Zoos as Conservation Institutions",
      paragraphs: [
        "Modern zoos present themselves primarily as conservation organisations, and there is a case for taking that claim seriously. Many participate in coordinated breeding programmes for species that are critically endangered in the wild, and some of those programmes have produced animals that were later released.",
        "Zoos also argue that they generate public engagement that no documentary can match. A visitor who stands in front of a living animal, the argument runs, forms a commitment that translates into donations and political support for habitat protection.",
        "Finally, zoos point to research output. Captive animals allow controlled studies of physiology, reproduction and behaviour that would be impossible to conduct in a forest, and much of what is known about the reproductive cycles of large mammals comes from such work.",
      ],
    },
    listening:
      "The lecturer does not deny that zoos breed endangered animals, but she disputes the scale. Of the species held in zoos, she says, only a small fraction are threatened in the wild, and of those, very few have produced individuals that survived long-term after release. The flagship examples are real, but they are exceptions presented as a pattern. On engagement, she cites studies showing that visitors' stated concern for wildlife rises immediately after a visit and returns to baseline within months, and that the animals most likely to be exhibited are those already familiar to the public, not those most in need of protection. On research, she concedes the value but observes that the number of peer-reviewed papers per animal per year is very low, and that the same questions can increasingly be studied with camera traps and non-invasive sampling in the wild. Her conclusion is not that zoos should close, but that the conservation language is doing work the evidence does not support.",
    guidance: [
      "Три возражения лектора должны быть видны как три отдельных абзаца или три чётких тезиса.",
      "Покажи, что именно оспаривается: масштаб, длительность эффекта, объём исследовательской отдачи.",
      "Объём 150–225 слов — этого достаточно; длиннее не значит лучше.",
    ],
  },
  {
    id: "toefl-write-discuss-ai-homework",
    title: "Academic Discussion: AI Tools in Homework",
    type: "academic_discussion",
    minutes: 10,
    minWords: 100,
    prompt:
      "Your professor is teaching a course on education policy. Write a post in which you express and support your opinion on the question below.",
    professorQuestion:
      "Universities increasingly allow students to use AI assistants for homework. Some faculty argue this builds the skills graduates will actually need; others argue it removes the struggle through which learning happens. What is your view, and why?",
    posts: [
      {
        author: "Marta",
        text: "I think the struggle is the point. When I write an essay myself, I discover what I don't understand about the argument. If a tool drafts it, I never hit that wall, so I never learn where my thinking is thin.",
      },
      {
        author: "Dev",
        text: "That assumes the wall is productive for everyone. For a student with a learning disability, or someone working twenty hours a week, the tool can be the difference between finishing and dropping out. Banning it protects an advantage some students already had.",
      },
    ],
    guidance: [
      "Дай собственную позицию и опирайся на посты других студентов — согласись, возрази или уточни.",
      "Один конкретный пример сильнее трёх общих утверждений.",
      "100–150 слов достаточно; ценится ясность позиции, а не объём.",
    ],
  },
  {
    id: "toefl-write-discuss-car-free",
    title: "Academic Discussion: Car-Free City Centres",
    type: "academic_discussion",
    minutes: 10,
    minWords: 100,
    prompt:
      "Your professor is teaching a course on urban planning. Write a post in which you express and support your opinion on the question below.",
    professorQuestion:
      "Several cities have removed private cars from their historic centres. Supporters point to cleaner air and livelier streets; critics point to delivery drivers, disabled residents and small businesses that depend on vehicle access. Should city centres be car-free?",
    posts: [
      {
        author: "Ines",
        text: "The businesses argument gets overstated. Studies in several cities found retail sales rose after pedestrianisation, because people on foot stop more often than people in cars. The shopkeepers who opposed it were guessing about their own customers.",
      },
      {
        author: "Tomas",
        text: "Retail sales aren't the only issue. My grandmother can't walk four hundred metres to a tram stop. A city that is pleasant for the healthy and the young can be hostile to everyone else, and those people don't get to vote in a survey.",
      },
    ],
    guidance: [
      "Назови свою позицию в первом предложении — экзаменатор не должен её угадывать.",
      "Ответь на контраргумент, а не игнорируй его.",
      "Избегай шаблонных вставок вроде «In today's fast-paced world».",
    ],
  },
  {
    id: "toefl-write-discuss-grading",
    title: "Academic Discussion: Should Schools Rank Students?",
    type: "academic_discussion",
    minutes: 10,
    minWords: 100,
    prompt:
      "Your professor is teaching a course on assessment. Write a post in which you express and support your opinion on the question below.",
    professorQuestion:
      "Some schools publish class rankings; others have moved to descriptive feedback only. Ranking is transparent and motivates competition; descriptive feedback is argued to support learning. Which approach would you defend?",
    posts: [
      {
        author: "Aiko",
        text: "Rankings tell you where you stand, and that information is useful. I'd rather know I'm tenth than be told vaguely that I'm doing well. Transparency at least lets me decide what to do about it.",
      },
      {
        author: "Ben",
        text: "A rank tells you where you stand relative to others, which isn't the same as telling you what you can't yet do. And it rewards the students who were already ahead. Feedback that names the gap is more actionable, even if it stings less.",
      },
    ],
    guidance: [
      "Можно занять промежуточную позицию, но она должна быть сформулирована явно.",
      "Покажи, как твоя позиция отвечает хотя бы одному из двух постов.",
      "Не пересказывай посты — используй их как опору.",
    ],
  },
  {
    id: "toefl-write-discuss-space",
    title: "Academic Discussion: Funding Space Exploration",
    type: "academic_discussion",
    minutes: 10,
    minWords: 100,
    prompt:
      "Your professor is teaching a course on science policy. Write a post in which you express and support your opinion on the question below.",
    professorQuestion:
      "Governments spend public money on space science while other research budgets are flat. Is space exploration a good use of public funds, or should that money go to problems closer to home?",
    posts: [
      {
        author: "Lucia",
        text: "The spin-off argument is weaker than people think. If the goal is useful technology, funding medical research directly is more efficient than hoping a Mars programme produces a side benefit.",
      },
      {
        author: "Omar",
        text: "That treats the budget as one pot, but it isn't. Space programmes have political constituencies that medical research doesn't. Cutting space doesn't reliably move the money to hospitals; it often just moves it to a different flagship project.",
      },
    ],
    guidance: [
      "Заяви позицию и один критерий, по которому ты её оцениваешь.",
      "Сошлись на аргумент из постов и покажи, где он силён или слаб.",
      "Не уходи в общие рассуждения о человечестве — держись бюджета и приоритетов.",
    ],
  },
];

export default WRITING;
