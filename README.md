# L.SPACE Tech Radar

https://lspace-next.github.io/WeeklyNews/

L.SPACE 의 주간 기술 동향. AI부터 제조·조선 AX, 클라우드, 보안, 개발도구까지 한 주의 기술 변화를 카드로 정리하는 정적 사이트 (GitHub Pages).

## 매주 발행

Claude Code에서:

```
/weekly                      # 오늘 기준 이번 주 호 생성 (대화형, 커밋은 승인 후)
/weekly 2026-10-19           # 발행일 지정
/weekly 2026-10-19 dry-run   # 자동 모드로 끝까지 만들고 검증만 (커밋·푸시 안 함)
/weekly auto                 # 자동 발행: 검증 통과 시 main 에 커밋·푸시
```

### 자동 발행

Claude Code 클라우드 루틴 두 개가 `/daily auto` 를 실행한다. `tools/check_issue.py` 검증을 통과하면 `main` 에 푸시하고, 통과하지 못하면 아무것도 푸시하지 않는다.

- 매일 06:30 KST — 월요일은 이번 주 호를 새로 열고, 화–일은 전날 소식을 추가
- 일요일 18:00 KST — 일요일 당일 소식을 추가하고 이번 주 호 마감

푸시에 성공하면 루틴이 Gmail 커넥터로 jihye.min@lspace.kr 에 결과 메일을 보낸다(실패·변경 없음이면 보내지 않음).
실행 기록·결과는 claude.ai 의 Claude Code 루틴 화면에서 확인하고, Claude Code 에서 `/schedule` 로 목록·수정·일시 중지할 수 있다.

규칙·소스 목록은 [CLAUDE.md](CLAUDE.md), 절차는 [.claude/commands/daily.md](.claude/commands/daily.md)·[.claude/commands/weekly.md](.claude/commands/weekly.md).

## 로컬 확인

```
python -m http.server 8000
```
http://localhost:8000 (file:// 로 열면 목록이 안 뜸)

## 배포

- 사이트: https://lspace-next.github.io/WeeklyNews/
- 저장소: https://github.com/lspace-next/WeeklyNews
- GitHub Pages: Settings → Pages → Source `Deploy from a branch`, Branch `main` / `(root)`
- `main` 에 push 하면 1–2분 뒤 자동 반영됩니다.
