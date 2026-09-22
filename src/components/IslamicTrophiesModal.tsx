import React from 'react';
import {
  Trophy,
  Award,
  Star,
  Crown,
  Sparkles,
  Shield,
  CheckCircle2,
  Lock,
  X,
  Target
} from 'lucide-react';
import { IslamicTrophyTier, StudentMeritBreakdown } from '../utils/meritTrophies';

interface IslamicTrophiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  trophies: IslamicTrophyTier[];
  meritData: StudentMeritBreakdown;
  studentName: string;
}

export const IslamicTrophiesModal: React.FC<IslamicTrophiesModalProps> = ({
  isOpen,
  onClose,
  trophies,
  meritData,
  studentName
}) => {
  if (!isOpen) return null;

  const getTrophyIcon = (icon: IslamicTrophyTier['badgeIcon'], className = 'w-5 h-5') => {
    switch (icon) {
      case 'crown':
        return <Crown className={className} />;
      case 'star':
        return <Star className={className} />;
      case 'sparkles':
        return <Sparkles className={className} />;
      case 'shield':
        return <Shield className={className} />;
      default:
        return <Award className={className} />;
    }
  };

  const getSchemeStyles = (scheme: IslamicTrophyTier['colorScheme'], isUnlocked: boolean) => {
    if (!isUnlocked) {
      return {
        bg: 'bg-slate-50 border-slate-200 text-slate-400',
        badge: 'bg-slate-200 text-slate-500',
        ring: 'border-slate-200'
      };
    }

    switch (scheme) {
      case 'amber':
        return {
          bg: 'bg-amber-50/80 border-amber-200 text-amber-950',
          badge: 'bg-amber-500 text-white',
          ring: 'border-amber-300'
        };
      case 'emerald':
        return {
          bg: 'bg-emerald-50/80 border-emerald-200 text-emerald-950',
          badge: 'bg-emerald-600 text-white',
          ring: 'border-emerald-300'
        };
      case 'purple':
        return {
          bg: 'bg-purple-50/80 border-purple-200 text-purple-950',
          badge: 'bg-purple-600 text-white',
          ring: 'border-purple-300'
        };
      case 'rose':
        return {
          bg: 'bg-rose-50/80 border-rose-200 text-rose-950',
          badge: 'bg-rose-600 text-white',
          ring: 'border-rose-300'
        };
      default:
        return {
          bg: 'bg-blue-50/80 border-blue-200 text-blue-950',
          badge: 'bg-blue-600 text-white',
          ring: 'border-blue-300'
        };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" />
              <span>Madrasah Islamic Merit Honor Tiers</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white">
              {studentName}’s Trophy Cabinet
            </h2>
            <p className="text-xs text-emerald-100/80 mt-1">
              Automated recognition for daily Sabaq mastery, Tajweed discipline, and 5-daily Salaah logs.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="relative z-10 w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Merit Summary Banner */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
                Total Automated Merit Points
              </span>
              <div className="text-xl font-black text-slate-900">
                {meritData.totalPoints}{' '}
                <span className="text-xs font-semibold text-slate-500">Points Earned</span>
              </div>
            </div>
          </div>

          {meritData.nextTrophy ? (
            <div className="text-right">
              <span className="text-[11px] font-semibold text-slate-500">Next Honor:</span>
              <div className="font-bold text-emerald-800 text-xs flex items-center gap-1.5 justify-end">
                <Target className="w-3.5 h-3.5 text-emerald-600" />
                <span>{meritData.nextTrophy.titleEnglish}</span>
              </div>
              <span className="text-[11px] text-amber-700 font-medium">
                {meritData.pointsToNext} more pts needed ({meritData.progressPercent}% achieved)
              </span>
            </div>
          ) : (
            <div className="px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 font-bold text-xs border border-rose-200">
              Highest Honor Attained! 👑
            </div>
          )}
        </div>

        {/* Point Breakdown Chips */}
        <div className="px-5 py-3 bg-white border-b border-slate-100 flex flex-wrap items-center gap-2 text-[11px]">
          <span className="font-bold text-slate-500">Point Sources:</span>
          <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200">
            Sabaq: +{meritData.sabaqPoints}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 font-semibold border border-teal-200">
            Sabaqee: +{meritData.sabaqParaPoints}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 font-semibold border border-amber-200">
            Dawr: +{meritData.dawrPoints}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-semibold border border-blue-200">
            Attendance: +{meritData.attendancePoints}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-800 font-semibold border border-purple-200">
            Salaah / Dhikr: +{meritData.prayerPoints}
          </span>
          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold">
            Home Study: +{meritData.homeStudyPoints}
          </span>
        </div>

        {/* Trophy Tiers List */}
        <div className="p-5 overflow-y-auto space-y-3.5 flex-1">
          {trophies.map((trophy, idx) => {
            const isUnlocked = meritData.totalPoints >= trophy.minPoints;
            const isCurrent = meritData.currentTrophy.id === trophy.id;
            const styles = getSchemeStyles(trophy.colorScheme, isUnlocked);

            return (
              <div
                key={trophy.id}
                className={`p-4 rounded-2xl border transition-all relative ${styles.bg} ${
                  isCurrent ? 'ring-2 ring-emerald-500 shadow-sm' : ''
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${styles.badge}`}
                    >
                      {getTrophyIcon(trophy.badgeIcon, 'w-6 h-6')}
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-serif text-base font-bold text-slate-900">
                          {trophy.titleArabic}
                        </span>
                        <span className="text-xs font-bold text-slate-700">
                          • {trophy.titleEnglish}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">
                          ({trophy.titleUrdu})
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {trophy.description}
                      </p>

                      <div className="mt-2 flex items-center gap-3 text-[11px]">
                        <span className="font-bold text-slate-500">
                          Requirement: {trophy.minPoints} Merit Points
                        </span>
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider">
                            Active Rank
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0 flex items-center">
                    {isUnlocked ? (
                      <div className="flex items-center gap-1 text-emerald-700 font-bold text-xs bg-emerald-100/80 px-2.5 py-1 rounded-full border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Unlocked</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-slate-400 font-semibold text-xs bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                        <Lock className="w-3.5 h-3.5" />
                        <span>Locked ({trophy.minPoints - meritData.totalPoints} pts)</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Points are recalculated dynamically based on attendance and daily recitation records.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
