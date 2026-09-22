// Vernacular & Regional Spelling Dictionary (UK vs US vs Other)
export type VernacularLocale = 'UK' | 'US' | 'OTHER';

export interface VernacularTerms {
  locale: VernacularLocale;
  schoolName: string;
  teacherTitle: string;
  teachersTitle: string;
  revisionTitle: string;
  memorisedTitle: string;
  termTitle: string;
  marksTitle: string;
  timetablesTitle: string;
  circleTitle: string;
  feedbackTitle: string;
  behaviourTitle: string;
  headTeacherTitle: string;
  enrolmentSpelling: string;
}

export const VERNACULAR_CONFIGS: Record<VernacularLocale, VernacularTerms> = {
  UK: {
    locale: 'UK',
    schoolName: 'Madrasah',
    teacherTitle: 'Ustadh',
    teachersTitle: 'Asatidhah / Faculty',
    revisionTitle: 'Revision (Dour / Manzil)',
    memorisedTitle: 'Memorised',
    termTitle: 'Term',
    marksTitle: 'Marks',
    timetablesTitle: 'Timetable',
    circleTitle: 'Circle (Halqa)',
    feedbackTitle: 'Remarks',
    behaviourTitle: 'Behaviour & Akhlaaq',
    headTeacherTitle: 'Head Teacher / Principal',
    enrolmentSpelling: 'Enrolment'
  },
  US: {
    locale: 'US',
    schoolName: 'Islamic School',
    teacherTitle: 'Instructor',
    teachersTitle: 'Faculty / Teachers',
    revisionTitle: 'Review (Murajaah / Dawr)',
    memorisedTitle: 'Memorized',
    termTitle: 'Semester',
    marksTitle: 'Grades',
    timetablesTitle: 'Schedule',
    circleTitle: 'Class (Halqa)',
    feedbackTitle: 'Feedback',
    behaviourTitle: 'Behavior & Akhlaaq',
    headTeacherTitle: 'Principal / Director',
    enrolmentSpelling: 'Enrollment'
  },
  OTHER: {
    locale: 'OTHER',
    schoolName: 'Maktab / Academy',
    teacherTitle: 'Muallim',
    teachersTitle: 'Muallimeen',
    revisionTitle: 'Murajaah / Dawr',
    memorisedTitle: 'Hifz Completed',
    termTitle: 'Session',
    marksTitle: 'Assessment Score',
    timetablesTitle: 'Class Hours',
    circleTitle: 'Halqa',
    feedbackTitle: 'Nasiha & Remarks',
    behaviourTitle: 'Adab & Akhlaaq',
    headTeacherTitle: 'Sadr Muallim',
    enrolmentSpelling: 'Registration'
  }
};

export function getVernacular(locale: VernacularLocale = 'UK'): VernacularTerms {
  return VERNACULAR_CONFIGS[locale] || VERNACULAR_CONFIGS.UK;
}
