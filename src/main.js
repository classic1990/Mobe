import "./style.css";

import {
  watchAuth,
  login,
  logout
} from "./auth.js";

import {
  getMovies,
  getGenres,
  getMovie,
  incrementViews
} from "./data.js";

const app = document.querySelector("#app");

let user = null;

const FALLBACK_POSTER =
  "https://placehold.co/600x900?text=DUY-ดู-DEE";

function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function getTitle(movie) {
  return (
    movie?.titleTH ||
    movie?.title ||
    movie?.nameTH ||
    movie?.name ||
    "ไม่มีชื่อ"
  );
}

function getPoster(movie) {
  return (
    movie?.poster ||
    movie?.posterUrl ||
    movie?.image ||
    movie?.imageUrl ||
    movie?.thumbnail ||
    movie?.thumbnailUrl ||
    movie?.cover ||
    movie?.coverUrl ||
    FALLBACK_POSTER
  );
}

function getVideoUrl(movie) {
  return (
    movie?.embedURL ||
    movie?.embedUrl ||
    movie?.videoUrl ||
    movie?.videoURL ||
    movie?.youtubeUrl ||
    movie?.youtubeURL ||
    ""
  );
}

function youtubeId(url) {
  if (!url) return "";

  try {
    const value = String(url).trim();

    if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
      return value;
    }

    const parsed = new URL(value);

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "").slice(0, 11);
    }

    if (
      parsed.hostname.includes("youtube.com") ||
      parsed.hostname.includes("youtube-nocookie.com")
    ) {
      const v = parsed.searchParams.get("v");

      if (v) {
        return v.slice(0, 11);
      }

      const match = parsed.pathname.match(
        /\/(?:embed|shorts|live)\/([^/?]+)/
      );

      if (match) {
        return match[1].slice(0, 11);
      }
    }
  } catch (error) {
    console.warn("youtubeId:", error);
  }

  return "";
}

