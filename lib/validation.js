// Shared input validation schemas using zod.
// Keeping these centralized avoids duplicating validation logic between
// the API routes and any future admin tooling.

const { z } = require('zod');

const phoneSchema = z
  .string()
  .trim()
  .regex(/^0[0-9]{9}$/, 'شماره تماس باید ۱۰ رقم و با صفر شروع شود (مثلاً 0700000000)');

const registerSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(6, 'رمز عبور باید حداقل ۶ کاراکتر باشد'),
  role: z.enum(['JOBSEEKER', 'EMPLOYER']),
});

const loginSchema = z.object({
  phone: phoneSchema,
  password: z.string().min(1, 'رمز عبور الزامی است'),
});

const seekerProfileSchema = z.object({
  name: z.string().trim().min(2, 'نام باید حداقل ۲ حرف باشد'),
  city: z.string().trim().min(2, 'شهر الزامی است'),
  skill: z.string().trim().min(2, 'مهارت الزامی است'),
  desc: z.string().trim().max(1000).optional().default(''),
  yearsExperience: z.coerce.number().int().min(0, 'سال‌های تجربه نمی‌تواند منفی باشد').max(60).optional().default(0),
});

const workExperienceSchema = z.object({
  company: z.string().trim().min(1, 'نام شرکت/کارفرما الزامی است'),
  jobTitle: z.string().trim().min(1, 'عنوان شغلی الزامی است'),
  duration: z.string().trim().min(1, 'مدت زمان الزامی است'),
});

const projectSchema = z.object({
  title: z.string().trim().min(1, 'عنوان پروژه الزامی است'),
  description: z.string().trim().min(1, 'توضیح پروژه الزامی است'),
  link: z.string().trim().url('لینک نامعتبر است').optional().or(z.literal('')),
  imageUrl: z.string().trim().optional().or(z.literal('')),
});

const jobSchema = z.object({
  title: z.string().trim().min(2, 'عنوان کار الزامی است'),
  biz: z.string().trim().min(2, 'نام کسب‌وکار الزامی است'),
  city: z.string().trim().min(2, 'شهر الزامی است'),
  category: z.string().trim().min(2, 'دسته‌بندی الزامی است'),
  pay: z.string().trim().min(1, 'معاش پیشنهادی الزامی است'),
  desc: z.string().trim().min(2, 'شرح کار الزامی است'),
  phone: phoneSchema,
  urgent: z.boolean().optional().default(false),
});

module.exports = {
  phoneSchema,
  registerSchema,
  loginSchema,
  seekerProfileSchema,
  workExperienceSchema,
  projectSchema,
  jobSchema,
};
