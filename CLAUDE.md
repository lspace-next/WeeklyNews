# L.SPACE Tech Radar (WeeklyNews)

L.SPACE의 주간 기술 동향 콘텐츠. 매주 AI·제조/조선 AX·클라우드·보안·개발도구 등 기술 변화를 카드 형식으로 정리해 GitHub Pages(프로젝트 사이트)에 발행하는 정적 사이트.
빌드 도구 없음. HTML/CSS/JS를 그대로 배포한다. 매주 발행은 `/weekly` 커맨드(`.claude/commands/weekly.md`)로 수행한다.
- **자동 발행**: Claude Code 클라우드 루틴이 매주 월요일 07:00 KST 에 `/weekly auto` 를 실행해 지난주 호를 만들고 `main` 에 푸시한다. 발행 전 `tools/check_issue.py` 검증을 통과하지 못하면 푸시하지 않고 실패 사유만 남긴다.

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
- **파일**: `archive/2026/10/week2.html`, **id**: `2026-10-w2`, **eyebrow**: `2026.10 · WEEK 2`
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

> 조선·해양: 우리 회사는 조선사·기자재 업체 대상 SI 를 주로 한다. 순수 수주 소식보다 **IT·디지털 전환과 연결되는 소식**(조선소 자동화·MES·PLM, 디지털 트윈, 자율운항/원격관제, IMO·IACS 사이버보안 규칙 UR E26/E27, 친환경 선박 운항 SW 등)을 우선한다.

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

봇 차단(401/403)이 있는 곳은 "RSS/검색" 열의 방법으로 접근한다. 2026-10-14 기준 동작 확인.

### 해외 종합 IT 언론
| 소스 | URL | RSS/검색 |
|---|---|---|
| Reuters Technology | https://www.reuters.com/technology/ | 직접 접근 차단 → WebSearch `site:reuters.com technology` |
| Bloomberg Technology | https://www.bloomberg.com/technology | 차단·유료 → WebSearch |
| The Verge | https://www.theverge.com/tech | https://www.theverge.com/rss/index.xml |
| TechCrunch | https://techcrunch.com/ | https://techcrunch.com/feed/ |
| Ars Technica | https://arstechnica.com/ | https://feeds.arstechnica.com/arstechnica/index |
| Wired | https://www.wired.com/ | https://www.wired.com/feed/rss |
| MIT Technology Review | https://www.technologyreview.com/ | https://www.technologyreview.com/feed/ |
| The Register | https://www.theregister.com/ | https://www.theregister.com/headlines.atom |

### 기업 공식 발표 (1차 출처)
| 소스 | URL | RSS/검색 |
|---|---|---|
| OpenAI | https://openai.com/news/ | https://openai.com/news/rss.xml |
| Anthropic | https://www.anthropic.com/news | RSS 없음 → 페이지 직접 |
| Google Blog | https://blog.google/ | https://blog.google/rss/ |
| Google DeepMind | https://deepmind.google/discover/blog/ | https://deepmind.google/blog/rss.xml |
| Microsoft | https://blogs.microsoft.com/ | 페이지 직접 |
| Meta AI | https://ai.meta.com/blog/ | 차단 → WebSearch `site:ai.meta.com` / about.fb.com/news |
| NVIDIA Newsroom | https://nvidianews.nvidia.com/ | https://nvidianews.nvidia.com/releases.xml |
| Apple Newsroom | https://www.apple.com/newsroom/ | https://www.apple.com/newsroom/rss-feed.rss |
| AWS What's New | https://aws.amazon.com/new/ | https://aws.amazon.com/about-aws/whats-new/recent/feed/ |
| GitHub Blog / Changelog | https://github.blog/ | https://github.blog/feed/ , https://github.blog/changelog/feed/ |

