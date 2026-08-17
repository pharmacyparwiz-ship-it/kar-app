import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import UserMenu from '../../../components/UserMenu';

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export const dynamic = 'force-dynamic';

export default async function SeekerProfilePage({ params }) {
  const profile = await prisma.seekerProfile.findUnique({
    where: { id: params.id },
    include: {
      user: { select: { phone: true } },
      experience: { orderBy: { order: 'asc' } },
      projects: { orderBy: { order: 'asc' } },
    },
  });

  if (!profile) notFound();

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="logo"><span className="dot" /> کار</Link>
          <div className="nav-links">
            <Link href="/#listings" className="btn btn-ghost btn-sm">بازگشت به آگهی‌ها</Link>
            <UserMenu />
          </div>
        </div>
      </header>

      <div className="dash-wrap">
        <div className="auth-card" style={{ marginBottom: 32 }}>
          <div className="dash-head" style={{ marginBottom: 4 }}>
            <h1 style={{ fontSize: 26 }}>{profile.name}</h1>
            <span className="job-tag">{profile.skill}</span>
          </div>
          <div className="dash-phone mono" style={{ marginBottom: 24 }}>
            {profile.city} · {toFa(profile.yearsExperience)} سال تجربه
          </div>

          {profile.desc && (
            <p style={{ fontSize: 14.5, color: 'var(--muted)', marginBottom: 20, lineHeight: 1.8 }}>
              {profile.desc}
            </p>
          )}

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <div style={{ fontSize: 12.5, color: 'var(--muted-dim)', marginBottom: 6 }}>تماس</div>
            <div className="mono" style={{ fontSize: 15, color: 'var(--copper-bright)' }}>{profile.phone}</div>
          </div>
        </div>

        <div className="section-head" style={{ marginBottom: 20, borderBottom: 'none' }}>
          <h2 style={{ fontSize: 18 }}>سوابق کاری</h2>
        </div>
        {profile.experience.length === 0 && (
          <div className="empty-state" style={{ marginBottom: 40 }}>سابقه کاری ثبت نشده است.</div>
        )}
        {profile.experience.map((exp) => (
          <div className="dash-item" key={exp.id} style={{ cursor: 'default' }}>
            <div className="dash-item-main">
              <div className="dash-item-title">{exp.jobTitle} — {exp.company}</div>
              <div className="dash-item-meta">{exp.duration}</div>
            </div>
          </div>
        ))}

        <div className="section-head" style={{ marginTop: 40, marginBottom: 20, borderBottom: 'none' }}>
          <h2 style={{ fontSize: 18 }}>پروژه‌ها و نمونه‌کارها</h2>
        </div>
        {profile.projects.length === 0 && (
          <div className="empty-state">پروژه‌ای ثبت نشده است.</div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {profile.projects.map((proj) => (
            <div key={proj.id} style={{ border: '1px solid var(--line)', overflow: 'hidden' }}>
              {proj.imageUrl && (
                <div style={{ position: 'relative', width: '100%', height: 160, background: 'var(--bg-panel)' }}>
                  <Image src={proj.imageUrl} alt={proj.title} fill style={{ objectFit: 'cover' }} unoptimized />
                </div>
              )}
              <div style={{ padding: 18 }}>
                <div className="dash-item-title" style={{ marginBottom: 8 }}>{proj.title}</div>
                <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 12, lineHeight: 1.7 }}>
                  {proj.description}
                </p>
                {proj.link && (
                  <a
                    href={proj.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontSize: 12.5, color: 'var(--copper-bright)', textDecoration: 'underline' }}
                  >
                    مشاهده لینک پروژه ←
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer>ساخته‌شده برای بازار کار افغانستان</footer>
    </>
  );
}
