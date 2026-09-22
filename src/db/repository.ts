import { db } from './index.ts';
import {
  users,
  students,
  dailyHifzRecords,
  dailyHomeLearningRecords,
  dailyTarbiyahRecords,
  weeklyEvaluations,
  madrasahSettings
} from './schema.ts';
import { eq, desc, and } from 'drizzle-orm';
import {
  INITIAL_STUDENTS,
  INITIAL_HIFZ_RECORDS,
  INITIAL_HOME_LEARNING,
  INITIAL_TARBIYAH_RECORDS,
  INITIAL_WEEKLY_EVALUATIONS,
  DEFAULT_ADMIN_SETTINGS
} from '../data/initialData.ts';
import { DEFAULT_TEACHER_SETTINGS } from '../context/HifzContext.tsx';

// --- Users ---
export async function getOrCreateUser(uid: string, email: string, displayName?: string, role: string = 'parent') {
  try {
    const existing = await db.select().from(users).where(eq(users.uid, uid));
    if (existing.length > 0) {
      return existing[0];
    }
    const inserted = await db.insert(users).values({
      uid,
      email,
      displayName: displayName || email.split('@')[0],
      role,
    }).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error in getOrCreateUser:', error);
    throw new Error('Database operation failed for user authentication.', { cause: error });
  }
}

// --- Students ---
export async function getAllStudents() {
  try {
    return await db.select().from(students).orderBy(students.name);
  } catch (error) {
    console.error('Error fetching students:', error);
    throw new Error('Failed to retrieve students from database.', { cause: error });
  }
}