### 조선·해양
2026-10-15 기준 접근 확인.
| 소스 | URL | RSS/검색 |
|---|---|---|
| HD현대 뉴스룸 (HD한국조선해양·HD현대중공업·미포·삼호) | https://www.hd.com/kr/newsroom/media-hub/press/list | 페이지 직접 |
| 삼성중공업 보도자료 | https://www.samsungshi.com/kor/pr/news.aspx | 페이지 직접 |
| 한화오션 | https://www.hanwhaocean.com/ | 미디어 경로 변동 잦음 → WebSearch `site:hanwhaocean.com` |
| 한국조선해양플랜트협회 | https://www.koshipa.or.kr/ | 연결 불안정 → WebSearch |
| 한국조선해양기자재연구원 (KOMERI) | https://www.komeri.re.kr/ | 기자재 업계 동향 |
| 선박해양플랜트연구소 (KRISO) | https://www.kriso.re.kr/ | 자율운항·친환경 선박 연구 |
| 한국선급 (KR) | https://www.kr.co.kr/ | 선급 규칙·사이버보안 인증 |
| 산업통상자원부 / 해양수산부 | https://www.motie.go.kr/ , https://www.mof.go.kr/ | 조선·해운 정책 1차 출처 |
| 쉬핑뉴스넷 | https://www.shippingnewsnet.com/ | https://www.shippingnewsnet.com/rss/allArticle.xml |
| DNV / Lloyd's Register 뉴스 | https://www.dnv.com/news/ , https://www.lr.org/en/latest-news/ | 선급 규칙·디지털 |
| Splash247 | https://splash247.com/ | https://splash247.com/feed/ |
| Offshore Energy | https://www.offshore-energy.biz/ | https://www.offshore-energy.biz/feed/ |
| gCaptain | https://gcaptain.com/ | https://gcaptain.com/feed/ |
| MarineLink | https://www.marinelink.com/ | https://www.marinelink.com/news/rss |
| Seatrade Maritime | https://www.seatrade-maritime.com/ | https://www.seatrade-maritime.com/rss.xml |
| Riviera Maritime Media | https://www.rivieramm.com/ | 페이지 직접 |

### 보안
| 소스 | URL | RSS/검색 |
|---|---|---|
| CISA KEV (악용 취약점 목록) | https://www.cisa.gov/known-exploited-vulnerabilities-catalog | https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json (`dateAdded` 로 기간 필터) |
| CISA Advisories | https://www.cisa.gov/news-events/cybersecurity-advisories | 차단 → WebSearch |
| BleepingComputer | https://www.bleepingcomputer.com/ | https://www.bleepingcomputer.com/feed/ |
| The Hacker News | https://thehackernews.com/ | https://feeds.feedburner.com/TheHackersNews |
| Krebs on Security | https://krebsonsecurity.com/ | https://krebsonsecurity.com/feed/ |
| KISA 보호나라 보안공지 | https://www.boho.or.kr/kr/bbs/list.do?menuNo=205020&bbsId=B0000133 | 페이지 직접 |

### 리서치·지표
| 소스 | URL | 비고 |
|---|---|---|
| Gartner Newsroom | https://www.gartner.com/en/newsroom | 차단 → WebSearch |
| IDC Press Releases | https://www.idc.com/about/press-releases | 시장 점유율·출하량 |
| Stanford HAI AI Index | https://hai.stanford.edu/ai-index | 연간 AI 지표 |
| Hacker News | https://news.ycombinator.com/ | 화제성 참고만. API: https://hn.algolia.com/api/v1/search?tags=front_page |

### 국내 IT 언론
| 소스 | URL | RSS |
|---|---|---|
| 전자신문 | https://www.etnews.com/ | https://rss.etnews.com/Section901.xml |
| ZDNet Korea | https://zdnet.co.kr/ | https://feeds.feedburner.com/zdkorea |
| 디지털데일리 | https://www.ddaily.co.kr/ | 페이지 직접 |
| 블로터 | https://www.bloter.net/ | https://www.bloter.net/rss/allArticle.xml |
| 바이라인네트워크 | https://byline.network/ | https://byline.network/feed/ |
| 아이뉴스24 | https://www.inews24.com/ | 페이지 직접 |
| 연합뉴스 IT·과학 | https://www.yna.co.kr/industry/technology-science | https://www.yna.co.kr/rss/industry.xml |

### 국내 공공·정책
| 소스 | URL | 비고 |
|---|---|---|
| 과학기술정보통신부 보도자료 | https://www.msit.go.kr/bbs/list.do?sCode=user&mPid=208&mId=307 | 정부 IT 정책 1차 출처 |
| IITP 정보통신기획평가원 | https://www.iitp.kr/ | 주간기술동향 |
| NIA 한국지능정보사회진흥원 | https://www.nia.or.kr/ | 디지털 정책 리포트 |
| SPRi 소프트웨어정책연구소 | https://spri.kr/ | AI·SW 정책 브리프 |
| NIPA 정보통신산업진흥원 | https://www.nipa.kr/ | 산업 지원 사업 |

