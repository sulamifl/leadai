# LeadAI — AI-платформа для подготовки к IELTS, TOEFL и SAT

**LeadAI** — веб-платформа подготовки к международным экзаменам: **IELTS Academic** (Band 0–9), **TOEFL iBT** (0–120) и **Digital SAT** (400–1600). В репозитории — 55 наборов и 232 задания с ключами, детерминированный скоринг, рубричная оценка Writing/Speaking (итог считает приложение, а не языковая модель) и AI-тьюторы поверх защищённого `/api/ai`.

---

## ✨ Возможности

### 📝 Тестирование

- **Три экзамена в одном движке**: IELTS Academic, TOEFL iBT, Digital SAT
- **55 наборов / 232 задания** с ключами и объяснениями — не заглушки
- **Экзаменационный режим** — имитация реального экзамена с таймером
- **Практический режим** — тренировка по отдельным секциям и наборам
- **Детерминированная автопроверка** 206 заданий: индексы, multi-answer,
  свободный текст, дроби, валюты, `$1,200` и `1 200` = `1200`
- **Рубричная оценка Writing/Speaking**: 4 критерия × band для IELTS,
  критерии 0–5 / 0–4 для TOEFL; итог считает приложение
- **Разбор ошибок** с AI-анализом каждого ответа

### 🤖 AI-функции

- **AI-чат ассистент** — общий помощник по IELTS
- **AI Speaking Tutor** — практика устной речи с обратной связью
- **AI Writing Tutor** — проверка эссе и письменных заданий
- **AI Reading/Listening Tutor** — разбор ошибок в чтении и аудировании
- **AI Error Analysis** — детальный анализ ошибок по вопросам
- **AI-генератор плана** — персонализированный план подготовки
- **AI-рекомендации университетов** — подбор вузов по баллу

### 📊 Прогресс и мотивация

- **Трекер прогресса** — графики и статистика по секциям
- **Цели (Target Band Score)** — постановка и отслеживание целей
- **Геймификация** — XP, уровни, достижения, серии (streaks)
- **Лидерборд** — рейтинг пользователей
- **Уведомления и напоминания**

### 🌍 Локализация

- Поддержка **5 языков**: English, Русский, 中文, Қазақша, العربية
- Переключение языка через `?lang=` параметр

### 📄 Экспорт

- **PDF-экспорт** результатов тестов
- **PDF-экспорт** плана подготовки
- **PDF-экспорт** словаря

### ⚙️ Технические

- **PWA / офлайн-режим** — установка на устройство, работа без интернета
- **Адаптивный дизайн** — мобильные и десктопные устройства
- **Тёмная/светлая тема**

---

## 🛠 Технологический стек

| Технология                              | Назначение                         |
| --------------------------------------- | ---------------------------------- |
| **Next.js 14** (App Router)             | Фреймворк                          |
| **React 18**                            | UI-библиотека                      |
| **Firebase** (Auth, Firestore, Storage) | Аутентификация, база данных, файлы |
| **DeepSeek API**                        | AI-модель для всех AI-функций      |
| **styled-components**                   | Стилизация                         |
| **Tailwind CSS**                        | Утилитарные стили                  |
| **react-i18next**                       | Интернационализация                |
| **jspdf**                               | PDF-экспорт                        |
| **react-syntax-highlighter**            | Подсветка кода                     |
| **Capacitor**                           | Мобильная сборка                   |

---

## 🚀 Быстрый старт

### Требования

- Node.js 18+ (рекомендуется 20+)
- npm или yarn

### Установка

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd leadai

# 2. Установить зависимости
npm install

# 3. Настроить переменные окружения
cp .env.example .env.local
# Заполните .env.local своими ключами (см. ниже)

# 4. Запустить в режиме разработки
npm run dev
```

Приложение будет доступно по адресу `http://localhost:3000`.

### Сборка для продакшена

```bash
npm run build
npm run start
```

### ⚠️ Если в вашем окружении задан `NODE_ENV=production`

Глобальная переменная `NODE_ENV=production` (например, в `~/.zshrc`) ломает локальную разработку:

