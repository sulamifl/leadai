# LeadAI — AI-платформа для подготовки к IELTS

**LeadAI** — это полнофункциональная веб-платформа для подготовки к IELTS с использованием искусственного интеллекта. Приложение покрывает все четыре секции экзамена (Listening, Reading, Writing, Speaking), предоставляет AI-тьюторов, трекер прогресса, геймификацию и поддержку 5 языков.

---

## ✨ Возможности

### 📝 Тестирование

- **Полные IELTS-тесты** по всем 4 секциям с таймером
- **Экзаменационный режим** — имитация реального экзамена
- **Практический режим** — тренировка по отдельным секциям
- **Автоматическая оценка** по шкале IELTS (0–9)
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
| `EDUOS_SSO_SECRET`                         | Секрет HMAC-моста федерации (== `LEADAI_SSO_SECRET` в EduOS) | Серверная |
| `EDUOS_FEDERATION_URL`                     | Базовый URL EduOS для ссылки «назад» (опционально) | Серверная |

> **Важно:** Переменные с префиксом `NEXT_PUBLIC_` попадают в клиентский бандл и считаются публичными. Серверные переменные (без префикса) не должны содержать секреты, которые нужно раскрывать клиенту.

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
│   └── programming/        # AI-помощник по программированию
├── components/             # Переиспользуемые компоненты
├── lib/                    # Бизнес-логика
│   ├── aiHandlers.js       # Обработчики AI-запросов
│   ├── deepseek.js         # Клиент DeepSeek API
│   ├── gamification.js     # Сервис геймификации
│   ├── resultsService.js   # Сервис результатов
│   ├── pdfExport.js        # PDF-экспорт
│   ├── federation.mjs      # HMAC-мост федерации (серверный, node:crypto)
│   └── firebase.js         # Firebase-конфигурация
├── tests/                  # node --test (federation.test.mjs)
├── public/                 # Статические файлы
│   ├── locales/            # Файлы переводов (5 языков)
│   ├── manifest.json       # PWA-манифест
│   └── sw.js               # Service Worker (офлайн)
└── data/                   # Данные
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
npm test         # node --test "tests/*.test.mjs" — контракт федерации, без зависимостей
npm run build    # проверка типов, продакшн-сборка всех страниц и API-роутов
```

> `npm test` работает на встроенном раннере Node (`node --test`, Node ≥ 18) и не
> требует установки пакетов. Если раннер ещё не подтянул dev-зависимости, тесты
> всё равно пройдут: [`lib/federation.mjs`](lib/federation.mjs:1) использует только
> `node:crypto` и стандартную библиотеку.

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
