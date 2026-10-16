"""발행 전 자동 검증. /daily·/weekly 의 auto·dry-run 모드가 커밋 전에 실행한다.

    python tools/check_issue.py 2026-10-w3            # 구조 검사 + 링크 검사
    python tools/check_issue.py 2026-10-w3 --no-links # 구조 검사만

통과하면 exit 0, 하나라도 실패하면 실패 항목을 출력하고 exit 1.
issues.json 의 status 로 규칙이 갈린다: live(매일 채우는 중)는 건수 하한·국내 IT 최소 건수를 보지 않는다.
링크가 403(봇 차단)이면 WARN 으로만 표시한다 → /weekly 가 WebFetch 로 존재를 확인한다.
"""
import html
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130 Safari/537.36"


def categories():
    """CLAUDE.md 카테고리 표: {이름: slug}"""
    text = (ROOT / "CLAUDE.md").read_text(encoding="utf-8")
    section = text.split("## 카테고리", 1)[1].split("\n## ", 1)[0]
    return {m[0].strip(): m[1] for m in re.findall(r"^\| ([^|]+?) \| `cat-(\w+)` \|", section, re.M)}


def status(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    try:
        with urllib.request.urlopen(req, timeout=20) as r:
            return r.status
    except urllib.error.HTTPError as e:
        return e.code
    except Exception:
        return 0


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    args =[a for a in sys.argv[1:] if not a.startswith("--")]
    check_links = "--no-links" not in sys.argv
    if len(args) != 1 or not re.fullmatch(r"\d{4}-\d{2}-w\d", args[0]):
        sys.exit("usage: python tools/check_issue.py YYYY-MM-wN [--no-links]")
    issue_id = args[0]
    fails, warns = [], []

    # 1. issues.json
    try:
        issues = json.loads((ROOT / "data/issues.json").read_text(encoding="utf-8"))
    except Exception as e:
        sys.exit(f"FAIL data/issues.json 이 유효한 JSON 이 아님: {e}")
    ids = [it.get("id") for it in issues]
    if not issues or issues[0].get("id") != issue_id:
        fails.append(f"issues.json 첫 항목 id 가 {issue_id} 가 아님 (현재 {ids[:1]})")
    if len(ids) != len(set(ids)):
        fails.append("issues.json 에 중복 id 가 있음")
    entry = next((it for it in issues if it.get("id") == issue_id), None)
    if not entry:
        print("\n".join("FAIL " + f for f in fails))
        sys.exit(1)

    page = ROOT / entry["path"]
    if not page.exists():
        sys.exit(f"FAIL 페이지 파일 없음: {entry['path']}")
    src = page.read_text(encoding="utf-8")

    # 2. 템플릿 잔재
    if "{{" in src or "}}" in src:
        fails.append("페이지에 {{ }} 플레이스홀더가 남아 있음")
    if "주차 페이지 템플릿" in src or "example.com" in src or "기사 제목</h2>" in src:
        fails.append("페이지에 템플릿 안내 주석/예시 카드가 남아 있음")
    if f'data-issue="{issue_id}"' not in src:
        fails.append(f'<body data-issue="{issue_id}"> 가 없음')
    st = entry.get("status", "final")
    live = st == "live"
    if st not in ("live", "final"):
        fails.append(f"issues.json status '{st}' (live 또는 final 이어야 함)")
    if f'data-status="{st}"' not in src:
        fails.append(f'<body data-status="{st}"> 가 없음 (issues.json status 와 같아야 함)')
    if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", str(entry.get("updated", ""))):
        fails.append("issues.json updated 가 YYYY-MM-DD 가 아님")

    # 3. 카드 규칙
    cats = categories()
    cards = re.findall(r'<article class="card" data-cat="([^"]+)"(?: data-added="([^"]*)")?>(.*?)</article>', src, re.S)
    n = len(cards)
    lo, hi = (1, 20) if live else (10, 20)
    if not lo <= n <= hi:
        fails.append(f"카드 수 {n}건 ({lo}–{hi}건이어야 함)")
    count = Counter()
    for i, (cat, added, body) in enumerate(cards, 1):
        count[cat] += 1
        if live and not re.fullmatch(r"\d{4}-\d{2}-\d{2}", added):
            fails.append(f"카드 {i}: data-added=\"YYYY-MM-DD\" 가 없음")
        if cat not in cats:
            fails.append(f"카드 {i}: data-cat '{cat}' 이 CLAUDE.md 카테고리 표에 없음")
            continue
        pc = re.search(r'class="poster-cat">([^<]*)<', body)
        tag = re.search(r'<span class="tag cat-(\w+)">([^<]*)<', body)
        kw = re.search(r'class="poster-kw">([^<]*)<', body)
        if not pc or pc.group(1) != cat:
            fails.append(f"카드 {i}: poster-cat 이 '{cat}' 와 다름")
        if not tag or tag.group(2) != cat or tag.group(1) != cats[cat]:
            fails.append(f"카드 {i}: tag 텍스트/클래스가 '{cat}' / cat-{cats[cat]} 와 다름")
        if not kw or not kw.group(1).strip():
            fails.append(f"카드 {i}: poster-kw 가 비어 있음")
        for cls in ("card-title", "card-summary", "card-why"):
            if f'class="{cls}"' not in body:
                fails.append(f"카드 {i}: {cls} 없음")
        if not re.search(r"<span>[^<]+ · \d{2}\.\d{2}</span>", body):
            fails.append(f"카드 {i}: 출처 표기 '출처명 · MM.DD' 형식이 아님")
    for cat, c in count.items():
        if c > 5:
            fails.append(f"카테고리 '{cat}' {c}건 (최대 5건)")
    if not live and count.get("국내 IT", 0) < 2:
        fails.append(f"국내 IT {count.get('국내 IT', 0)}건 (최소 2건)")
    if not live and count.get("조선·해양", 0) == 0:
        warns.append("조선·해양 0건 — 보고에 명시할 것")
    srcs = re.findall(r'<a href="(https?://[^"]+)" target="_blank" rel="noopener">원문', src)
    for u, c in Counter(srcs).items():
        if c > 1:
            fails.append(f"같은 원문 링크가 카드 {c}개에 있음 (같은 사건은 1건으로): {u}")
    if entry.get("count") != n:
        fails.append(f"issues.json count={entry.get('count')} 와 카드 수 {n} 불일치")
    if entry.get("categories") != dict(count):
        fails.append(f"issues.json categories {entry.get('categories')} 와 실제 {dict(count)} 불일치")
    if len(entry.get("highlights", [])) != 3:
        fails.append("issues.json highlights 가 3줄이 아님")

    # 4. 링크·이미지
    if check_links:
        links = set(re.findall(r'<a href="(https?://[^"]+)" target="_blank" rel="noopener">원문', src))
        imgs = set(re.findall(r'class="card-img" src="([^"]+)"', src))
        thumbs = set(re.findall(r'src="(https://i\.ytimg\.com/[^"]+)"', src))
        videos = set(re.findall(r'href="(https://www\.youtube\.com/watch\?v=[^"]+)"', src))
        for kind, urls in (("원문", links), ("카드 이미지", imgs), ("영상 썸네일", thumbs), ("영상", videos)):
            for u in sorted(urls):
                u = html.unescape(u)
                if u.startswith("http://") and kind == "카드 이미지":
                    fails.append(f"{kind} http:// 사용: {u}")
                    continue
                code = status(u)
                if kind == "영상" and not 200 <= code < 400:
                    # 클라우드 IP 는 시청 페이지가 봇 확인(google.com/sorry)으로 넘어가 실패한다 → oEmbed 로 존재 확인
                    code = status("https://www.youtube.com/oembed?format=json&url=" + urllib.parse.quote(u, safe=""))
                if code in (401, 403, 429):
                    warns.append(f"{kind} {code} (봇 차단 추정 — WebFetch 로 확인): {u}")
                elif not 200 <= code < 400:
                    fails.append(f"{kind} {code}: {u}")

    for w in warns:
        print("WARN " + w)
    for f in fails:
        print("FAIL " + f)
    print(f"{'PASS' if not fails else 'FAIL'} {issue_id} ({st}): 카드 {n}건 {dict(count)}")
    sys.exit(1 if fails else 0)


if __name__ == "__main__":
    main()