function youtubeEmbed(url) {
  const id = youtubeId(url);

  if (!id) return "";

  return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(
    id
  )}?autoplay=1&rel=0&modestbranding=1`;
}

function loading() {
  return `
    <div class="loading-screen">
      <div>
        <h1>DUY-<b>ดู</b>-DEE</h1>
        <p>กำลังโหลด...</p>
      </div>
    </div>
  `;
}

function layout(content) {
  return `
    <header>
      <a class="brand" href="#/">DUY-<b>ดู</b>-DEE</a>

      <nav>
        <a href="#/">หน้าแรก</a>
        <a href="#/movies">หนัง</a>
        <a href="#/genres">หมวดหมู่</a>
      </nav>

      <div class="actions">
        <button id="searchBtn">
          ค้นหา
        </button>

        ${
          user
            ? `
              <button id="logoutBtn">
                ออกจากระบบ
              </button>
            `
            : `
              <button id="loginBtn">
                เข้าสู่ระบบ
              </button>
            `
        }
      </div>
    </header>

    ${content}

    <footer>
      © ${new Date().getFullYear()} DUY-ดู-DEE
    </footer>
  `;
}

function movieCard(movie) {
  const id = movie?.id || "";
  const title = getTitle(movie);
  const poster = getPoster(movie);

  return `
    <article
      class="movie-card"
      data-id="${esc(id)}"
      role="button"
      tabindex="0"
    >
      <img
        loading="lazy"
        src="${esc(poster)}"
        alt="${esc(title)}"
        onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'"
      >

      <div class="movie-info">
        <h3>
          ${esc(title)}
        </h3>

        <p>
          ${esc(movie?.category || movie?.type || "")}
          ${
            movie?.year
              ? ` · ${esc(movie.year)}`
              : ""
          }
        </p>

        <span>
          ⭐ ${esc(
            movie?.imdb ??
            movie?.rating ??
            movie?.score ??
            "-"
          )}

          ·

          ${esc(movie?.quality || movie?.badge || "HD")}
        </span>
      </div>
    </article>
  `;
}

function emptyMovies() {
  return `
    <section class="empty">
      <h2>ยังไม่มีหนัง</h2>
      <p>
        ยังไม่มีหนังที่เผยแพร่ในระบบ
      </p>
    </section>
  `;
}

function errorPage(error) {
  console.error("DUY-ดู-DEE ERROR:", error);

  return layout(`
    <main class="page">
      <section class="empty">

        <h2>
          เกิดข้อผิดพลาด
        </h2>

        <p>
          ไม่สามารถโหลดข้อมูลจาก Firebase ได้
        </p>

        <small>
          ${esc(error?.message || error || "Unknown error")}
        </small>

        <br><br>

        <button
          class="primary"
          id="retryBtn"
        >
          ลองใหม่
        </button>

      </section>
    </main>
  `);
}

/* =========================
   HOME
========================= */

async function home() {
  const movies = await getMovies({
    max: 24
  });

  let genres = [];

  try {
    genres = await getGenres();
  } catch (error) {
    console.warn("getGenres:", error);
  }

  return layout(`
    <main>

      <section class="hero">
        <div>

          <small>
            DUY-ดู-DEE
          </small>

          <h1>
            ดูหนังและซีรีส์
            <br>
            <em>
              ในแบบที่คุณชอบ
            </em>
          </h1>

          <p>
            ดูหนังและซีรีส์ออนไลน์
          </p>

          <a
            class="primary"
            href="#/movies"
          >
            เริ่มดูหนัง
          </a>

        </div>
      </section>

      <section class="section">

        <div class="section-head">
          <h2>
            หนังล่าสุด
          </h2>

          <a href="#/movies">
            ดูทั้งหมด →
          </a>
        </div>

        <div class="grid">
          ${
            movies.length
              ? movies.map(movieCard).join("")
              : emptyMovies()
          }
        </div>

      </section>

      <section class="section">

        <div class="section-head">
          <h2>
            หมวดหมู่
          </h2>
        </div>

        <div class="chips">

          ${
            genres.length
              ? genres.map((genre) => `
                  <a
                    href="#/movies?genre=${encodeURIComponent(
                      genre.id
                    )}"
                  >
                    ${esc(
                      genre.nameTH ||
                      genre.name ||
                      genre.id
                    )}
                  </a>
                `).join("")
              : `
                <span>
                  ยังไม่มีหมวดหมู่
                </span>
              `
          }

        </div>

      </section>

    </main>
  `);
}

/* =========================
   MOVIES
========================= */

async function moviesPage() {
  const queryString =
    location.hash.includes("?")
      ? location.hash.split("?")[1]
      : "";

  const params =
    new URLSearchParams(queryString);

  const genre =
    params.get("genre");

  const search =
    params.get("q");

  const movies = await getMovies({
    max: 60,
    genre,
    search
  });

  return layout(`
    <main class="page">

      <div class="section-head">

        <h1>
          ${
            search
              ? `ผลค้นหา: ${esc(search)}`
              : "หนังทั้งหมด"
          }
        </h1>

      </div>

      ${
        movies.length
          ? `
            <div class="grid">
              ${movies.map(movieCard).join("")}
            </div>
          `
          : emptyMovies()
      }

    </main>
  `);
}

/* =========================
   WATCH PAGE
========================= */

async function watchPage() {
  const queryString =
    location.hash.includes("?")
      ? location.hash.split("?")[1]
      : "";

  const params =
    new URLSearchParams(queryString);

  const id = params.get("id");

  if (!id) {
    return layout(`
      <main class="page">
        <section class="empty">

          <h2>
            ไม่พบหนัง
          </h2>

          <p>
            ไม่มี Movie ID
          </p>

          <button
            class="primary"
            id="backMoviesBtn"
          >
            กลับไปดูหนัง
          </button>

        </section>
      </main>
    `);
  }

  console.log(
    "DUY WATCH MOVIE ID:",
    id
  );

  const movie =
    await getMovie(id);

  if (!movie) {
    return layout(`
      <main class="page">

        <section class="empty">

          <h2>
            ไม่พบหนังเรื่องนี้
          </h2>

          <p>
            Movie ID:
            ${esc(id)}
          </p>

          <button
            class="primary"
            id="backMoviesBtn"
          >
            กลับไปดูหนัง
          </button>

        </section>

      </main>
    `);
  }

  const title =
    getTitle(movie);

  const poster =
    getPoster(movie);

  const videoUrl =
    getVideoUrl(movie);

  const embed =
    youtubeEmbed(videoUrl);

  console.log(
    "DUY WATCH MOVIE:",
    movie
  );

  console.log(
    "DUY VIDEO URL:",
    videoUrl
  );

  console.log(
    "DUY YOUTUBE EMBED:",
    embed
  );

  if (embed) {
    try {
      await incrementViews(id);
    } catch (error) {
      console.warn(
        "incrementViews:",
        error
      );
    }
  }

  return layout(`
    <main class="watch-page">

      <div class="watch-top">

        <button
          class="back-btn"
          id="backMoviesBtn"
        >
          ← กลับ
        </button>

      </div>

      <section class="watch-container">

        <div class="video-wrapper">

          ${
            embed
              ? `
                <iframe
                  src="${esc(embed)}"
                  title="${esc(title)}"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowfullscreen
                ></iframe>
              `
              : `
                <div class="video-empty">

                  <div>

                    <h2>
                      ยังไม่มีวิดีโอ
                    </h2>

                    <p>
                      หนังเรื่องนี้ยังไม่มี
                      videoUrl หรือ embedURL
                    </p>

                  </div>

                </div>
              `
          }

        </div>

        <div class="watch-info">

          <img
            src="${esc(poster)}"
            alt="${esc(title)}"
            class="watch-poster"
            onerror="this.onerror=null;this.src='${FALLBACK_POSTER}'"
          >

          <div>

            <h1>
              ${esc(title)}
            </h1>

            ${
              movie?.description
                ? `
                  <p>
                    ${esc(movie.description)}
                  </p>
                `
                : ""
            }

            <div class="watch-meta">

              <span>
                ${esc(movie?.badge || movie?.quality || "HD")}
              </span>

              ${
                movie?.views != null
                  ? `
                    <span>
                      👁 ${esc(movie.views)} ครั้ง
                    </span>
                  `
                  : ""
              }

            </div>

          </div>

        </div>

      </section>

    </main>
  `);
}

/* =========================
   GENRES
========================= */

async function genresPage() {
  const genres =
    await getGenres();

  return layout(`
    <main class="page">

      <div class="section-head">
        <h1>
          หมวดหมู่
        </h1>
      </div>

      <div class="chips">

        ${
          genres.length
            ? genres.map((genre) => `
                <a
                  href="#/movies?genre=${encodeURIComponent(
                    genre.id
                  )}"
                >
                  ${esc(
                    genre.nameTH ||
                    genre.name ||
                    genre.id
                  )}
                </a>
              `).join("")
            : `
              <div class="empty">
                ยังไม่มีหมวดหมู่
              </div>
            `
        }

      </div>

    </main>
  `);
}

/* =========================
   LOGIN
========================= */

async function loginPage() {
  return layout(`
    <main class="page auth-page">

      <section class="auth-card">

        <h2>
          เข้าสู่ระบบ
        </h2>

        <form id="loginForm">

          <input
            id="loginEmail"
            type="email"
            placeholder="อีเมล"
            autocomplete="email"
            required
          >

          <input
            id="loginPassword"
            type="password"
            placeholder="รหัสผ่าน"
            autocomplete="current-password"
            required
          >

          <button
            class="primary"
            type="submit"
          >
            เข้าสู่ระบบ
          </button>

          <p id="authMessage"></p>

        </form>

      </section>

    </main>
  `);
}

/* =========================
   EVENTS
========================= */

function bindEvents() {

  document
    .querySelectorAll(".movie-card")
    .forEach((card) => {

      const openMovie = () => {

        const id =
          card.dataset.id;

        if (!id) {
          console.warn(
            "Movie card has no ID"
          );
          return;
        }

        console.log(
          "OPEN MOVIE:",
          id
        );

        location.hash =
          `#/watch?id=${encodeURIComponent(id)}`;
      };

      card.addEventListener(
        "click",
        openMovie
      );

      card.addEventListener(
        "keydown",
        (event) => {

          if (
            event.key === "Enter" ||
            event.key === " "
          ) {
            event.preventDefault();
            openMovie();
          }

        }
      );

    });

  const backBtn =
    document.querySelector(
      "#backMoviesBtn"
    );

  if (backBtn) {
    backBtn.addEventListener(
      "click",
      () => {
        location.hash =
          "#/movies";
      }
    );
  }

  const loginBtn =
    document.querySelector(
      "#loginBtn"
    );

  if (loginBtn) {
    loginBtn.addEventListener(
      "click",
      () => {
        location.hash =
          "#/login";
      }
    );
  }

  const logoutBtn =
    document.querySelector(
      "#logoutBtn"
    );

  if (logoutBtn) {

    logoutBtn.addEventListener(
      "click",
      async () => {

        try {

          await logout();

          location.hash =
            "#/";

        } catch (error) {

          console.error(
            "Logout:",
            error
          );

        }

      }
    );

  }

  const searchBtn =
    document.querySelector(
      "#searchBtn"
    );

  if (searchBtn) {

    searchBtn.addEventListener(
      "click",
      () => {

        const query =
          prompt("ค้นหาหนัง");

        if (
          query &&
          query.trim()
        ) {

          location.hash =
            `#/movies?q=${encodeURIComponent(
              query.trim()
            )}`;

        }

      }
    );

  }

  const retryBtn =
    document.querySelector(
      "#retryBtn"
    );

  if (retryBtn) {

    retryBtn.addEventListener(
      "click",
      () => {
        render();
      }
    );

  }

  const loginForm =
    document.querySelector(
      "#loginForm"
    );

  if (loginForm) {

    loginForm.addEventListener(
      "submit",
      async (event) => {

        event.preventDefault();

        const email =
          document
            .querySelector(
              "#loginEmail"
            )
            ?.value
            .trim();

        const password =
          document
            .querySelector(
              "#loginPassword"
            )
            ?.value;

        const message =
          document.querySelector(
            "#authMessage"
          );

        try {

          await login(
            email,
            password
          );

          if (message) {
            message.textContent =
              "เข้าสู่ระบบสำเร็จ";
          }

          location.hash =
            "#/";

        } catch (error) {

          console.error(
            "Login:",
            error
          );

          if (message) {
            message.textContent =
              error?.message ||
              "เข้าสู่ระบบไม่สำเร็จ";
          }

        }

      }
    );

  }

}