export async function upsertStudent(studentData: typeof students.$inferInsert) {
  try {
    const existing = await db.select().from(students).where(eq(students.id, studentData.id));
    if (existing.length > 0) {
      const updated = await db.update(students)
        .set(studentData)
        .where(eq(students.id, studentData.id))
        .returning();
      return updated[0];
    } else {
      const inserted = await db.insert(students).values(studentData).returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Error upserting student:', error);
    throw new Error('Failed to save student record.', { cause: error });
  }
}

export async function deleteStudentById(studentId: string) {
  try {
    await db.delete(students).where(eq(students.id, studentId));
  } catch (error) {
    console.error('Error deleting student:', error);
    throw new Error('Failed to delete student.', { cause: error });
  }
}

// --- Daily Hifz Records ---
export async function getHifzRecords(studentId?: string) {
  try {
    if (studentId) {
      return await db.select().from(dailyHifzRecords).where(eq(dailyHifzRecords.studentId, studentId)).orderBy(desc(dailyHifzRecords.date));
    }
    return await db.select().from(dailyHifzRecords).orderBy(desc(dailyHifzRecords.date));
  } catch (error) {
    console.error('Error fetching hifz records:', error);
    throw new Error('Failed to retrieve recitation records.', { cause: error });
  }
}

export async function saveHifzRecord(record: typeof dailyHifzRecords.$inferInsert) {
  try {
    const existing = await db.select().from(dailyHifzRecords).where(
      and(
        eq(dailyHifzRecords.studentId, record.studentId),
        eq(dailyHifzRecords.date, record.date)
      )
    );
    if (existing.length > 0) {
      const updated = await db.update(dailyHifzRecords)
        .set(record)
        .where(eq(dailyHifzRecords.id, existing[0].id))
        .returning();
      return updated[0];
    }
    const inserted = await db.insert(dailyHifzRecords).values(record).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error saving hifz record:', error);
    throw new Error('Failed to record daily recitation.', { cause: error });
  }
}

// --- Daily Home Learning ---
export async function getHomeLearning(studentId?: string) {
  try {
    if (studentId) {
      return await db.select().from(dailyHomeLearningRecords).where(eq(dailyHomeLearningRecords.studentId, studentId)).orderBy(desc(dailyHomeLearningRecords.date));
    }
    return await db.select().from(dailyHomeLearningRecords).orderBy(desc(dailyHomeLearningRecords.date));
  } catch (error) {
    console.error('Error fetching home learning:', error);
    throw new Error('Failed to retrieve home learning records.', { cause: error });
  }
}

export async function saveHomeLearning(record: typeof dailyHomeLearningRecords.$inferInsert) {
  try {
    const existing = await db.select().from(dailyHomeLearningRecords).where(
      and(
        eq(dailyHomeLearningRecords.studentId, record.studentId),
        eq(dailyHomeLearningRecords.date, record.date)
      )
    );
    if (existing.length > 0) {
      const updated = await db.update(dailyHomeLearningRecords)
        .set(record)
        .where(eq(dailyHomeLearningRecords.id, existing[0].id))
        .returning();
      return updated[0];
    }
    const inserted = await db.insert(dailyHomeLearningRecords).values(record).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error saving home learning record:', error);
    throw new Error('Failed to record home practice.', { cause: error });
  }
}

// --- Daily Tarbiyah ---
export async function getTarbiyah(studentId?: string) {
  try {
    if (studentId) {
      return await db.select().from(dailyTarbiyahRecords).where(eq(dailyTarbiyahRecords.studentId, studentId)).orderBy(desc(dailyTarbiyahRecords.date));
    }
    return await db.select().from(dailyTarbiyahRecords).orderBy(desc(dailyTarbiyahRecords.date));
  } catch (error) {
    console.error('Error fetching tarbiyah records:', error);
    throw new Error('Failed to retrieve tarbiyah records.', { cause: error });
  }
}

export async function saveTarbiyah(record: typeof dailyTarbiyahRecords.$inferInsert) {
  try {
    const existing = await db.select().from(dailyTarbiyahRecords).where(
      and(
        eq(dailyTarbiyahRecords.studentId, record.studentId),
        eq(dailyTarbiyahRecords.date, record.date)
      )
    );
    if (existing.length > 0) {
      const updated = await db.update(dailyTarbiyahRecords)
        .set(record)
        .where(eq(dailyTarbiyahRecords.id, existing[0].id))
        .returning();
      return updated[0];
    }
    const inserted = await db.insert(dailyTarbiyahRecords).values(record).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error saving tarbiyah record:', error);
    throw new Error('Failed to record tarbiyah log.', { cause: error });
  }
}

// --- Weekly Evaluations ---
export async function getEvaluations(studentId?: string) {
  try {
    if (studentId) {
      return await db.select().from(weeklyEvaluations).where(eq(weeklyEvaluations.studentId, studentId)).orderBy(desc(weeklyEvaluations.weekCommencing));
    }
    return await db.select().from(weeklyEvaluations).orderBy(desc(weeklyEvaluations.weekCommencing));
  } catch (error) {
    console.error('Error fetching evaluations:', error);
    throw new Error('Failed to retrieve weekly evaluations.', { cause: error });
  }
}

export async function saveEvaluation(evaluation: typeof weeklyEvaluations.$inferInsert) {
  try {
    const existing = await db.select().from(weeklyEvaluations).where(
      and(
        eq(weeklyEvaluations.studentId, evaluation.studentId),
        eq(weeklyEvaluations.weekCommencing, evaluation.weekCommencing)
      )
    );
    if (existing.length > 0) {
      const updated = await db.update(weeklyEvaluations)
        .set(evaluation)
        .where(eq(weeklyEvaluations.id, existing[0].id))
        .returning();
      return updated[0];
    }
    const inserted = await db.insert(weeklyEvaluations).values(evaluation).returning();
    return inserted[0];
  } catch (error) {
    console.error('Error saving weekly evaluation:', error);
    throw new Error('Failed to save evaluation.', { cause: error });
  }
}

// --- Madrasah Settings ---
export async function getSettings(key: string) {
  try {
    const res = await db.select().from(madrasahSettings).where(eq(madrasahSettings.key, key));
    return res[0]?.value ? JSON.parse(res[0].value) : null;
  } catch (error) {
    console.error(`Error fetching settings for ${key}:`, error);
    throw new Error(`Failed to load settings for ${key}.`, { cause: error });
  }
}

export async function saveSettings(key: string, value: any) {
  try {
    const existing = await db.select().from(madrasahSettings).where(eq(madrasahSettings.key, key));
    const strVal = JSON.stringify(value);
    if (existing.length > 0) {
      await db.update(madrasahSettings).set({ value: strVal, updatedAt: new Date() }).where(eq(madrasahSettings.key, key));
    } else {
      await db.insert(madrasahSettings).values({ key, value: strVal });
    }
  } catch (error) {
    console.error(`Error saving settings for ${key}:`, error);
    throw new Error(`Failed to save settings for ${key}.`, { cause: error });
  }
}

// --- Auto-Seed on First Launch ---
export async function seedInitialMadrasahDataIfEmpty() {
  try {
    // In production, automatic demo seeding is strictly prohibited unless explicitly enabled via ALLOW_DEMO_SEED=true
    const isProduction = process.env.NODE_ENV === 'production';
    const allowDemoSeed = process.env.ALLOW_DEMO_SEED === 'true';
    if (isProduction && !allowDemoSeed) {
      console.log('[Seed] Auto-seeding disabled in production environment.');
      return { seeded: false, count: 0, reason: 'Auto-seeding disabled in production' };
    }

    const existingStudents = await db.select().from(students);
    if (existingStudents.length > 0) {
      return { seeded: false, count: existingStudents.length };
    }

    console.log('[Seed] Seeding initial madrasah dataset into Cloud SQL...');

    // 1. Seed Students
    for (const std of INITIAL_STUDENTS) {
      await db.insert(students).values({
        id: std.id,
        rollNumber: std.rollNumber,
        name: std.name,
        dob: null,
        gender: 'Male',
        classGroup: std.classGroup,
        circleCode: std.circleCode,
        teacherName: std.teacherName,
        enrollmentDate: std.hifzStartDate,
        status: std.status,
        currentJuz: std.currentJuz,
        currentSurah: std.currentSurah,
        currentAyah: 1,
        parentName: std.parentName,
        parentEmail: std.parentEmail,
        parentPhone: std.parentPhone,
        studentEmail: std.studentEmail || null,
        homeAddress: null,
        notes: null,
        enrollmentCode: std.enrollmentCode,
      });
    }

    // 2. Seed Daily Hifz Records
    for (const [studentId, recs] of Object.entries(INITIAL_HIFZ_RECORDS)) {
      for (const r of recs) {
        await db.insert(dailyHifzRecords).values({
          studentId,
          date: r.date,
          day: r.day,
          attendance: r.attendance,
          sabaqAmount: r.sabaq.amount,
          sabaqMistakes: r.sabaq.mistakes,
          sabaqPassed: r.sabaq.taskPassed,
          sabaqParaAmount: r.sabaqPara.amount,
          sabaqParaMistakes: r.sabaqPara.mistakes,
          sabaqParaPassed: r.sabaqPara.taskPassed,
          dawr1Amount: r.dawr1.amount,
          dawr1Mistakes: r.dawr1.mistakes,
          dawr1Passed: r.dawr1.taskPassed,
          dawr2Amount: r.dawr2.amount,
          dawr2Mistakes: r.dawr2.mistakes,
          dawr2Passed: r.dawr2.taskPassed,
          comments: r.comments,
        });
      }
    }

    // 3. Seed Home Learning
    for (const [studentId, homes] of Object.entries(INITIAL_HOME_LEARNING)) {
      for (const h of homes) {
        await db.insert(dailyHomeLearningRecords).values({
          studentId,
          date: h.date,
          day: h.day,
          sabaqMins: h.sabaqMins,
          sabaqParaMins: h.sabaqParaMins,
          dawr1Mins: h.dawr1Mins,
          dawr2Mins: h.dawr2Mins,
          parentSigned: h.parentSigned,
          parentComments: h.notes || '',
        });
      }
    }

    // 4. Seed Tarbiyah
    for (const [studentId, tars] of Object.entries(INITIAL_TARBIYAH_RECORDS)) {
      for (const t of tars) {
        await db.insert(dailyTarbiyahRecords).values({
          studentId,
          date: t.date,
          day: t.day,
          fajr: t.prayers.fajr,
          dhuhr: t.prayers.dhuhr,
          asr: t.prayers.asr,
          maghrib: t.prayers.maghrib,
          ishaa: t.prayers.ishaa,
          dailySadaqah: t.dailySadaqah,
          eesaalThawaab: t.eesaalThawaab,
          dailyDuasDhikr: t.dailyDuasDhikr,
          dailyQuranWird: t.dailyQuranWird,
          parentSignature: false,
        });
      }
    }

    // 5. Seed Weekly Evaluations
    for (const [studentId, ev] of Object.entries(INITIAL_WEEKLY_EVALUATIONS)) {
      await db.insert(weeklyEvaluations).values({
        studentId,
        weekCommencing: ev.weekCommencing,
        overallGrade: 'A',
        performanceScore: 92,
        teacherSigned: ev.teacherSigned,
        parentSigned: ev.parentSigned,
        signedDate: ev.weekCommencing,
        hadithId: 1,
      });
    }

    // 6. Seed Settings
    await saveSettings('admin_settings', DEFAULT_ADMIN_SETTINGS);
    await saveSettings('teacher_settings', DEFAULT_TEACHER_SETTINGS);

    console.log('[Seed] Database initialization completed successfully.');
    return { seeded: true, count: INITIAL_STUDENTS.length };
  } catch (error) {
    console.error('[Seed] Error during seeding:', error);
    return { seeded: false, error: String(error) };
  }
}
