---
description: 이번 주 L.SPACE Tech Radar 호에 전날 소식을 추가한다 (월요일엔 지난주 호 마감)
argument-hint: "[YYYY-MM-DD 실행일 (생략 시 오늘)] [auto | dry-run]"
---

CLAUDE.md 의 규칙을 따라 이번 주 호를 하루치 채운다. 인자: `$ARGUMENTS`
수집·카드 작성·검증의 세부 방법은 `.claude/commands/weekly.md` 2·4·7단계와 같다. 여기서는 매일 흐름만 정한다.

**인자 해석** (순서 무관, 모두 생략 가능)
- `YYYY-MM-DD` → 실행일. 없으면 오늘(KST).
- 모드: 없음 = 대화형(커밋·푸시는 사용자 승인 후) / `auto` = 클라우드 루틴용, 묻지 않고 검증 통과 시 푸시 / `dry-run` = auto 와 같되 커밋·푸시 안 함.

0. **준비** (auto·dry-run): `git pull --rebase origin main`. 작업 트리가 깨끗하지 않으면 중단하고 보고한다.

1. **대상 정하기** (CLAUDE.md "주차 규칙")
   - 실행일이 **화–금**: 대상 = 실행일이 속한 주의 호. 수집 범위 = 직전 실행 이후 ~ 전날
     (보통 전날 하루. issues.json `updated` 다음 날부터 전날까지 — 실패로 빠진 날이 있으면 함께 채운다. 새 호면 그 주 월요일부터).
   - 실행일이 **월**: 대상 = 지난주 호. 수집 범위 = `updated` 다음 날 ~ 어제(일요일). 추가 후 **마감**(5단계).
   - 대상 id 가 issues.json 에 없으면 새 호를 연다: `templates/issue.html` 로 페이지를 만들고(STATUS=live) issues.json 맨 앞에 항목 추가(`status: "live"`, `published` = 실행일).
   - 대상 호가 이미 `final` 이면 아무것도 바꾸지 않고 "이미 마감됨(id)"으로 보고하고 끝낸다.

2. **수집·선정**: 수집 범위 안의 소식만. 하루치 **2–4건**(월요일 금–일분은 최대 6건). 주 전체가 **20건**을 넘지 않게, 카테고리 최대 5건.
   - 페이지에 이미 있는 카드와 원문 URL·사건이 겹치면 새 카드로 넣지 않는다. 같은 사건의 의미 있는 후속이면 기존 카드의 요약·출처·날짜를 갱신한다.
   - 쓸 만한 소식이 없으면 0건도 가능(억지로 채우지 않는다). 0건이면 페이지는 그대로 두고 `updated` 만 올린다.

3. **작성**: 카드마다 `data-added="실행일"`. weekly.md 4단계대로 원문 확인 후 직접 요약, 포스터 키워드, og:image.
   - 진행 중 순서: 최근 추가일 카드가 위, 같은 날 안에서는 중요도 순.
   - headline·이번 주 핵심 3줄을 "이번 주 지금까지" 기준으로 다시 쓰고 페이지·issues.json 둘 다 맞춘다.
   - 히어로 meta: `수집 기간 YYYY.MM.DD – MM.DD · 매일 업데이트 중 · 최근 MM.DD`.
   - issues.json: `updated` = 실행일, `count`·`categories` 갱신.

4. **검증·커밋** (화–금, 또는 월요일 마감까지 끝낸 뒤)
   - `python tools/check_issue.py <id>` — FAIL 은 고치거나 그 카드를 뺀다. 봇 차단 WARN 은 WebFetch 로 확인. 새 카드의 출처 날짜가 수집 범위 안인지 확인.
   - auto: PASS 일 때만 커밋·푸시. 실패하면 되돌리고(`git checkout -- . && git clean -fd archive/`) 사유를 보고한다. 다음 실행이 빠진 날을 이어서 채운다.
     ```
     git add archive/ data/issues.json
     git commit -m "Content: YYYY년 M월 N주차 업데이트 (MM.DD, auto)" -m "Co-Authored-By: Claude <noreply@anthropic.com>"
     git push origin main     # 거부되면 git pull --rebase origin main 후 1회 재시도
     ```

5. **마감** (월요일만, 2–3단계로 금–일분을 추가한 뒤)
   - 주 전체 카드를 중요도 순으로 다시 정렬하고 가장 중요한 기사를 리드 카드로.
   - 선정 기준(주 10–20건·국내 IT 최소 2건·조선·해양 1–2건)을 맞춘다. 부족하면 그 주 소식으로 보충, 넘치면 약한 카드부터 뺀다.
   - headline·핵심 3줄 확정, 영상 2–4개 추가(`.claude/sources.md` 영상 규칙).
   - `status: "final"`, `<body data-status="final">`, 히어로 meta `수집 기간 … · 마감 YYYY-MM-DD`.
   - check_issue PASS 후 커밋 메시지 `Content: YYYY년 M월 N주차 마감 (auto)`. 새 주 호는 화요일 실행이 연다.

6. **보고**: 추가한 카드(카테고리·제목·출처·날짜), 갱신·제외한 후보와 이유, 0건이면 그 사실, check_issue 결과, (auto) 커밋 해시와 페이지 URL.