### 유튜브 (이번 주 볼만한 영상 후보)
해외
| 채널 | URL | 성격 |
|---|---|---|
| Fireship | https://www.youtube.com/@Fireship | 개발·기술 뉴스 짧은 요약 |
| Two Minute Papers | https://www.youtube.com/@TwoMinutePapers | AI 논문 해설 |
| AI Explained | https://www.youtube.com/@aiexplained-official | AI 모델·벤치마크 분석 |
| Bloomberg Tech | https://www.youtube.com/bloombergtech | 빅테크 비즈니스 |
| CNBC Television | https://www.youtube.com/@CNBCtelevision | 빅테크 실적·인터뷰 |
| The Verge | https://www.youtube.com/@TheVerge | 제품·서비스 리뷰 |
| Marques Brownlee (MKBHD) | https://www.youtube.com/@mkbhd | 디바이스 리뷰 |
| Lex Fridman | https://www.youtube.com/@LexFridman | 업계 인물 장편 인터뷰 |
| Google for Developers | https://www.youtube.com/@GoogleDevelopers | 공식 (개발) |
| Google DeepMind | https://www.youtube.com/@GoogleDeepMind | 공식 (AI 연구) |
| Microsoft Developer | https://www.youtube.com/@MicrosoftDeveloper | 공식 (개발) |
| NVIDIA | https://www.youtube.com/@NVIDIA | 공식 (키노트) |
| AWS Events | https://www.youtube.com/@AWSEventsChannel | 공식 (클라우드 행사) |
| OpenAI | https://www.youtube.com/@OpenAI | 공식 (발표) |
| Anthropic | https://www.youtube.com/@anthropic-ai | 공식 (발표) |

국내
| 채널 | URL | 성격 |
|---|---|---|
| 안될공학 | https://www.youtube.com/@unrealtech | 반도체·IT 산업 분석 |
| 티타임즈TV | https://www.youtube.com/@TTimesTV | 테크 비즈니스 해설 |
| 조코딩 | https://www.youtube.com/@jocoding | AI·개발 트렌드 |
| 노마드 코더 | https://www.youtube.com/@nomadcoders | 개발 생태계 |
| ITSub잇섭 | https://www.youtube.com/@ITSUB | 디바이스 리뷰 |
| 테크몽 | https://www.youtube.com/@techmong | 디바이스·칩 분석 |

영상은 수집 기간에 올라온 것 중 2–4개(카드 그리드라 4개가 PC 한 줄). 공식 채널 키노트/발표 영상을 우선하고, Shorts(`/shorts/`)는 제외한다. 영상 URL은 `watch?v=` 형식으로 실제 존재를 확인한다.
- 채널 업로드 목록: `https://www.youtube.com/feeds/videos.xml?channel_id=<UC...>` (채널 ID는 채널 페이지의 `"externalId"`)
- 영상 카드는 썸네일 `https://i.ytimg.com/vi/<ID>/mqdefault.jpg` 을 쓴다(200 확인). 썸네일 클릭 시 main.js가 페이지 안에서 재생한다.

## HTML 작성 규칙

- `templates/issue.html` 을 복사해 플레이스홀더를 채우고 맨 위 안내 주석은 지운다.
- 카드: `<article class="card" data-cat="카테고리명">` > `.card-media`(포스터 + 선택 이미지) + `.card-body`(tag·제목·요약·why·foot). data-cat · `poster-cat` · tag 텍스트는 위 표의 이름과 정확히 일치. 구조는 `templates/issue.html` 참고.
- 포스터 키워드(`poster-kw`): 기사를 한눈에 대표하는 2–12자. 숫자·제품명·고유명사 위주(예: `107.4조`, `GPT-6`, `−20%`, `Vera Rubin`). 원문에 없는 숫자를 만들지 않는다.
- 이미지: 원문 HTML 의 `og:image`(없으면 `twitter:image`)를 curl 로 뽑아 200 확인 후 `<img class="card-img" ... onerror="this.remove()">`. URL 의 `&` 는 `&amp;`.
- 카드 순서: 중요도 순 (카테고리 순 아님). **첫 카드는 PC 에서 가로 전체 리드 카드**가 된다. 필터 칩·카테고리 막대는 JS가 자동 생성.
- 출처 표기: `출처명 · MM.DD` (원문 발표일).
- 링크 공유 미리보기: 모든 페이지 `og:image` = `assets/images/og-cover.png?v=YYYYMMDD`(1200×630, 템플릿에 포함). 문구·디자인을 바꾸면 이미지를 다시 만들고 모든 페이지의 `?v=` 값을 새 날짜로 올리며(카톡이 이미지 URL 단위로 캐시), 카카오톡은 캐시 초기화(https://developers.kakao.com/tool/clear/og)가 필요하다.
- 외부 링크는 `target="_blank" rel="noopener"`.
- 텍스트의 `& < > "` 는 이스케이프.
- `data/issues.json` 은 배열 맨 앞에 추가. `headline`/`highlights` 는 페이지의 내용과 동일하게, `categories` 는 카테고리별 건수, `count` 는 총 카드 수.

## 로컬 확인

```
python -m http.server 8000   # http://localhost:8000  (file:// 로 열면 issues.json 로딩 실패)
```
