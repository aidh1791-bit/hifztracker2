import { pgTable, serial, text, integer, boolean, timestamp, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(), // Firebase Auth UID
  email: text('email').notNull(),
  displayName: text('display_name'),
  role: text('role').notNull().default('parent'), // 'admin' | 'teacher' | 'parent'
  createdAt: timestamp('created_at').defaultNow(),
});

export const students = pgTable('students', {
  id: text('id').primaryKey(), // std-xxx
  rollNumber: text('roll_number').notNull().unique(),
  name: text('name').notNull(),
  dob: text('dob'),
  gender: text('gender'),
  classGroup: text('class_group').notNull(),
  circleCode: text('circle_code').notNull(),
  teacherName: text('teacher_name').notNull(),
  enrollmentDate: text('enrollment_date').notNull(),
  status: text('status').notNull().default('active'),
  currentJuz: integer('current_juz').notNull().default(1),
  currentSurah: text('current_surah').notNull().default('Al-Fatihah'),
  currentAyah: integer('current_ayah').notNull().default(1),
  parentName: text('parent_name').notNull(),
  parentEmail: text('parent_email').notNull(),
  parentPhone: text('parent_phone').notNull(),
  studentEmail: text('student_email'),
  homeAddress: text('home_address'),
  notes: text('notes'),
  enrollmentCode: text('enrollment_code').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});

