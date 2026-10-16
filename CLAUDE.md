# L.SPACE Tech Radar (WeeklyNews)

L.SPACE의 주간 기술 동향 콘텐츠. 매주 AI·제조/조선 AX·클라우드·보안·개발도구 등 기술 변화를 카드 형식으로 정리해 GitHub Pages(프로젝트 사이트)에 발행하는 정적 사이트.
빌드 도구 없음. HTML/CSS/JS를 그대로 배포한다. 매주 발행은 `/weekly` 커맨드(`.claude/commands/weekly.md`)로 수행한다.
- **자동 발행**: Claude Code 클라우드 루틴이 매주 월요일 05:00 KST 에 `/weekly auto` 를 실행해 지난주 호를 만들고 `main` 에 푸시한다. 발행 전 `tools/check_issue.py` 검증을 통과하지 못하면 푸시하지 않고 실패 사유만 남긴다.

- **SITE_URL**: `https://lspace-next.github.io/WeeklyNews`
- **저장소**: https://github.com/lspace-next/WeeklyNews (main 브랜치 / root 를 Pages 로 배포)
- 참고한 원형: https://busanbus.github.io/weekly-mobility (주차별 카드뉴스 아카이브 구조)

## 구조

```
index.html                 홈 — 최신호 + 지난 호 목록 (data/issues.json 렌더)
archive.html               전체 아카이브 — 연/월 그룹 (data/issues.json 렌더)
archive/YYYY/MM/weekN.html 주차 페이지 (정적 HTML, templates/issue.html 기반)
data/issues.json           발행 인덱스. 홈·아카이브·이전/다음 링크의 단일 소스. 최신순.
templates/issue.html       주차 페이지 템플릿
assets/css/style.css       단일 스타일시트 (라이트/다크 자동)
assets/js/main.js          목록 렌더 · 카테고리 필터 · 이전/다음 링크
_config.yml                Pages(Jekyll) 배포 제외 목록 — CLAUDE.md·README·templates·tools·.claude 는 사이트로 공개하지 않음
.claude/sources.md         /weekly 수집 소스·유튜브 채널 목록
tools/check_issue.py       발행 전 자동 검증(구조·카드 규칙·링크). /weekly 가 실행
tools/feedback/            독자 피드백 수집용 Google Apps Script(Code.gs)와 설정 방법(README.md)
404.html                   절대경로(/WeeklyNews/...) 사용 — 저장소명이 바뀌면 함께 수정
```

- 내부 링크는 상대경로. 각 페이지 `<body data-root="...">` 가 루트까지의 상대경로(주차 페이지는 `../../../`).
- 월별 index 페이지, 다국어, 빌드 스크립트는 만들지 않는다.
- 카드 상단은 **포스터**(카테고리 색 + 큰 키워드)가 기본이고, 원문에 대표 이미지(og:image)가 있으면 그 위에 이미지를 얹는다.
  이미지는 원문 og:image 를 그대로 링크(복사·재호스팅 안 함)하고 `onerror="this.remove()"` 로 깨지면 포스터가 보이게 한다.
  로고만 있는 이미지, `http://` 이미지(혼합 콘텐츠 차단)는 쓰지 않는다. 기업 보도자료·공식 블로그 이미지를 우선한다.

## 주차 규칙

- **라벨**: 발행일이 속한 주의 **월요일** 기준, 그 월요일이 해당 월의 n번째 월요일이면 `n주차`.
  - 예: 2026-10-14(수) → 그 주 월요일 10-12 → 10월의 2번째 월요일 → `2026년 10월 2주차`
  - 월요일이 다음 달이면 다음 달 주차로 센다. (예: 2026-11-01(일) 발행 → 월요일 10-26 → 10월 4주차)
- **수집 기간**: 직전 주 월요일 ~ 일요일 (예: 10월 2주차 → 2026.10.05 – 10.11)
- **파일**: `archive/2026/10/week2.html`, **id**: `2026-10-w2`, **상단 제목**: `Tech Radar · Oct W2` (위 작은 글씨 `2026년 10월 2주차 · 기술 동향`)
- 같은 id가 issues.json에 이미 있으면 새로 만들지 말고 사용자에게 갱신 여부를 묻는다.

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

