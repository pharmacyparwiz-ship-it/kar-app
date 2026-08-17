import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '../../../lib/prisma';
import UserMenu from '../../../components/UserMenu';

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export const dynamic = 'force-dynamic';

export default async function EmployerProfilePage({ params }) {
  const employer = await prisma.user.findUnique({
    where: { id: params.id },
    include: { jobs: { orderBy: { createdAt: 'desc' } } },
  });

  if (!employer || employer.role !== 'EMPLOYER') notFound();

  const businessName = employer.jobs[0]?.biz || employer.phone;
  const city = employer.jobs[0]?.city || null;

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
            <h1 style={{ fontSize: 26 }}>{businessName}</h1>
            <span className="job-tag">کارفرما</span>
          </div>
          <div className="dash-phone mono" style={{ marginBottom: 24 }}>
            {city ? `${city} · ` : ''}{toFa(employer.jobs.length)} آگهی ثبت‌شده
          </div>

          <div style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
            <div style={{ fontSize: 12.5, color: 'var(--muted-dim)', marginBottom: 6 }}>تماس</div>
            <div className="mono" style={{ fontSize: 15, color: 'var(--copper-bright)' }}>{employer.phone}</div>
          </div>
        </div>

        <div className="section-head" style={{ marginBottom: 20, borderBottom: 'none' }}>
          <h2 style={{ fontSize: 18 }}>آگهی‌های این کارفرما</h2>
        </div>
        {employer.jobs.length === 0 && (
          <div className="empty-state">هنوز آگهی‌ای ثبت نشده است.</div>
        )}
        {employer.jobs.map((job) => (
          <div className="dash-item" key={job.id} style={{ cursor: 'default' }}>
            <div className="dash-item-main">
              <div className="dash-item-title">
                {job.title}
                {job.urgent && <span className="job-tag urgent" style={{ marginRight: 8 }}>فوری</span>}
              </div>
              <div className="dash-item-meta">{job.city} · {job.pay}</div>
            </div>
          </div>
        ))}
      </div>

      <footer>ساخته‌شده برای بازار کار افغانستان</footer>
    </>
  );
}
