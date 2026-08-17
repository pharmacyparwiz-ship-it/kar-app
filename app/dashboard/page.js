'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

const CITIES = ['کابل', 'هرات', 'مزار شریف', 'قندهار', 'ننگرهار', 'بلخ', 'بدخشان'];
const CATEGORIES = ['خدماتی', 'فنی و صنعتی', 'فروش و بازاریابی', 'تکنالوژی', 'آموزشی'];

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(undefined); // undefined = loading, null = logged out
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // seeker form state
  const [sName, setSName] = useState('');
  const [sCity, setSCity] = useState(CITIES[0]);
  const [sSkill, setSSkill] = useState('');
  const [sDesc, setSDesc] = useState('');
  const [sYears, setSYears] = useState(0);

  // work experience form state
  const [expCompany, setExpCompany] = useState('');
  const [expTitle, setExpTitle] = useState('');
  const [expDuration, setExpDuration] = useState('');

  // project form state
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projLink, setProjLink] = useState('');
  const [projImageFile, setProjImageFile] = useState(null);
  const [projUploading, setProjUploading] = useState(false);

  // employer form state
  const [eTitle, setETitle] = useState('');
  const [eBiz, setEBiz] = useState('');
  const [eCity, setECity] = useState('');
  const [eCategory, setECategory] = useState(CATEGORIES[0]);
  const [ePay, setEPay] = useState('');
  const [ePhone, setEPhone] = useState('');
  const [eDesc, setEDesc] = useState('');
  const [eUrgent, setEUrgent] = useState(false);

  async function loadMe() {
    const res = await fetch('/api/me');
    const data = await res.json();
    setUser(data.user);
    if (data.user?.seekerProfile) {
      setSName(data.user.seekerProfile.name);
      setSCity(data.user.seekerProfile.city);
      setSSkill(data.user.seekerProfile.skill);
      setSDesc(data.user.seekerProfile.desc || '');
      setSYears(data.user.seekerProfile.yearsExperience || 0);
    }
  }

  useEffect(() => {
    loadMe();
  }, []);

  useEffect(() => {
    if (user === null) router.push('/login');
  }, [user, router]);

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  }

  async function submitSeeker(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/seekers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: sName, city: sCity, skill: sSkill, desc: sDesc, yearsExperience: sYears }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'خطایی رخ داد'); return; }
    setSuccess('پروفایل شما ذخیره شد.');
    loadMe();
  }

  async function submitExperience(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/me/experience', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company: expCompany, jobTitle: expTitle, duration: expDuration }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'خطایی رخ داد'); return; }
    setExpCompany(''); setExpTitle(''); setExpDuration('');
    setSuccess('سابقه کاری اضافه شد.');
    loadMe();
  }

  async function deleteExperience(id) {
    if (!confirm('این سابقه کاری حذف شود؟')) return;
    await fetch(`/api/me/experience/${id}`, { method: 'DELETE' });
    loadMe();
  }

  async function submitProject(e) {
    e.preventDefault();
    setError(''); setSuccess('');

    let imageUrl = '';
    if (projImageFile) {
      setProjUploading(true);
      const formData = new FormData();
      formData.append('file', projImageFile);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      const uploadData = await uploadRes.json();
      setProjUploading(false);
      if (!uploadRes.ok) { setError(uploadData.error || 'آپلود عکس ناموفق بود'); return; }
      imageUrl = uploadData.url;
    }

    const res = await fetch('/api/me/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: projTitle, description: projDesc, link: projLink, imageUrl }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'خطایی رخ داد'); return; }
    setProjTitle(''); setProjDesc(''); setProjLink(''); setProjImageFile(null);
    setSuccess('پروژه اضافه شد.');
    loadMe();
  }

  async function deleteProject(id) {
    if (!confirm('این پروژه حذف شود؟')) return;
    await fetch(`/api/me/projects/${id}`, { method: 'DELETE' });
    loadMe();
  }

  async function submitJob(e) {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: eTitle, biz: eBiz, city: eCity, category: eCategory,
        pay: ePay || 'توافقی', phone: ePhone, desc: eDesc, urgent: eUrgent,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error || 'خطایی رخ داد'); return; }
    setSuccess('آگهی شما ثبت شد.');
    setETitle(''); setEBiz(''); setECity(''); setEPay(''); setEPhone(''); setEDesc(''); setEUrgent(false);
    loadMe();
  }

  async function deleteJob(id) {
    if (!confirm('این آگهی حذف شود؟')) return;
    await fetch(`/api/jobs/${id}`, { method: 'DELETE' });
    loadMe();
  }

  if (user === undefined) {
    return (
      <div className="dash-wrap"><p style={{ color: 'var(--muted-dim)' }}>در حال بارگذاری...</p></div>
    );
  }
  if (!user) return null;

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="logo"><span className="dot" /> کار</Link>
          <div className="nav-links">
            {user.isAdmin && (
              <Link href="/admin" className="btn btn-outline btn-sm">پنل مدیریت</Link>
            )}
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>خروج</button>
          </div>
        </div>
      </header>

      <div className="dash-wrap">
        <div className="dash-head"><h1>داشبورد</h1></div>
        <div className="dash-phone mono">
          {user.phone} — {user.role === 'JOBSEEKER' ? 'حساب کارجو' : 'حساب کارفرما'}
        </div>

        {error && <div className="form-error">{error}</div>}
        {success && <div className="form-success">{success}</div>}

        {user.role === 'JOBSEEKER' ? (
          <>
            <div className="auth-card" style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 18, marginBottom: 4 }}>پروفایل کارجو</h1>
              <p className="auth-sub">این اطلاعات به کارفرماها نمایش داده می‌شود</p>
              <form onSubmit={submitSeeker}>
                <div className="field">
                  <label>نام کامل</label>
                  <input value={sName} onChange={(e) => setSName(e.target.value)} placeholder="مثلاً: احمد رضایی" required />
                </div>
                <div className="field">
                  <label>شهر</label>
                  <select value={sCity} onChange={(e) => setSCity(e.target.value)}>
                    {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>مهارت / حرفه</label>
                  <input value={sSkill} onChange={(e) => setSSkill(e.target.value)} placeholder="مثلاً: خیاطی، برنامه‌نویسی" required />
                </div>
                <div className="field">
                  <label>سال‌های تجربه</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    className="mono"
                    value={sYears}
                    onChange={(e) => setSYears(e.target.value)}
                    placeholder="مثلاً: 3"
                  />
                </div>
                <div className="field">
                  <label>توضیح کوتاه</label>
                  <textarea value={sDesc} onChange={(e) => setSDesc(e.target.value)} placeholder="تجربه و توانایی‌های خود را بنویسید..." />
                </div>
                <button type="submit" className="btn btn-primary btn-full">ذخیره پروفایل</button>
              </form>
            </div>

            {user.seekerProfile && (
              <>
                <div className="auth-card" style={{ marginBottom: 40 }}>
                  <h1 style={{ fontSize: 18, marginBottom: 4 }}>افزودن سابقه کاری</h1>
                  <p className="auth-sub">شرکت‌ها یا کارفرماهای قبلی که برایشان کار کرده‌اید</p>
                  <form onSubmit={submitExperience}>
                    <div className="field">
                      <label>نام شرکت / کارفرما</label>
                      <input value={expCompany} onChange={(e) => setExpCompany(e.target.value)} placeholder="مثلاً: استودیو دیجیتال آریانا" required />
                    </div>
                    <div className="field">
                      <label>عنوان شغلی</label>
                      <input value={expTitle} onChange={(e) => setExpTitle(e.target.value)} placeholder="مثلاً: فرانت‌اند دولوپر" required />
                    </div>
                    <div className="field">
                      <label>مدت زمان</label>
                      <input value={expDuration} onChange={(e) => setExpDuration(e.target.value)} placeholder="مثلاً: ۲۰۲۳ تا ۲۰۲۵ (۲ سال)" required />
                    </div>
                    <button type="submit" className="btn btn-outline btn-full">افزودن سابقه</button>
                  </form>
                </div>

                {user.seekerProfile.experience && user.seekerProfile.experience.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <div className="section-head" style={{ marginBottom: 16, borderBottom: 'none' }}>
                      <h2 style={{ fontSize: 16 }}>سوابق ثبت‌شده</h2>
                    </div>
                    {user.seekerProfile.experience.map((exp) => (
                      <div className="dash-item" key={exp.id}>
                        <div className="dash-item-main">
                          <div className="dash-item-title">{exp.jobTitle} — {exp.company}</div>
                          <div className="dash-item-meta">{exp.duration}</div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteExperience(exp.id)}>حذف</button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="auth-card" style={{ marginBottom: 40 }}>
                  <h1 style={{ fontSize: 18, marginBottom: 4 }}>افزودن پروژه / نمونه‌کار</h1>
                  <p className="auth-sub">پروژه‌هایی که قبلاً انجام داده‌اید را نشان دهید</p>
                  <form onSubmit={submitProject}>
                    <div className="field">
                      <label>عنوان پروژه</label>
                      <input value={projTitle} onChange={(e) => setProjTitle(e.target.value)} placeholder="مثلاً: طراحی سایت فروشگاهی" required />
                    </div>
                    <div className="field">
                      <label>توضیح پروژه</label>
                      <textarea value={projDesc} onChange={(e) => setProjDesc(e.target.value)} placeholder="این پروژه چه بود و چه کاری انجام دادید..." required />
                    </div>
                    <div className="field">
                      <label>لینک نمونه‌کار (اختیاری)</label>
                      <input value={projLink} onChange={(e) => setProjLink(e.target.value)} placeholder="https://..." />
                    </div>
                    <div className="field">
                      <label>عکس نمونه‌کار (اختیاری)</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProjImageFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <button type="submit" className="btn btn-outline btn-full" disabled={projUploading}>
                      {projUploading ? 'در حال آپلود عکس...' : 'افزودن پروژه'}
                    </button>
                  </form>
                </div>

                {user.seekerProfile.projects && user.seekerProfile.projects.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <div className="section-head" style={{ marginBottom: 16, borderBottom: 'none' }}>
                      <h2 style={{ fontSize: 16 }}>پروژه‌های ثبت‌شده</h2>
                    </div>
                    {user.seekerProfile.projects.map((proj) => (
                      <div className="dash-item" key={proj.id}>
                        <div className="dash-item-main">
                          <div className="dash-item-title">{proj.title}</div>
                          <div className="dash-item-meta">{proj.description}</div>
                        </div>
                        <button className="btn btn-danger btn-sm" onClick={() => deleteProject(proj.id)}>حذف</button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ textAlign: 'center', marginBottom: 40 }}>
                  <Link href={`/seekers/${user.seekerProfile.id}`} className="btn btn-outline">
                    مشاهده پروفایل عمومی من
                  </Link>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="auth-card" style={{ marginBottom: 40 }}>
              <h1 style={{ fontSize: 18, marginBottom: 4 }}>ثبت آگهی جدید</h1>
              <p className="auth-sub">آگهی بلافاصله در صفحه اصلی نمایش داده می‌شود</p>
              <form onSubmit={submitJob}>
                <div className="field">
                  <label>عنوان کار</label>
                  <input value={eTitle} onChange={(e) => setETitle(e.target.value)} placeholder="مثلاً: شاگرد نانوایی" required />
                </div>
                <div className="field">
                  <label>نام کسب‌وکار</label>
                  <input value={eBiz} onChange={(e) => setEBiz(e.target.value)} placeholder="مثلاً: نانوایی برادران" required />
                </div>
                <div className="field">
                  <label>شهر / منطقه</label>
                  <input value={eCity} onChange={(e) => setECity(e.target.value)} placeholder="مثلاً: کابل، کارته سه" required />
                </div>
                <div className="field">
                  <label>دسته‌بندی</label>
                  <select value={eCategory} onChange={(e) => setECategory(e.target.value)}>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="field">
                  <label>معاش پیشنهادی</label>
                  <input value={ePay} onChange={(e) => setEPay(e.target.value)} placeholder="مثلاً: ۶٬۰۰۰ افغانی/ماه یا توافقی" />
                </div>
                <div className="field">
                  <label>شماره تماس</label>
                  <input className="mono" value={ePhone} onChange={(e) => setEPhone(e.target.value)} placeholder="07XXXXXXXX" required />
                </div>
                <div className="field">
                  <label>شرح کار</label>
                  <textarea value={eDesc} onChange={(e) => setEDesc(e.target.value)} placeholder="وظایف و شرایط لازم..." required />
                </div>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, fontSize: 13.5, color: 'var(--muted)' }}>
                  <input type="checkbox" checked={eUrgent} onChange={(e) => setEUrgent(e.target.checked)} style={{ width: 'auto' }} />
                  فوری (اولویت نمایش)
                </label>
                <button type="submit" className="btn btn-primary btn-full">ثبت آگهی</button>
              </form>
            </div>

            <div className="section-head" style={{ marginBottom: 20, borderBottom: 'none' }}>
              <h2 style={{ fontSize: 18 }}>آگهی‌های من</h2>
            </div>
            {(!user.jobs || user.jobs.length === 0) && (
              <div className="empty-state">هنوز آگهی‌ای ثبت نکرده‌اید.</div>
            )}
            {user.jobs && user.jobs.map((job) => (
              <div className="dash-item" key={job.id}>
                <div className="dash-item-main">
                  <div className="dash-item-title">{job.title}</div>
                  <div className="dash-item-meta">{job.city} · {job.pay}</div>
                </div>
                <button className="btn btn-danger btn-sm" onClick={() => deleteJob(job.id)}>حذف</button>
              </div>
            ))}
          </>
        )}
      </div>
    </>
  );
}
