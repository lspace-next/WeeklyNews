// IT 주간동향 — renders issue lists from data/issues.json and wires the category filter.
// Each page sets <body data-root="..."> (relative path to the site root) so links work at any depth.

(function () {
  const root = document.body.dataset.root || "";
  // Keep in sync with the category table in CLAUDE.md.
  const CATEGORIES = ["AI", "빅테크", "보안", "클라우드·인프라", "반도체·HW", "모바일·디바이스", "정책·규제", "국내 IT", "개발도구"];

  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  let issuesPromise;
  function loadIssues() {
    issuesPromise ||= fetch(root + "data/issues.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    return issuesPromise;
  }

  function issueRow(it) {
    return `<li><a href="${root}${esc(it.path)}">
      <span class="il-label">${esc(it.label)}</span>
      <span class="il-head">${esc(it.headline)}</span>
      <span class="il-count">${esc(it.count)}건</span>
    </a></li>`;
  }

  // ---------- home ----------
  async function renderHome() {
    const latestEl = document.getElementById("latest");
    const recentEl = document.getElementById("recent");
    if (!latestEl && !recentEl) return;
    const issues = await loadIssues();

    if (latestEl) {
      const it = issues[0];
      latestEl.innerHTML = it
        ? `<a class="latest" href="${root}${esc(it.path)}">
            <p class="eyebrow">LATEST · ${esc(it.period)}</p>
            <span class="latest-label">${esc(it.label)}</span>
            <h2>${esc(it.headline)}</h2>
            <ol>${it.highlights.map((h) => `<li>${esc(h)}</li>`).join("")}</ol>
            <span class="btn">이번 주 동향 읽기 →</span>
          </a>`
        : `<p class="empty">아직 발행된 호가 없습니다.</p>`;
    }
    if (recentEl) {
      const rest = issues.slice(1, 9);
      recentEl.innerHTML = rest.length
        ? `<ul class="issue-list">${rest.map(issueRow).join("")}</ul>`
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
        html += `<div class="month-block"><h3>${month}월</h3><ul class="issue-list">${list.map(issueRow).join("")}</ul></div>`;
      }
      html += `</section>`;
    }
    el.innerHTML = html;
  }

  // ---------- issue page: category filter ----------
  function initFilter() {
    const bar = document.getElementById("filters");
    const cards = [...document.querySelectorAll(".grid .card")];
    if (!bar || !cards.length) return;

    const counts = new Map();
    for (const c of cards) counts.set(c.dataset.cat, (counts.get(c.dataset.cat) || 0) + 1);

    const chip = (label, value, n) =>
      `<button type="button" class="chip" data-value="${esc(value)}" aria-pressed="${value === "" ? "true" : "false"}">${esc(label)}<span class="n">${n}</span></button>`;
    const order = (cat) => (CATEGORIES.indexOf(cat) + 1 || 99);
    const sorted = [...counts].sort((a, b) => order(a[0]) - order(b[0]));
    bar.innerHTML = chip("전체", "", cards.length) + sorted.map(([cat, n]) => chip(cat, cat, n)).join("");

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
