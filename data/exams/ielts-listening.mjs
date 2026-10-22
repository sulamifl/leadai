/**
 * IELTS Listening — новый контент-пак с ключами.
 *
 * Шесть наборов в формате четырёх секций IELTS: бытовой диалог, монолог
 * о campus-сервисах, академический тьюториал и лекция. Транскрипт
 * озвучивается на клиенте через `speechSynthesis`, поэтому аудиофайлы
 * и лицензии не нужны.
 *
 * Типы вопросов: "multiple_choice", "short_answer" (с полем `accept`),
 * "true_false_not_given".
 */

const LISTENING = [
  {
    id: "ielts-listen-booking",
    title: "Section 1: Booking a Weekend Course",
    section: 1,
    minutes: 10,
    audioText: `Receptionist: Good morning, Riverside Adult Education. How can I help?

Caller: Hello. I'm calling about the weekend photography course. Is there still space?

Receptionist: There is, but only in the afternoon group. The morning group filled last week. The afternoon group runs from two until five on Saturdays.

Caller: That's fine. And what's the fee?

Receptionist: The course fee is one hundred and forty pounds, and that includes the darkroom materials. There's no charge for the equipment, but you'll need to bring your own camera — or you can hire one from us for fifteen pounds for the whole course.

Caller: I'll bring mine. Do I need any previous experience?

Receptionist: None at all. The first two weeks are about exposure and composition, and after that people work at their own level. If you've never used a manual camera, that's honestly the more common situation.

Caller: Good. Can I pay on the day?

Receptionist: You can, but we ask for a deposit of thirty pounds to hold the place, and the balance on the first morning. Deposit is non-refundable if you cancel within seven days.

Caller: Understood. Could you hold a place for me until Friday?

Receptionist: I can hold it for forty-eight hours. So I'd need to hear from you by Thursday morning.

Caller: That works. One last thing — is there parking?

Receptionist: There's a small car park behind the building, but it's shared with the theatre, so on Saturdays it's often full by midday. The bus stops directly outside.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Which group does the caller join?",
        options: ["The morning group", "The afternoon group", "The evening group", "Both groups"],
        answer: 1,
        explanation:
          "Утренняя группа заполнена; «only in the afternoon group» — звонящий записывается в дневную.",
      },
      {
        id: "q2",
        type: "short_answer",
        prompt: "What is the course fee, in pounds? Write ONE NUMBER only.",
        answer: "140",
        accept: ["140", "£140", "140 pounds"],
        explanation: "«The course fee is one hundred and forty pounds».",
      },
      {
        id: "q3",
        type: "short_answer",
        prompt: "How much does it cost to hire a camera for the course, in pounds? Write ONE NUMBER only.",
        answer: "15",
        accept: ["15", "£15", "15 pounds"],
        explanation: "«you can hire one from us for fifteen pounds for the whole course».",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "Previous experience with a manual camera is required for the course.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation: "«None at all… If you've never used a manual camera, that's honestly the more common situation.»",
      },
      {
        id: "q5",
        type: "short_answer",
        prompt: "How much is the deposit, in pounds? Write ONE NUMBER only.",
        answer: "30",
        accept: ["30", "£30", "30 pounds"],
        explanation: "«we ask for a deposit of thirty pounds to hold the place».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Why does the receptionist recommend the bus?",
        options: [
          "The car park is expensive",
          "The car park is shared with the theatre and often full by midday",
          "There is no parking at all",
          "Buses are free for students",
        ],
        answer: 1,
        explanation: "«it's shared with the theatre, so on Saturdays it's often full by midday».",
      },
    ],
  },
  {
    id: "ielts-listen-library-tour",
    title: "Section 2: A Monologue about Library Services",
    section: 2,
    minutes: 10,
    audioText: `Librarian: Welcome to the Hallworth Library. I'll take five minutes to explain how the building works, because students lose a surprising amount of time here in the first term.

The ground floor is the borrowing collection. Everything here can be taken out, with the exception of the reference shelves at the back, which stay in the building. If you need something that we don't hold, the interlibrary loan desk is on this floor too, next to the returns bin.

The first floor is silent study. No phones, no conversation, no food. I want to be clear that this is enforced — the desk staff will ask you to leave if you take a call. The second floor is group study, and you can book a room for up to two hours at a time. Bookings open at eight in the morning and they go quickly in the exam period.

The third floor houses the special collections. You can't browse it. You request an item in advance, and you'll be given a slot to consult it in a supervised reading room. Bring photographic identification; without it you'll be turned away, and that rule has no exceptions.

One practical note about fines. The overdue charge is twenty pence per day per item, capped at ten pounds. But the cap resets each term, so an item borrowed in September and returned in December will hit the cap more than once. If you receive a fine notice you believe is wrong, don't pay it at the machine — come to the desk and we'll look at the record.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is on the ground floor?",
        options: [
          "Silent study space",
          "The borrowing collection and the interlibrary loan desk",
          "Special collections",
          "Group study rooms",
        ],
        answer: 1,
        explanation:
          "«The ground floor is the borrowing collection… the interlibrary loan desk is on this floor too».",
      },
      {
        id: "q2",
        type: "true_false_not_given",
        prompt: "Reference shelves can be borrowed overnight.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation: "«with the exception of the reference shelves at the back, which stay in the building».",
      },
      {
        id: "q3",
        type: "short_answer",
        prompt: "For how many hours at a time can a group study room be booked? Write ONE NUMBER only.",
        answer: "2",
        accept: ["2", "two"],
        explanation: "«you can book a room for up to two hours at a time».",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "What is required to consult the special collections?",
        options: [
          "A letter from a supervisor",
          "Photographic identification and an advance request",
          "A fee of ten pounds",
          "Membership of the Friends of the Library",
        ],
        answer: 1,
        explanation: "«You request an item in advance… Bring photographic identification».",
      },
      {
        id: "q5",
        type: "short_answer",
        prompt: "What is the maximum overdue fine per item, in pounds? Write ONE NUMBER only.",
        answer: "10",
        accept: ["10", "£10", "10 pounds"],
        explanation: "«capped at ten pounds».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What should a student do with a fine notice they believe is incorrect?",
        options: [
          "Pay it at the machine to avoid problems",
          "Come to the desk so staff can check the record",
          "Ignore it until the end of term",
          "Appeal in writing to the university",
        ],
        answer: 1,
        explanation: "«don't pay it at the machine — come to the desk and we'll look at the record».",
      },
    ],
  },
  {
    id: "ielts-listen-tutorial",
    title: "Section 3: A Tutorial about a Research Proposal",
    section: 3,
    minutes: 10,
    audioText: `Supervisor: Let's look at your proposal. My main worry is the question, not the topic. "How do young people use social media?" is not a research question; it's a field.

Student: I thought narrowing it to one platform would help. I've picked a video-sharing app and I want to look at how people decide what to post.

Supervisor: Better. But "how people decide" is still hard to observe. What would you actually measure?

Student: I was thinking of interviews. Maybe twelve people, aged eighteen to twenty-two.

Supervisor: Twelve interviews will give you a lot of talk and not much comparison. Have you considered a diary study? Ask people to record, for a week, each time they drafted a post and then abandoned it. That gives you the decision moment, and it gives you something countable.

Student: That would be more work for participants. Would enough people agree?

Supervisor: Some will drop out — plan for that. If you recruit twenty and expect fifteen to finish, you'll still have more usable material than twelve interviews. And keep three or four interviews for the end, to check your interpretation against what participants say they were doing.

Supervisor: One more thing. Your timetable says you'll analyse the data in the same week you collect it. Don't. Diaries generate more text than students expect, and transcription is slower than you think. Give yourself a fortnight after the last diary comes in.

Student: Should I include a pilot?

Supervisor: Yes, and make it small: three participants, one week. The pilot is not for data. It's to find out whether your instructions are clear. They usually aren't.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the supervisor's main criticism of the original proposal?",
        options: [
          "The topic is not interesting",
          "The question is too broad to be a research question",
          "The student chose the wrong platform",
          "The student has not read enough literature",
        ],
        answer: 1,
        explanation: "«My main worry is the question, not the topic… it's a field» — вопрос слишком широк.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "Why does the supervisor suggest a diary study?",
        options: [
          "It is easier for the supervisor to grade",
          "It captures the decision moment and produces countable material",
          "It requires no ethical approval",
          "It replaces the need for any interviews",
        ],
        answer: 1,
        explanation: "«That gives you the decision moment, and it gives you something countable.»",
      },
      {
        id: "q3",
        type: "short_answer",
        prompt: "How many participants does the student plan to interview initially? Write ONE NUMBER only.",
        answer: "12",
        accept: ["12", "twelve"],
        explanation: "«Maybe twelve people, aged eighteen to twenty-two».",
      },
      {
        id: "q4",
        type: "true_false_not_given",
        prompt: "The supervisor advises keeping a few interviews for the end of the study.",
        options: ["True", "False", "Not Given"],
        answer: 0,
        explanation: "«keep three or four interviews for the end, to check your interpretation».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What does the supervisor say about analysing the data?",
        options: [
          "It should happen in the same week as collection",
          "It needs about a fortnight after the last diary is returned",
          "It should be done entirely by software",
          "It can be skipped if the sample is small",
        ],
        answer: 1,
        explanation: "«Give yourself a fortnight after the last diary comes in.»",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What is the purpose of the pilot according to the supervisor?",
        options: [
          "To collect preliminary data for the analysis",
          "To test whether the instructions are clear",
          "To satisfy the ethics committee",
          "To practise interviewing technique",
        ],
        answer: 1,
        explanation: "«The pilot is not for data. It's to find out whether your instructions are clear.»",
      },
    ],
  },
  {
    id: "ielts-listen-lecture-cities",
    title: "Section 4: Lecture on the Economics of Street Layout",
    section: 4,
    minutes: 12,
    audioText: `Lecturer: Today I want to make an argument about something that looks too ordinary to argue about: the width of streets.

The standard assumption in planning is that wider roads carry more traffic. That is true for a single road in isolation. It stops being true when the wider road connects to a network, and the reason is what engineers call induced demand. When a route becomes faster, people who previously travelled at a different time, by a different route, or not at all, begin to use it. The capacity is consumed by new trips rather than by the same trips moving faster.

The evidence is fairly consistent. Studies that measure traffic before and after major road expansions typically find that vehicle kilometres rise, and that the initial improvement in journey times decays over a period of years. This is not a marginal effect; in several well-known cases the traffic on the expanded road returned to its previous level of congestion within five years.

There is a second effect that is less discussed. Wide streets are expensive to maintain per unit of frontage, and they push destinations further apart. A district laid out with wide arterial roads has fewer intersections per square kilometre, and intersections are where the economic activity of a city actually happens — shops, services, encounters. So a street network optimised for throughput can reduce the density of the very thing that made the trips worthwhile.

I should be careful here. None of this implies that narrow streets are automatically better, or that road capacity never matters. A city with a genuinely disconnected network and no alternative modes will simply be congested. The claim is narrower: capacity added to an already-connected network is largely absorbed, and the measure of success should not be the speed of vehicles but the accessibility of destinations.

And that has a methodological consequence. If you evaluate a transport project by average vehicle speed, you will systematically prefer projects that widen roads. If you evaluate it by how many destinations a resident can reach within thirty minutes, you will sometimes prefer projects that do the opposite. The metric is not neutral. It chooses the answer before the analysis begins.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What is the lecture mainly about?",
        options: [
          "The history of road building",
          "Why adding road capacity often fails to reduce congestion, and how success should be measured",
          "The maintenance costs of narrow streets",
          "How to design intersections",
        ],
        answer: 1,
        explanation:
          "Основная линия: induced demand → почему расширение не помогает → смена метрики на доступность.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "What is induced demand?",
        options: [
          "The tendency of new capacity to be consumed by new trips",
          "The increase in road maintenance costs over time",
          "The effect of weather on traffic volume",
          "The requirement that developers fund roads",
        ],
        answer: 0,
        explanation:
          "«people who previously travelled at a different time, by a different route, or not at all, begin to use it» — спрос порождается вместимостью.",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        prompt: "The lecturer says that in several well-known cases congestion on the expanded road returned to its previous level within five years.",
        options: ["True", "False", "Not Given"],
        answer: 0,
        explanation:
          "«in several well-known cases the traffic on the expanded road returned to its previous level of congestion within five years».",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "Why does the lecturer say wide arterial roads can reduce economic activity?",
        options: [
          "They are more expensive to build",
          "They reduce the number of intersections per square kilometre, where activity happens",
          "They are always built in poor neighbourhoods",
          "They attract too many pedestrians",
        ],
        answer: 1,
        explanation:
          "«fewer intersections per square kilometre, and intersections are where the economic activity of a city actually happens».",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What qualification does the lecturer make about narrow streets?",
        options: [
          "Narrow streets are always better",
          "Capacity can matter in genuinely disconnected networks",
          "Narrow streets cannot support buses",
          "Narrow streets increase maintenance costs",
        ],
        answer: 1,
        explanation:
          "«A city with a genuinely disconnected network and no alternative modes will simply be congested.»",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "What is the lecturer's point about the choice of metric?",
        options: [
          "Metrics are objective and cannot be biased",
          "Evaluating by vehicle speed systematically favours road-widening projects",
          "Accessibility is impossible to measure",
          "Only economic metrics are reliable",
        ],
        answer: 1,
        explanation: "«The metric is not neutral. It chooses the answer before the analysis begins.»",
      },
    ],
  },
  {
    id: "ielts-listen-housing",
    title: "Section 1: Renting a Flat",
    section: 1,
    minutes: 10,
    audioText: `Agent: Thanks for waiting. I've got three flats that match what you described. The first is on Cardigan Street — two bedrooms, second floor, no lift. Six hundred and eighty a month, bills not included.

Client: No lift is a problem. My partner has a knee injury.

Agent: Then the second one is better. It's on the ground floor of a converted house on Pellam Road. Seven hundred and twenty a month, and that includes water. Electricity is separate, and the landlord says the last tenant paid about forty a month in winter.

Client: Is there outdoor space?

Agent: There's a shared courtyard at the back, and a small private patio. It's not a garden, but you can sit out.

Client: And the third?

Agent: The third is the largest, on the fourth floor with a lift, but it's nine hundred and ten and the tenancy is twelve months minimum. The other two can be taken for six months.

Client: I think the Pellam Road one is the sensible choice. What do I need to do to apply?

Agent: A completed form, two months' bank statements, a reference from your previous landlord, and the holding deposit, which is one week's rent. The holding deposit comes off the first month's rent if you take the flat, and it's returned if the landlord withdraws.

Client: How long does referencing take?

Agent: Usually three to five working days, but it can be longer if your previous landlord is slow to respond. I'd apply this week if you want to move at the start of the month.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "Why does the client reject the first flat?",
        options: [
          "It is too expensive",
          "It has no lift and the partner has a knee injury",
          "It has no outdoor space",
          "The tenancy is too short",
        ],
        answer: 1,
        explanation: "«No lift is a problem. My partner has a knee injury.»",
      },
      {
        id: "q2",
        type: "short_answer",
        prompt: "What is the monthly rent of the Pellam Road flat, in pounds? Write ONE NUMBER only.",
        answer: "720",
        accept: ["720", "£720", "720 pounds"],
        explanation: "«Seven hundred and twenty a month, and that includes water.»",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        prompt: "The Pellam Road flat includes electricity in the rent.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation: "«Electricity is separate» — включена только вода.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "What outdoor space does the Pellam Road flat have?",
        options: [
          "A large private garden",
          "A shared courtyard and a small private patio",
          "Only a balcony",
          "No outdoor space",
        ],
        answer: 1,
        explanation: "«There's a shared courtyard at the back, and a small private patio.»",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "What is the holding deposit?",
        options: [
          "One month's rent",
          "One week's rent",
          "Two months' rent",
          "A fixed fee of one hundred pounds",
        ],
        answer: 1,
        explanation: "«the holding deposit, which is one week's rent».",
      },
      {
        id: "q6",
        type: "short_answer",
        prompt: "How many working days does referencing usually take? Write the FIRST number only.",
        answer: "3",
        accept: ["3", "three"],
        explanation: "«Usually three to five working days» — минимальная граница 3.",
      },
    ],
  },
  {
    id: "ielts-listen-museum",
    title: "Section 2: A Talk about a Museum Rehang",
    section: 2,
    minutes: 10,
    audioText: `Curator: Thank you for coming. I want to explain why we've moved almost everything in the gallery, because the first question visitors ask is whether we simply wanted a change.

The old arrangement was chronological. You walked from left to right and the dates went up. It was easy to explain and it was, in a sense, honest. But it made one thing invisible: objects from different parts of the world that were made at the same time never appeared together. A sixteenth-century ship model from Lisbon sat in one room, and a sixteenth-century navigational instrument from Gujarat sat four rooms away, and no visitor ever saw them in the same glance.

The new arrangement is thematic. The first room is about navigation, the second about trade goods, the third about the display of wealth. Within each room, objects are grouped by what they did rather than by where they were made. The dates are still on every label; we haven't hidden them.

Not everyone is happy. Two colleagues have argued that we've replaced a clear story with a puzzle, and that a visitor without background knowledge may leave without knowing what century anything is from. That's a fair worry and we're responding to it. In September we're adding a timeline panel at the entrance to each room, so the chronology is available without being the organising principle.

The other change is smaller but popular. The labels are shorter. The old labels ran to two hundred words and visitors read about a third of them. The new ones are around eighty words and we've moved the detailed material to a free audio guide, which people can use if they want more.

One request: if you're visiting with a group, please book. The rooms are smaller now, and a group of thirty arriving without notice will block the navigation room entirely.`,
    questions: [
      {
        id: "q1",
        type: "multiple_choice",
        prompt: "What was the problem with the old chronological arrangement?",
        options: [
          "The dates were wrong",
          "Objects from different regions made at the same time were never seen together",
          "It was too difficult to explain",
          "It required too much space",
        ],
        answer: 1,
        explanation:
          "«objects from different parts of the world that were made at the same time never appeared together».",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt: "How are objects arranged in the new rooms?",
        options: [
          "By country of origin",
          "By what they did",
          "By size",
          "By donor",
        ],
        answer: 1,
        explanation: "«objects are grouped by what they did rather than by where they were made».",
      },
      {
        id: "q3",
        type: "true_false_not_given",
        prompt: "Dates have been removed from the labels in the new arrangement.",
        options: ["True", "False", "Not Given"],
        answer: 1,
        explanation: "«The dates are still on every label; we haven't hidden them.»",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "How is the museum responding to criticism from colleagues?",
        options: [
          "By returning to the old arrangement",
          "By adding a timeline panel at the entrance to each room",
          "By removing the thematic rooms",
          "By hiring more explainers",
        ],
        answer: 1,
        explanation: "«we're adding a timeline panel at the entrance to each room».",
      },
      {
        id: "q5",
        type: "short_answer",
        prompt: "Approximately how many words are the new labels? Write ONE NUMBER only.",
        answer: "80",
        accept: ["80", "eighty"],
        explanation: "«The new ones are around eighty words».",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Why does the curator ask groups to book?",
        options: [
          "Groups pay a different entrance fee",
          "The rooms are smaller and large groups block them",
          "Groups are not allowed on weekdays",
          "There are no guided tours available",
        ],
        answer: 1,
        explanation: "«The rooms are smaller now, and a group of thirty arriving without notice will block the navigation room entirely.»",
      },
    ],
  },
];

export default LISTENING;
