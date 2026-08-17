'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Renders the right-hand side of the navbar. Fetches the current session
// itself so it can be dropped into any page without prop drilling.
// Logged out -> "ورود" / "ثبت‌نام" links (unchanged behavior).
// Logged in  -> avatar + phone trigger that opens a dropdown with links to
//               the dashboard, the user's own public profile, the admin
//               panel (if applicable), and a logout action.
export default function UserMenu() {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = loading
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    fetch('/api/me')
      .then((res) => res.json())
      .then((data) => setUser(data.user))
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    setOpen(false);
    router.push('/');
    router.refresh();
  }

  // Still loading: render nothing to avoid a flash of the wrong state.
  if (user === undefined) {
    return <div style={{ width: 120 }} />;
  }

  if (!user) {
    return (
      <div className="nav-links">
        <Link href="/login" className="btn btn-ghost btn-sm">ورود</Link>
        <Link href="/register" className="btn btn-primary btn-sm">ثبت‌نام</Link>
      </div>
    );
  }

  const initial = (user.role === 'JOBSEEKER'
    ? user.seekerProfile?.name
    : user.jobs?.[0]?.biz) || user.phone;
  const avatarLetter = initial.trim().charAt(0) || '؟';

  const profileHref = user.role === 'JOBSEEKER'
    ? (user.seekerProfile ? `/seekers/${user.seekerProfile.id}` : null)
    : `/employers/${user.id}`;

  const displayName = user.role === 'JOBSEEKER'
    ? (user.seekerProfile?.name || 'کارجو')
    : (user.jobs?.[0]?.biz || 'کارفرما');

  return (
    <div className="user-menu-wrap" ref={wrapRef}>
      <button
        className={`user-menu-trigger ${open ? 'open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="true"
      >
        <span className="chevron">▾</span>
        <span className="phone mono">{user.phone}</span>
        <span className="user-avatar">{avatarLetter}</span>
      </button>

      {open && (
        <div className="dropdown open">
          <div className="dropdown-header">
            <div className="name">
              {displayName}
              {user.isAdmin && <span className="admin-badge">ادمین</span>}
            </div>
            <div className="role">{user.role === 'JOBSEEKER' ? 'حساب کارجو' : 'حساب کارفرما'}</div>
          </div>

          <Link href="/dashboard" className="dropdown-item" onClick={() => setOpen(false)}>
            <span className="icon">◧</span> داشبورد
          </Link>

          {profileHref ? (
            <Link href={profileHref} className="dropdown-item" onClick={() => setOpen(false)}>
              <span className="icon">◎</span> مشاهده پروفایل من
            </Link>
          ) : (
            <div className="dropdown-item" style={{ color: 'var(--muted-dim)', cursor: 'default' }}>
              <span className="icon">◎</span> ابتدا پروفایل بسازید
            </div>
          )}

          {user.isAdmin && (
            <Link href="/admin" className="dropdown-item" onClick={() => setOpen(false)}>
              <span className="icon">⚙</span> پنل مدیریت
            </Link>
          )}

          <div className="dropdown-divider" />

          <button className="dropdown-item danger" onClick={handleLogout}>
            <span className="icon">⏻</span> خروج از حساب
          </button>
        </div>
      )}
    </div>
  );
}
