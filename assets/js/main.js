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
        [(issues[0].updated || issues[0].published).slice(5).replace("-", "."), "최근 업데이트"],
      ].map(([b, s]) => `<div class="stat"><b>${esc(b)}</b><span>${esc(s)}</span></div>`).join("");
    }

    if (latestEl) {
      const it = issues[0];
      const live = it && it.status === "live";
      latestEl.innerHTML = it
        ? `<a class="hero-poster panel-dark" href="${root}${esc(it.path)}">
            <div class="hp-top">${live
              ? `<span class="badge"><span class="live"></span>THIS WEEK · LIVE</span><span>${esc(it.period)} · ${esc((it.updated || "").slice(5).replace("-", "."))} 업데이트</span>`
              : `<span class="badge">LATEST ISSUE</span><span>${esc(it.period)}</span>`}</div>
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
    const grid = document.querySelector(".grid");
    // HTML 순서 = 중요도 순(맨 앞이 리드 카드)
    const cards = [...document.querySelectorAll(".grid .card")];
    const live = document.body.dataset.status === "live";
    // 원문 날짜 최신순, 같은 날은 중요도 순 (sort 는 안정 정렬)
    const byDate = (list) => [...list].sort((a, b) => (b.dataset.date || "").localeCompare(a.dataset.date || ""));

    // 전체: live 는 리드 1장 + 나머지 최신순, final 은 중요도 순 / 카테고리: 항상 최신순
    function arrange(value) {
      const shown = value ? byDate(cards.filter((c) => c.dataset.cat === value)) : live ? [cards[0], ...byDate(cards.slice(1))] : cards;
      const order = [...shown, ...cards.filter((c) => !shown.includes(c))];
      for (const c of order) {
        c.hidden = !shown.includes(c);
        c.classList.toggle("is-lead", !value && c === cards[0]);
        grid?.appendChild(c);
      }
      // 카드 번호: CSS counter 는 container-type(.card-media) 안에서 0 으로 초기화되는 브라우저(iOS Safari 등)가 있어 JS 로 넣는다
      shown.forEach((c, i) => c.querySelector(".card-media")?.setAttribute("data-n", String(i + 1).padStart(2, "0")));
    }
    if (cards.length) arrange("");

    // 매일 채우는 중인 호: 가장 최근에 추가한 날의 카드에 NEW 배지
    if (live) {
      const latest = cards.reduce((m, c) => (c.dataset.added > m ? c.dataset.added : m), "");
      for (const c of cards) if (latest && c.dataset.added === latest) c.classList.add("is-new");
    }
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
      arrange(value);
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

  // ---------- issue page: card title → original article ----------
  // Titles are plain text in the HTML; link each one to the card's "원문" URL so every issue gets it without markup changes.
  function initCardTitles() {
    for (const card of document.querySelectorAll(".grid .card")) {
      const title = card.querySelector(".card-title");
      const src = card.querySelector(".card-foot a[href]");
      if (!title || !src || title.querySelector("a")) continue;
      const a = document.createElement("a");
      a.className = "card-title-link";
      a.href = src.href;
      a.target = "_blank";
      a.rel = "noopener";
      a.append(...title.childNodes);
      title.append(a);
    }
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

  // ---------- search: data/cards.json (tools/build_index.py 가 생성) ----------
  // 카드 키 = 원문 URL 의 FNV-1a 32bit 해시(base36). tools/build_index.py 의 card_key() 와 같아야 한다.
  function cardKey(url) {
    let h = 0x811c9dc5;
    for (const b of new TextEncoder().encode(url)) h = Math.imul(h ^ b, 0x01000193);
    return (h >>> 0).toString(36);
  }

  let cardsPromise;
  function loadCards() {
    cardsPromise ||= fetch(root + "data/cards.json", { cache: "no-cache" })
      .then((r) => (r.ok ? r.json() : []))
      .catch(() => []);
    return cardsPromise;
  }

  const norm = (s) => String(s || "").normalize("NFC").toLowerCase();
  const termsOf = (q) => [...new Set(norm(q).split(/\s+/).filter(Boolean))];
  // 한글·영문 표기가 섞이는 이름: 한쪽으로 찾아도 다른 쪽 표기 카드가 나오게 한다 (모두 소문자)
  const ALIASES = [
    ["엔비디아", "nvidia"], ["마이크로소프트", "microsoft"], ["구글", "google"], ["애플", "apple"], ["메타", "meta"],
    ["아마존", "amazon", "aws"], ["오픈ai", "openai", "오픈에이아이"], ["앤트로픽", "anthropic"], ["삼성", "samsung"],
    ["sk하이닉스", "하이닉스", "hynix"], ["깃허브", "github"], ["인텔", "intel"], ["퀄컴", "qualcomm"],
    ["클로드", "claude"], ["제미나이", "gemini"], ["챗gpt", "chatgpt"], ["테슬라", "tesla"], ["화웨이", "huawei"],
    ["시스코", "cisco"], ["오라클", "oracle"], ["랜섬웨어", "ransomware"], ["반도체", "semiconductor", "칩"],
    ["디지털 트윈", "디지털트윈", "digital twin"], ["자율운항", "autonomous ship"], ["데이터센터", "data center", "데이터 센터"],
  ];
  const ALIAS_OF = new Map(ALIASES.flatMap((g) => g.map((w) => [w, g])));
  const variantsOf = (t) => ALIAS_OF.get(t) || [t];
  // 필드별 가중치: 제목·포스터 키워드가 본문보다 앞선다
  const FIELDS = [["t", 5], ["kw", 4], ["c", 2], ["src", 2], ["s", 1], ["w", 1], ["l", 1]];

  // 모든 검색어를 포함하는 카드만, 점수 → 원문 날짜 최신순
  function searchCards(cards, terms, cat) {
    const out = [];
    for (const c of cards) {
      if (cat && c.c !== cat) continue;
      c._n ||= Object.fromEntries(FIELDS.map(([f]) => [f, norm(c[f])]));
      let score = 0;
      const all = terms.every((t) => {
        let hit = 0;
        for (const [f, w] of FIELDS) if (variantsOf(t).some((v) => c._n[f].includes(v))) hit += w;
        score += hit;
        return hit > 0;
      });
      if (all) out.push([score, c]);
    }
    return out.sort((a, b) => b[0] - a[0] || b[1].d.localeCompare(a[1].d)).map(([, c]) => c);
  }

  // 검색어를 <mark> 로 감싼다 (원문은 이스케이프)
  function hl(text, terms) {
    text = String(text || "");
    const low = norm(text);
    const marks = [];
    for (const t of terms.flatMap(variantsOf)) for (let i = low.indexOf(t); i >= 0; i = low.indexOf(t, i + t.length)) marks.push([i, i + t.length]);
    marks.sort((a, b) => a[0] - b[0]);
    let html = "", pos = 0;
    for (const [s, e] of marks) {
      if (e <= pos) continue;
      html += esc(text.slice(pos, Math.max(s, pos))) + "<mark>" + esc(text.slice(Math.max(s, pos), e)) + "</mark>";
      pos = e;
    }
    return html + esc(text.slice(pos));
  }

  // 요약에서 첫 일치 부분 주변을 잘라 보여준다
  function snippet(c, terms, len = 96) {
    terms = terms.flatMap(variantsOf);
    const text = terms.some((t) => norm(c.s).includes(t)) || !terms.some((t) => norm(c.w).includes(t)) ? c.s : c.w;
    const low = norm(text);
    const at = Math.min(...terms.map((t) => low.indexOf(t)).filter((i) => i >= 0), Infinity);
    const start = at === Infinity || at < 30 ? 0 : at - 30;
    const cut = text.slice(start, start + len);
    return (start ? "…" : "") + hl(cut, terms) + (start + len < text.length ? "…" : "");
  }

  const resultHref = (c) => `${root}${esc(c.p)}#c-${esc(c.k)}`;
  const resultItem = (c, terms, attrs = "") => `<a class="sr-item" href="${resultHref(c)}"${attrs}>
      <span class="sr-meta"><span class="tag ${catClass(c.c)}">${esc(c.c)}</span><span>${esc(c.src)} · ${esc(c.d.slice(5).replace("-", "."))}</span><span class="sr-issue">${esc(c.l)}</span></span>
      <span class="sr-title">${hl(c.t, terms)}</span>
      <span class="sr-snip">${snippet(c, terms)}</span>
    </a>`;

  const ICON_SEARCH = `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>`;
  const searchPage = (q) => `${root}search.html${q ? "?q=" + encodeURIComponent(q) : ""}`;

  // 헤더 검색 버튼 + 오버레이(빠른 검색). Enter(선택 없음) → 전용 페이지 search.html
  function initSearch() {
    const nav = document.querySelector(".site-header .nav");
    if (!nav) return;
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "nav-search";
    btn.setAttribute("aria-label", "기사 검색 (단축키 /)");
    btn.innerHTML = `${ICON_SEARCH}<span>검색</span><kbd>/</kbd>`;
    nav.append(btn);

    const dlg = document.createElement("dialog");
    dlg.className = "search-dialog";
    dlg.setAttribute("aria-label", "기사 검색");
    dlg.innerHTML = `<div class="sd-box">
        <div class="sd-head">${ICON_SEARCH}<input type="search" placeholder="제목·요약·키워드·출처로 검색" aria-label="검색어" autocomplete="off" enterkeyhint="search"><button type="button" class="sd-close" aria-label="검색 닫기"><kbd>Esc</kbd><span>닫기</span></button></div>
        <div class="sd-body" role="listbox"></div>
        <div class="sd-foot"><span class="sd-keys"><kbd>↑</kbd><kbd>↓</kbd> 이동 <kbd>Enter</kbd> 열기</span><a class="sd-all" href="${searchPage("")}">전체 결과 보기 →</a></div>
      </div>`;
    document.body.append(dlg);
    const input = dlg.querySelector("input");
    const body = dlg.querySelector(".sd-body");
    const all = dlg.querySelector(".sd-all");
    let active = -1;

    const items = () => [...body.querySelectorAll(".sr-item")];
    const setActive = (i) => {
      const list = items();
      active = list.length ? (i + list.length) % list.length : -1;
      list.forEach((el, j) => el.classList.toggle("is-active", j === active));
      list[active]?.scrollIntoView({ block: "nearest" });
    };
    async function render() {
      const cards = await loadCards();
      const q = input.value.trim();
      const terms = termsOf(q);
      all.href = searchPage(q);
      active = -1;
      if (!terms.length) {
        body.innerHTML = `<p class="sd-label">최근 기사</p>` + [...cards].sort((a, b) => b.d.localeCompare(a.d)).slice(0, 5).map((c) => resultItem(c, [])).join("");
        return;
      }
      const hits = searchCards(cards, terms);
      body.innerHTML = hits.length
        ? `<p class="sd-label">${hits.length}건${hits.length > 8 ? " 중 8건" : ""}</p>` + hits.slice(0, 8).map((c) => resultItem(c, terms)).join("")
        : `<p class="sd-empty">‘${esc(q)}’ 검색 결과가 없습니다.</p>`;
    }
    const open = () => {
      if (dlg.open) return;
      dlg.showModal();
      input.select();
      render();
    };

    btn.addEventListener("click", () => (document.getElementById("search-q") ? document.getElementById("search-q").focus() : open()));
    input.addEventListener("input", render);
    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();
        setActive(active + (e.key === "ArrowDown" ? 1 : -1));
      } else if (e.key === "Enter" && !e.isComposing) {
        e.preventDefault();
        const el = items()[active];
        location.href = el ? el.href : searchPage(input.value.trim());
        if (el) dlg.close();
      }
    });
    body.addEventListener("click", (e) => e.target.closest(".sr-item") && dlg.close());
    dlg.querySelector(".sd-close").addEventListener("click", () => dlg.close());
    dlg.addEventListener("click", (e) => e.target === dlg && dlg.close()); // 바깥(backdrop) 클릭
    document.addEventListener("keydown", (e) => {
      const typing = e.target.closest?.("input, textarea, select, [contenteditable]");
      const pageInput = document.getElementById("search-q");
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        pageInput ? pageInput.focus() : open();
      }
    });
  }

  // 전용 검색 페이지(search.html): ?q=검색어&cat=카테고리 — 주소로 공유 가능
  async function renderSearchPage() {
    const list = document.getElementById("search-results");
    if (!list) return;
    const input = document.getElementById("search-q");
    const chips = document.getElementById("search-filters");
    const countEl = document.getElementById("search-count");
    const params = new URLSearchParams(location.search);
    input.value = params.get("q") || "";
    let cat = params.get("cat") || "";
    let shown = 30;
    const cards = await loadCards();

    function render() {
      const q = input.value.trim();
      const terms = termsOf(q);
      const base = terms.length ? searchCards(cards, terms) : [...cards].sort((a, b) => b.d.localeCompare(a.d));
      const counts = new Map();
      for (const c of base) counts.set(c.c, (counts.get(c.c) || 0) + 1);
      if (cat && !counts.has(cat)) counts.set(cat, 0);
      const chip = (label, value, n) =>
        `<button type="button" class="chip ${value ? catClass(value) : ""}" data-value="${esc(value)}" aria-pressed="${value === cat}">${esc(label)}<span class="n">${n}</span></button>`;
      chips.innerHTML = chip("전체", "", base.length) + [...counts].sort((a, b) => order(a[0]) - order(b[0])).map(([c, n]) => chip(c, c, n)).join("");

      const hits = cat ? base.filter((c) => c.c === cat) : base;
      countEl.textContent = terms.length ? `‘${q}’ 검색 결과 ${hits.length}건` : `${cat || "전체"} 기사 ${hits.length}건 · 최신순`;
      list.innerHTML = hits.length
        ? hits.slice(0, shown).map((c) => resultItem(c, terms)).join("") +
          (hits.length > shown ? `<button type="button" class="sr-more">더 보기 (${hits.length - shown}건 남음)</button>` : "")
        : `<p class="sd-empty">검색 결과가 없습니다. 다른 단어로 찾아보세요.</p>`;

      const p = new URLSearchParams();
      if (q) p.set("q", q);
      if (cat) p.set("cat", cat);
      const qs = p.toString();
      history.replaceState(null, "", location.pathname + (qs ? "?" + qs : ""));
      document.title = (q ? `${q} · ` : "") + "검색 · L.SPACE Tech Radar";
    }

    let timer;
    input.addEventListener("input", () => {
      clearTimeout(timer);
      timer = setTimeout(() => ((shown = 30), render()), 120);
    });
    document.getElementById("search-form")?.addEventListener("submit", (e) => (e.preventDefault(), input.blur(), render()));
    chips.addEventListener("click", (e) => {
      const b = e.target.closest(".chip");
      if (!b) return;
      cat = b.dataset.value;
      shown = 30;
      render();
    });
    list.addEventListener("click", (e) => {
      if (!e.target.closest(".sr-more")) return;
      shown += 30;
      render();
    });
    render();
    if (!input.value) input.focus();
  }

  // 주차 페이지: 카드마다 id="c-<키>" — 검색 결과에서 그 카드로 이동해 강조
  function initCardAnchors() {
    const cards = [...document.querySelectorAll(".grid .card")];
    for (const c of cards) {
      const url = c.querySelector(".card-foot a[href]")?.getAttribute("href");
      if (url) c.id = "c-" + cardKey(url);
    }
    const focus = () => {
      const el = location.hash.startsWith("#c-") && document.getElementById(location.hash.slice(1));
      if (!el) return;
      document.querySelector('#filters .chip[data-value=""]')?.click(); // 필터가 걸려 있으면 전체로
      el.classList.remove("is-target");
      void el.offsetWidth; // 같은 카드로 다시 와도 애니메이션 재생
      el.classList.add("is-target");
      el.scrollIntoView({ block: "center", behavior: "smooth" });
    };
    if (cards.length) {
      focus();
      addEventListener("hashchange", focus);
    }
  }

  renderHome();
  renderArchive();
  initFilter();
  initCardAnchors();
  initSearch();
  renderSearchPage();
  renderPager();
  initCardTitles();
  initVideos();
  initFeedback();
  initViewCounts();

  // View counts from GoatCounter (site setting "allow using the visitor counter" must be on).
  // Home: site-wide total (all time). Other pages: this page's count. Footer badge, hidden on any failure.
  function initViewCounts() {
    if (!location.hostname.endsWith("github.io")) return; // localhost isn't counted either
    // Path goes in with its slashes as-is: GoatCounter returns 0 for %2F-encoded paths
    const fetchCount = (path) =>
      fetch(`https://lspace-next.goatcounter.com/counter${path === "TOTAL" ? "/TOTAL" : encodeURI(path)}.json`)
        .then((r) => (r.ok ? r.json() : null))
        .then((d) => (d && d.count && d.count !== "0" ? String(d.count) : null))
        .catch(() => null);
    const isHome = !!document.getElementById("latest");
    const label = isHome ? "Total views" : "Views for this page";
    fetchCount(isHome ? "TOTAL" : location.pathname).then((n) => {
      const copy = document.querySelector(".site-footer .wrap > span:last-child");
      if (!n || !copy) return;
      // badge above the copyright line, both right-aligned
      const side = document.createElement("div");
      side.className = "footer-side";
      copy.replaceWith(side);
      side.innerHTML = `<div class="gc-badge">
        <span class="gc-label">${label}</span>
        <strong class="gc-num">${esc(n)}</strong>
        <a class="gc-by" href="https://www.goatcounter.com" target="_blank" rel="noopener">stats by GoatCounter ↗</a>
      </div>`;
      side.append(copy);
    });
  }
})();
