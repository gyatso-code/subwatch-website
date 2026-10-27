import { useEffect, useRef, useState, type CSSProperties } from "react";
import "./styles.css";

type Lang = "ru" | "en";

type Page = "home" | "privacy";

const readRoute = () => {
  const parts = window.location.hash.replace(/^#\/?/, "").split("/");

  const lang: Lang = parts[0] === "en" ? "en" : "ru";
  const route = parts[0] === "en" || parts[0] === "ru" ? parts[1] : parts[0];

  return {
    lang,
    page: (route === "privacy" ? "privacy" : "home") as Page,
    support: route === "support",
  };
};

const copy = {
  ru: {
    home: "Главная",
    features: "Возможности",
    support: "Поддержка",
    privacy: "Политика конфиденциальности",
    install: "Установить бесплатно",
    first: "Подписки.",
    second: "Без хаоса.",
    description:
      "Все регулярные расходы в одном месте. Добавляй подписки, следи за платежами и получай напоминания до списания.",
    coming: "Скоро в Chrome Web Store",
    alt: "Настоящий экран расширения SubWatch",
  },
  en: {
    home: "Home",
    features: "Features",
    support: "Support",
    privacy: "Privacy policy",
    install: "Install free",
    first: "Subscriptions.",
    second: "No chaos.",
    description:
      "All recurring expenses in one place. Add subscriptions, track payments and get reminders before renewals.",
    coming: "Coming soon on Chrome Web Store",
    alt: "Real SubWatch extension interface",
  },
};

const services = [
  {
    name: "Netflix",
    slug: "netflix",
    amount: "−$14",
    x: "-275px",
    y: "-190px",
    delay: "-1.2s",
    duration: "10.3s",
  },
  {
    name: "Spotify",
    slug: "spotify",
    amount: "−€12",
    x: "-350px",
    y: "85px",
    delay: "-5.8s",
    duration: "10.9s",
  },
  {
    name: "YouTube",
    slug: "youtube",
    amount: "−250 BYN",
    x: "-300px",
    y: "215px",
    delay: "-8.6s",
    duration: "11.2s",
  },
  {
    name: "Telegram",
    slug: "telegram",
    amount: "−$5",
    x: "310px",
    y: "-180px",
    delay: "-3.7s",
    duration: "10.7s",
  },
  {
    name: "Notion",
    slug: "notion",
    amount: "−$5",
    x: "330px",
    y: "195px",
    delay: "-7.4s",
    duration: "11.7s",
  },
  {
    name: "Dropbox",
    slug: "dropbox",
    amount: "−€6",
    x: "390px",
    y: "50px",
    delay: "-9.9s",
    duration: "12.1s",
  },
];

export default function App() {
  const [lang, setLang] = useState<Lang>(() => readRoute().lang);
  const [supportOpen, setSupportOpen] = useState(false);
  const [topic, setTopic] = useState("bug");
  const [topicOpen, setTopicOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [page, setPage] = useState<Page>(() => readRoute().page);
  const supportReturnHash = useRef("#/home");
  const supportScrollY = useRef(0);
  const previousHash = useRef(window.location.hash);
  const modalRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const t = copy[lang];
  const openSupport = () => {
    supportScrollY.current = window.scrollY;
    supportReturnHash.current = `#/${lang}/${page}`;
    window.location.hash = `#/${lang}/support`;
  };

  const closeSupport = () => {
    window.location.hash = supportReturnHash.current;
  };

  useEffect(() => {
    const ru = lang === "ru";

    document.documentElement.lang = lang;

    document.title = ru
      ? "SubWatch - Подписки под контролем"
      : "SubWatch - Subscriptions Under Control";

    const description = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );

    if (description) {
      description.content = ru
        ? "SubWatch - бесплатное расширение для учёта подписок. Отслеживайте расходы, контролируйте платежи и получайте напоминания о списаниях."
        : "SubWatch is a free browser extension for tracking subscriptions, managing expenses, and getting payment reminders.";
    }
  }, [lang]);
  useEffect(() => {
    const onHash = () => {
      const hash = window.location.hash;
      const route = readRoute();
      const wasSupport = previousHash.current.endsWith("/support");

      setLang(route.lang);

      if (!route.support) {
        setPage(route.page);
      }

      setSupportOpen(route.support);
      setTopicOpen(false);

      if (wasSupport && !route.support) {
        requestAnimationFrame(() => {
          window.scrollTo(0, supportScrollY.current);
        });
      } else if (!route.support && previousHash.current !== hash) {
        window.scrollTo(0, 0);
      }

      previousHash.current = hash;
    };

    onHash();

    window.addEventListener("hashchange", onHash);

    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  useEffect(() => {
    if (!supportOpen) return;
    const previous = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        window.location.hash = supportReturnHash.current;
      }
      if (event.key === "Tab" && modalRef.current) {
        const focusable = Array.from(
          modalRef.current.querySelectorAll<HTMLElement>(
            "button:not([disabled]), input, textarea, select, a[href]",
          ),
        );
        if (!focusable.length) return;
        const first = focusable[0],
          last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = oldOverflow;
      previous?.focus({ preventScroll: true });
    };
  }, [supportOpen]);
  const sendSupport = () => {
    const topics: Record<string, string> = {
      bug: lang === "ru" ? "Сообщение об ошибке" : "Bug report",
      idea: lang === "ru" ? "Предложение по улучшению" : "Feature request",
      other: lang === "ru" ? "Другой вопрос" : "General question",
    };

    const subject = `SubWatch — ${topics[topic]}`;
    const body = message.trim();

    // Открываем почтовое приложение
    window.location.href = `mailto:art.pointqa@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    // Очищаем форму
    setTopic("bug");
    setTopicOpen(false);
    setMessage("");

    // Закрываем модальное окно
    closeSupport();
  };

  return (
    <div className="site" id="home">
      <header className="header shell">
        <a className="brand" href={`#/${lang}/home`} aria-label="SubWatch home">
          <img
            src={`${import.meta.env.BASE_URL}icon-128.png`}
            className="brand-logo"
            alt=""
          />
          <span>SubWatch</span>
        </a>
        <div className="header-actions">
          <div className="language" aria-label="Language">
            <button
              type="button"
              className={lang === "ru" ? "active" : ""}
              onClick={() => {
                if (supportOpen) {
                  supportReturnHash.current = `#/ru/${page}`;
                }
                window.location.hash = `#/ru/${supportOpen ? "support" : page}`;
              }}
              aria-pressed={lang === "ru"}
            >
              RU
            </button>
            <span>/</span>
            <button
              type="button"
              className={lang === "en" ? "active" : ""}
              onClick={() => {
                if (supportOpen) {
                  supportReturnHash.current = `#/en/${page}`;
                }
                window.location.hash = `#/en/${supportOpen ? "support" : page}`;
              }}
              aria-pressed={lang === "en"}
            >
              EN
            </button>
          </div>
          <span className="header-install" title={t.coming}>
            {t.install}
          </span>
        </div>
      </header>

      {page === "privacy" ? (
        <Privacy lang={lang} />
      ) : (
        <main className="hero shell">
          <div className="hero-copy">
            <h1>
              {t.first}
              <br />
              <span>{t.second}</span>
            </h1>
            <p className="hero-description">{t.description}</p>
            <div className="hero-buttons">
              <div className="install-group">
                <span className="primary-cta" title={t.coming}>
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    width="19"
                    height="19"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 3v12m-5-5 5 5 5-5" />
                    <path d="M4 17v3h16v-3" />
                  </svg>
                  {t.install}
                </span>
                <span className="install-caption">{t.coming}</span>
              </div>
            </div>
          </div>

          <div className="hero-art" id="preview" aria-label={t.alt}>
            <div className="back-glow" aria-hidden="true" />
            <div className="orbit orbit-one" aria-hidden="true" />
            <div className="orbit orbit-two" aria-hidden="true" />
            <div className="orbit orbit-three" aria-hidden="true" />
            <div className="stars" aria-hidden="true">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </div>

            <div className="particles" aria-hidden="true">
              {services.map((s) => (
                <div
                  key={s.name}
                  className={`particle particle-${s.slug}`}
                  style={
                    {
                      "--start-x": s.x,
                      "--start-y": s.y,
                      "--delay": s.delay,
                      "--duration": s.duration,
                    } as CSSProperties
                  }
                >
                  <div className="particle-icon">
                    <img
                      src={`https://cdn.simpleicons.org/${s.slug}/${s.slug === "spotify" ? "000000" : s.slug === "netflix" ? "E50914" : s.slug === "notion" ? "000000" : "FFFFFF"}`}
                      alt=""
                      loading="eager"
                    />
                  </div>
                  <span className="particle-amount">{s.amount}</span>
                </div>
              ))}
            </div>

            <div className="screenshot-frame">
              <img
                src={`${import.meta.env.BASE_URL}${lang === "ru" ? "subwatch-ru.png" : "subwatch-en.png"}`}
                alt={t.alt}
                width="380"
                height="600"
              />
            </div>
          </div>
        </main>
      )}
      <footer className="footer shell">
        <span>© {new Date().getFullYear()} SubWatch</span>
        <div>
          <button type="button" onClick={openSupport}>
            {t.support}
          </button>
          <a href={`#/${lang}/privacy`}>{t.privacy}</a>
        </div>
      </footer>
      {supportOpen && (
        <div
          className="modal-backdrop"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeSupport();
          }}
        >
          <div
            className="support-modal"
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="support-title"
          >
            <button
              ref={closeRef}
              className="modal-close"
              type="button"
              aria-label={lang === "ru" ? "Закрыть" : "Close"}
              onClick={closeSupport}
            >
              ×
            </button>
            <h2 id="support-title">
              {lang === "ru" ? "Связаться с нами" : "Contact support"}
            </h2>
            <p>
              {lang === "ru"
                ? "Нашёл ошибку или есть идея? Напиши нам."
                : "Found a bug or have an idea? Let us know."}
            </p>
            <label htmlFor="support-topic">
              {lang === "ru" ? "Тема обращения" : "Topic"}
            </label>
            <div className="custom-select">
              <button
                id="support-topic"
                type="button"
                className="custom-select-trigger"
                aria-expanded={topicOpen}
                aria-controls="support-topic-options"
                onClick={() => setTopicOpen(!topicOpen)}
              >
                <span>
                  {topic === "bug"
                    ? lang === "ru"
                      ? "Сообщить об ошибке"
                      : "Report a bug"
                    : topic === "idea"
                      ? lang === "ru"
                        ? "Предложить улучшение"
                        : "Suggest a feature"
                      : lang === "ru"
                        ? "Другой вопрос"
                        : "Other question"}
                </span>
                <svg
                  className="custom-select-arrow"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>

              {topicOpen && (
                <div
                  className="custom-select-options"
                  id="support-topic-options"
                >
                  {[
                    {
                      value: "bug",
                      ru: "Сообщить об ошибке",
                      en: "Report a bug",
                    },
                    {
                      value: "idea",
                      ru: "Предложить улучшение",
                      en: "Suggest a feature",
                    },
                    {
                      value: "other",
                      ru: "Другой вопрос",
                      en: "Other question",
                    },
                  ].map((option) => (
                    <button
                      type="button"
                      key={option.value}
                      className={`custom-select-option ${topic === option.value ? "selected" : ""}`}
                      onClick={() => {
                        setTopic(option.value);
                        setTopicOpen(false);
                      }}
                    >
                      {option[lang]}
                      {topic === option.value && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <label htmlFor="support-message">
              {lang === "ru" ? "Сообщение" : "Message"}
            </label>
            <textarea
              id="support-message"
              rows={5}
              maxLength={4000}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                lang === "ru" ? "Расскажи подробнее..." : "Tell us more..."
              }
            />
            <button
              className="send-button"
              type="button"
              disabled={!message.trim()}
              onClick={sendSupport}
            >
              {lang === "ru" ? "Написать в поддержку" : "Contact support"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Privacy({ lang }: { lang: Lang }) {
  const ru = lang === "ru";
  return (
    <main className="privacy-page shell">
      <a className="back-link" href={`#/${lang}/home`}>
        ← {ru ? "На главную" : "Back to home"}
      </a>
      <h1>{ru ? "Политика конфиденциальности" : "Privacy Policy"}</h1>
      <p className="privacy-date">
        {ru
          ? "Обновлено: 27 октября 2026 г."
          : "Last updated: October 27, 2026"}
      </p>
      {ru ? (
        <div className="privacy-content">
          <p>
            SubWatch - расширение браузера для учёта подписок, расходов и
            напоминаний о платежах. Эта политика описывает обработку данных
            расширением и информационным сайтом.
          </p>
          <h2>1. Данные расширения</h2>
          <p>
            Добавленные вами сведения о подписках (например, название сервиса,
            стоимость, валюта, период оплаты, дата следующего платежа и
            необязательная ссылка), а также настройки напоминаний сохраняются
            локально в хранилище браузера. Для использования расширения не
            требуется учётная запись.
          </p>
          <h2>2. Для чего используются данные</h2>
          <p>
            Данные используются для отображения списка подписок, расчёта
            расходов, определения предстоящих платежей и показа локальных
            уведомлений. Для этих функций расширение использует разрешения
            браузера на локальное хранилище, фоновые события/таймеры и
            уведомления.
          </p>
          <h2>3. Передача данных</h2>
          <p>
            В текущей версии SubWatch не предусматривает отправку содержимого
            ваших подписок на сервер разработчика, продажу данных или
            использование данных подписок для рекламы. Данные остаются в
            локальном хранилище браузера, пока вы их не удалите или не очистите
            хранилище расширения.
          </p>
          <h2>4. Сайт и сторонние ресурсы</h2>
          <p>
            На сайте могут загружаться SVG-логотипы сервисов со стороннего CDN
            Simple Icons. При обращении к такому ресурсу его оператор может
            получать стандартные технические сведения, например IP-адрес. Сайт
            не требует регистрации. Форма обратной связи не отправляет сообщения
            напрямую на сервер, а подготавливает письмо в почтовом приложении
            пользователя.
          </p>
          <h2>5. Обратная связь</h2>
          <p>
            При заполнении формы обратной связи и нажатии кнопки «Написать в
            поддержку» сайт подготавливает письмо в вашем почтовом приложении.
            Письмо отправляется только после вашего подтверждения. Если вы
            отправите письмо, мы получим указанные вами сведения и используем их
            для ответа на обращение.
          </p>
          <h2>6. Управление данными</h2>
          <p>
            Вы можете изменять и удалять подписки в расширении. При удалении
            расширения Chrome удаляет связанные с ним данные локального
            хранилища. Данные также могут быть удалены при очистке хранилища
            расширения.
          </p>
          <h2>7. Изменения политики</h2>
          <p>
            При изменении работы SubWatch эта политика может обновляться.
            Актуальная версия публикуется на этой странице.
          </p>
          <h2>8. Контакты</h2>
          <p>
            По вопросам конфиденциальности и работы расширения:{" "}
            <a href="mailto:art.pointqa@gmail.com">art.pointqa@gmail.com</a>.
          </p>
        </div>
      ) : (
        <div className="privacy-content">
          <p>
            SubWatch is a browser extension for tracking subscriptions,
            expenses, and payment reminders. This policy describes how the
            extension and its informational website handle data.
          </p>
          <h2>1. Extension data</h2>
          <p>
            Subscription details you enter (such as service name, price,
            currency, billing period, next payment date, and optional website),
            along with reminder settings, are stored locally in your browser. No
            account is required.
          </p>
          <h2>2. How data is used</h2>
          <p>
            Data is used to display subscriptions, calculate expenses, identify
            upcoming payments, and display local notifications. These features
            use browser permissions for local storage, background alarms, and
            notifications.
          </p>
          <h2>3. Data sharing</h2>
          <p>
            The current version of SubWatch does not send the contents of your
            subscriptions to the developer's server, sell subscription data, or
            use it for advertising. Data remains in browser-local storage until
            you delete it or clear the extension's storage.
          </p>
          <h2>4. Website and third-party resources</h2>
          <p>
            {" "}
            The website may load service-logo SVGs from the third-party Simple
            Icons CDN. When accessing these resources, the CDN operator may
            receive standard technical information, such as your IP address. The
            website does not require registration. The support form does not
            send messages directly to a server; instead, it prepares an email in
            the user's email application.
          </p>
          <h2>5. Support requests</h2>
          <p>
            {" "}
            When you fill out the support form and click "Contact support", the
            website prepares an email in your email application. The email is
            sent only after you confirm sending it. If you send the email, we
            receive the information you provide and use it to respond to your
            request.
          </p>
          <h2>6. Managing your data</h2>
          <p>
            {" "}
            You can edit and delete subscriptions within the extension. When you
            uninstall the extension, Chrome removes its associated local storage
            data. Data may also be deleted when the extension's local storage is
            cleared.
          </p>
          <h2>7. Policy updates</h2>
          <p>
            We may update this policy when SubWatch changes. The current version
            will be published here.
          </p>
          <h2>8. Contact</h2>
          <p>
            For privacy questions or extension support:{" "}
            <a href="mailto:art.pointqa@gmail.com">art.pointqa@gmail.com</a>.
          </p>
        </div>
      )}
    </main>
  );
}
