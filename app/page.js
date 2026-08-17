import Link from 'next/link';
import { prisma } from '../lib/prisma';
import JobSearch from '../components/JobSearch';
import SeekerDirectory from '../components/SeekerDirectory';
import UserMenu from '../components/UserMenu';

const toFa = (n) => {
  const fa = ['۰','۱','۲','۳','۴','۵','۶','۷','۸','۹'];
  return String(n).split('').map((d) => fa[d] ?? d).join('');
};

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [jobs, jobCount, cityRows] = await Promise.all([
    prisma.job.findMany({ orderBy: { createdAt: 'desc' }, take: 3 }),
    prisma.job.count(),
    prisma.job.findMany({ select: { city: true }, distinct: ['city'] }),
  ]);

  return (
    <>
      <header>
        <div className="nav">
          <Link href="/" className="logo"><span className="dot" /> کار</Link>
          <UserMenu />
        </div>
      </header>

      <main>
        <section className="hero">
          <div>
            <div className="eyebrow">بدون واسطه، بدون کمیشن</div>
            <h1>کار پیدا کردن<br />نباید <span>وابسته به آشنا</span> باشد</h1>
            <p className="hero-sub">
              کارجو و کارفرما را مستقیم به هم وصل می‌کنیم — از نانوایی محل تا دفتر برنامه‌نویسی.
              جستجو کنید، تماس بگیرید، کار کنید.
            </p>
            <div className="hero-cta">
              <Link href="#listings" className="btn btn-primary">دیدن آگهی‌ها</Link>
              <Link href="/register" className="btn btn-outline">ثبت آگهی کار</Link>
            </div>
            <div className="stats-row">
              <div className="stat"><b className="mono">{toFa(jobCount)}</b><span>آگهی فعال</span></div>
              <div className="stat"><b className="mono">{toFa(cityRows.length)}</b><span>شهر</span></div>
              <div className="stat"><b className="mono">۰٪</b><span>کمیشن</span></div>
            </div>
          </div>
          <div className="board">
            <div className="board-head"><span>تازه‌ترین آگهی‌ها</span></div>
            {jobs.map((job) => (
              <div className="pin-note" key={job.id}>
                <div className="pin-title">{job.title} — {job.city}</div>
                <div className="pin-meta">
                  <span>{job.biz}</span>
                  <span>{job.category}</span>
                </div>
                <span className="pin-price mono">{job.pay}</span>
              </div>
            ))}
            {jobs.length === 0 && (
              <div className="pin-note"><div className="pin-title">هنوز آگهی‌ای ثبت نشده</div></div>
            )}
          </div>
        </section>

        <div id="listings">
          <JobSearch />
        </div>

        <SeekerDirectory />

        <section>
          <div className="section-head"><h2>چطور کار می‌کند</h2></div>
          <div className="how-grid">
            <div className="how-card">
              <div className="how-num mono">۰۱</div>
              <h3>حساب بسازید</h3>
              <p>به عنوان کارجو یا کارفرما ثبت‌نام کنید — در کمتر از دو دقیقه.</p>
            </div>
            <div className="how-card">
              <div className="how-num mono">۰۲</div>
              <h3>جستجو یا آگهی بگذارید</h3>
              <p>کارجوها آگهی‌های نزدیک خودشون رو می‌بینن، کارفرماها مستقیم کارجو پیدا می‌کنن.</p>
            </div>
            <div className="how-card">
              <div className="how-num mono">۰۳</div>
              <h3>مستقیم تماس بگیرید</h3>
              <p>هیچ واسطه یا کمیشنی نیست. شماره تماس مستقیم در اختیارتون قرار می‌گیره.</p>
            </div>
          </div>
        </section>
      </main>

      <div className="post-section">
        <div className="post-inner">
          <h2>کارفرما هستید؟</h2>
          <p>ثبت آگهی رایگانه و کمتر از دو دقیقه وقت می‌گیره.</p>
          <Link href="/register" className="btn btn-primary">همین حالا حساب بسازید</Link>
        </div>
      </div>

      <footer>ساخته‌شده برای بازار کار افغانستان</footer>
    </>
  );
}
