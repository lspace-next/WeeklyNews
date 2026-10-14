---
description: 이번 주 IT 주간동향 호를 조사·작성·발행 준비한다
argument-hint: "[YYYY-MM-DD 발행일 (생략 시 오늘)]"
---

CLAUDE.md 의 규칙을 따라 IT 주간동향 한 호를 만든다. 발행일: $ARGUMENTS (비어 있으면 오늘).

1. **주차 계산**: CLAUDE.md "주차 규칙"으로 라벨·id·파일 경로·수집 기간(직전 주 월~일)을 정한다. `data/issues.json` 에 같은 id가 있으면 멈추고 사용자에게 묻는다.

2. **수집**: CLAUDE.md "공신력 있는 소스"의 RSS/API/페이지를 훑고, 막힌 곳은 WebSearch(필요하면 extended)로 보완한다. 기간 안의 후보를 20–30건 모은다. 카테고리마다 최소 한 번은 확인한다.
   - RSS는 `curl -s -A "Mozilla/5.0" <feed>` 로 가져와 pubDate로 기간 필터.
   - CISA KEV JSON은 `dateAdded` 로 기간 필터.

3. **선정**: "선정 기준"에 맞게 8–12건을 고른다. 같은 사건은 합친다. 선정 이유가 약한 것은 뺀다.

4. **검증·작성**: 선정한 기사마다 원문을 WebFetch로 열어 날짜·숫자·이름을 확인한 뒤 요약(2–3문장)과 "왜 중요한가"(1문장)를 직접 쓴다. 이번 주 핵심 3줄과 한 줄 headline 을 쓴다.

5. **영상**: CLAUDE.md 유튜브 목록에서 기간 내 영상 2–4개를 고르고 URL이 존재하는지 확인한다.

6. **생성**: `templates/issue.html` → `archive/YYYY/MM/weekN.html`. `data/issues.json` 맨 앞에 항목 추가.

7. **검증**:
   - 모든 원문/영상 링크 상태 확인 (curl; 403 봇 차단은 WebFetch로 재확인).
   - `data/issues.json` 이 유효한 JSON인지 확인 (`python -m json.tool`).
   - `python -m http.server` 로 띄우고 홈·아카이브·새 호 페이지가 렌더되는지, 카테고리 필터·이전/다음 링크가 동작하는지 확인. 가능하면 375px/1280px 스크린샷.

8. **보고**: 선정 기사 목록(카테고리·제목·출처)과 제외한 주요 후보 및 이유를 짧게 보고한다. 커밋/푸시는 사용자가 승인한 뒤에 한다.
