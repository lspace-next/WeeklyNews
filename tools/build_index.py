"""검색 인덱스 생성. 주차 페이지(archive/**)의 카드를 읽어 data/cards.json 을 만든다.

    python tools/build_index.py          # data/cards.json 갱신
    python tools/build_index.py --check  # 최신이 아니면 exit 1 (check_issue.py 도 같은 검사를 한다)

원본은 주차 HTML 하나뿐이고 cards.json 은 거기서 뽑은 파생 파일이다. 손으로 고치지 않는다.
카드 키(k)는 원문 URL 의 FNV-1a 32bit 해시(base36) — main.js 의 cardKey() 와 같아야 한다.
주차 페이지는 각 카드에 id="c-<k>" 를 붙여 검색 결과에서 바로 그 카드로 이동한다.
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "data/cards.json"


def card_key(url):
    h = 0x811C9DC5
    for b in url.encode("utf-8"):
        h = ((h ^ b) * 0x01000193) & 0xFFFFFFFF
    digits = "0123456789abcdefghijklmnopqrstuvwxyz"
    s = ""
    while True:
        h, r = divmod(h, 36)
        s = digits[r] + s
        if not h:
            return s


def text(fragment):
    return html.unescape(re.sub(r"<[^>]+>", "", fragment or "")).strip()


def cards_of(issue):
    src = (ROOT / issue["path"]).read_text(encoding="utf-8")
    out = []
    for attrs, body in re.findall(r'<article class="card"([^>]*)>(.*?)</article>', src, re.S):
        a = dict(re.findall(r'(data-[\w-]+)="([^"]*)"', attrs))
        url = re.search(r'<a href="(https?://[^"]+)" target="_blank" rel="noopener">원문', body)
        foot = re.search(r"<span>([^<]+) · \d{2}\.\d{2}</span>", body)
        grab = lambda cls: text((re.search(rf'class="{cls}">(.*?)</(?:h2|p|span)>', body, re.S) or [None, ""])[1])
        if not url:
            continue
        u = html.unescape(url[1])
        out.append({
            "k": card_key(u), "i": issue["id"], "l": issue["label"], "p": issue["path"],
            "c": html.unescape(a.get("data-cat", "")), "d": a.get("data-date", ""),
            "t": grab("card-title"), "kw": grab("poster-kw"), "s": grab("card-summary"), "w": grab("card-why"),
            "src": text(foot[1]) if foot else "", "u": u,
        })
    # 같은 호 안에서는 원문 날짜 최신순(같은 날은 HTML 순서 = 중요도 순)
    return sorted(out, key=lambda c: c["d"], reverse=True)


def build():
    issues = json.loads((ROOT / "data/issues.json").read_text(encoding="utf-8"))
    cards = [c for it in issues for c in cards_of(it)]
    # 한 줄에 카드 하나 — diff 가 읽기 쉽게
    return "[\n" + ",\n".join(json.dumps(c, ensure_ascii=False, separators=(",", ":")) for c in cards) + "\n]\n"


def is_current():
    return OUT.exists() and OUT.read_text(encoding="utf-8") == build()


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    if "--check" in sys.argv:
        ok = is_current()
        print("OK data/cards.json 최신" if ok else "FAIL data/cards.json 이 최신이 아님 — python tools/build_index.py 실행")
        sys.exit(0 if ok else 1)
    data = build()
    OUT.write_text(data, encoding="utf-8", newline="\n")
    print(f"data/cards.json: 카드 {len(json.loads(data))}건")
