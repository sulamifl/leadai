"use client";

/**
 * Модуль интеграции с нативными плагинами Capacitor.
 * Безопасно определяет, работает ли приложение внутри нативной обёртки,
 * и предоставляет функции для push-уведомлений, состояния сети и обработки
 * системной кнопки "назад" на Android.
 */

// Определяем, запущено ли приложение внутри Capacitor WebView.
export const isNative = () => {
  if (typeof window === "undefined") return false;
  return typeof window.Capacitor !== "undefined" && !!window.Capacitor.isNativePlatform();
};

// Динамический импорт плагинов только внутри нативной среды.
const loadPlugins = async () => {
  if (!isNative()) return null;
  const [
    { Capacitor },
    { PushNotifications },
    { Network },
    { App },
    { StatusBar },
    { SplashScreen },
  ] = await Promise.all([
    import("@capacitor/core"),
    import("@capacitor/push-notifications"),
    import("@capacitor/network"),
    import("@capacitor/app"),
    import("@capacitor/status-bar"),
    import("@capacitor/splash-screen"),
  ]);
  return { Capacitor, PushNotifications, Network, App, StatusBar, SplashScreen };
};

/**
 * Регистрирует нативные обработчики:
 * - push-уведомления (запрос разрешения + обработка входящих)
 * - обработка системной кнопки "назад" на Android (минимизация вместо выхода)
 * - скрытие сплэш-экрана после загрузки
 * - стиль статус-бара
 */
export const initNative = async () => {
  if (!isNative()) return;
  const plugins = await loadPlugins();
  if (!plugins) return;
  const { PushNotifications, App, StatusBar, SplashScreen } = plugins;

  // Скрыть сплэш-экран после загрузки веб-контента.
  try {
    await SplashScreen.hide();
  } catch (e) {
    // Игнорируем — сплэш может быть уже скрыт.
  }

  // Стиль статус-бара.
  try {
    await StatusBar.setStyle({ style: "LIGHT" });
    await StatusBar.setBackgroundColor({ color: "#800120" });
  } catch (e) {
    // iOS не поддерживает setBackgroundColor — игнорируем.
  }

  // Обработка системной кнопки "назад" на Android:
  // если пользователь на главной странице — сворачиваем приложение,
  // иначе позволяем WebView обработать навигацию.
  App.addListener("backButton", ({ canGoBack }) => {
    if (!canGoBack) {
      App.minimizeApp();
    }
  });

  // Push-уведомления.
  try {
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive === "prompt") {
      await PushNotifications.requestPermissions();
    }
    await PushNotifications.register();

    PushNotifications.addListener("registration", (token) => {
      console.log("Push registration token:", token.value);
    });

    PushNotifications.addListener("registrationError", (err) => {
      console.error("Push registration error:", err);
    });

    PushNotifications.addListener("pushNotificationReceived", (notification) => {
      console.log("Push received:", notification);
    });

    PushNotifications.addListener("pushNotificationActionPerformed", (notification) => {
      console.log("Push action performed:", notification);
    });
  } catch (e) {
    console.warn("Push notifications not available:", e);
  }
};

/**
 * Подписка на изменения состояния сети.
 * Возвращает функцию отписки.
 */
export const watchNetwork = (onChange) => {
  if (!isNative()) return () => {};
  let unsubscribe = () => {};
  loadPlugins().then(({ Network }) => {
    if (!Network) return;
    Network.addListener("networkStatusChange", (status) => {
      onChange(status.connected);
    });
  });
  return unsubscribe;
};

/**
 * Открывает внешнюю ссылку в системном браузере (не в WebView).
 */
export const openExternal = async (url) => {
  if (!isNative()) {
    window.open(url, "_blank");
    return;
  }
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({ url });
};