- **8–12건**, 한 카테고리 최대 4건, 국내 IT 최소 2건, 조선·해양 1–2건(해당 주에 쓸 만한 소식이 없으면 0건 가능, 보고 때 명시).
- **1차 출처 우선**: 공식 발표/블로그/보도자료 > 주요 언론 > 기타. 커뮤니티(HN 등)는 화제성 확인용으로만 쓰고 출처로 쓰지 않는다.
- 수집 기간 안에 발표·보도된 것만. 날짜를 원문에서 확인한다.
- 루머, 익명 소식통 단독 보도, 미확인 유출, 광고성 기사는 제외한다.
- 같은 사건은 1건으로 합치고 가장 신뢰도 높은 출처를 링크한다.
- 요약은 **직접 작성**한다(원문 문장 복사 금지). 요약 2–3문장, "왜 중요한가" 1문장.
- 숫자·이름·날짜는 원문과 대조한다. 확인 못 한 내용은 쓰지 않는다.
- 모든 원문 링크는 발행 전 열리는지 확인한다(curl 200/3xx. 봇 차단 403이면 WebFetch/검색으로 존재 확인).

## 공신력 있는 소스

수집할 소스(RSS·검색 방법)와 유튜브 채널 목록, 영상 고르는 방법은 `.claude/sources.md` 에 있다. `/weekly` 수집 단계에서만 읽는다. 소스를 추가·변경하면 그 파일을 고친다.

## HTML 작성 규칙

- `templates/issue.html` 을 복사해 플레이스홀더를 채우고 맨 위 안내 주석은 지운다.
- 카드: `<article class="card" data-cat="카테고리명">` > `.card-media`(포스터 + 선택 이미지) + `.card-body`(tag·제목·요약·why·foot). data-cat · `poster-cat` · tag 텍스트는 위 표의 이름과 정확히 일치. 구조는 `templates/issue.html` 참고.
- 포스터 키워드(`poster-kw`): 기사를 한눈에 대표하는 2–12자. 숫자·제품명·고유명사 위주(예: `107.4조`, `GPT-6`, `−20%`, `Vera Rubin`). 원문에 없는 숫자를 만들지 않는다.
- 이미지: 원문 HTML 의 `og:image`(없으면 `twitter:image`)를 curl 로 뽑아 200 확인 후 `<img class="card-img" ... onerror="this.remove()">`. URL 의 `&` 는 `&amp;`.
- 카드 순서: 중요도 순 (카테고리 순 아님). **첫 카드는 PC 에서 가로 전체 리드 카드**가 된다. 필터 칩·카테고리 막대는 JS가 자동 생성.
- 출처 표기: `출처명 · MM.DD` (원문 발표일).
- 링크 공유 미리보기: 모든 페이지 `og:image` = `assets/images/og-cover.png?v=YYYYMMDD`(1200×630, 템플릿에 포함). 문구·디자인을 바꾸면 이미지를 다시 만들고 모든 페이지의 `?v=` 값을 새 날짜로 올리며(카톡이 이미지 URL 단위로 캐시), 카카오톡은 캐시 초기화(https://developers.kakao.com/tool/clear/og)가 필요하다.
- CSS/JS 캐시: 모든 페이지가 `style.css?v=YYYYMMDD`·`main.js?v=YYYYMMDD` 로 불러온다(Pages 캐시 10분). `style.css`·`main.js` 를 고치면 모든 페이지와 `templates/issue.html` 의 `?v=` 를 새 날짜로 함께 올린다(같은 날 두 번째면 `YYYYMMDD02`). 주간 발행만 할 때는 템플릿 값을 그대로 쓴다.
- 외부 링크는 `target="_blank" rel="noopener"`.
- 텍스트의 `& < > "` 는 이스케이프.
- `data/issues.json` 은 배열 맨 앞에 추가. `headline`/`highlights` 는 페이지의 내용과 동일하게, `categories` 는 카테고리별 건수, `count` 는 총 카드 수.

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
