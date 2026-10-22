/**
 * Digital SAT — Math.
 *
 * 24 задания по четырём доменам официального Digital SAT:
 *  1. Algebra (линейные уравнения, системы, неравенства, наклон)
 *  2. Advanced Math (квадратичные, экспоненциальные, алгебраические дроби)
 *  3. Problem-Solving and Data Analysis (проценты, средние, отношения, вероятность)
 *  4. Geometry and Trigonometry (треугольники, окружность, подобие, объём, тригонометрия)
 *
 * Типы ответов:
 *  - "multiple_choice" — индекс верного варианта в `answer`;
 *  - "numeric"          — строка-эталон в `answer` + список допустимых записей в `accept`
 *                         (движок нормализует запись: «0.5», «1/2», «0,5»).
 */

const MATH = [
  {
    id: "sat-math-algebra",
    title: "Domain 1: Algebra",
    minutes: 16,
    questions: [
      {
        id: "q1",
        type: "numeric",
        prompt: "If 3(2x − 4) = 5x + 7, what is the value of x?",
        answer: "19",
        accept: ["19"],
        explanation: "6x − 12 = 5x + 7 → x = 19.",
      },
      {
        id: "q2",
        type: "numeric",
        prompt: "A line passes through the points (2, 5) and (6, 13). What is the slope of the line?",
        answer: "2",
        accept: ["2"],
        explanation: "(13 − 5) / (6 − 2) = 8/4 = 2.",
      },
      {
        id: "q3",
        type: "numeric",
        prompt: "In the system below, what is the value of x + y?\n2x + 3y = 12\nx − y = 1",
        answer: "5",
        accept: ["5"],
        explanation:
          "Из второго уравнения x = y + 1. Подставляем: 2(y + 1) + 3y = 12 → 5y = 10 → y = 2, x = 3. Тогда x + y = 5.",
      },
      {
        id: "q4",
        type: "numeric",
        prompt: "The function f is defined by f(x) = 3x − 7. If f(a) = 11, what is the value of a?",
        answer: "6",
        accept: ["6"],
        explanation: "3a − 7 = 11 → 3a = 18 → a = 6.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "Line ℓ is given by 4x − 2y = 9. What is the slope of a line perpendicular to ℓ?",
        options: ["−2", "−1/2", "1/2", "2"],
        answer: 1,
        explanation:
          "4x − 2y = 9 → y = 2x − 4.5, наклон ℓ равен 2. Перпендикулярный наклон — это −1/2.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt: "Which inequality is equivalent to 5 − 2x ≥ 13?",
        options: ["x ≥ −4", "x ≤ −4", "x ≥ 4", "x ≤ 4"],
        answer: 1,
        explanation:
          "5 − 2x ≥ 13 → −2x ≥ 8. При делении на −2 знак меняется: x ≤ −4.",
      },
    ],
  },
  {
    id: "sat-math-advanced",
    title: "Domain 2: Advanced Math",
    minutes: 18,
    questions: [
      {
        id: "q1",
        type: "numeric",
        prompt: "What is the sum of the solutions of x² − 5x + 6 = 0?",
        answer: "5",
        accept: ["5"],
        explanation:
          "Корни 2 и 3 (разложение (x − 2)(x − 3)); их сумма 5 — это же даёт формула Виета −b/a.",
      },
      {
        id: "q2",
        type: "numeric",
        prompt: "For the parabola y = x² − 6x + 11, what is the minimum value of y?",
        answer: "2",
        accept: ["2"],
        explanation:
          "y = (x − 3)² + 2, значит минимум достигается при x = 3 и равен 2.",
      },
      {
        id: "q3",
        type: "numeric",
        prompt:
          "A population of 300 bacteria doubles every 5 years. Assuming the model continues, what is the population after 20 years?",
        answer: "4800",
        accept: ["4800", "4,800"],
        explanation: "За 20 лет происходит 20 / 5 = 4 удвоения: 300 · 2⁴ = 300 · 16 = 4800.",
      },
      {
        id: "q4",
        type: "multiple_choice",
        prompt: "What are the solutions of x² + 2x − 8 = 0?",
        options: ["x = −4 and x = 2", "x = 4 and x = −2", "x = −8 and x = 1", "x = 8 and x = −1"],
        answer: 0,
        explanation: "(x + 4)(x − 2) = 0 → x = −4 или x = 2.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt: "For x ≠ 3, which expression is equivalent to (x² − 9) / (x − 3)?",
        options: ["x − 3", "x + 3", "x² + 3", "3x"],
        answer: 1,
        explanation:
          "Числитель раскладывается как (x − 3)(x + 3); после сокращения остаётся x + 3.",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "The equation x² + kx + 9 = 0 has exactly one real solution. Which of the following could be the value of k?",
        options: ["0", "3", "6", "9"],
        answer: 2,
        explanation:
          "Ровно одно решение при дискриминанте 0: k² − 36 = 0 → k = ±6. Из вариантов подходит 6.",
      },
    ],
  },
  {
    id: "sat-math-data",
    title: "Domain 3: Problem-Solving and Data Analysis",
    minutes: 18,
    questions: [
      {
        id: "q1",
        type: "numeric",
        prompt:
          "The average of five numbers is 12. Four of the numbers are 9, 14, 11 and 16. What is the fifth number?",
        answer: "10",
        accept: ["10"],
        explanation: "Сумма пяти чисел 5 · 12 = 60. Известные дают 50, значит пятое число 60 − 50 = 10.",
      },
      {
        id: "q2",
        type: "numeric",
        prompt:
          "A jacket costs 80 dollars. It is discounted by 25%, and then a 10% sales tax is applied to the discounted price. What is the final price, in dollars?",
        answer: "66",
        accept: ["66"],
        explanation: "После скидки 80 · 0.75 = 60. С налогом 60 · 1.10 = 66.",
      },
      {
        id: "q3",
        type: "numeric",
        prompt:
          "Four identical machines produce 240 parts in 6 hours. At the same rate, how many parts will seven machines produce in 9 hours?",
        answer: "630",
        accept: ["630"],
        explanation:
          "Производительность одной машины: 240 / (4 · 6) = 10 деталей в час. Тогда 7 · 9 · 10 = 630.",
      },
      {
        id: "q4",
        type: "numeric",
        prompt: "What is the median of the data set 4, 7, 7, 9, 12, 15?",
        answer: "8",
        accept: ["8"],
        explanation:
          "Набор уже упорядочен, элементов чётное число: медиана — среднее двух центральных (7 и 9) = 8.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "A bag contains 5 red, 3 blue and 2 green marbles. One marble is drawn at random. What is the probability that it is NOT red?",
        options: ["1/5", "1/2", "3/10", "2/5"],
        answer: 1,
        explanation:
          "Некрасных 3 + 2 = 5 из 10, вероятность 5/10 = 1/2. (Или 1 − 5/10.)",
      },
      {
        id: "q6",
        type: "multiple_choice",
        prompt:
          "A study finds that, in a town, the number of bicycles sold increases by about 4 for every 1-degree rise in average summer temperature. Which statement best interprets this relationship?",
        options: [
          "Temperature causes exactly four additional sales per degree",
          "On average, sales and temperature increase together by about 4 sales per degree",
          "Every fourth customer buys a bicycle when it is warmer",
          "Four degrees of warming double bicycle sales",
        ],
        answer: 1,
        explanation:
          "Это описание ассоциации по средней скорости изменения, а не утверждение о причинности и не удвоение.",
      },
    ],
  },
  {
    id: "sat-math-geometry",
    title: "Domain 4: Geometry and Trigonometry",
    minutes: 18,
    questions: [
      {
        id: "q1",
        type: "numeric",
        prompt:
          "In a right triangle, the legs have lengths 6 and 8. What is the length of the hypotenuse?",
        answer: "10",
        accept: ["10"],
        explanation: "Теорема Пифагора: √(36 + 64) = √100 = 10.",
      },
      {
        id: "q2",
        type: "multiple_choice",
        prompt:
          "In the same right triangle (legs 6 and 8, hypotenuse 10), what is the sine of the angle opposite the side of length 6?",
        options: ["0.6", "0.8", "0.75", "1.25"],
        answer: 0,
        explanation: "sin = противолежащий катет / гипотенуза = 6/10 = 0.6.",
      },
      {
        id: "q3",
        type: "numeric",
        prompt: "A circle in the xy-plane is given by x² + y² = 25. What is its area?",
        answer: "25π",
        accept: ["25π", "25pi", "78.5", "78.54"],
        explanation: "Радиус 5, площадь πr² = 25π ≈ 78.54.",
      },
      {
        id: "q4",
        type: "numeric",
        prompt:
          "Two triangles are similar with a side-length ratio of 3 : 5. If the area of the smaller triangle is 36, what is the area of the larger triangle?",
        answer: "100",
        accept: ["100"],
        explanation:
          "Отношение площадей подобных фигур — квадрат отношения сторон: 9 : 25. Значит 36 · (25/9) = 100.",
      },
      {
        id: "q5",
        type: "multiple_choice",
        prompt:
          "Two parallel lines are cut by a transversal. One of the alternate interior angles measures 68°. What is the measure of the other alternate interior angle?",
        options: ["22°", "68°", "112°", "136°"],
        answer: 1,
        explanation: "Накрест лежащие углы при параллельных прямых равны, поэтому второй тоже 68°.",
      },
      {
        id: "q6",
        type: "numeric",
        prompt:
          "If θ is an acute angle and cos θ = 3/5, what is the value of sin θ?",
        answer: "4/5",
        accept: ["4/5", "0.8", "0,8"],
        explanation:
          "sin²θ = 1 − 9/25 = 16/25. Так как θ острый, sin θ = 4/5 = 0.8.",
      },
    ],
  },
];

export default MATH;
