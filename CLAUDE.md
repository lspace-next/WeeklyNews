# L.SPACE Tech Radar (WeeklyNews)

L.SPACE의 주간 기술 동향 콘텐츠. AI·제조/조선 AX·클라우드·보안·개발도구 등 기술 변화를 카드 형식으로 정리해 GitHub Pages(프로젝트 사이트)에 발행하는 정적 사이트.
빌드 도구 없음. HTML/CSS/JS를 그대로 배포한다.
- **발행 방식**: 한 주 = 한 호. 월요일 아침에 이번 주 호를 열고, 평일 아침마다 전날 소식으로 채우고(`status: live`), 일요일 저녁에 마감한다(`status: final`).
  - 매일 업데이트: `/daily` (`.claude/commands/daily.md`). 한 주를 통째로 수동 작성·백필: `/weekly` (`.claude/commands/weekly.md`).
- **자동 발행**: Claude Code 클라우드 루틴 두 개가 `/daily auto` 를 실행해 `main` 에 푸시한다 — 평일(월–금) 06:30 KST(월요일은 이번 주 호 생성), 일요일 18:00 KST(이번 주 호 마감). 발행 전 `tools/check_issue.py` 검증을 통과하지 못하면 푸시하지 않고 실패 사유만 남긴다.

- **SITE_URL**: `https://lspace-next.github.io/WeeklyNews`
- **저장소**: https://github.com/lspace-next/WeeklyNews (main 브랜치 / root 를 Pages 로 배포)
- 참고한 원형: https://busanbus.github.io/weekly-mobility (주차별 카드뉴스 아카이브 구조)

## 구조

```
index.html                 홈 — 최신호 + 지난 호 목록 (data/issues.json 렌더)
archive.html               전체 아카이브 — 연/월 그룹 (data/issues.json 렌더)
search.html                기사 검색 전용 페이지(?q=검색어&cat=카테고리). 모든 페이지 헤더의 검색 버튼(단축키 / · Ctrl+K)은 오버레이로 빠른 검색
archive/YYYY/MM/weekN.html 주차 페이지 (정적 HTML, templates/issue.html 기반)
data/issues.json           발행 인덱스. 홈·아카이브·이전/다음 링크의 단일 소스. 최신순. status(live/final)·updated 포함
data/cards.json            검색 인덱스(모든 카드). tools/build_index.py 가 주차 HTML 에서 생성 — 손으로 고치지 않는다
templates/issue.html       주차 페이지 템플릿
assets/css/style.css       단일 스타일시트 (라이트/다크 자동)
assets/js/main.js          목록 렌더 · 카테고리 필터 · 이전/다음 링크
_config.yml                Pages(Jekyll) 배포 제외 목록 — CLAUDE.md·README·templates·tools·.claude 는 사이트로 공개하지 않음
.claude/sources.md         /daily·/weekly 수집 소스·유튜브 채널 목록
tools/check_issue.py       발행 전 자동 검증(구조·카드 규칙·검색 인덱스 최신 여부·링크, status 별 규칙). /daily·/weekly 가 실행
tools/build_index.py       data/cards.json 생성. 카드를 추가·수정하면 커밋 전에 실행
tools/feedback/            독자 피드백 수집용 Google Apps Script(Code.gs)와 설정 방법(README.md)
404.html                   절대경로(/WeeklyNews/...) 사용 — 저장소명이 바뀌면 함께 수정
```

- 내부 링크는 상대경로. 각 페이지 `<body data-root="...">` 가 루트까지의 상대경로(주차 페이지는 `../../../`).
- 월별 index 페이지, 다국어, 빌드 스크립트는 만들지 않는다.
- 카드 상단은 **포스터**(카테고리 색 + 큰 키워드)가 기본이고, 원문에 대표 이미지(og:image)가 있으면 그 위에 이미지를 얹는다.
  이미지는 원문 og:image 를 그대로 링크(복사·재호스팅 안 함)하고 `onerror="this.remove()"` 로 깨지면 포스터가 보이게 한다.
  로고만 있는 이미지, `http://` 이미지(혼합 콘텐츠 차단)는 쓰지 않는다. 기업 보도자료·공식 블로그 이미지를 우선한다.

## 주차 규칙