/* =========================
   ROUTER
========================= */

async function render() {

  if (!app) {
    console.error(
      "ไม่พบ #app ใน index.html"
    );
    return;
  }

  app.innerHTML =
    loading();

  const hash =
    location.hash || "#/";

  console.log(
    "DUY ROUTE:",
    hash
  );

  try {

    if (
      hash === "#/" ||
      hash === "#"
    ) {

      app.innerHTML =
        await home();

    } else if (
      hash.startsWith("#/watch")
    ) {

      app.innerHTML =
        await watchPage();

    } else if (
      hash.startsWith("#/movies")
    ) {

      app.innerHTML =
        await moviesPage();

    } else if (
      hash.startsWith("#/genres")
    ) {

      app.innerHTML =
        await genresPage();

    } else if (
      hash.startsWith("#/login")
    ) {

      app.innerHTML =
        await loginPage();

    } else {

      app.innerHTML =
        await home();

    }

    bindEvents();

  } catch (error) {

    console.error(
      "DUY RENDER ERROR:",
      error
    );

    app.innerHTML =
      errorPage(error);

    bindEvents();
  }
}

/* =========================
   AUTH
========================= */

watchAuth((currentUser) => {

  user =
    currentUser || null;

  render();

});

/* =========================
   ROUTE CHANGE
========================= */

window.addEventListener(
  "hashchange",
  render
);

render();
