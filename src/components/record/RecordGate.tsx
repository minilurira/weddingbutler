'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const ERRORS: Record<string, string> = {
  too_many_requests: '인증번호 요청이 너무 많아요. 1시간 뒤에 다시 시도해 주세요.',
  sms_failed: '문자를 보내지 못했어요. 고객센터로 문의해 주세요.',
  expired: '인증번호가 만료됐어요. 인증번호를 다시 받아 주세요.',
  locked: '인증번호를 5번 틀렸어요. 인증번호를 다시 받아 주세요.',
  not_found: '기록을 찾을 수 없어요. 링크를 다시 확인해 주세요.',
};

/** S14 — 예약자 휴대폰 문자 인증. 성공하면 서버가 쿠키를 주고 페이지를 다시 그린다. */
export function RecordGate({ token, coupleName, phoneMasked }: { token: string; coupleName: string; phoneMasked: string }) {
  const router = useRouter();
  const [sent, setSent] = useState(false);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  async function post(path: string, body?: object) {
    const res = await fetch(`/api/records/${token}/${path}`, {
      method: 'POST',
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; remaining?: number };
    return { ok: res.ok, data };
  }

  async function sendCode() {
    setBusy(true);
    setMessage('');
    const { ok, data } = await post('otp');
    setBusy(false);
    if (!ok) { setMessage(ERRORS[data.error ?? ''] ?? '잠시 후 다시 시도해 주세요.'); return; }
    setSent(true);
    setCode('');
    setMessage(`${phoneMasked}로 인증번호를 보냈어요. 5분 안에 입력해 주세요.`);
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    if (code.length !== 6) { setMessage('인증번호 6자리를 입력해 주세요.'); return; }
    setBusy(true);
    const { ok, data } = await post('verify', { code });
    if (ok) { router.refresh(); return; }
    setBusy(false);
    if (data.error === 'mismatch') {
      setMessage(typeof data.remaining === 'number' && data.remaining > 0
        ? `인증번호가 맞지 않아요. ${data.remaining}번 더 시도할 수 있어요.`
        : '인증번호가 맞지 않아요.');
      return;
    }
    setMessage(ERRORS[data.error ?? ''] ?? '잠시 후 다시 시도해 주세요.');
  }

  return (
    <section className="wbr-card wbr-gate">
      <h1>{coupleName} 님의 축의 기록</h1>
      <p className="wbr-gate__lead">
        하객 개인정보 보호를 위해 예약하신 휴대폰 번호({phoneMasked})로 본인 확인을 해 주세요.
      </p>
      {!sent ? (
        <button type="button" className="wbr-btn wbr-btn--primary wbr-btn--block" onClick={sendCode} disabled={busy}>
          {busy ? '보내는 중…' : '인증번호 받기'}
        </button>
      ) : (
        <form className="wbr-gate__form" onSubmit={verify}>
          <label className="sr-only" htmlFor="wbr-otp">인증번호 6자리</label>
          <input
            id="wbr-otp"
            className="wbr-gate__input"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            placeholder="인증번호 6자리"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
          />
          <button type="submit" className="wbr-btn wbr-btn--primary" disabled={busy}>확인</button>
          <button type="button" className="wbr-btn" onClick={sendCode} disabled={busy}>다시 받기</button>
        </form>
      )}
      {message && <p className="wbr-gate__msg" role="status">{message}</p>}
    </section>
  );
}
