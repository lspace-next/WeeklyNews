// L.SPACE Tech Radar — renders issue lists from data/issues.json and wires the category filter.
// Each page sets <body data-root="..."> (relative path to the site root) so links work at any depth.

(function () {
  // Reader feedback endpoint (Google Apps Script web app — see tools/feedback/README.md). Empty = feedback block hidden.
  const FEEDBACK_URL = "https://script.google.com/macros/s/AKfycbyc6IF4vHzz8lNAGg4ytzL5PVJgBxTtBABNXk_YGXIC1qWZGP4cmi5162vi6i2vSEi1/exec";

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

  // ---------- issue page: reader feedback ----------
  // One anonymous row per browser per issue; changing the rating or sending a comment updates that row.
  const RATES = [["good", "👍", "유용했어요"], ["soso", "😐", "보통이에요"], ["bad", "👎", "아쉬워요"]];

  function initFeedback() {
    const el = document.getElementById("feedback");
    const issue = document.body.dataset.issue;
    if (!el || !issue || !FEEDBACK_URL) return;

    const key = "fb:" + issue;
    let state = {};
    try { state = JSON.parse(localStorage.getItem(key)) || {}; } catch {}
    if (!state.sid) state.sid = (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/[^\w-]/g, "");
    const save = () => { try { localStorage.setItem(key, JSON.stringify(state)); } catch {} };

    el.innerHTML = `
      <div class="fb-head">
        <span class="kicker">FEEDBACK</span>
        <h2 id="fb-title">이번 호 어땠나요?</h2>
        <p>익명으로 전달되며, 다음 호 기사 선정에 반영합니다.</p>
      </div>
      <div class="fb-rates" role="group" aria-labelledby="fb-title">
        ${RATES.map(([v, icon, label]) => `<button type="button" class="fb-rate" data-rate="${v}" aria-pressed="false"><span class="fb-icon" aria-hidden="true">${icon}</span>${label}</button>`).join("")}
      </div>
      <form class="fb-form" hidden>
        <label for="fb-text">다음에 다뤘으면 하는 주제나 의견 <span>(선택)</span></label>
        <textarea id="fb-text" maxlength="500" rows="3" placeholder="예: 조선소 MES·디지털 트윈 사례를 더 보고 싶어요"></textarea>
        <input type="text" name="website" class="fb-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
        <div class="fb-actions"><span class="fb-count">0 / 500</span><button type="submit" class="fb-send">의견 보내기</button></div>
      </form>
      <p class="fb-status" role="status" aria-live="polite"></p>`;
    el.hidden = false;

    const form = el.querySelector(".fb-form");
    const text = el.querySelector("#fb-text");
    const status = el.querySelector(".fb-status");
    const count = el.querySelector(".fb-count");

    const send = (data) =>
      fetch(FEEDBACK_URL, {
        method: "POST",
        mode: "no-cors", // Apps Script sends no CORS headers; text/plain avoids a preflight
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({ issue, sid: state.sid, website: form.website.value, ...data }),
      });
    const mark = () => {
      for (const b of el.querySelectorAll(".fb-rate")) b.setAttribute("aria-pressed", String(b.dataset.rate === state.rate));
      form.hidden = !state.rate;
      if (state.commented) status.textContent = "의견 감사합니다. 다음 호에 반영할게요.";
    };

    el.querySelector(".fb-rates").addEventListener("click", async (e) => {
      const btn = e.target.closest(".fb-rate");
      if (!btn || btn.dataset.rate === state.rate) return;
      const prev = state.rate;
      state.rate = btn.dataset.rate;
      save();
      mark();
      status.textContent = "응답 감사합니다! 한 줄 의견도 남겨주시면 큰 도움이 됩니다.";
      try {
        await send({ rate: state.rate });
      } catch {
        state.rate = prev;
        save();
        mark();
        status.textContent = "전송에 실패했어요. 잠시 후 다시 눌러주세요.";
      }
    });
    text.addEventListener("input", () => (count.textContent = `${text.value.length} / 500`));
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const comment = text.value.trim();
      if (!comment) return text.focus();
      const btn = form.querySelector(".fb-send");
      btn.disabled = true;
      try {
        await send({ rate: state.rate, comment });
        state.commented = true;
        save();
        text.value = "";
        count.textContent = "0 / 500";
        status.textContent = "의견 감사합니다. 다음 호에 반영할게요.";
      } catch {
        status.textContent = "전송에 실패했어요. 잠시 후 다시 시도해주세요.";
      } finally {
        btn.disabled = false;
      }
    });
    mark();
  }

  renderHome();
  renderArchive();
  initFilter();
  renderPager();
  initVideos();
  initFeedback();
})();
