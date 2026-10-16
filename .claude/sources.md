# 수집 소스 목록

`/weekly` 수집 단계에서 쓰는 소스·채널 목록. 선정 규칙은 CLAUDE.md "선정 기준"을 따른다.

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
