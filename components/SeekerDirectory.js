'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export default function SeekerDirectory() {
  const [seekers, setSeekers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/seekers')
      .then((res) => res.json())
      .then((data) => setSeekers(data.seekers || []))
      .catch(() => setSeekers([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading || seekers.length === 0) return null;

  return (
    <section style={{ borderTop: '1px solid var(--line)' }}>
      <div className="section-head">
        <h2>کارجویان ثبت‌شده</h2>
        <span className="count mono">{toFa(seekers.length)} نفر</span>
      </div>
      <div className="listings-grid">
        {seekers.map((s) => (
          <Link href={`/seekers/${s.id}`} key={s.id} className="job-card" style={{ display: 'block', textDecoration: 'none', color: 'inherit' }}>
            <div className="job-top">
              <span className="job-tag">{s.skill}</span>
            </div>
            <div className="job-title">{s.name}</div>
            <div className="job-desc">
              {toFa(s.yearsExperience || 0)} سال تجربه
              {s.projects && s.projects.length > 0 ? ` · ${toFa(s.projects.length)} پروژه نمونه` : ''}
            </div>
            <div className="job-foot">
              <span className="job-loc">{s.city}</span>
              <span className="job-price mono">مشاهده پروفایل ←</span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
