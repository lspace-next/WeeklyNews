/**
 * L.SPACE Tech Radar — 독자 피드백 수집 (Google Apps Script 웹앱)
 * 설정 방법은 같은 폴더의 README.md 참고.
 *
 * 시트 컬럼: 접수시각 | 호 | 평가 | 의견 | 세션 | 수정시각
 * - 같은 세션(브라우저)·같은 호는 한 행만 쓰고, 평가를 바꾸거나 의견을 보내면 그 행을 갱신한다.
 * - 익명. 이름·이메일·IP 는 받지 않는다.
 */
const SHEET_NAME = 'feedback';
const RATES = ['good', 'soso', 'bad'];
const HEADER = ['접수시각', '호', '평가', '의견', '세션', '수정시각'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(5000);
  try {
    const d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (d.website) return out_('ok'); // honeypot: 봇이 채우는 숨김 필드

    const issue = String(d.issue || '');
    const sid = String(d.sid || '');
    if (!/^\d{4}-\d{2}-w\d$/.test(issue) || !/^[\w-]{8,40}$/.test(sid)) return out_('bad');
    const rate = RATES.indexOf(d.rate) >= 0 ? d.rate : '';
    const comment = clean_(d.comment, 500);
    if (!rate && !comment) return out_('bad');

    const sh = sheet_();
    const now = new Date();
    const last = sh.getLastRow();
    if (last > 1) {
      const start = Math.max(2, last - 999); // 최근 1000행에서 같은 세션 찾기
      const vals = sh.getRange(start, 2, last - start + 1, 4).getValues(); // 호, 평가, 의견, 세션
      for (let i = vals.length - 1; i >= 0; i--) {
        if (vals[i][0] === issue && vals[i][3] === sid) {
          const row = start + i;
          if (rate) sh.getRange(row, 3).setValue(rate);
          if (comment) sh.getRange(row, 4).setValue(comment);
          sh.getRange(row, 6).setValue(now);
          return out_('updated');
        }
      }
    }
    sh.appendRow([now, issue, rate, comment, sid, now]);
    return out_('ok');
  } catch (err) {
    return out_('error');
  } finally {
    lock.releaseLock();
  }
}

// 브라우저에서 URL 을 열었을 때 동작 확인용
function doGet() {
  return out_('L.SPACE Tech Radar feedback endpoint');
}

function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADER);
    sh.setFrozenRows(1);
  }
  return sh;
}

// 제어문자 제거, 길이 제한, 수식 주입(=,+,-,@ 로 시작) 방지
function clean_(v, max) {
  let s = String(v || '').replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, ' ').trim().slice(0, max);
  if (/^[=+\-@]/.test(s)) s = "'" + s;
  return s;
}

function out_(msg) {
  return ContentService.createTextOutput(msg).setMimeType(ContentService.MimeType.TEXT);
}
