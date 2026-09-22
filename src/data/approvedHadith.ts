export interface ApprovedHadith {
  id: number;
  arabic: string;
  translation: string;
  source: string;
  hadithNumber: string;
  approvedDate: string;
}

/**
 * Standardized, scholarly approved Hadith citations for student motivation and reports.
 * Fixed numbering ensures historical evaluations retain their exact recorded Hadith.
 */
export const APPROVED_HADITH_LIST: ApprovedHadith[] = [
  {
    id: 1,
    arabic: 'خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ',
    translation: 'The best of you is the one who learns the Qurʾān and teaches it.',
    source: 'Ṣaḥīḥ al-Bukhārī',
    hadithNumber: '5027',
    approvedDate: '2026-09-01'
  },
  {
    id: 2,
    arabic: 'مَنْ قَرَأَ حَرْفًا مِنْ كِتَابِ اللَّهِ فَلَهُ بِهِ حَسَنَةٌ، وَالْحَسَنَةُ بِعَشْرِ أَمْثَالِهَا',
    translation: 'Whoever reads a letter from the Book of Allāh will have a good deed for it, and a good deed is rewarded ten times over.',
    source: 'Jāmiʿ al-Tirmidhī',
    hadithNumber: '2910',
    approvedDate: '2026-09-01'
  },
  {
    id: 3,
    arabic: 'يُقَالُ لِصَاحِبِ الْقُرْآنِ اقْرَأْ وَارْتَقِ وَرَتِّلْ كَمَا كُنْتَ تَرَتِّلُ فِي الدُّنْيَا فَإِنَّ مَنْزِلَتَكَ عِنْدَ آخِرِ آيَةٍ تَقْرَؤُهَا',
    translation: 'It will be said to the companion of the Qurʾān: "Recite, ascend, and recite carefully as you recited in the world; for your status is at the last verse you recite."',
    source: 'Sunan Abī Dāwūd',
    hadithNumber: '1464',
    approvedDate: '2026-09-01'
  }
];

export function getApprovedHadith(id?: number): ApprovedHadith {
  if (id) {
    const found = APPROVED_HADITH_LIST.find(h => h.id === id);
    if (found) return found;
  }
  return APPROVED_HADITH_LIST[0];
}
