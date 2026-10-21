/*
 * EduOS Shell — единая навигация экосистемы поверх любых SPA.
 *
 * Решает «дробность интерфейса»: вместо 10 разрозненных страниц с разными
 * стилями и без общей навигации — одна залипающая шапка с переходами между
 * всеми контурами (портал, бизнес, вузы, гос, код, live, ИИ, маркетплейс,
 * платформа, федерация) и общим виджетом сессии (см. static/euos-auth.js).
 *
 * Подключение внутри EduOS: достаточно одного тега
 *   <script src="/static/euos-shell.js" defer></script>
 *
 * Подключение в другом продукте экосистемы (Saiyan, exam-ace, LeadAI):
 *   <script src="…/euos-shell-config.js"></script>   <!-- первым, без defer -->
 *   <script src="…/euos-shell.js" defer></script>
 * Конфиг задаёт window.EUOS_SHELL_CONFIG — им шелл узнаёт, где на этом origin
 * лежат его ассеты, куда ведёт кнопка EduOS и какие продукты показывать в
 * группе «Экосистема». Без конфига шелл деградирует до EduOS-режима
 * (относительные ссылки), а не падает.
 *
 * Шелл сам: подключит euos-shell.css, построит шапку, подсветит активный
 * раздел и синхронизирует состояние входа. Авто-монтирование отключается
 * атрибутом <body data-euos-no-shell> или EduOSShell.config.autoMount=false.
 *
 * Публичный API: window.EduOSShell
 */