- `npm install` перестаёт ставить `devDependencies` — `npm run lint` падает с `ESLint must be installed`;
- `next dev` не обрабатывает директивы Tailwind, и все страницы отдают 500 (`Module parse failed: Unexpected character '@'`).

Обход:

```bash
npm install --include=dev      # установить и dev-зависимости
NODE_ENV=development npm run dev
```

Продакшн-сборка (`npm run build`) от этой переменной не зависит.

---

## 🎯 Экзаменационный движок (IELTS · TOEFL · SAT)

Хаб `/exams` → экзамен → секция. Страницы собираются статически
(`generateStaticParams`), поэтому после первой загрузки контент доступен и
офлайн.

| Экзамен | Шкала | Наборов | Заданий | Автопроверка | Рубрика |
| --- | --- | --- | --- | --- | --- |
| **IELTS Academic** | Band 0–9 | 24 | 90 | 76 (Listening 36 + Reading 40) | 14 |
| **TOEFL iBT** | 0–120 | 21 | 82 | 70 (Reading 40 + Listening 30) | 12 |
| **Digital SAT** | 400–1600 | 10 | 60 | 60 (Reading & Writing 36 + Math 24) | — |
| **Итого** | — | **55** | **232** | **206** | **26** |

### Слои движка

| Файл | Ответственность |
| --- | --- |
| [`lib/exams/registry.mjs`](lib/exams/registry.mjs:1) | Реестр экзаменов, секций и наборов — единый источник правды для UI и тестов |
| [`lib/exams/scoring.mjs`](lib/exams/scoring.mjs:1) | Шкалы: официальная таблица IELTS 40→band, TOEFL 0–30 по проценту, SAT 200–800 |
| [`lib/exams/grade.mjs`](lib/exams/grade.mjs:1) | Проверка ответов: индексы, `multiple_answer`, свободный текст, дроби, валюты |
| [`lib/exams/rubrics.mjs`](lib/exams/rubrics.mjs:1) | Рубрики Writing/Speaking, промпты и калибровка ответа модели |
| [`lib/exams/content.mjs`](lib/exams/content.mjs:1) | Валидация контент-паков и сводка (`validateContent`, `contentSummary`) |
| `data/exams/{ielts,toefl,sat}/*.mjs` | Контент: пассажи, транскрипты, вопросы, ключи, объяснения |

Все модули — чистый ESM без зависимостей: работают и в браузере, и в
`node --test` без сборки.

### Почему оценка Writing/Speaking рубричная

Раньше модель возвращала `score out of 100`, и итог зависел от её «настроения».
Теперь модель заполняет **только критерии** (IELTS — 4 × band 0–9, TOEFL
Writing — 4 × 0–5, TOEFL Speaking — 3 × 0–4), а итог считает приложение:

- [`calibrateRubric()`](lib/exams/rubrics.mjs:340) отбрасывает лишние критерии,
  добивает отсутствующие нулём с предупреждением, приводит балл к сетке рубрики
  ([`snapToRubricScale()`](lib/exams/rubrics.mjs:317)) и сам считает среднее;
- итог IELTS округляется по официальному правилу (6.25 → 6.5, 6.75 → 7.0),
  TOEFL — до 0.5;
- поле `overall` от модели **игнорируется**: если модель написала «9», а
  критерии дают 6.5, пользователь увидит 6.5.

### Как добавить свой набор

1. Создайте `data/exams/<exam>/<section>.mjs` с массивом `sets`.
2. У вопроса обязателен `answer` (индекс варианта, массив индексов или строка)
   и желателен `explanation`.
3. Запустите `npm test`: [`tests/exam-content.test.mjs`](tests/exam-content.test.mjs:1)
   проверит структуру, уникальность id и границы индексов, а
   [`tests/exam-grade.test.mjs`](tests/exam-grade.test.mjs:1) прогонит все
   эталонные ответы через проверку и потребует 100%.

---

## 🔑 Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните значения:

| Переменная                                 | Описание                                     | Тип       |
| ------------------------------------------ | -------------------------------------------- | --------- |
| `DEEPSEEK_API_KEY`                         | Ключ API DeepSeek                            | Серверная |
| `DEEPSEEK_BASE_URL`                        | Базовый URL API (`https://api.deepseek.com`) | Серверная |
| `DEEPSEEK_MODEL`                           | Модель (`deepseek-chat`)                     | Серверная |
| `MONGODB_URI`                              | Строка подключения MongoDB (опционально)     | Серверная |
| `NEXT_PUBLIC_FIREBASE_API_KEY`             | Firebase API Key                             | Публичная |
| `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`         | Firebase Auth Domain                         | Публичная |
| `NEXT_PUBLIC_FIREBASE_DATABASE_URL`        | Firebase Database URL                        | Публичная |
| `NEXT_PUBLIC_FIREBASE_PROJECT_ID`          | Firebase Project ID                          | Публичная |
| `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`      | Firebase Storage Bucket                      | Публичная |
| `NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase Sender ID                           | Публичная |
| `NEXT_PUBLIC_FIREBASE_APP_ID`              | Firebase App ID                              | Публичная |
| `NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID`      | Firebase Analytics ID                        | Публичная |
| `AI_AUTH_MODE`                             | `required` (по умолчанию) / `optional` / `off` — режим проверки ID-token на `/api/ai` | Серверная |
| `FIREBASE_PROJECT_ID`                      | Проект Firebase, чьи токены принимаем (fallback: `NEXT_PUBLIC_FIREBASE_PROJECT_ID`) | Серверная |
| `AI_RATE_USER_LIMIT` / `AI_RATE_USER_WINDOW_MS` | Лимит на пользователя (по умолчанию 40 / 5 мин) | Серверная |
| `AI_RATE_IP_LIMIT` / `AI_RATE_IP_WINDOW_MS`     | Лимит на IP для анонимов (по умолчанию 20 / 5 мин) | Серверная |
| `AI_RATE_GLOBAL_LIMIT` / `AI_RATE_GLOBAL_WINDOW_MS` | Глобальный предохранитель (по умолчанию 600 / мин) | Серверная |
| `EDUOS_SSO_SECRET`                         | Секрет HMAC-моста федерации (== `LEADAI_SSO_SECRET` в EduOS) | Серверная |
| `EDUOS_FEDERATION_URL`                     | Базовый URL EduOS для ссылки «назад» (опционально) | Серверная |

> **Важно:** Переменные с префиксом `NEXT_PUBLIC_` попадают в клиентский бандл и считаются публичными. Серверные переменные (без префикса) не должны содержать секреты, которые нужно раскрывать клиенту.

---

## 🔒 Защита `/api/ai`

`/api/ai` — единственная точка выхода к платному DeepSeek, поэтому она закрыта
двумя слоями: **аутентификацией** и **лимитами**. Обе проверки выполняются до
вызова модели, так что неавторизованный или слишком частый запрос не тратит деньги.

### Аутентификация

Токен — Firebase ID-token (`Authorization: Bearer <idToken>`). Подпись RS256
проверяется по публичным x509-сертификатам Google ([`lib/apiAuth.mjs`](lib/apiAuth.mjs:1)),
без `firebase-admin`; сертификаты кешируются по `Cache-Control: max-age`.

| `AI_AUTH_MODE`            | Поведение                                                      |
| ------------------------- | -------------------------------------------------------------- |
| `required` (по умолчанию) | Без валидного токена — `401`, модель не вызывается              |
| `optional`                | Токен проверяется, если передан; аноним идёт под IP-лимитом     |
| `off`                     | Проверка выключена (только для локальной разработки)            |

Издатель и аудитория сверяются с `FIREBASE_PROJECT_ID`
(fallback — `NEXT_PUBLIC_FIREBASE_PROJECT_ID`). Клиент получает токен сам:

```js
import { aiJson } from "../lib/aiClient";

