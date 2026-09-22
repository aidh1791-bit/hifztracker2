import React, { useState } from 'react';
import { useHifz } from '../context/HifzContext';
import {
  Moon,
  Clock,
  HeartHandshake,
  CheckCircle2,
  PenTool,
  Plus,
  Trash2,
  Sparkles,
  BookOpen,
  Check,
  Building,
  Home
} from 'lucide-react';
import { PrayerLocation } from '../types';
import { getUkCurrentDate, formatUkDate } from '../utils/dateUtils';

export const TarbiyahHomeView: React.FC = () => {
  const {
    selectedStudent,
    userRole,
    currentHomeLearning,
    currentTarbiyah,
    currentParentTasks,
    currentEvaluation,
    updateHomeLearningMins,
    signHomeLearningParent,
    togglePrayerLocation,
    updateTarbiyahBool,
    updateTarbiyahMins,
    addParentTask,
    toggleParentTaskSign,
    deleteParentTask,
    updateWeeklyEvaluation,
    signEvaluation
  } = useHifz();

  const [activeSubTab, setActiveSubTab] = useState<'time-spent' | 'parent-tasks' | 'salaah-awraad' | 'studies-eval'>('time-spent');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  const isParent = userRole === 'parent';
  const isTeacher = userRole === 'teacher';

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    addParentTask(newTaskTitle.trim(), newTaskNotes.trim());
    setNewTaskTitle('');
    setNewTaskNotes('');
    setIsAddingTask(false);
  };

  const prayersList: { key: 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'ishaa'; name: string }[] = [
    { key: 'fajr', name: 'Fajr' },
    { key: 'dhuhr', name: 'Dhuhr' },
    { key: 'asr', name: 'Asr' },
    { key: 'maghrib', name: 'Maghrib' },
    { key: 'ishaa', name: 'Ishaa' }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Info Sheet Bar (Matching Image 2 Header) */}
      <div className="bg-white rounded-2xl border border-slate-300 p-4 sm:p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider bg-indigo-700 text-white px-2.5 py-0.5 rounded">
                Logbook Sheet 2
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                Parental Home Monitoring & Tarbiyah Log
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Spiritual development, home revision hours, and parent-guided tasks for {selectedStudent.name}.
            </p>
          </div>

          <div className="bg-slate-100 border border-slate-300 rounded-lg px-3 py-2 text-xs">
            <span className="text-slate-500 block text-[10px] font-semibold uppercase">Week Commencing</span>
            <span className="font-bold text-slate-800 text-sm">
              {currentHomeLearning[0]?.date ? formatUkDate(currentHomeLearning[0].date) : getUkCurrentDate().formattedDate}
            </span>
          </div>
        </div>

        {/* Section Sub-Navigation Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('time-spent')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'time-spent'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            1. Time Spent Learning at Home
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('parent-tasks')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeSubTab === 'parent-tasks'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            2. Tasks With Parents
            <span className="px-1.5 py-0.2 rounded-full bg-white/20 text-[10px]">
              {currentParentTasks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('salaah-awraad')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'salaah-awraad'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            3. Salaah & Awraad (Spiritual)
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('studies-eval')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeSubTab === 'studies-eval'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            4. Islamic Studies & Duas Evaluation
          </button>
        </div>
      </div>

      {/* SUBTAB 1: Time Spent Learning at Home */}
      {activeSubTab === 'time-spent' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Time Spent Learning at Home (Mon – Sun)
              </h3>
              <p className="text-xs text-slate-500">
                Log minutes or hours spent outside Madrasah for each lesson portion.
              </p>
            </div>
            {isParent && (
              <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded border border-indigo-200">
                Parent Active: Edit minutes & click Sign to confirm
              </span>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">Day</th>
                  <th className="p-3">New Lesson / Sabaq (Mins)</th>
                  <th className="p-3">Latest Juz / Sabaqee (Mins)</th>
                  <th className="p-3">Further Revision 1 (Mins)</th>
                  <th className="p-3">Further Revision 2 (Mins)</th>
                  <th className="p-3">Total Daily</th>
                  <th className="p-3 text-right">Parent's Sign</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentHomeLearning.map((item) => {
                  const dailyTotal = (item.sabaqMins || 0) + (item.sabaqParaMins || 0) + (item.dawr1Mins || 0) + (item.dawr2Mins || 0);

                  return (
                    <tr key={item.day} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-3 font-bold text-slate-900">
                        {item.day}
                      </td>

                      {/* Sabaq Mins */}
                      <td className="p-3">
                        {isParent ? (
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.sabaqMins}
                            onChange={(e) => updateHomeLearningMins(item.day, 'sabaqMins', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800">{item.sabaqMins} mins</span>
                        )}
                      </td>

                      {/* Sabaq Para Mins */}
                      <td className="p-3">
                        {isParent ? (
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.sabaqParaMins}
                            onChange={(e) => updateHomeLearningMins(item.day, 'sabaqParaMins', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800">{item.sabaqParaMins} mins</span>
                        )}
                      </td>

                      {/* Dawr 1 Mins */}
                      <td className="p-3">
                        {isParent ? (
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.dawr1Mins}
                            onChange={(e) => updateHomeLearningMins(item.day, 'dawr1Mins', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800">{item.dawr1Mins} mins</span>
                        )}
                      </td>

                      {/* Dawr 2 Mins */}
                      <td className="p-3">
                        {isParent ? (
                          <input
                            type="number"
                            min="0"
                            step="5"
                            value={item.dawr2Mins}
                            onChange={(e) => updateHomeLearningMins(item.day, 'dawr2Mins', parseInt(e.target.value) || 0)}
                            className="w-16 px-2 py-1 bg-white border border-slate-300 rounded font-semibold text-center focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="font-semibold text-slate-800">{item.dawr2Mins} mins</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="p-3 font-bold text-indigo-900">
                        {dailyTotal} mins
                        <span className="text-[10px] text-slate-400 font-normal block">
                          ({(dailyTotal / 60).toFixed(1)} hrs)
                        </span>
                      </td>

                      {/* Parent Sign */}
                      <td className="p-3 text-right">
                        {isParent ? (
                          <button
                            type="button"
                            onClick={() => signHomeLearningParent(item.day)}
                            disabled={item.parentSigned}
                            className={`px-2.5 py-1 rounded text-xs font-bold transition-all ${
                              item.parentSigned
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-default'
                                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                            }`}
                          >
                            {item.parentSigned ? 'Signed ✓' : 'Sign Day'}
                          </button>
                        ) : (
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            item.parentSigned ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'
                          }`}>
                            {item.parentSigned ? 'Signed' : 'Pending'}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: Tasks To Be Completed with Parents */}
      {activeSubTab === 'parent-tasks' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                Tasks To Be Completed with Parents
              </h3>
              <p className="text-xs text-slate-500">
                Direct reproduction of the middle table in Image 2. Home assignments and parent listening drills.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsAddingTask(!isAddingTask)}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Parent Task
            </button>
          </div>

          {/* New Task Form */}
          {isAddingTask && (
            <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wide">
                Assign New Task for Parent & Student
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Task Description</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Listen to Sabaq Surah Maryam v.51-65 3 times"
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-700 block mb-1">Notes / Mistakes Observed</label>
                  <input
                    type="text"
                    placeholder="e.g. Watch out for Waqf Jaiz on verse 55"
                    value={newTaskNotes}
                    onChange={(e) => setNewTaskNotes(e.target.value)}
                    className="w-full text-xs bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddingTask(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-lg font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1.5 text-xs bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold"
                >
                  Save Task
                </button>
              </div>
            </form>
          )}

          {/* Table of Tasks */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">Date / Day</th>
                  <th className="p-3">Task Description</th>
                  <th className="p-3">No. Mistakes / Notes</th>
                  <th className="p-3 text-center">Parent's Sign</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {currentParentTasks.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No parent tasks currently assigned for this week.
                    </td>
                  </tr>
                ) : (
                  currentParentTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-slate-900 block">{t.day}</span>
                        <span className="text-[10px] text-slate-500">{t.date}</span>
                      </td>

                      <td className="p-3 font-semibold text-slate-800">
                        {t.task}
                      </td>

                      <td className="p-3 text-slate-600">
                        {t.mistakesNotes || <span className="text-slate-400 italic">None noted</span>}
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => toggleParentTaskSign(t.id)}
                          className={`px-2.5 py-1 rounded text-xs font-bold inline-flex items-center gap-1 transition-colors ${
                            t.parentSigned
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 hover:bg-amber-200'
                          }`}
                        >
                          {t.parentSigned ? <Check className="w-3.5 h-3.5" /> : <PenTool className="w-3.5 h-3.5" />}
                          {t.parentSigned ? 'Verified Signed' : 'Click to Sign'}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <button
                          type="button"
                          onClick={() => deleteParentTask(t.id)}
                          className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 3: Salaah & Awraad (Spiritual Development) */}
      {activeSubTab === 'salaah-awraad' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Moon className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-slate-900 text-base">
                  Salaah & Awraad (Spiritual Development) Progress Tracker
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Exact digital mirror of the third section of Image 2. Click any prayer cell to toggle: <strong className="text-emerald-700">MSJ</strong> (Masjid) → <strong className="text-indigo-700">HM</strong> (Home) → Unperformed.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                <Building className="w-3 h-3" /> MSJ = Masjid
              </span>
              <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-indigo-100 text-indigo-800 font-bold">
                <Home className="w-3 h-3" /> HM = Home
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold text-slate-600 uppercase">
                  <th className="p-3">Awraad / Act</th>
                  {currentTarbiyah.map((t) => (
                    <th key={t.day} className="p-3 text-center">
                      {t.day.substring(0, 3)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                
                {/* 5 Daily Prayers Rows */}
                {prayersList.map((prayer) => (
                  <tr key={prayer.key} className="hover:bg-slate-50/60">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                      <span>{prayer.name}</span>
                    </td>
                    {currentTarbiyah.map((t) => {
                      const loc = t.prayers[prayer.key];

                      return (
                        <td key={t.day} className="p-2 text-center">
                          <button
                            type="button"
                            onClick={() => togglePrayerLocation(t.day, prayer.key)}
                            className={`w-12 py-1 rounded font-extrabold text-[11px] transition-all border ${
                              loc === 'MSJ'
                                ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                                : loc === 'HM'
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-2xs'
                                : 'bg-slate-100 text-slate-400 border-slate-200 hover:bg-slate-200'
                            }`}
                          >
                            {loc === 'none' ? '—' : loc}
                          </button>
                        </td>
                      );
                    })}
                  </tr>
                ))}

                {/* Collective Ta'leem */}
                <tr className="bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">
                    Collective Ta'leem (Mins)
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={t.collectiveTaleemMins}
                        onChange={(e) => updateTarbiyahMins(t.day, 'collectiveTaleemMins', parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-white border border-slate-300 rounded py-0.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  ))}
                </tr>

                {/* Collective Dua */}
                <tr className="bg-slate-50/50">
                  <td className="p-3 font-semibold text-slate-800">
                    Collective Dua (Mins)
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <input
                        type="number"
                        min="0"
                        step="5"
                        value={t.collectiveDuaMins}
                        onChange={(e) => updateTarbiyahMins(t.day, 'collectiveDuaMins', parseInt(e.target.value) || 0)}
                        className="w-12 text-center bg-white border border-slate-300 rounded py-0.5 text-xs font-semibold focus:ring-1 focus:ring-indigo-500"
                      />
                    </td>
                  ))}
                </tr>

                {/* Daily Sadaqah */}
                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Daily Sadaqah (Charity)
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateTarbiyahBool(t.day, 'dailySadaqah', !t.dailySadaqah)}
                        className={`w-12 py-0.5 rounded font-bold text-[11px] border ${
                          t.dailySadaqah
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.dailySadaqah ? 'Yes' : 'No'}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Eesaal Thawaab */}
                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Eesaal Thawaab
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateTarbiyahBool(t.day, 'eesaalThawaab', !t.eesaalThawaab)}
                        className={`w-12 py-0.5 rounded font-bold text-[11px] border ${
                          t.eesaalThawaab
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.eesaalThawaab ? 'Yes' : 'No'}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Daily Duas & Dhikr */}
                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Daily Duas & Dhikr
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateTarbiyahBool(t.day, 'dailyDuasDhikr', !t.dailyDuasDhikr)}
                        className={`w-12 py-0.5 rounded font-bold text-[11px] border ${
                          t.dailyDuasDhikr
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.dailyDuasDhikr ? 'Yes' : 'No'}
                      </button>
                    </td>
                  ))}
                </tr>

                {/* Daily Quran Wird */}
                <tr>
                  <td className="p-3 font-semibold text-slate-800">
                    Daily Quran Wird (Tilawah)
                  </td>
                  {currentTarbiyah.map((t) => (
                    <td key={t.day} className="p-2 text-center">
                      <button
                        type="button"
                        onClick={() => updateTarbiyahBool(t.day, 'dailyQuranWird', !t.dailyQuranWird)}
                        className={`w-12 py-0.5 rounded font-bold text-[11px] border ${
                          t.dailyQuranWird
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : 'bg-slate-100 text-slate-400 border-slate-200'
                        }`}
                      >
                        {t.dailyQuranWird ? 'Yes' : 'No'}
                      </button>
                    </td>
                  ))}
                </tr>

              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 4: Islamic Studies & Duas Evaluation (Bottom of Image 2) */}
      {activeSubTab === 'studies-eval' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-slate-900 text-base">
              Non-Hifz Weekly Curriculum Evaluation
            </h3>
            <p className="text-xs text-slate-500">
              Direct implementation of the bottom section of Image 2: Islamic Studies, Duas Memorisation, and Surah Memorisation with Teacher & Parent sign-off.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            {/* Box 1: Islamic Studies */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs uppercase">
                  Islamic Studies
                </span>
                <button
                  type="button"
                  onClick={() => updateWeeklyEvaluation({
                    islamicStudies: {
                      ...currentEvaluation.islamicStudies,
                      passed: !currentEvaluation.islamicStudies.passed
                    }
                  })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    currentEvaluation.islamicStudies.passed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Task Passed: {currentEvaluation.islamicStudies.passed ? 'Yes' : 'No'}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mt-2">
                  Teacher's Comments:
                </label>
                {isTeacher ? (
                  <textarea
                    rows={2}
                    value={currentEvaluation.islamicStudies.teacherComments}
                    onChange={(e) => updateWeeklyEvaluation({
                      islamicStudies: {
                        ...currentEvaluation.islamicStudies,
                        teacherComments: e.target.value
                      }
                    })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 mt-1"
                  />
                ) : (
                  <p className="text-xs text-slate-700 italic mt-1">
                    "{currentEvaluation.islamicStudies.teacherComments}"
                  </p>
                )}
              </div>
            </div>

            {/* Box 2: Duas Memorisation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs uppercase">
                  Duas Memorisation
                </span>
                <button
                  type="button"
                  onClick={() => updateWeeklyEvaluation({
                    duasMemorisation: {
                      ...currentEvaluation.duasMemorisation,
                      passed: !currentEvaluation.duasMemorisation.passed
                    }
                  })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    currentEvaluation.duasMemorisation.passed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Task Passed: {currentEvaluation.duasMemorisation.passed ? 'Yes' : 'No'}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mt-2">
                  Target Dua:
                </label>
                <p className="text-xs font-medium text-slate-800 mt-1">
                  {currentEvaluation.duasMemorisation.currentDua}
                </p>
              </div>
            </div>

            {/* Box 3: Surah Memorisation */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-xs uppercase">
                  Surah Memorisation
                </span>
                <button
                  type="button"
                  onClick={() => updateWeeklyEvaluation({
                    surahMemorisation: {
                      ...currentEvaluation.surahMemorisation,
                      passed: !currentEvaluation.surahMemorisation.passed
                    }
                  })}
                  className={`px-2.5 py-0.5 rounded text-[11px] font-bold border ${
                    currentEvaluation.surahMemorisation.passed
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-rose-100 text-rose-800 border-rose-300'
                  }`}
                >
                  Task Passed: {currentEvaluation.surahMemorisation.passed ? 'Yes' : 'No'}
                </button>
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mt-2">
                  Parents Comments:
                </label>
                {isParent ? (
                  <textarea
                    rows={2}
                    value={currentEvaluation.surahMemorisation.parentComments}
                    onChange={(e) => updateWeeklyEvaluation({
                      surahMemorisation: {
                        ...currentEvaluation.surahMemorisation,
                        parentComments: e.target.value
                      }
                    })}
                    className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 mt-1"
                  />
                ) : (
                  <p className="text-xs text-slate-700 italic mt-1">
                    "{currentEvaluation.surahMemorisation.parentComments}"
                  </p>
                )}
              </div>
            </div>

          </div>

          {/* Teacher and Parent Sign-off seals */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-600 font-semibold">Teacher's Signature:</span>
              {currentEvaluation.teacherSigned ? (
                <span className="px-3 py-1 rounded bg-emerald-100 text-emerald-800 font-bold text-xs flex items-center gap-1 border border-emerald-300">
                  <Check className="w-3.5 h-3.5" /> Verified by Ustadh
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => signEvaluation('teacher')}
                  className="px-3 py-1 rounded bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
                >
                  Sign as Teacher
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-xs text-slate-600 font-semibold">Parent's Signature:</span>
              {currentEvaluation.parentSigned ? (
                <span className="px-3 py-1 rounded bg-indigo-100 text-indigo-800 font-bold text-xs flex items-center gap-1 border border-indigo-300">
                  <Check className="w-3.5 h-3.5" /> Signed ({selectedStudent.parentName})
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => signEvaluation('parent')}
                  className="px-3 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs"
                >
                  Sign as Parent
                </button>
              )}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