(function (global) {
  "use strict";

  /**
   * Версия пакета. Меняется при каждой правке файла: scripts/sync_shell.py
   * копирует пару .js/.css во все продукты, а
   * eduos/tests/test_shell_package_parity.py сверяет sha256 всех копий и
   * падает при рассинхроне.
   */
  var EUOS_SHELL_VERSION = "1.1.0";

  /** Реестр экранов EduOS — относительные пути, имеют смысл только в EduOS. */
  var PAGES = [
    { path: "/",             label: "Портал",       icon: "🧭" },
    { path: "/business",     label: "Бизнес",       icon: "🏫" },
    { path: "/company",      label: "Компании",     icon: "🏢" },
    { path: "/university",   label: "Вузы",         icon: "🎓" },
    { path: "/government",   label: "Гос",          icon: "🏛️" },
    { path: "/code",         label: "Код",          icon: "💻" },
    { path: "/live",         label: "Live",         icon: "📡" },
    { path: "/scenario",     label: "Сценарии",     icon: "🎭" },
    { path: "/ai-tools",     label: "ИИ",           icon: "🤖" },
    { path: "/marketplace",  label: "Маркетплейс",  icon: "🧩" },
    { path: "/federation",   label: "Федерация",    icon: "🌏" },
    { path: "/platform",     label: "Платформа",    icon: "⚙️" }
  ];

  var config = {
    apiBase: "",
    rawConsolePath: "/docs",   // «сырая» консоль API (Swagger) — вторичный путь
    autoMount: true,
    loginTenants: true,

    /* --- Режим внешнего продукта; переопределяется через EUOS_SHELL_CONFIG --- */
    assetBase: "/static",  // каталог, из которого отдаются euos-shell.js/.css
    homeUrl: "/",          // куда ведёт кнопка EduOS в шапке
    consolePath: "",       // API-консоль; пусто => rawConsolePath
    current: "",           // id продукта, в котором мы находимся
    currentLabel: "",      // человекочитаемое имя этого продукта
    products: []           // [{id, label, icon, url}] — группа «Экосистема»
  };

  function trimSlashes(value) {
    return String(value == null ? "" : value).replace(/\/+$/, "");
  }

  /** Наложение window.EUOS_SHELL_CONFIG на дефолты. Идемпотентно. */
  function applyExternalConfig() {
    var ext = global.EUOS_SHELL_CONFIG;
    if (!ext || typeof ext !== "object") return config;

    Object.keys(ext).forEach(function (key) {
      var value = ext[key];
      if (value === undefined || value === null) return;

      if (key === "products") {
        if (!Array.isArray(value)) return;
        config.products = value.filter(function (p) {
          return p && typeof p === "object" && p.id && p.url;
        }).map(function (p) {
          return {
            id: String(p.id),
            label: String(p.label || p.id),
            icon: p.icon ? String(p.icon) : "↗",
            url: String(p.url)
          };
        });
        return;
      }

      if (key === "assetBase" || key === "homeUrl" || key === "consolePath" ||
          key === "current" || key === "currentLabel" || key === "apiBase") {
        config[key] = String(value);
        return;
      }

      config[key] = value;
    });

    return config;
  }

  function assetBase() { return trimSlashes(config.assetBase); }
  function cssHref() { return assetBase() + "/euos-shell.css"; }
  function homeHref() { return config.homeUrl || "/"; }
  function consoleHref() {
    return config.consolePath || config.rawConsolePath || "/docs";
  }

  /** Шелл смонтирован не в EduOS, а в продукте-партнёре. */
  function externalMode() {
    return !!(config.current && config.current !== "eduos");
  }

  /**
   * Куда ведёт бренд «EduOS» в шапке. На чужом origin «/» — это сам продукт,
   * поэтому при пустом homeUrl ссылки нет: неактивный бренд честнее перехода
   * «в никуда». Внутри EduOS поведение прежнее.
   */
  function homeLink() {
    if (!externalMode()) return homeHref();
    var home = trimSlashes(config.homeUrl);
    return home && home !== "." ? home : "";
  }

  /**
   * Префикс для внутренних экранов EduOS. Вне EduOS относительные пути
   * указывали бы на экраны продукта-партнёра (404), поэтому нужен абсолютный
   * адрес хаба; неизвестен — значит пункты не показываем.
   */
  function eduosOrigin() {
    return externalMode() ? homeLink() : "";
  }

  function productLabel(id) {
    for (var i = 0; i < config.products.length; i += 1) {
      if (config.products[i].id === id) return config.products[i].label;
    }
    return id;
  }

  function injectCSS() {
    var href = cssHref();
    if (global.document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function currentPath() {
    var p = location.pathname.replace(/\/+$/, "");
    return p === "" ? "/" : p;
  }

  function activePath() {
    var p = currentPath();
    if (p === "/international") return "/federation";
    return p;
  }

  /** Один пункт навигации — общий конструктор для внутренних и внешних ссылок. */
  function navLink(href, label, icon, isActive, external) {
    var a = document.createElement("a");
    a.className = "euos-link" +
      (isActive ? " active" : "") +
      (external ? " euos-ext" : "");
    a.href = href;
    a.title = external ? label + " · " + href : label;
    a.innerHTML = '<span class="euos-ico">' + (icon || "•") +
      "</span><span>" + label + "</span>";
    return a;
  }

  function build() {
    if (document.querySelector(".euos-shell")) return;

    var A = global.EduOSAuth;
    var header = document.createElement("header");
    header.className = "euos-shell";
    header.setAttribute("data-euos-product", config.current || "eduos");

    var brandHref = homeLink();
    var brand = document.createElement("a");
    brand.className = "euos-brand";
    if (brandHref) brand.href = brandHref;
    brand.title = brandHref && externalMode() ? "Вернуться в EduOS" : "EduOS";
    brand.innerHTML = '<span class="euos-dot"></span><span>EduOS</span>';

    var hereLabel = config.currentLabel || (config.current && config.current !== "eduos"
      ? productLabel(config.current)
      : "");
    if (hereLabel && hereLabel !== "EduOS") {
      var here = document.createElement("span");
      here.className = "euos-cur";
      here.textContent = hereLabel;
      brand.appendChild(here);
    }

    var nav = document.createElement("nav");
    nav.className = "euos-links";
    var act = activePath();
    var origin = eduosOrigin();

    // Вне EduOS относительный «/business» — это экран продукта-партнёра.
    // Показываем разделы хаба только когда знаем его адрес.
    if (origin || !externalMode()) {
      PAGES.forEach(function (pg) {
        var href = origin ? origin + pg.path : pg.path;
        nav.appendChild(navLink(href, pg.label, pg.icon, !origin && pg.path === act, Boolean(origin)));
      });
    }

    if (config.products.length) {
      var sep = document.createElement("span");
      sep.className = "euos-sep";
      sep.setAttribute("aria-hidden", "true");
      nav.appendChild(sep);
      config.products.forEach(function (p) {
        nav.appendChild(navLink(p.url, p.label, p.icon, p.id === config.current, true));
      });
    }

    var right = document.createElement("div");
    right.className = "euos-right";

    var raw = document.createElement("a");
    raw.className = "euos-raw";
    raw.href = consoleHref();
    raw.title = "Низкоуровневый доступ ко всем эндпоинтам (OpenAPI)";
    raw.textContent = "API-консоль";
    right.appendChild(raw);

    var userBox = document.createElement("div");
    userBox.className = "euos-user";
    right.appendChild(userBox);

    header.appendChild(brand);
    header.appendChild(nav);
    header.appendChild(right);

    document.body.classList.add("euos-has-shell");
    document.body.insertBefore(header, document.body.firstChild);

    function renderUser() {
      userBox.innerHTML = "";
      if (A && A.isAuthenticated()) {
        var d = A.displayName();
        var who = document.createElement("span");
        who.className = "euos-who";
        who.textContent = "👤 " + d.name + (d.role ? " · " + d.role : "") + (d.id != null ? " (#" + d.id + ")" : "");
        who.title = "Сессия EduOS (JWT)";
        var out = document.createElement("button");
        out.className = "euos-btn";
        out.textContent = "Выйти";
        out.addEventListener("click", function () {
          if (A) A.logout();
          renderUser();
        });
        userBox.appendChild(who);
        userBox.appendChild(out);
      } else {
        var bi = document.createElement("button");
        bi.className = "euos-btn primary";
        bi.textContent = "Войти";
        bi.addEventListener("click", function () {
          if (A) A.openLoginModal({ tenants: config.loginTenants, onSuccess: renderUser });
        });
        var guest = document.createElement("span");
        guest.textContent = "гость";
        userBox.appendChild(guest);
        userBox.appendChild(bi);
      }
    }
    renderUser();
    if (A && A.onAuthChange) A.onAuthChange(renderUser);
  }

  function mount() {
    // Конфиг мог подгрузиться позже самого шелла, но до DOMContentLoaded.
    applyExternalConfig();
    injectCSS();
    build();
  }

  function auto() {
    if (!config.autoMount) return;
    if (document.body && document.body.hasAttribute("data-euos-no-shell")) return;
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", mount);
    } else {
      mount();
    }
  }

  global.EduOSShell = {
    version: EUOS_SHELL_VERSION,
    EUOS_SHELL_VERSION: EUOS_SHELL_VERSION,
    PAGES: PAGES,
    config: config,
    mount: mount,
    injectCSS: injectCSS,
    applyExternalConfig: applyExternalConfig,
    cssHref: cssHref,
    homeHref: homeHref,
    homeLink: homeLink,
    externalMode: externalMode,
    consoleHref: consoleHref,
    _build: build
  };

  // Конфиг применяется до auto(): иначе assetBase/autoMount/products
  // пришли бы уже после монтирования шапки.
  applyExternalConfig();
  auto();
})(typeof window !== "undefined" ? window : this);