const data = await aiJson("/api/ai", { endpoint: "writing", text, task });
```

### Лимиты

Скользящие окна проверяются по цепочке **global → user → ip**
([`lib/rateLimit.mjs`](lib/rateLimit.mjs:1)): сработавший самый узкий лимит
определяет ответ. При превышении — `429` с `Retry-After`,
`X-RateLimit-Limit` и `X-RateLimit-Remaining`.

| Ключ              | По умолчанию | Зачем                                          |
| ----------------- | ------------ | ---------------------------------------------- |
| global            | 600 / мин    | предохранитель от всплеска (общий счёт за API) |
| user (`sub` токена) | 40 / 5 мин  | честная квота одному ученику                   |
| ip (аноним)       | 20 / 5 мин   | анонимный трафик не выедает чужую квоту         |

---

## 🔗 Федерация EduOS (SSO)

LeadAI — четвёртый продукт федерации Sulametrix: EduOS владеет аккаунтом,
LeadAI принимает его подтверждённую личность. Обмен идёт по тому же HMAC-мосту,
что и с exam-ace, но со своим секретом и своим маркером направления
`aud="leadai"`.

### Как это работает

1. Пользователь в EduOS открывает «Федерация» → «Токен для LeadAI»
   (`POST /saiyan/sso/token?audience=leadai`).
2. EduOS подписывает `{email, aud: "leadai", exp, iat}` и, если у него задан
   `LEADAI_BASE_URL`, добавляет `handoff_url` вида
   `{LEADAI_BASE_URL}/api/federation/sso?token=…`.
3. LeadAI проверяет подпись, срок и `aud`, затем рендерит [`/federation`](app/federation/page.jsx:1)
   с подтверждённым email и ключом склейки.

### Эндпоинты

| Маршрут | Поведение |
| --- | --- |
| [`GET /api/federation/sso`](app/api/federation/sso/route.js:1) | `404` без `EDUOS_SSO_SECRET` (конвенция «секрет вместо флага»), `401` с причиной отказа, `200 {linked, owner, email, emailKey, expiresAt}`. Всегда `Cache-Control: no-store`. |
| [`GET /api/federation/unlink`](app/api/federation/unlink/route.js:1) | Уведомление `act="unlink"` (P1-8B): `200 {unlinked: true, subject: null, subjectVersion, session: "none"}` — subject больше не наш; handoff-токен здесь получает `400 not_an_unlink_notice`. |
| [`GET /api/federation/logout`](app/api/federation/logout/route.js:1) | Уведомление `act="logout"` (P1-8C): `200 {loggedOut: true, subject, subjectVersion, session: "none"}` — честный no-op, потому что гасить нечего; handoff-токен получает `400 not_a_logout_notice`. |
| [`GET /api/federation/health`](app/api/federation/health/route.js:1) | Состояние моста **без секрета** (P2-9): всегда `200 {status: "ok", owner, audience, configured, eduos_url_set, token_ttl_seconds, session: "none", endpoints}`, где `configured: false` значит «`EDUOS_SSO_SECRET` не задан», а `eduos_url_set` — задан ли `EDUOS_FEDERATION_URL`. Ни секрета, ни URL в ответе нет. `404` здесь был бы хуже: выключенный мост выглядел бы как недоступный продукт. |
| [`/federation`](app/federation/page.jsx:1) | Серверная страница: проверяет токен **до** рендера и переводит код ошибки в человеческий текст. |

Причины отказа (`reason` в 401): `not_configured`, `malformed`, `bad_signature`,
`expired`, `missing_email`, `wrong_audience`, `missing_secret`.

### Единый выход и версия subject (P1-8C)

EduOS поднимает версию subject при выходе и обходит соседей; LeadAI получает тот
же уведомляющий вызов, что и exam-ace, но отвечает **`session: "none"`** — не
потому что забыл, а потому что Firebase-сессии у него нет. Молчащий эндпоинт хаб
прочитал бы как сбой федерации, а явный no-op отличает «подтвердил» от «не
отвечает»: у хаба в `logout.delivered.leadai` окажется `true`.

Что здесь **не** происходит:

- **Ссылка не гасится.** LeadAI не ведёт реестр `jti`: он ничего не помнит о
  посетителе, поэтому повторный переход по той же ссылке откроет ту же
  подтверждённую личность. Одноразовость — свойство продукта с сессией
  (exam-ace), а не универсальное правило федерации.
- **Версия никуда не пишется.** `subjectVersion` возвращается вызывающему, но
  принимать решения по `sv` здесь нечему — у LeadAI нет ни cookie, ни
  сохранённого watermark. Сравнение версий живёт там, где есть сессия.
- **Личность не создаётся и не удаляется.** Ни `logout`, ни `unlink` не пишут
  в хранилище: прогресс IELTS привязан к Firebase-пользователю, а федеративный
  слой остаётся проверкой личности, а не источником данных.

### Что этот мост НЕ делает

- **Не создаёт Firebase-сессию.** В проекте используется клиентский Firebase SDK,
  Admin SDK нет, поэтому выпустить `session cookie` из токена нечем. `/federation`
  показывает подтверждённую личность и предлагает войти в Firebase обычным
  способом; это осознанный «минимум», а не забытая деталь.
- **Не отправляет попытки IELTS** в `/fed/attempts` EduOS. Обратный поток для
  LeadAI — следующий шаг; формат и идемпотентность уже обкатаны на exam-ace.

### Шелл экосистемы (P1-7)

Шапка EduOS встроена в корневой layout — [`app/layout.tsx`](app/layout.tsx:1),
в самое начало `<body>`:

```tsx
<script src="/euos/euos-shell-config.js" />
<script src="/euos/euos-shell.js" defer />
```

Конфиг идёт первым и отдельным файлом: шелл читает `window.EUOS_SHELL_CONFIG`
до авто-монтирования, а CSP `script-src 'self'` собственные файлы не запрещает.
Layout объявлен `"use client"`, поэтому `next/script` с `beforeInteractive`
недоступен — обычные теги здесь и есть правильный выбор.

Копии лежат в [`public/euos/`](public/euos) и разносятся
[`scripts/sync_shell.py`](../scripts/sync_shell.py:1) из `eduos/static/`;
рассинхрон ловит `eduos/tests/test_shell_package_parity.py`. Домены в конфиге —
шаблон `*.example.org`, синхронизатор не перезаписывает существующий файл,
поэтому реальные адреса деплоя сохраняются при повторных прогонах.

### Совместимость с Python-хабом

[`lib/federation.mjs`](lib/federation.mjs:1) реализует ровно тот же формат, что и
[`eduos/ai_core/federation_sso.py`](../eduos/ai_core/federation_sso.py:1):
`base64url(json(sort_keys, compact))` + `.` + `base64url(hmac_sha256(...))`, без
padding. Отдельно реализовано экранирование как у `json.dumps(ensure_ascii=True)`
— `JSON.stringify` не экранирует не-ASCII, и без этого подпись не сошлась бы на
любом нелатинском email.

Совместимость доказана не рассуждением, а **общей золотой строкой**: один токен,
выпущенный настоящим Python-подписантом, зашит константой и в
[`tests/federation.test.mjs`](tests/federation.test.mjs:1), и в
`eduos/tests/test_federation_leadai.py`. JS обязан его принять и переподписать
байт-в-байт.

---

## 🗂 Структура проекта

```
leadai/
├── app/                    # Страницы Next.js (App Router)
│   ├── api/                # API-маршруты
│   │   ├── ai/route.js     # Единый AI-маршрут (роутинг по endpoint)
│   │   └── federation/     # Приём SSO-токена федерации EduOS
│   │       └── sso/route.js
│   ├── federation/         # Страница подтверждённой личности (/federation)
│   ├── main/               # Основной модуль тестирования
│   │   ├── page.jsx        # Точка входа (trainer/practice/default)
│   │   ├── MainPage.jsx    # Полный тест
│   │   ├── TestHub.jsx     # Выбор режима
│   │   ├── results.jsx     # Результаты + геймификация
│   │   ├── ListeningSection.jsx
│   │   ├── ReadingSection.jsx
│   │   ├── WritingSection.jsx
│   │   └── SpeakingSection.jsx
│   ├── cabinet/            # Личный кабинет
│   ├── gamification/       # Геймификация (XP, уровни, достижения)
│   ├── leaderboard/        # Лидерборд
│   ├── progress/           # Трекер прогресса
│   ├── goals/              # Цели (Target Band Score)
│   ├── study-plan/         # AI-план подготовки
│   ├── history/            # История тестов
│   ├── speaking-tutor/     # AI Speaking Tutor
│   ├── writing-tutor/      # AI Writing Tutor
│   ├── reading-listening-tutor/ # AI Reading/Listening Tutor
│   ├── assistant/          # AI-чат
│   ├── vocabulary/         # Словарь
│   ├── notifications/      # Уведомления
│   ├── programming/        # AI-помощник по программированию
│   └── exams/              # Экзамены IELTS · TOEFL · SAT
│       ├── page.jsx        # Каталог экзаменов и секций
│       └── [exam]/
│           ├── page.jsx    # Секции выбранного экзамена
│           └── [section]/
│               └── page.jsx # Раннер набора (/exams/ielts/reading)
├── components/             # Переиспользуемые компоненты
│   └── exam/
│       └── ExamRunner.jsx  # Раннер: вопросы, таймер, авто- и рубричная проверка
├── lib/                    # Бизнес-логика
│   ├── aiHandlers.js       # Обработчики AI-запросов (в т.ч. rubric-оценка Writing/Speaking)
│   ├── aiClient.js         # Клиент: ID-token Firebase + aiFetch/aiJson
│   ├── apiAuth.mjs         # Проверка Firebase ID-token (RS256, x509-кэш)
│   ├── apiGuard.mjs        # Единый guard: 401/429/500 + JSON-ответ
│   ├── rateLimit.mjs       # Скользящие окна: global → user → ip
│   ├── exams/              # Движок экзаменов (без зависимостей)
│   │   ├── registry.mjs    # Описание экзаменов и секций
│   │   ├── scoring.mjs     # Шкалы: band 0–9, 0–120, 400–1600
│   │   ├── grade.mjs       # Детерминированная проверка ответов
│   │   ├── rubrics.mjs     # Рубрики Writing/Speaking + калибровка
│   │   └── content.mjs     # Загрузка и валидация контент-паков
│   ├── deepseek.js         # Клиент DeepSeek API
│   ├── gamification.js     # Сервис геймификации
│   ├── resultsService.js   # Сервис результатов
│   ├── pdfExport.js        # PDF-экспорт
│   ├── federation.mjs      # HMAC-мост федерации (серверный, node:crypto)
│   └── firebase.js         # Firebase-конфигурация
├── tests/                  # node --test — 10 файлов, 146 тестов
├── public/                 # Статические файлы
│   ├── locales/            # Файлы переводов (5 языков)
│   ├── manifest.json       # PWA-манифест
│   └── sw.js               # Service Worker (офлайн)
└── data/                   # Данные
    └── exams/              # Контент-паки: ielts/ (24 набора), toefl/ (21), sat/ (10)
