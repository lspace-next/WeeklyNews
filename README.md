# L.SPACE Tech Radar

https://lspace-next.github.io/WeeklyNews/

매주 AI·빅테크·보안·클라우드·반도체·국내 IT 핵심 뉴스를 카드로 정리하는 정적 사이트 (GitHub Pages).

## 매주 발행

Claude Code에서:

```
/weekly                      # 오늘 기준 이번 주 호 생성 (대화형, 커밋은 승인 후)
/weekly 2026-10-19           # 발행일 지정
/weekly 2026-10-19 dry-run   # 자동 모드로 끝까지 만들고 검증만 (커밋·푸시 안 함)
/weekly auto                 # 자동 발행: 검증 통과 시 main 에 커밋·푸시
```

### 자동 발행 (매주 월요일 05:00 KST)

Claude Code 클라우드 루틴이 `/weekly auto` 를 실행한다. 지난주(월~일) 호를 만들어 `tools/check_issue.py` 검증을 통과하면 `main` 에 푸시하고, 통과하지 못하면 아무것도 푸시하지 않는다.
실행 기록·결과는 claude.ai 의 Claude Code 루틴 화면에서 확인하고, Claude Code 에서 `/schedule` 로 목록·수정·일시 중지할 수 있다.

규칙·소스 목록은 [CLAUDE.md](CLAUDE.md), 절차는 [.claude/commands/weekly.md](.claude/commands/weekly.md).

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
