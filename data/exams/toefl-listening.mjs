/**
 * TOEFL Listening (академические лекции и кампусные диалоги).
 *
 * Формат: каждый набор — это один «трек» с транскриптом (`audioText`).
 * Транскрипт озвучивается на клиенте через Web Speech API (`speechSynthesis`),
 * поэтому контент остаётся полностью офлайновым и не требует аудиофайлов
 * и лицензий на них. Вопросы проверяются детерминированно по полю `answer`.
 *
 * Типы вопросов:
 *  - "multiple_choice" — один верный вариант;
 *  - "multiple_answer" — несколько верных вариантов (`answer` — массив индексов);
 *  - "true_false"       — два варианта, `answer` — индекс верного.
 */

const LISTENING = [
  {
    id: "toefl-listen-art-fresco",
    title: "Lecture: Fresco and the Economics of Wall Painting",
    kind: "lecture",
    minutes: 12,
    audioText: `Professor: Today I want to talk about fresco, and I want to start with a question that sounds almost too practical for an art history class: why did so many governments and churches in the Italian Renaissance pay enormous sums for a technique that was, from an engineering standpoint, a nightmare?

Let me describe what fresco actually involves. The painter works on wet lime plaster. Pigment is applied to plaster that has not yet carbonated, and as the lime sets, the pigment becomes part of the wall itself. That is the great advantage: the image is not a layer sitting on a surface. It cannot peel the way paint on canvas can, and it does not fade the way organic dyes do. Five hundred years later we can still read these walls.

Now the disadvantage. Once the plaster is dry, the pigment is locked in. You cannot correct a mistake. You cannot scrape off a bad arm and try again tomorrow. So the painter had to plan the entire surface in advance, and had to work only on the area he could finish before the plaster set — a patch called a giornata, literally a day's work. If you look closely at a large fresco, you can find the seams between giornate, because each patch carbonates slightly differently.

This changes how we should read these images. When we see a composition that looks effortless, we are seeing the end of a process that was ruthless about time. The painter's assistants mixed lime, prepared the intonaco — the final smooth layer — and the master painted at speed. There are documented cases of painters who laid in an entire figure in a single session, because they had no choice.

And that brings me to the economics. Because fresco is permanent and because it is architectural, a fresco is very hard to sell. You cannot take it to a patron in another city. So fresco became a signal. A family that commissioned a chapel in fresco was announcing that it intended to stay — that its money was in this city, in this building, for generations. A panel painting can travel; a wall cannot. The medium itself was a statement about permanence.

There is one more consequence I want you to notice. Because the technique is fast and unforgiving, it pushed painters toward large, simple, legible forms. You can see this even in artists who were famous for delicacy in other media. So when a historian says that a wall painting looks monumental, part of that monumentality is not a style at all. It is a material constraint showing through.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the main purpose of the lecture?",
        options: [
          "To explain a technique and show how its limitations shaped the art made with it",
          "To argue that fresco is technically superior to oil painting",
          "To describe the training of Renaissance apprentices in detail",
          "To compare the prices of frescoes and panel paintings",
        ],
        answer: 0,
        explanation:
          "Лектор сначала объясняет технику, затем дважды возвращается к тому, как ограничения материала меняли результат — композицию, темп работы и даже смысл заказа.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Why does the professor mention giornata?",
        options: [
          "To give an example of a pigment used in fresco",
          "To explain a unit of work caused by the drying of plaster",
          "To identify a school of Renaissance painters",
          "To show how much assistants were paid",
        ],
        answer: 1,
        explanation:
          "Giornata — участок, который художник успевал закончить за один день, пока штукатурка не схватилась. Это единица работы, навязанная материалом.",
      },
      {
        id: "q3",
        type: "true_false",
        prompt: "According to the lecture, mistakes in fresco can be corrected after the plaster dries.",
        options: ["True", "False"],
        answer: 1,
        explanation:
          "Прямо сказано: «Once the plaster is dry, the pigment is locked in. You cannot correct a mistake».",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "Why does the professor say that fresco functioned as a signal?",
        options: [
          "Because the pigments were imported from distant markets",
          "Because only churches could legally commission it",
          "Because a wall painting cannot be moved, so it advertised a family's long-term commitment to a place",
          "Because the technique required the approval of a guild",
        ],
        answer: 2,
        explanation:
          "Фреска непереносима, поэтому заказчик заявлял: деньги останутся здесь, в этом городе, на поколения.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What does the professor imply about the monumental look of wall painting?",
        options: [
          "It was imposed by patrons who disliked detail",
          "It partly reflects a material constraint rather than a deliberate style",
          "It disappeared once artists learned to work more slowly",
          "It is a myth created by later historians",
        ],
        answer: 1,
        explanation:
          "«Part of that monumentality is not a style at all. It is a material constraint showing through» — монументальность отчасти следствие техники.",
      },
      {
        id: "q6",
        type: "multiple_answer",
        prompt: "Which TWO advantages of fresco does the professor mention?",
        options: [
          "It resists peeling because the image is part of the wall",
          "It allows quick correction of errors",
          "It can be transported to other cities for sale",
          "It does not fade like organic dyes",
        ],
        answer: [0, 3],
        explanation:
          "Названы два плюса: изображение становится частью стены (не отслаивается) и не выцветает, в отличие от органических красителей.",
      },
    ],
  },
  {
    id: "toefl-listen-bio-mycorrhiza",
    title: "Lecture: Mycorrhizal Networks and the Forest as a Market",
    kind: "lecture",
    minutes: 13,
    audioText: `Professor: Last week we talked about competition between trees. Today I want to complicate that picture, because if you look below the leaf litter, the story changes.

Most forest trees on Earth form a partnership with fungi. The fungus threads — hyphae — grow into and around the roots, and they extend the effective surface area of the root system by an enormous factor. In exchange for sugars the tree makes in photosynthesis, the fungus delivers water and, critically, phosphorus and nitrogen in forms the roots can absorb. This is a mycorrhizal association, and it is not a rare curiosity. It is the default condition for most trees.

The question that has driven the last twenty years of research is whether these fungal threads connect different trees to each other. They do. A single fungus can colonise the roots of several trees, and different fungi can fuse, so you get a network — often called a common mycorrhizal network. Through that network, carbon can move from one plant to another.

Now, here is where the field becomes careful, and I want you to be careful too. Early press coverage described this as trees feeding their children, and described old trees as mothers. That framing sold books, but the experiments behind it are harder to interpret than the metaphors suggest. In many studies, carbon that appears in a seedling may have come through the network, or it may have come from soil organic matter that the fungus decomposed. Separating the two pathways is technically difficult, and some of the most-cited results have been queried on exactly this point.

What is on firmer ground is the idea of exchange as a market. Fungi are not charities. A fungus trades nutrients for carbon, and it will allocate its threads toward the roots that pay best. Where phosphorus is scarce, a tree that supplies more sugar gets more phosphorus. This is not altruism; it is a bargaining relationship, and it is shaped by the fact that both partners can walk away — a tree can reduce its investment in a fungus that delivers little, and a fungus can favour a generous host.

So the practical lesson is this: the forest is not only a set of competing stems above ground. It is also a set of negotiated supply lines below ground. That does not mean the forest is a cooperative village. It means that our accounting was incomplete. And when we plan a reforestation project, ignoring what happens in the soil is one reason so many plantings fail.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the lecture mainly about?",
        options: [
          "The history of forest conservation policy",
          "How fungal networks connect trees and how that relationship is best interpreted",
          "The chemical composition of leaf litter",
          "Why seedlings are more productive than mature trees",
        ],
        answer: 1,
        explanation:
          "Лекция описывает микоризную сеть и затем обсуждает, как её правильно интерпретировать (рынок, а не альтруизм).",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "What does the tree provide to the fungus?",
        options: [
          "Phosphorus",
          "Water",
          "Sugars produced in photosynthesis",
          "Nitrogen in mineral form",
        ],
        answer: 2,
        explanation:
          "Дерево отдаёт сахара из фотосинтеза, а получает воду, фосфор и азот.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Why does the professor mention the phrase “mother trees”?",
        options: [
          "As an accepted scientific term",
          "As a metaphor from popular books that outran the evidence",
          "As a term used by the first researchers in the field",
          "As a way to describe the largest fungus in a network",
        ],
        answer: 1,
        explanation:
          "Профессор прямо говорит, что метафора «продала книги», но эксперименты интерпретировать сложнее.",
      },
      {
        id: "q4",
        type: "true_false",
        prompt: "The professor says that tracing whether carbon travelled through fungal threads or came from decomposing soil is methodologically easy.",
        options: ["True", "False"],
        answer: 1,
        explanation:
          "Сказано обратное: «Separating the two pathways is technically difficult».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What does the professor mean by describing the relationship as a market?",
        options: [
          "Fungi charge money for nutrients",
          "Nutrients and carbon are exchanged according to what each partner gains",
          "Trees compete for a fixed amount of sunlight",
          "Forests are managed as economic units by humans",
        ],
        answer: 1,
        explanation:
          "Рынок здесь — метафора обмена: гриб направляет гифы туда, где больше углерода, дерево меньше инвестирует в слабого партнёра.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Why does the professor mention reforestation projects?",
        options: [
          "To suggest that ignoring soil processes contributes to their failure",
          "To recommend a specific species of fungus",
          "To argue that planting should be done only in spring",
          "To show that seedlings cannot form mycorrhizae",
        ],
        answer: 0,
        explanation:
          "Финальная мысль: игнорирование того, что происходит в почве, — одна из причин провала многих посадок.",
      },
    ],
  },
  {
    id: "toefl-listen-conv-library",
    title: "Conversation: Interlibrary Loan and a Deadline",
    kind: "conversation",
    minutes: 8,
    audioText: `Student: Hi, I'm hoping you can help me. I requested a book through interlibrary loan about three weeks ago and I still haven't received a notification.

Librarian: Let me look it up. What's the title?

Student: It's a monograph on nineteenth-century water management. It's not a popular book — I doubt anyone else has ever asked for it.

Librarian: Ah, here it is. The request went out on the fourth. The lending library confirmed on the seventh, so it should have shipped. Sometimes the item sits in their outgoing mail for a while. But I also see a note here — it says the holding library is doing a shelf audit this month, which can add a week or two.

Student: That's a problem. My seminar paper is due in twelve days and I need chapter four. Is there any way to speed it up?

Librarian: Two things. First, I can submit an expedited request, but I should be honest with you: expediting changes the routing, not the lending library's schedule. It helps maybe half the time.

Student: And the second?

Librarian: The second is more reliable. The volume is from a university press and it's been digitised in a collection we subscribe to. Let me check whether we have that collection. — Yes. The chapter you need is available as a PDF through our portal. You'll have to read it in the browser or print it; the licence doesn't allow a permanent download.

Student: That solves it. Should I cancel the interlibrary loan?

Librarian: I wouldn't. If it arrives, you'll have the physical book, which is easier to annotate, and there's no cost to you. Just don't plan around it.

Student: Fair enough. And the PDF — can I access it from home?

Librarian: You'll need to sign in with your campus credentials, so yes, from anywhere. If the portal logs you out, clear your browser cache first; that's the usual culprit.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Why does the student go to the library desk?",
        options: [
          "To return an overdue book",
          "To ask about a book she requested that has not arrived",
          "To pay a fine for a damaged volume",
          "To get a library card for a visiting researcher",
        ],
        answer: 1,
        explanation:
          "Студентка пришла узнать о книге, запрошенной по МБА три недели назад.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "What does the librarian say about expediting the request?",
        options: [
          "It guarantees delivery within three days",
          "It changes the routing but not the lending library's schedule",
          "It costs a small fee paid by the student",
          "It is not available for books already confirmed",
        ],
        answer: 1,
        explanation:
          "«Expediting changes the routing, not the lending library's schedule» — и помогает примерно в половине случаев.",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "What is the librarian's more reliable solution?",
        options: [
          "Borrowing a copy from another student",
          "Accessing the chapter as a PDF through a subscribed digital collection",
          "Requesting the book again from a different library",
          "Using a reference copy held behind the desk",
        ],
        answer: 1,
        explanation:
          "Глава доступна в PDF в базе, на которую у библиотеки есть подписка.",
      },
      {
        id: "q4",
        type: "true_false",
        prompt: "The licence allows the student to keep a permanent download of the PDF.",
        options: ["True", "False"],
        answer: 1,
        explanation:
          "Сказано: «the licence doesn't allow a permanent download» — только чтение в браузере или печать.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "Why does the librarian advise against cancelling the interlibrary loan?",
        options: [
          "Cancelling would create a fee",
          "The physical book will be easier to annotate and costs nothing extra",
          "The student's grade depends on using a printed source",
          "The request cannot be cancelled once confirmed",
        ],
        answer: 1,
        explanation:
          "Смысл: если книга приедет, будет бумажный экземпляр, удобнее для пометок, и это ничего не стоит.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What should the student do first if the portal logs her out?",
        options: [
          "Contact the publisher",
          "Clear the browser cache",
          "Re-register her campus credentials",
          "Wait twenty-four hours",
        ],
        answer: 1,
        explanation:
          "«Clear your browser cache first; that's the usual culprit».",
      },
    ],
  },
  {
    id: "toefl-listen-conv-advisor",
    title: "Conversation: A Prerequisite Waiver and a Full Section",
    kind: "conversation",
    minutes: 9,
    audioText: `Advisor: Come in. You're here about registration, I assume.

Student: Yes. I'm trying to get into Applied Statistics, and the system says I don't meet the prerequisite. But I've taken the intro course — I took it last spring.

Advisor: Let me pull up your record. — I see the intro course. There's a grade of “incomplete” attached to it.

Student: Right. I was ill during the final and the professor let me finish in the fall term. I handed everything in and he said he'd file the change.

Advisor: He may have filed it. Grade changes go through the registrar and they batch them, so there can be a lag of a couple of weeks. The registration system only checks the transcript of record, so until the incomplete becomes a letter grade, it won't recognise the prerequisite. That's the mechanical explanation. It isn't a judgment about you.

Student: So what do I do?

Advisor: Two options. The first is to wait for the batch to clear. The second, and I'd recommend it, is to ask the instructor of Applied Statistics for a prerequisite waiver. There's a one-page form. If the instructor signs, we can enrol you manually and the system's objection stops mattering.

Student: And if the instructor says no?

Advisor: Then you'd be enrolling next term. So it's worth going to office hours with your work from the intro course. Show him what you did, not just the transcript.

Student: Understand. One more thing — is there room in the section? I heard it fills quickly.

Advisor: There are seats now, but I want to flag something. The evening section is almost full and it's the one most students want because of work schedules. The morning section has more space and, in my experience, a better discussion. If you can be flexible, take the morning and you won't be competing for a waitlist spot.

Student: I can do mornings. Should I still get the waiver?

Advisor: Get the waiver regardless. If the batch clears before the term starts, the waiver is simply unused. If it doesn't, the waiver is the difference between taking the course and losing a term.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Why is the student unable to register for Applied Statistics?",
        options: [
          "He has not taken the introductory course",
          "The registration system does not yet recognise a completed prerequisite",
          "The course is restricted to statistics majors",
          "He missed the registration deadline",
        ],
        answer: 1,
        explanation:
          "Курс пройден, но оценка «incomplete» ещё не заменена буквенной, поэтому система не видит пререквизит.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "What does the advisor say about the delay in the grade change?",
        options: [
          "It is caused by the professor refusing to file the change",
          "It is a routine batching delay at the registrar, not a judgment about the student",
          "It happens because the student missed a deadline",
          "It usually takes a full academic year",
        ],
        answer: 1,
        explanation:
          "«There can be a lag of a couple of weeks… That's the mechanical explanation. It isn't a judgment about you».",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "What does the advisor recommend as the better option?",
        options: [
          "Waiting for the batch process to clear",
          "Asking the instructor for a prerequisite waiver",
          "Retaking the introductory course",
          "Changing majors",
        ],
        answer: 1,
        explanation:
          "Советник рекомендует вариант с waiver: «the second, and I'd recommend it».",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "What advice does the advisor give for the meeting with the instructor?",
        options: [
          "Bring a written appeal from the registrar",
          "Show the work done in the introductory course, not just the transcript",
          "Ask for a grade change directly",
          "Attend the evening section instead",
        ],
        answer: 1,
        explanation:
          "«Show him what you did, not just the transcript».",
      },
      {
        id: "q5",
        type: "true_false",
        prompt: "The advisor says the evening section currently has more available seats than the morning section.",
        options: ["True", "False"],
        answer: 1,
        explanation:
          "Наоборот: вечерняя почти заполнена, а утренняя — просторнее.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Why does the advisor say to get the waiver regardless of the section choice?",
        options: [
          "The waiver is required for graduation",
          "It is free and can be the difference between taking the course now or losing a term",
          "It allows the student to skip the introductory course entirely",
          "It automatically fixes the incomplete grade",
        ],
        answer: 1,
        explanation:
          "«If it doesn't [clear], the waiver is the difference between taking the course and losing a term».",
      },
    ],
  },
  {
    id: "toefl-listen-geo-cycles",
    title: "Lecture: Orbital Cycles and the Timing of Ice Ages",
    kind: "lecture",
    minutes: 12,
    audioText: `Professor: For most of the nineteenth century, geologists could see that ice sheets had advanced and retreated, but they had no reliable clock. They knew the ice had been there. They could not say when.

The breakthrough came from astronomy, not from geology. A Serbian mathematician, Milutin Milanković, worked out that the Earth's orbit and axis change in three regular ways, and that these changes alter how sunlight is distributed across latitudes and seasons.

The first is the shape of the orbit, which shifts from more circular to more elliptical on a cycle of roughly a hundred thousand years. The second is the tilt of the axis, which varies between about twenty-two and twenty-five degrees over about forty-one thousand years. The third is the wobble of the axis, the precession, which changes which season occurs when the Earth is closest to the Sun, on a cycle of about twenty-three thousand years.

Notice what these cycles do. They do not change the total amount of energy the Earth receives by very much. What they change is distribution — where the sunlight lands, and in which season. And one variable turns out to be especially important: the intensity of summer sunlight at high northern latitudes. If northern summers are cool, snow that falls in winter can survive the melt season, and once that happens, the ice can grow.

So the hypothesis was elegant. The problem was the evidence. For decades the geological record was not precise enough to test it. Sediments and ice cores were dated with large uncertainties, and a hypothesis that fits anything fits nothing.

What changed the situation was the deep-sea sediment cores recovered in the nineteen-sixties and seventies. Microfossils in those cores record temperature, and because the sediment accumulates slowly and continuously, the cores preserve a long, ordered sequence. When researchers plotted that sequence against time, the pattern that emerged matched the orbital cycles closely. The hundred-thousand-year rhythm was there, and so were the shorter ones.

I want to end with a caution that applies well beyond this topic. The orbital hypothesis does not claim that astronomy alone explains the ice ages. It says that orbital change sets the timing. The magnitude of the response depends on the climate system itself — on ice, on ocean circulation, on carbon dioxide. Astronomy provides the metronome, not the volume knob.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the lecture mainly about?",
        options: [
          "How Milanković calculated the age of the Earth",
          "How orbital cycles were proposed and eventually tested against geological evidence",
          "Why ice cores are more useful than sediment cores",
          "The causes of modern sea-level rise",
        ],
        answer: 1,
        explanation:
          "Структура лекции: гипотеза орбитальных циклов → проблема доказательств → подтверждение по морским кернам.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "According to the lecture, what do the orbital cycles mainly change?",
        options: [
          "The total energy the Earth receives",
          "The distribution of sunlight across latitudes and seasons",
          "The speed of the Earth's rotation",
          "The composition of the atmosphere",
        ],
        answer: 1,
        explanation:
          "«They do not change the total amount of energy… What they change is distribution».",
      },
      {
        id: "q3",
        type: "multiple_choice",
        prompt: "Which variable does the professor identify as especially important for ice growth?",
        options: [
          "Winter snowfall at the equator",
          "Summer sunlight intensity at high northern latitudes",
          "Ocean salinity near the poles",
          "The length of the day",
        ],
        answer: 1,
        explanation:
          "Ключевая переменная — интенсивность летнего солнечного света в высоких северных широтах.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "Why does the professor say that “a hypothesis that fits anything fits nothing”?",
        options: [
          "Because the orbital cycles are too short to observe",
          "Because imprecise dating made the idea impossible to falsify",
          "Because Milanković's mathematics was wrong",
          "Because geologists rejected astronomy",
        ],
        answer: 1,
        explanation:
          "Пока датировка неточна, гипотезу нельзя проверить — она подходит ко всему.",
      },
      {
        id: "q5",
        type: "true_false",
        prompt: "Deep-sea sediment cores helped because microfossils in them record temperature within a long, ordered sequence.",
        options: ["True", "False"],
        answer: 0,
        explanation:
          "Именно так: микрофоссилии фиксируют температуру, а медленное непрерывное накопление даёт длинную упорядоченную последовательность.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What is the point of the professor's final caution?",
        options: [
          "Orbital change determines the timing, while the climate system determines the size of the response",
          "Orbital cycles are now considered disproved",
          "Carbon dioxide plays no role in ice ages",
          "Astronomy cannot be applied to geology",
        ],
        answer: 0,
        explanation:
          "«Astronomy provides the metronome, not the volume knob» — астрономия задаёт ритм, а не амплитуду.",
      },
    ],
  },
];

export default LISTENING;
