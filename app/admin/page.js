'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export default function AdminPage() {
  const router = useRouter();
  const [me, setMe] = useState(undefined); // undefined = loading, null = not logged in
  const [tab, setTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [seekers, setSeekers] = useState([]);
  const [users, setUsers] = useState([]);
  const [error, setError] = useState('');
  const [loadingTab, setLoadingTab] = useState(false);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setMe(data.user));
  }, []);

  useEffect(() => {
    if (me === null) {
      router.push('/login');
      return;
    }
    if (me && !me.isAdmin) {
      router.push('/');
    }
  }, [me, router]);

  async function loadTab(nextTab) {
    setTab(nextTab);
    setError('');
    setLoadingTab(true);
    try {
      if (nextTab === 'stats') {
        const res = await fetch('/api/admin/stats');
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'خطا'); return; }
        setStats(data);
      } else if (nextTab === 'jobs') {
        const res = await fetch('/api/admin/jobs');
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'خطا'); return; }
        setJobs(data.jobs || []);
      } else if (nextTab === 'seekers') {
        const res = await fetch('/api/admin/seekers');
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'خطا'); return; }
        setSeekers(data.seekers || []);
      } else if (nextTab === 'users') {
        const res = await fetch('/api/admin/users');
        const data = await res.json();
        if (!res.ok) { setError(data.error || 'خطا'); return; }
        setUsers(data.users || []);
      }
    } finally {
      setLoadingTab(false);
    }
  }

  useEffect(() => {
    if (me && me.isAdmin) loadTab('stats');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  async function deleteJob(id) {
    if (!confirm('این آگهی برای همیشه حذف شود؟')) return;
    await fetch(`/api/admin/jobs/${id}`, { method: 'DELETE' });
    loadTab('jobs');
  }

  async function deleteSeeker(id) {
    if (!confirm('این پروفایل کارجو برای همیشه حذف شود؟')) return;
    await fetch(`/api/admin/seekers/${id}`, { method: 'DELETE' });
    loadTab('seekers');
  }

  async function deleteUser(id) {
    if (!confirm('این کاربر و همه اطلاعاتش (آگهی‌ها یا پروفایل) برای همیشه حذف شود؟')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    const data = await res.json();
    if (!res.ok) { alert(data.error || 'خطا'); return; }
    loadTab('users');
  }

  async function lockUser(id) {
    if (!confirm('این حساب مسدود شود؟ کاربر دیگر نمی‌تواند وارد شود.')) return;
    await fetch(`/api/admin/users/${id}/lock`, { method: 'POST' });
    loadTab('users');
  }

  async function unlockUser(id) {
    await fetch(`/api/admin/users/${id}/unlock`, { method: 'POST' });
    loadTab('users');
  }

  if (me === undefined || (me && !me.isAdmin)) {
    return <div className="dash-wrap"><p style={{ color: 'var(--muted-dim)' }}>در حال بارگذاری...</p></div>;
  }
  if (!me) return null;

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="logo"><span className="dot" /> کار</Link>
          <span className="job-tag urgent">پنل مدیریت</span>
        </div>
      </header>

      <div className="dash-wrap">
        <div className="dash-head"><h1>پنل مدیریت</h1></div>
        <div className="dash-phone mono" style={{ marginBottom: 24 }}>{me.phone}</div>

        <div className="role-toggle" style={{ marginBottom: 32, maxWidth: 500 }}>
          <button className={`role-btn ${tab === 'stats' ? 'active' : ''}`} onClick={() => loadTab('stats')}>آمار</button>
          <button className={`role-btn ${tab === 'jobs' ? 'active' : ''}`} onClick={() => loadTab('jobs')}>آگهی‌ها</button>
          <button className={`role-btn ${tab === 'seekers' ? 'active' : ''}`} onClick={() => loadTab('seekers')}>کارجویان</button>
          <button className={`role-btn ${tab === 'users' ? 'active' : ''}`} onClick={() => loadTab('users')}>کاربران</button>
        </div>

        {error && <div className="form-error">{error}</div>}
        {loadingTab && <p style={{ color: 'var(--muted-dim)', fontSize: 13.5 }}>در حال بارگذاری...</p>}

        {!loadingTab && tab === 'stats' && stats && (
          <div className="stats-row" style={{ maxWidth: 600, borderTop: 'none' }}>
            <div className="stat"><b className="mono">{toFa(stats.userCount)}</b><span>کاربر</span></div>
            <div className="stat"><b className="mono">{toFa(stats.jobCount)}</b><span>آگهی</span></div>
            <div className="stat"><b className="mono">{toFa(stats.seekerCount)}</b><span>پروفایل کارجو</span></div>
            <div className="stat"><b className="mono">{toFa(stats.lockedCount)}</b><span>حساب مسدود</span></div>
          </div>
        )}

        {!loadingTab && tab === 'jobs' && (
          <>
            {jobs.length === 0 && <div className="empty-state">هیچ آگهی‌ای ثبت نشده.</div>}
            {jobs.map((job) => (
              <div className="dash-item" key={job.id}>
                <div className="dash-item-main">
                  <div className="dash-item-title">{job.title} — {job.biz}</div>
                  <div className="dash-item-meta">
                    {job.city} · {job.pay} · تماس کارفرما: <span className="mono">{job.employer?.phone}</span>
                  </div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteJob(job.id)}>حذف</button>
              </div>
            ))}
          </>
        )}

        {!loadingTab && tab === 'seekers' && (
          <>
            {seekers.length === 0 && <div className="empty-state">هیچ پروفایل کارجویی ثبت نشده.</div>}
            {seekers.map((s) => (
              <div className="dash-item" key={s.id}>
                <div className="dash-item-main">
                  <div className="dash-item-title">{s.name} — {s.skill}</div>
                  <div className="dash-item-meta">
                    {s.city} · تماس: <span className="mono">{s.user?.phone}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <Link href={`/seekers/${s.id}`} className="btn btn-outline btn-sm">مشاهده</Link>
                  <button className="btn btn-danger btn-sm" onClick={() => deleteSeeker(s.id)}>حذف</button>
                </div>
              </div>
            ))}
          </>
        )}

        {!loadingTab && tab === 'users' && (
          <>
            {users.length === 0 && <div className="empty-state">هیچ کاربری ثبت نشده.</div>}
            {users.map((u) => {
              const locked = u.lockedUntil && new Date(u.lockedUntil) > new Date();
              return (
                <div className="dash-item" key={u.id}>
                  <div className="dash-item-main">
                    <div className="dash-item-title mono">
                      {u.phone} {locked && <span className="job-tag urgent" style={{ marginRight: 8 }}>مسدود</span>}
                    </div>
                    <div className="dash-item-meta">
                      {u.role === 'EMPLOYER' ? 'کارفرما' : 'کارجو'} ·{' '}
                      {u.role === 'EMPLOYER' ? `${toFa(u._count?.jobs || 0)} آگهی` : (u.seekerProfile ? 'دارای پروفایل' : 'بدون پروفایل')}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {locked ? (
                      <button className="btn btn-outline btn-sm" onClick={() => unlockUser(u.id)}>رفع مسدودیت</button>
                    ) : (
                      <button className="btn btn-outline btn-sm" onClick={() => lockUser(u.id)}>مسدود کردن</button>
                    )}
                    <button className="btn btn-danger btn-sm" onClick={() => deleteUser(u.id)}>حذف حساب</button>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>
    </>
  );
}