```

---

## 🌐 Развёртывание

### Vercel (рекомендуется)

```bash
npm run deploy   # или: vercel --prod
```

Или подключите репозиторий в [Vercel Dashboard](https://vercel.com) — сборка и деплой настроятся автоматически.

### Netlify

Проект уже содержит [`netlify.toml`](netlify.toml) с плагином `@netlify/plugin-nextjs`. Подключите репозиторий в Netlify — сборка произойдёт автоматически.

### Fly.io

```bash
fly launch
fly deploy
```

Конфигурация в [`fly.toml`](fly.toml) и [`Dockerfile`](Dockerfile).

### Docker

```bash
docker build -t leadai .
docker run -p 3000:3000 leadai
```

---

## 📱 Мобильное приложение (Capacitor)

Проект включает гибридную мобильную обёртку на **Capacitor**. Приложение загружает развёрнутый веб-сервис в нативный WebView, поэтому все серверные API-маршруты (`/api/ai`, `/api/voice` и т.д.) продолжают работать на сервере.

### Как это работает

- [`capacitor.config.ts`](capacitor.config.ts) настроен на гибридный режим: `server.url` указывает на развёрнутый веб-сервис.
- Нативные плагины: push-уведомления, статус-бар, сплэш-экран, обработка кнопки «назад» на Android, состояние сети.
- Интеграция в [`lib/capacitor.js`](lib/capacitor.js) и [`app/layout.tsx`](app/layout.tsx).

### Требования

- Node.js 18+
- Для Android: Android Studio + JDK 17
- Для iOS: macOS + Xcode

### Сборка

1. **Разверните веб-версию** на Vercel/Netlify и укажите URL в `capacitor.config.ts` (`server.url`).

2. **Установите зависимости** (плагины Capacitor уже в `package.json`):

   ```bash
   npm install
   ```

3. **Добавьте нативные платформы** (один раз):

   ```bash
   npm run mobile:add
   ```

4. **Синхронизируйте** веб-сборку с нативными проектами:

   ```bash
   npm run mobile:sync
   ```

5. **Откройте нативный проект**:

   ```bash
   npm run mobile:android   # Android Studio
   npm run mobile:ios       # Xcode
   ```

6. Соберите и запустите приложение из Android Studio / Xcode.

### Настройка push-уведомлений

- **Android**: Firebase Cloud Messaging (FCM) — добавьте `google-services.json` в `android/app/`.
- **iOS**: Apple Push Notification Service (APNs) — настройте в Xcode и на сервере.

---

## 🧪 Проверка перед коммитом

```bash
npm run lint     # ESLint (next lint)
npm test         # node --test "tests/*.test.mjs" — 146 тестов, без зависимостей
npm run build    # проверка типов, продакшн-сборка всех страниц и API-роутов
```

> `npm test` работает на встроенном раннере Node (`node --test`, Node ≥ 18) и не
> требует установки пакетов: движок экзаменов и федерация используют только
> стандартную библиотеку (`node:crypto`).

| Файл | Что проверяет |
| ---- | ------------- |
| [`tests/federation.test.mjs`](tests/federation.test.mjs:1) | HMAC-мост, направление `aud`, срок жизни токена |
| [`tests/exam-scoring.test.mjs`](tests/exam-scoring.test.mjs:1) | Шкалы: IELTS band, TOEFL 0–120, SAT 400–1600, округления и `null` |
| [`tests/exam-grade.test.mjs`](tests/exam-grade.test.mjs:1) | Детерминированная проверка: числа, дроби, `$1,200`, регистр, кавычки |
| [`tests/exam-rubrics.test.mjs`](tests/exam-rubrics.test.mjs:1) | Рубрики 4×band, калибровка, `snapToRubricScale` |
| [`tests/exam-content.test.mjs`](tests/exam-content.test.mjs:1) | Целостность контент-паков (уникальные id, есть правильный ответ) |
| [`tests/api-auth.test.mjs`](tests/api-auth.test.mjs:1) | Разбор JWT, режимы `required`/`optional`/`off`, `401` |
| [`tests/api-guard.test.mjs`](tests/api-guard.test.mjs:1) | Скользящие окна, порядок global → user → ip, заголовки `429` |
| [`tests/health-route.test.mjs`](tests/health-route.test.mjs:1) | `/api/federation/health`: конфигурация без утечки секрета |
| [`tests/logout-route.test.mjs`](tests/logout-route.test.mjs:1) | Уведомление о выходе: подпись, `aud`, срок, версия subject |
| [`tests/unlink-route.test.mjs`](tests/unlink-route.test.mjs:1) | Уведомление об отвязке: только свой маркер, идемпотентность |

> `next lint` требует установленных dev-зависимостей — см. раздел выше про `NODE_ENV`.

---

## 📚 Локализация

Файлы переводов находятся в `public/locales/{en,ru,zh,kk,ar}/translation.json`.

Для добавления нового языка:

1. Создайте папку `public/locales/<code>/`
2. Скопируйте `translation.json` из английской версии
3. Переведите строки
4. Добавьте флаг в `components/Hero.tsx` (языковое меню)

---

## 🤝 Вклад в проект

1. Форкните репозиторий
2. Создайте ветку для фичи (`git checkout -b feature/amazing-feature`)
3. Закоммитьте изменения (`git commit -m 'Add amazing feature'`)
4. Запушьте ветку (`git push origin feature/amazing-feature`)
5. Откройте Pull Request

---

## 📄 Лицензия

Проект распространяется под частной лицензией. Все права защищены.
