# IT 주간동향

https://lspace-next.github.io/lspace-weekly-news/

매주 AI·빅테크·보안·클라우드·반도체·국내 IT 핵심 뉴스를 카드로 정리하는 정적 사이트 (GitHub Pages).

## 매주 발행

Claude Code에서:

```
/weekly              # 오늘 기준 이번 주 호 생성
/weekly 2026-10-19   # 발행일 지정
```

규칙·소스 목록은 [CLAUDE.md](CLAUDE.md), 절차는 [.claude/commands/weekly.md](.claude/commands/weekly.md).

## 로컬 확인

```
python -m http.server 8000
```
http://localhost:8000 (file:// 로 열면 목록이 안 뜸)

## 배포

- 사이트: https://lspace-next.github.io/lspace-weekly-news/
- 저장소: https://github.com/lspace-next/lspace-weekly-news
- GitHub Pages: Settings → Pages → Source `Deploy from a branch`, Branch `main` / `(root)`
- `main` 에 push 하면 1–2분 뒤 자동 반영됩니다.
