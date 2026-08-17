'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState('JOBSEEKER');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password, role }),
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
          <h1>ساخت حساب</h1>
          <p className="auth-sub">در کمتر از دو دقیقه ثبت‌نام کنید</p>

          <div className="role-toggle">
            <button type="button" className={`role-btn ${role === 'JOBSEEKER' ? 'active' : ''}`} onClick={() => setRole('JOBSEEKER')}>کارجو هستم</button>
            <button type="button" className={`role-btn ${role === 'EMPLOYER' ? 'active' : ''}`} onClick={() => setRole('EMPLOYER')}>کارفرما هستم</button>
          </div>

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
                placeholder="حداقل ۶ کاراکتر"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? '...' : 'ساخت حساب'}
            </button>
          </form>

          <div className="auth-switch">
            حساب دارید؟ <Link href="/login">وارد شوید</Link>
          </div>
        </div>
      </div>
    </>
  );
}
