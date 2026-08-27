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

> **Важно:** Переменные с префиксом `NEXT_PUBLIC_` попадают в клиентский бандл и считаются публичными. Серверные переменные (без префикса) не должны содержать секреты, которые нужно раскрывать клиенту.

---

## 🗂 Структура проекта

```
leadai/
├── app/                    # Страницы Next.js (App Router)
│   ├── api/                # API-маршруты
│   │   └── ai/route.js     # Единый AI-маршрут (роутинг по endpoint)
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
│   └── firebase.js         # Firebase-конфигурация
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

## 🧪 Тестирование

Проект использует сборку Next.js для проверки типов и линтинга:

```bash
npm run build
```

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