- **수집 기간**: 한 호 = 월요일 ~ 일요일 한 주. **그 주의 소식은 그 주 라벨**로 낸다.
- **라벨**: 수집 기간의 **월요일**이 해당 월의 n번째 월요일이면 `n주차`.
  - 예: 2026.10.12 – 10.18 → 월요일 10-12 → 10월의 2번째 월요일 → `2026년 10월 2주차`
  - 월요일 기준이라 주가 달을 걸치면 월요일이 속한 달로 센다. (예: 2026.09.28 – 10.04 → `2026년 9월 4주차`)
  - 2026-10-16 에 기준을 바꾸면서 기존 호를 다시 붙였다(옛 10월 1주차 → 9월 4주차, 옛 10월 2주차 → 10월 1주차).
- **파일**: `archive/2026/10/week2.html`, **id**: `2026-10-w2`, **상단 제목**: `Tech Radar · Oct W2` (위 작은 글씨 `2026년 10월 2주차 · 기술 동향`)
- 같은 id가 issues.json에 이미 있으면: `/daily` 는 live 호에 이어서 채우고(final 이면 중단), `/weekly` 는 새로 만들지 말고 사용자에게 갱신 여부를 묻는다.

## 카테고리 (고정)

| 카테고리 | class | 범위 |
|---|---|---|
| AI | `cat-ai` | 모델 출시, AI 서비스, 연구 성과 |
| 빅테크 | `cat-bigtech` | 애플·구글·MS·메타·아마존 등의 사업/실적/M&A |
| 보안 | `cat-security` | 취약점, 침해사고, 랜섬웨어, 보안 정책 |
| 클라우드·인프라 | `cat-cloud` | 클라우드, 데이터센터, 네트워크 |
| 반도체·HW | `cat-chip` | 반도체, GPU, 하드웨어 |
| 모바일·디바이스 | `cat-device` | 스마트폰, 웨어러블, XR, 가전 |
| 정책·규제 | `cat-policy` | 각국 법·규제, 반독점, 개인정보 |
| 국내 IT | `cat-korea` | 국내 기업·정부 IT 소식 |
| 조선·해양 | `cat-ship` | 조선사·기자재 업체의 IT/DX(스마트 야드, 디지털 트윈, 자율운항, 선박 SW·사이버보안), 업계 영향이 큰 수주·정책 |
| 개발도구 | `cat-dev` | 언어, 프레임워크, 오픈소스, 개발 플랫폼 |

카테고리를 추가/변경하면 이 표, `assets/js/main.js` 의 `CATEGORIES`, `style.css` 의 `--c-*`·`--p-*`·`.cat-*`/`[data-cat]` 를 함께 고친다.

> 조선·해양: 조선·해양 분야 독자를 위해 순수 수주 소식보다 **IT·디지털 전환과 연결되는 소식**(조선소 자동화·MES·PLM, 디지털 트윈, 자율운항/원격관제, IMO·IACS 사이버보안 규칙 UR E26/E27, 친환경 선박 운항 SW 등)을 우선한다.

## 선정 기준

- 마감 기준 **주 10–20건**(하루 2–4건씩 추가), 한 카테고리 최대 5건, 국내 IT 최소 2건, 조선·해양 1–2건(해당 주에 쓸 만한 소식이 없으면 0건 가능, 보고 때 명시). 진행 중(live)에는 건수 하한·국내 IT 최소를 보지 않는다.
- **1차 출처 우선**: 공식 발표/블로그/보도자료 > 주요 언론 > 기타. 커뮤니티(HN 등)는 화제성 확인용으로만 쓰고 출처로 쓰지 않는다.
- 수집 기간 안에 발표·보도된 것만. 날짜를 원문에서 확인한다.
- 루머, 익명 소식통 단독 보도, 미확인 유출, 광고성 기사는 제외한다.
- 같은 사건은 1건으로 합치고 가장 신뢰도 높은 출처를 링크한다.
- 요약은 **직접 작성**한다(원문 문장 복사 금지). 요약 2–3문장, "왜 중요한가" 1문장(`card-why`. 라벨 `WHY IT MATTERS` 는 CSS 가 붙이므로 본문만 쓴다).
- 숫자·이름·날짜는 원문과 대조한다. 확인 못 한 내용은 쓰지 않는다.
- 모든 원문 링크는 발행 전 열리는지 확인한다(curl 200/3xx. 봇 차단 403이면 WebFetch/검색으로 존재 확인).

## 공신력 있는 소스

수집할 소스(RSS·검색 방법)와 유튜브 채널 목록, 영상 고르는 방법은 `.claude/sources.md` 에 있다. `/weekly` 수집 단계에서만 읽는다. 소스를 추가·변경하면 그 파일을 고친다.

## HTML 작성 규칙

