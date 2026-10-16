---
description: L.SPACE Tech Radar 한 주 호를 통째로 조사·작성한다 (수동 작성·백필용. 매일 업데이트는 /daily)
argument-hint: "[YYYY-MM-DD 그 주의 아무 날 (생략 시 지난주)] [auto | dry-run]"
---

CLAUDE.md 의 규칙을 따라 L.SPACE Tech Radar 한 호를 만든다. 인자: `$ARGUMENTS`

**인자 해석** (순서 무관, 모두 생략 가능)
- `YYYY-MM-DD` → 만들 주에 속한 아무 날. 없으면 지난주(KST).
- 모드:
  - 없음 = **대화형**: 막히면 사용자에게 묻고, 커밋·푸시는 사용자 승인 후.
  - `auto` = **무인 실행**: 사용자에게 아무것도 묻지 않는다. 판단이 필요하면 CLAUDE.md 규칙대로 스스로 정하고 보고에 남긴다. 검증을 통과하면 `main` 에 커밋·푸시한다.
  - `dry-run` = auto 와 똑같이 진행하되 **커밋·푸시하지 않고** 결과만 보고한다(테스트용).

0. **준비** (auto·dry-run): `git pull --rebase origin main` 으로 최신 상태에서 시작한다. 작업 트리가 깨끗하지 않으면 중단하고 보고한다.

1. **주차 계산**: CLAUDE.md "주차 규칙"으로 라벨·id·파일 경로·수집 기간(그 주 월~일)을 정한다. `data/issues.json` 에 같은 id가 있으면:
   - 대화형: 멈추고 사용자에게 갱신 여부를 묻는다.
   - auto·dry-run: **아무것도 바꾸지 않고** "이미 발행됨(id)"으로 보고하고 끝낸다.

2. **수집**: `.claude/sources.md` 의 RSS/API/페이지를 훑고, 막힌 곳은 WebSearch(필요하면 extended)로 보완한다. 기간 안의 후보를 20–30건 모은다. 카테고리마다 최소 한 번은 확인한다. 조선·해양은 같은 파일의 조선·해양 소스를 반드시 훑는다.
   - RSS는 `curl -s -A "Mozilla/5.0" <feed>` 로 가져와 pubDate로 기간 필터.
   - CISA KEV JSON은 `dateAdded` 로 기간 필터.

3. **선정**: "선정 기준"에 맞게 10–20건을 고른다. 같은 사건은 합친다. 선정 이유가 약한 것은 뺀다. 가장 중요한 기사를 첫 카드(리드 카드)로 둔다.

4. **검증·작성**: 선정한 기사마다 원문을 WebFetch로 열어 날짜·숫자·이름을 확인한 뒤 요약(2–3문장)과 "왜 중요한가"(1문장)를 직접 쓴다. 이번 주 핵심 3줄과 한 줄 headline 을 쓴다.
   - 날짜를 원문에서 확인하지 못한 기사, 숫자를 대조하지 못한 기사는 쓰지 않는다(auto 에서는 특히 엄격하게 — 애매하면 빼고 다른 후보로 채운다).
   - 카드마다 포스터 키워드(`poster-kw`, 2–12자)를 정하고, 원문 `og:image` 를 추출해 200 이면 `card-img` 로 넣는다(로고뿐인 이미지·http 이미지는 제외).
     `curl -sL -A "Mozilla/5.0" <url> | grep -oiE '<meta[^>]+(og:image|twitter:image)[^>]*>'`

5. **영상**: `.claude/sources.md` 유튜브 목록과 영상 규칙에 따라 기간 내 영상 2–4개를 고르고 URL이 존재하는지 확인한다.

6. **생성**: `templates/issue.html` → `archive/YYYY/MM/weekN.html` (안내 주석 삭제, STATUS=final, 모든 카드 data-added=생성일, meta 는 마감 형식). `data/issues.json` 맨 앞에 항목 추가(`status: "final"`, `published`·`updated` = 생성일). 이미 지난 주를 백필하면 issues.json 안에서 날짜 순 위치에 넣는다.

7. **검증**:
   - `python tools/check_issue.py <id>` 를 실행한다. 구조(issues.json·플레이스홀더·카드 규칙·카테고리 표 일치)와 원문·이미지·영상 링크 상태를 검사한다.
     - `FAIL` → 원인을 고치고 다시 실행한다. 고칠 수 없으면(예: 원문 링크가 죽음) 그 카드를 빼거나 다른 후보로 바꾼다.
     - `WARN ... 봇 차단` → 그 URL 을 WebFetch 로 열어 존재를 확인한다. 확인되지 않으면 FAIL 과 같이 처리한다.
   - 모든 카드의 출처 날짜(`MM.DD`)가 수집 기간 안인지 다시 확인한다.
   - 대화형: `python -m http.server` 로 띄워 홈·아카이브·새 호 페이지 렌더, 카테고리 필터·이전/다음 링크를 확인한다. 가능하면 375px/1280px 스크린샷.

8. **커밋·푸시**
   - 커밋 메시지는 CLAUDE.md "커밋 컨벤션"을 따른다.
   - 대화형: 하지 않는다. 보고 후 사용자 승인을 기다린다.
   - dry-run: 하지 않는다.
   - auto: `check_issue.py` 가 PASS 이고 위 날짜 확인까지 끝났을 때만 진행한다.
     ```
     git add archive/ data/issues.json
     git commit -m "Content: YYYY년 M월 N주차 발행 (auto)" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
     git push origin main     # 거부되면 git pull --rebase origin main 후 1회 재시도
     ```
     검증을 통과하지 못했으면 **커밋·푸시하지 않고** 변경을 되돌린 뒤(`git checkout -- . && git clean -fd archive/`) 실패 사유를 보고한다. 공개 사이트에 불완전한 호를 올리지 않는 것이 우선이다.

9. **보고**: 선정 기사 목록(카테고리·제목·출처·날짜), 제외한 주요 후보와 이유, 조선·해양 0건이면 그 사실, `check_issue.py` 결과, (auto) 푸시한 커밋 해시와 페이지 URL(`SITE_URL/archive/YYYY/MM/weekN.html`).