export const dailyHifzRecords = pgTable('daily_hifz_records', {
  id: serial('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  day: text('day').notNull(),
  attendance: text('attendance').notNull().default('present'),
  sabaqAmount: text('sabaq_amount').notNull().default(''),
  sabaqMistakes: integer('sabaq_mistakes').notNull().default(0),
  sabaqPassed: boolean('sabaq_passed'),
  sabaqParaAmount: text('sabaq_para_amount').notNull().default(''),
  sabaqParaMistakes: integer('sabaq_para_mistakes').notNull().default(0),
  sabaqParaPassed: boolean('sabaq_para_passed'),
  dawr1Amount: text('dawr1_amount').notNull().default(''),
  dawr1Mistakes: integer('dawr1_mistakes').notNull().default(0),
  dawr1Passed: boolean('dawr1_passed'),
  dawr2Amount: text('dawr2_amount').notNull().default(''),
  dawr2Mistakes: integer('dawr2_mistakes').notNull().default(0),
  dawr2Passed: boolean('dawr2_passed'),
  comments: text('comments').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('daily_hifz_records_student_id_date_unique').on(table.studentId, table.date)
]);

export const dailyHomeLearningRecords = pgTable('daily_home_learning_records', {
  id: serial('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  day: text('day').notNull(),
  sabaqMins: integer('sabaq_mins').notNull().default(0),
  sabaqParaMins: integer('sabaq_para_mins').notNull().default(0),
  dawr1Mins: integer('dawr1_mins').notNull().default(0),
  dawr2Mins: integer('dawr2_mins').notNull().default(0),
  parentSigned: boolean('parent_signed').notNull().default(false),
  parentComments: text('parent_comments').notNull().default(''),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('daily_home_learning_records_student_id_date_unique').on(table.studentId, table.date)
]);

export const dailyTarbiyahRecords = pgTable('daily_tarbiyah_records', {
  id: serial('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  date: text('date').notNull(),
  day: text('day').notNull(),
  fajr: text('fajr').notNull().default('none'),
  dhuhr: text('dhuhr').notNull().default('none'),
  asr: text('asr').notNull().default('none'),
  maghrib: text('maghrib').notNull().default('none'),
  ishaa: text('ishaa').notNull().default('none'),
  dailySadaqah: boolean('daily_sadaqah').notNull().default(false),
  eesaalThawaab: boolean('eesaal_thawaab').notNull().default(false),
  dailyDuasDhikr: boolean('daily_duas_dhikr').notNull().default(false),
  dailyQuranWird: boolean('daily_quran_wird').notNull().default(false),
  parentSignature: boolean('parent_signature').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('daily_tarbiyah_records_student_id_date_unique').on(table.studentId, table.date)
]);

export const weeklyEvaluations = pgTable('weekly_evaluations', {
  id: serial('id').primaryKey(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  weekCommencing: text('week_commencing').notNull(),
  overallGrade: text('overall_grade').notNull().default('Not yet assessed'),
  performanceScore: integer('performance_score').notNull().default(0),
  teacherSigned: boolean('teacher_signed').notNull().default(false),
  parentSigned: boolean('parent_signed').notNull().default(false),
  signedDate: text('signed_date'),
  hadithId: integer('hadith_id').notNull().default(1),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('weekly_evaluations_student_id_week_commencing_unique').on(table.studentId, table.weekCommencing)
]);

export const processedOperations = pgTable('processed_operations', {
  id: serial('id').primaryKey(),
  operationId: text('operation_id').notNull().unique(),
  uid: text('uid').notNull(),
  endpoint: text('endpoint').notNull(),
  status: text('status').notNull().default('completed'),
  responseData: text('response_data'),
  clientTimestamp: text('client_timestamp'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const auditLog = pgTable('audit_log', {
  id: serial('id').primaryKey(),
  actorUid: text('actor_uid').notNull(),
  actorRole: text('actor_role').notNull(),
  action: text('action').notNull(), // 'read' | 'write' | 'delete'
  resourceType: text('resource_type').notNull(), // 'hifz_record' | 'student' | 'evaluation' | etc.
  resourceId: text('resource_id').notNull(),
  studentId: text('student_id'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: timestamp('timestamp').defaultNow(),
});

export const parentStudentLinks = pgTable('parent_student_links', {
  id: serial('id').primaryKey(),
  parentUid: text('parent_uid').notNull(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at').defaultNow(),
}, (table) => [
  unique('parent_student_links_parent_student_unique').on(table.parentUid, table.studentId)
]);

export const appUsers = pgTable('app_users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  email: text('email').notNull(),
  role: text('role').notNull().default('unassigned'), // 'admin' | 'teacher' | 'parent' | 'unassigned' | 'disabled'
  circleCode: text('circle_code'), // Optional Halqah circle assigned to teacher
  displayName: text('display_name'),
  disabled: boolean('disabled').notNull().default(false),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const parentNoticeRecords = pgTable('parent_notice_records', {
  id: serial('id').primaryKey(),
  noticeVersion: text('notice_version').notNull(),
  parentUid: text('parent_uid').notNull(),
  studentId: text('student_id')
    .notNull()
    .references(() => students.id, { onDelete: 'cascade' }),
  decision: text('decision').notNull(), // 'acknowledged' | 'withdrawn'
  acceptedAt: timestamp('accepted_at').defaultNow(),
  withdrawnAt: timestamp('withdrawn_at'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
}, (table) => [
  unique('parent_notice_parent_student_version_unique').on(table.parentUid, table.studentId, table.noticeVersion)
]);

export const madrasahSettings = pgTable('madrasah_settings', {
  id: serial('id').primaryKey(),
  key: text('key').notNull().unique(),
  value: text('value').notNull(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Relations
export const studentsRelations = relations(students, ({ many }) => ({
  dailyHifzRecords: many(dailyHifzRecords),
  dailyHomeLearningRecords: many(dailyHomeLearningRecords),
  dailyTarbiyahRecords: many(dailyTarbiyahRecords),
  weeklyEvaluations: many(weeklyEvaluations),
}));

export const dailyHifzRecordsRelations = relations(dailyHifzRecords, ({ one }) => ({
  student: one(students, {
    fields: [dailyHifzRecords.studentId],
    references: [students.id],
  }),
}));

export const dailyHomeLearningRecordsRelations = relations(dailyHomeLearningRecords, ({ one }) => ({
  student: one(students, {
    fields: [dailyHomeLearningRecords.studentId],
    references: [students.id],
  }),
}));

export const dailyTarbiyahRecordsRelations = relations(dailyTarbiyahRecords, ({ one }) => ({
  student: one(students, {
    fields: [dailyTarbiyahRecords.studentId],
    references: [students.id],
  }),
}));

export const weeklyEvaluationsRelations = relations(weeklyEvaluations, ({ one }) => ({
  student: one(students, {
    fields: [weeklyEvaluations.studentId],
    references: [students.id],
  }),
}));