- `templates/issue.html` 을 복사해 플레이스홀더를 채우고 맨 위 안내 주석은 지운다.
- 카드: `<article class="card" data-cat="카테고리명" data-date="YYYY-MM-DD">` > `.card-media`(포스터 + 선택 이미지) + `.card-body`(tag·제목·요약·why·foot). data-cat · `poster-cat` · tag 텍스트는 위 표의 이름과 정확히 일치. 구조는 `templates/issue.html` 참고.
- 포스터 키워드(`poster-kw`): 기사를 한눈에 대표하는 2–12자. 숫자·제품명·고유명사 위주(예: `107.4조`, `GPT-6`, `−20%`, `Vera Rubin`). 원문에 없는 숫자를 만들지 않는다.
- 이미지: 원문 HTML 의 `og:image`(없으면 `twitter:image`)를 curl 로 뽑아 200 확인 후 `<img class="card-img" ... onerror="this.remove()">`. URL 의 `&` 는 `&amp;`.
- 카드 순서: HTML 에는 **중요도 순**으로 둔다(카테고리 순 아님). **맨 앞 카드가 리드 카드**(PC 에서 가로 전체). 화면 순서는 JS 가 정한다.
  - 전체 보기: live = 리드 카드 고정 + 나머지 원문 날짜 최신순 / final = HTML 순서(중요도 순).
  - 카테고리 필터: 항상 원문 날짜 최신순(같은 날은 중요도 순). 필터 칩·카테고리 막대도 JS가 자동 생성.
- 출처 표기: `출처명 · MM.DD` (원문 발표일).
- 링크 공유 미리보기: 모든 페이지 `og:image` = `assets/images/og-cover.png?v=YYYYMMDD`(1200×630, 템플릿에 포함). 문구·디자인을 바꾸면 이미지를 다시 만들고 모든 페이지의 `?v=` 값을 새 날짜로 올리며(카톡이 이미지 URL 단위로 캐시), 카카오톡은 캐시 초기화(https://developers.kakao.com/tool/clear/og)가 필요하다.
- CSS/JS 캐시: 모든 페이지가 `style.css?v=YYYYMMDD`·`main.js?v=YYYYMMDD` 로 불러온다(Pages 캐시 10분). `style.css`·`main.js` 를 고치면 모든 페이지와 `templates/issue.html` 의 `?v=` 를 새 날짜로 함께 올린다(같은 날 두 번째면 `YYYYMMDD02`). 주간 발행만 할 때는 템플릿 값을 그대로 쓴다.
- 방문자 집계: GoatCounter(https://lspace-next.goatcounter.com, 쿠키 없음). 모든 페이지가 `main.js` 바로 다음 줄에서 `count.js` 를 불러온다(템플릿 포함, check_issue 가 검사). 새 페이지를 만들면 같은 줄을 넣는다. localhost 방문은 집계되지 않는다.
- 외부 링크는 `target="_blank" rel="noopener"`.
- 텍스트의 `& < > "` 는 이스케이프.
- `data/issues.json` 은 배열 맨 앞에 추가. `headline`/`highlights` 는 페이지의 내용과 동일하게, `categories` 는 카테고리별 건수, `count` 는 총 카드 수.
  `status` 는 `live`(채우는 중)/`final`(마감) — 페이지 `<body data-status>` 와 같게. `published` = 호를 연 날, `updated` = 마지막으로 카드를 추가·수정한 날.
- 카드 `data-date="YYYY-MM-DD"` = 원문 발표일(출처 표기 `MM.DD` 와 같고 수집 기간 안). 정렬에 쓰며 check_issue 가 검사한다.
- 카드 `data-added="YYYY-MM-DD"` = 추가한 날. live 호에서 가장 최근 날짜 카드에 JS 가 NEW 배지를 붙인다.

## 커밋 컨벤션

`Type: 한글 제목` — 타입은 첫 글자 대문자 + 콜론, 제목은 한글로 간결하게(마침표 없음). 필요하면 빈 줄 뒤 본문에 `- ` 목록으로 상세.

| Type | 용도 |
|---|---|
| Feat | 새 기능 (예: `Feat: 주차 페이지 독자 피드백 추가`) |
| Fix | 버그·오류 수정 |
| Style | 디자인·CSS·레이아웃 변경 (동작 변화 없음) |
| Content | 주간 호 발행·기사 내용 수정 (예: `Content: 2026년 10월 3주차 발행`) |
| Docs | CLAUDE.md·README·주석 등 문서 |
| Refactor | 동작 변화 없는 코드 정리 |
| Chore | 설정·배포·도구 (예: `_config.yml`, `tools/`) |

## 로컬 확인

```
python -m http.server 8000   # http://localhost:8000  (file:// 로 열면 issues.json 로딩 실패)
```
