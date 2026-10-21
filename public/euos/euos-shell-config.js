/*
 * Конфигурация EduOS-шелла для продукта «LeadAI».
 *
 * Грузится ДО euos-shell.js. Файлы шелла лежат в public/euos/, поэтому
 * Next.js отдаёт их по /euos/euos-shell.js и /euos/euos-shell.css.
 *
 * CSP: конфиг — отдельный файл, а не инлайн-скрипт, поэтому политика
 * script-src 'self' его не ломает.
 *
 * Домены ниже — шаблон. Замените на реальные адреса деплоя.
 */
window.EUOS_SHELL_CONFIG = {
  current: "leadai",
  currentLabel: "LeadAI",

  assetBase: "/euos",
  homeUrl: "https://eduos.example.org",
  consolePath: "https://eduos.example.org/docs",

  products: [
    { id: "eduos", label: "EduOS", icon: "🧭", url: "https://eduos.example.org" },
    { id: "saiyan", label: "Saiyan", icon: "🐉", url: "https://saiyan.example.org/console/" },
    { id: "exam-ace", label: "exam-ace", icon: "📝", url: "https://exam-ace.example.org" },
    { id: "leadai", label: "LeadAI", icon: "🎯", url: "https://leadai.example.org/federation" }
  ]
};
