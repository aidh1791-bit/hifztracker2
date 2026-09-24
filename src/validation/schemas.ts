import { z } from 'zod';

export const HifzRecordSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  day: z.string().min(1),
  attendance: z.enum(['present', 'absent', 'late', 'excused', 'unmarked']).default('present'),
  sabaqAmount: z.string().max(250).default(''),
  sabaqMistakes: z.number().int().min(0).max(500).default(0),
  sabaqPassed: z.boolean().nullable().optional(),
  sabaqParaAmount: z.string().max(250).default(''),
  sabaqParaMistakes: z.number().int().min(0).max(500).default(0),
  sabaqParaPassed: z.boolean().nullable().optional(),
  dawr1Amount: z.string().max(250).default(''),
  dawr1Mistakes: z.number().int().min(0).max(500).default(0),
  dawr1Passed: z.boolean().nullable().optional(),
  dawr2Amount: z.string().max(250).default(''),
  dawr2Mistakes: z.number().int().min(0).max(500).default(0),
  dawr2Passed: z.boolean().nullable().optional(),
  comments: z.string().max(2000).default(''),
});

export const HomeLearningRecordSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  day: z.string().min(1),
  sabaqMins: z.number().int().min(0).max(720).default(0),
  sabaqParaMins: z.number().int().min(0).max(720).default(0),
  dawr1Mins: z.number().int().min(0).max(720).default(0),
  dawr2Mins: z.number().int().min(0).max(720).default(0),
  parentSigned: z.boolean().default(false),
  parentComments: z.string().max(2000).default(''),
});

export const TarbiyahRecordSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be formatted YYYY-MM-DD'),
  day: z.string().min(1),
  fajr: z.string().default('none'),
  dhuhr: z.string().default('none'),
  asr: z.string().default('none'),
  maghrib: z.string().default('none'),
  ishaa: z.string().default('none'),
  dailySadaqah: z.boolean().default(false),
  eesaalThawaab: z.boolean().default(false),
  dailyDuasDhikr: z.boolean().default(false),
  dailyQuranWird: z.boolean().default(false),
  parentSignature: z.boolean().default(false),
});

export const WeeklyEvaluationSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  weekCommencing: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week commencing must be formatted YYYY-MM-DD'),
  overallGrade: z.string().max(100).default('Not yet assessed'),
  performanceScore: z.number().int().min(0).max(100).default(0),
  teacherSigned: z.boolean().default(false),
  parentSigned: z.boolean().default(false),
  signedDate: z.string().nullable().optional(),
  hadithId: z.number().int().min(1).default(1),
});

export const WeeklyEvaluationTeacherSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  weekCommencing: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week commencing must be formatted YYYY-MM-DD'),
  overallGrade: z.string().max(100).default('Not yet assessed'),
  performanceScore: z.number().int().min(0).max(100).default(0),
  teacherSigned: z.boolean().default(false),
  signedDate: z.string().nullable().optional(),
  hadithId: z.number().int().min(1).default(1),
}).strict();

export const WeeklyEvaluationParentSchema = z.object({
  id: z.string().optional(),
  studentId: z.string().min(1, 'Student ID is required'),
  weekCommencing: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Week commencing must be formatted YYYY-MM-DD'),
  parentSigned: z.boolean().default(true),
  signedDate: z.string().nullable().optional(),
}).strict();

// Admin Onboarding Schemas (Phase 6)
export const AssignUserRoleSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
  email: z.string().email(),
  role: z.enum(['admin', 'teacher', 'parent', 'unassigned', 'disabled']),
  circleCode: z.string().max(50).optional(),
  displayName: z.string().max(150).optional(),
}).strict();

export const LinkParentStudentSchema = z.object({
  parentUid: z.string().min(1, 'Parent UID is required'),
  studentId: z.string().min(1, 'Student ID is required'),
}).strict();

export const RevokeAccessSchema = z.object({
  uid: z.string().min(1, 'UID is required'),
}).strict();

// Parent Notice / Decision Schema (Phase 7)
export const ParentNoticeDecisionSchema = z.object({
  studentId: z.string().min(1, 'Student ID is required'),
  noticeVersion: z.string().min(1, 'Notice version is required'),
  decision: z.enum(['acknowledged', 'withdrawn']),
}).strict();
