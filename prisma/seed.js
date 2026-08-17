// Seeds the database with a demo employer account and sample job listings
// so the marketplace isn't empty on first run.
// Run with: npm run db:seed

const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const SEED_JOBS = [
  { title: "شاگرد نانوایی", biz: "نانوایی برادران", city: "کابل", category: "خدماتی", pay: "۶٬۰۰۰ افغانی/ماه", desc: "کار در صبح، آموزش داده می‌شود، جای غذا موجود است.", urgent: true, phone: "0700000001" },
  { title: "خیاط ماهر لباس زنانه", biz: "خیاطی نوری", city: "هرات", category: "فنی و صنعتی", pay: "توافقی", desc: "حداقل ۲ سال تجربه، کار تمام‌وقت.", urgent: false, phone: "0700000002" },
  { title: "فرانت‌اند دولوپر (دورکار)", biz: "استودیو دیجیتال آریانا", city: "کابل", category: "تکنالوژی", pay: "۲۵٬۰۰۰ افغانی/پروژه", desc: "آشنایی با React و Tailwind، همکاری پروژه‌ای.", urgent: true, phone: "0700000003" },
  { title: "راننده تکسی شخصی", biz: "خانواده رحیمی", city: "مزار شریف", category: "خدماتی", pay: "۸٬۰۰۰ افغانی/ماه", desc: "دارای جواز رانندگی معتبر، آشنا به مسیرهای شهر.", urgent: false, phone: "0700000004" },
  { title: "معلم ریاضی صنف ۹ تا ۱۲", biz: "لیسه خصوصی نور", city: "قندهار", category: "آموزشی", pay: "۱۲٬۰۰۰ افغانی/ماه", desc: "مدرک لیسانس ریاضی یا انجینری، تجربه تدریس ترجیح دارد.", urgent: false, phone: "0700000005" },
  { title: "بازاریاب فروش موبایل", biz: "موبایل سنتر افغان", city: "ننگرهار", category: "فروش و بازاریابی", pay: "۷٬۵۰۰ افغانی/ماه + کمیشن", desc: "روابط عمومی خوب، آشنایی با موبایل‌های اندروید.", urgent: false, phone: "0700000006" },
  { title: "نجار مبل‌ساز", biz: "کارگاه چوب سلطانی", city: "بلخ", category: "فنی و صنعتی", pay: "۹٬۰۰۰ افغانی/ماه", desc: "تجربه در ساخت مبل چوبی، کار در کارگاه.", urgent: false, phone: "0700000007" },
  { title: "ادیتور ویدیو (پاره‌وقت)", biz: "کانال یوتیوب محلی", city: "کابل", category: "تکنالوژی", pay: "۵٬۰۰۰ افغانی/ماه", desc: "آشنایی با Premiere یا CapCut، ۲ ویدیو در هفته.", urgent: true, phone: "0700000008" },
  { title: "کارگر ساختمانی", biz: "شرکت ساختمانی وحدت", city: "بدخشان", category: "فنی و صنعتی", pay: "۵۰۰ افغانی/روز", desc: "کار روزمزد، شروع فوری.", urgent: true, phone: "0700000009" },
];

async function main() {
  const existingCount = await prisma.job.count();
  if (existingCount > 0) {
    console.log(`Database already has ${existingCount} jobs — skipping seed.`);
    return;
  }

  const passwordHash = await bcrypt.hash('demo1234', 10);
  const demoEmployer = await prisma.user.create({
    data: {
      phone: '0700000000',
      passwordHash,
      role: 'EMPLOYER',
    },
  });

  for (const job of SEED_JOBS) {
    await prisma.job.create({
      data: { ...job, employerId: demoEmployer.id },
    });
  }

  console.log(`Seeded ${SEED_JOBS.length} jobs under demo employer (phone: 0700000000, password: demo1234).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
