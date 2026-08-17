'use client';

import { useEffect, useState, useCallback } from 'react';

const CITIES = ['کابل', 'هرات', 'مزار شریف', 'قندهار', 'ننگرهار', 'بلخ', 'بدخشان'];
const CATEGORIES = ['خدماتی', 'فنی و صنعتی', 'فروش و بازاریابی', 'تکنالوژی', 'آموزشی'];

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export default function JobSearch() {
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [category, setCategory] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (category) params.set('category', category);
    try {
      const res = await fetch(`/api/jobs?${params.toString()}`);
      const data = await res.json();
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [q, city, category]);

  useEffect(() => {
    const timer = setTimeout(fetchJobs, 250);
    return () => clearTimeout(timer);
  }, [fetchJobs]);

  return (
    <>
      <div className="search-bar">
        <div className="search-box">
          <input
            type="text"
            placeholder="جستجو: مثلاً «خیاط»، «برنامه‌نویس»، «راننده»..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <div className="divider-v" />
          <select value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">همه شهرها</option>
            {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <div className="divider-v" />
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="">همه بخش‌ها</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <section>
        <div className="section-head">
          <h2>آگهی‌های اخیر</h2>
          <span className="count mono">{loading ? '...' : `${toFa(jobs.length)} نتیجه`}</span>
        </div>

        {!loading && jobs.length === 0 && (
          <div className="empty-state">هیچ آگهی‌ای با این جستجو پیدا نشد. فیلترها را تغییر دهید.</div>
        )}

        <div className="listings-grid">
          {jobs.map((job) => (
            <div className="job-card" key={job.id} onClick={() => setSelected(job)}>
              <div className="job-top">
                <span className={`job-tag ${job.urgent ? 'urgent' : ''}`}>
                  {job.urgent ? 'فوری' : job.category}
                </span>
              </div>
              <div className="job-title">{job.title}</div>
              <div className="job-desc">{job.desc}</div>
              <div className="job-foot">
                <span className="job-loc">{job.city}</span>
                <span className="job-price mono">{job.pay}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {selected && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setSelected(null)}>
          <div className="modal">
            <h3>{selected.title}</h3>
            <div className="modal-sub">{selected.biz} — {selected.city}</div>
            <p style={{ fontSize: 14, color: 'var(--muted)', marginBottom: 16 }}>{selected.desc}</p>
            <p className="mono" style={{ fontSize: 14, marginBottom: 4 }}>معاش: {selected.pay}</p>
            <p className="mono" style={{ fontSize: 14 }}>تماس: {selected.phone}</p>
            <div className="modal-actions">
              <button className="btn btn-outline btn-full" onClick={() => setSelected(null)}>بستن</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
