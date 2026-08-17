'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'خطایی رخ داد');
        return;
      }
      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('اتصال برقرار نشد. دوباره تلاش کنید.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="logo"><span className="dot" /> کار</Link>
        </div>
      </header>
      <div className="auth-wrap">
        <div className="auth-card">
          <h1>ورود به حساب</h1>
          <p className="auth-sub">برای دسترسی به داشبورد وارد شوید</p>

          {error && <div className="form-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>شماره تماس</label>
              <input
                type="tel"
                className="mono"
                placeholder="07XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="field">
              <label>رمز عبور</label>
              <input
                type="password"
                placeholder="رمز عبور"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? '...' : 'ورود'}
            </button>
          </form>

          <div className="auth-switch">
            حساب ندارید؟ <Link href="/register">ثبت‌نام کنید</Link>
          </div>
          <div className="auth-switch" style={{ marginTop: 8, fontSize: 12 }}>
            حساب نمونه: <span className="mono">0700000000</span> / <span className="mono">demo1234</span>
          </div>
        </div>
      </div>
    </>
  );
}
