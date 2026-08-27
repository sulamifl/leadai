import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "app.netlify.leadai",
  appName: "Lead AI",
  // Гибридный режим: приложение загружает развёрнутый веб-сервис в нативный WebView.
  // Все серверные API-маршруты (/api/ai, /api/voice и т.д.) продолжают работать на сервере.
  webDir: ".next",
  server: {
    // URL развёрнутого веб-сервиса (Vercel/Netlify). Замените на ваш продакшен-URL.
    url: "https://leadai.netlify.app",
    // Разрешить HTTP-запросы (для локальной разработки/тестирования).
    cleartext: true,
  },
  android: {
    // Разрешить WebView загружать удалённый контент.
    allowMixedContent: true,
  },
  ios: {
    // Разрешить произвольные загрузки в WebView.
    contentInset: "always",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#800120",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "large",
      spinnerColor: "#ffffff",
    },
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#800120",
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"],
    },
  },
};

export default config;
