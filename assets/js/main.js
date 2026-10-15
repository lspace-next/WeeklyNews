// IT 주간동향 — renders issue lists from data/issues.json and wires the category filter.
// Each page sets <body data-root="..."> (relative path to the site root) so links work at any depth.

(function () {
  const root = document.body.dataset.root || "";
  // Keep in sync with the category table in CLAUDE.md (name → .cat-* slug in style.css).
  const CATEGORIES = {
    "AI": "ai", "빅테크": "bigtech", "보안": "security", "클라우드·인프라": "cloud", "반도체·HW": "chip",
    "모바일·디바이스": "device", "정책·규제": "policy", "국내 IT": "korea", "조선·해양": "ship", "개발도구": "dev",
  };
  const CAT_NAMES = Object.keys(CATEGORIES);
  const MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const catClass = (cat) => "cat-" + (CATEGORIES[cat] || "policy");
  const order = (cat) => (CAT_NAMES.indexOf(cat) + 1 || 99);
  // category entries of an issue, most cards first
  const catsOf = (it) => Object.entries(it.categories || {}).sort((a, b) => b[1] - a[1] || order(a[0]) - order(b[0]));

  let issuesPromise;
  function loadIssues() {
    issuesPromise ||= fetch(root + "data/issues.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    return issuesPromise;
  }

  // poster tile, tinted by the issue's biggest category
  function issueTile(it) {
    const cats = catsOf(it);
    return `<a class="tile panel-dark ${cats[0] ? catClass(cats[0][0]) : ""}" href="${root}${esc(it.path)}">
      <span class="tile-top"><span>${esc(it.period)}</span><span>${MONTHS[it.month - 1] || ""} ${esc(it.year)}</span></span>
      <span class="big-num">W${esc(it.week)}</span>
      <span class="tile-label">${esc(it.label)}</span>
      <span class="tile-head">${esc(it.headline)}</span>
      <span class="tile-foot">
        <span class="dots">${cats.map(([c]) => `<span class="${catClass(c)}" title="${esc(c)}"></span>`).join("")}</span>
        <span class="arrow">${esc(it.count)}건 →</span>
      </span>
    </a>`;
  }

  // ---------- home ----------
  async function renderHome() {
    const latestEl = document.getElementById("latest");
    const recentEl = document.getElementById("recent");
    const statsEl = document.getElementById("stats");
    if (!latestEl && !recentEl) return;
    const issues = await loadIssues();

    if (statsEl && issues.length) {
      const total = issues.reduce((n, it) => n + (it.count || 0), 0);
      statsEl.innerHTML = [
        [issues.length + "호", "발행"],
        [total + "건", "누적 뉴스"],
        [CAT_NAMES.length + "개", "카테고리"],
        [issues[0].published.slice(5).replace("-", "."), "최근 발행"],
      ].map(([b, s]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("");
    }

    if (latestEl) {
      const it = issues[0];
      latestEl.innerHTML = it
        ? `<a class="hero-poster panel-dark" href="${root}${esc(it.path)}">
            <div class="hp-top"><span class="badge"><span class="live"></span>LATEST ISSUE</span><span>${esc(it.period)}</span></div>
            <div class="hp-text">
              <span class="hp-label">${esc(it.label)}</span>
              <h2>${esc(it.headline)}</h2>
              <ol>${it.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>
              <div class="hp-foot">
                <span class="btn">이번 주 동향 읽기 →</span>
                <span class="pills">${catsOf(it).map(([c, n]) => `<span class="pill ${catClass(c)}">${esc(c)}<i>${n}</i></span>`).join("")}</span>
              </div>
            </div>
            <div class="hp-week" aria-hidden="true"><span class="big-num">W${esc(it.week)}</span><small>${MONTHS[it.month - 1] || ""} ${esc(it.year)} · ${esc(it.count)} NEWS</small></div>
          </a>`
        : `<p class="empty">아직 발행된 호가 없습니다.</p>`;
    }
    if (recentEl) {
      const rest = issues.slice(1, 7);
      recentEl.innerHTML = rest.length
        ? `<div class="tiles">${rest.map(issueTile).join("")}</div>`
        : `<p class="empty">이전 호가 없습니다.</p>`;
    }
  }

  // ---------- archive ----------
  async function renderArchive() {
    const el = document.getElementById("archive");
    if (!el) return;
    const issues = await loadIssues();
    if (!issues.length) {
      el.innerHTML = `<p class="empty">아직 발행된 호가 없습니다.</p>`;
      return;
    }
    const byYear = new Map();
    for (const it of issues) {
      if (!byYear.has(it.year)) byYear.set(it.year, new Map());
      const months = byYear.get(it.year);
      if (!months.has(it.month)) months.set(it.month, []);
      months.get(it.month).push(it);
    }
    let html = "";
    for (const [year, months] of byYear) {
      html += `<section class="year-block"><h2>${year}</h2>`;
      for (const [month, list] of months) {
        html += `<div class="month-block"><h3>${month}월</h3><div class="tiles">${list.map(issueTile).join("")}</div></div>`;
      }
      html += `</section>`;
    }
    el.innerHTML = html;
  }

  // ---------- issue page: category filter + category bar ----------
  function initFilter() {
    const bar = document.getElementById("filters");
    const cards = [...document.querySelectorAll(".grid .card")];
    if (!bar || !cards.length) return;

    const counts = new Map();
    for (const c of cards) counts.set(c.dataset.cat, (counts.get(c.dataset.cat) || 0) + 1);
    const sorted = [...counts].sort((a, b) => order(a[0]) - order(b[0]));

    const chip = (label, value, n) =>
      `<button type="button" class="chip ${value ? catClass(value) : ""}" data-value="${esc(value)}" aria-pressed="${value === "" ? "true" : "false"}">${esc(label)}<span class="n">${n}</span></button>`;
    bar.innerHTML = chip("전체", "", cards.length) + sorted.map(([cat, n]) => chip(cat, cat, n)).join("");

    const catbar = document.getElementById("catbar");
    if (catbar) {
      catbar.innerHTML = sorted.map(([cat, n]) => `<span class="${catClass(cat)}" style="--n:${n}" title="${esc(cat)} ${n}건"></span>`).join("");
    }

    bar.addEventListener("click", (e) => {
      const btn = e.target.closest(".chip");
      if (!btn) return;
      const value = btn.dataset.value;
      for (const b of bar.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b === btn));
      for (const c of cards) c.hidden = value !== "" && c.dataset.cat !== value;
    });
  }

  // ---------- issue page: prev / next ----------
  async function renderPager() {
    const el = document.getElementById("pager");
    const id = document.body.dataset.issue;
    if (!el || !id) return;
    const issues = await loadIssues();
    const i = issues.findIndex((it) => it.id === id);
    if (i < 0) return;
    const older = issues[i + 1];
    const newer = issues[i - 1];
    el.innerHTML =
      (older ? `<a class="prev" href="${root}${esc(older.path)}"><span class="dir">← 이전 호</span>${esc(older.label)}</a>` : "") +
      (newer ? `<a class="next" href="${root}${esc(newer.path)}"><span class="dir">다음 호 →</span>${esc(newer.label)}</a>` : "");
  }

  // ---------- issue page: play video in place ----------
  // Thumbnails link to YouTube; a plain click swaps the thumbnail for an embedded player instead.
  function initVideos() {
    document.addEventListener("click", (e) => {
      const thumb = e.target.closest(".video-thumb[data-yt]");
      if (!thumb || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
      e.preventDefault();
      const iframe = document.createElement("iframe");
      iframe.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(thumb.dataset.yt)}?autoplay=1&rel=0`;
      iframe.title = thumb.querySelector("img")?.alt || "YouTube video";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      const player = document.createElement("div");
      player.className = "video-thumb";
      player.append(iframe);
      thumb.replaceWith(player);
    });
  }

  renderHome();
  renderArchive();
  initFilter();
  renderPager();
  initVideos();
})();
