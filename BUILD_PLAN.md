# HifzTrack build plan (version 2)

Approved by Abu on 17 September 2026. Version 2 adds both developers' reviews of version 1, plus Decisions I to L.

Item numbers carry over from version 1, so some carry letters (25a, 34k). New design-gate items are numbered 50 to 58, and new building items 59 to 62.

## What changed in version 2

- Phase 3a now has three steps: a design gate (3a-0), the build (3a-1) and security tests (3a-2).
- Ten system rules now sit at the top of the plan.
- Decisions I to L cover devices, waiting marks, deleting students and text-message sign-in.
- Text-message sign-in moves to a later update (Phase 8).
- The audit checks grow from 11 to 35, and most of the new ones test the database directly.
- Every phase's "done when" list now has three layers: build, behaviour, and security.
- A new section lists what to settle or arrange before each phase.

---

## System rules

Everything else in this plan depends on these ten rules. *[Dev 1]*

- **I1.** Nobody can read a child's record unless the database allows it.
- **I2.** Nobody can add or change a child's record unless the database allows it.
- **I3.** Nothing the browser sends, such as a role, a student number or a parent number, can grant access.
- **I4.** Past reports never change when today's settings change.
- **I5.** A change made offline is never silently thrown away.
- **I6.** A change made offline is never silently overwritten by another change.
- **I7.** Every accepted change has a known author and a record on the server.
- **I8.** Signing out removes that person's readable data from a shared device. Locked waiting marks (item 34m) stay unreadable.
- **I9.** A child's records never become visible to someone just because an account, roll number or link changed.
- **I10.** Unknown information is shown as unknown, never as zero, passed or complete.

---

## Words used in this plan

- **Sabaq:** the new lesson a child memorises.
- **Sabaq para:** revision of recent lessons. Some madāris call it sabaq dawr.
- **Dawr:** revision of older paras. The app has two dawr sections, Dawr 1 and Dawr 2.
- **Para:** one of the 30 parts of the Qurʾān (juzʾ).
- **Quarter:** a quarter of a para.
- **Mushaf:** a printed copy of the Qurʾān. Page and line numbers depend on which mushaf is used.
- **Tarbiyah log:** a record of ṣalāh and good deeds.
- **Admin:** the person who manages settings, staff and families.
- **Switch:** an on/off setting on the admin page.
- **Database rules:** rules inside the online database that decide who may see or change each record.
- **Data layer:** the one part of the code that saves and loads data.
- **Offline working:** saving changes on the device when there is no internet, then uploading them later.
- **Phase:** a stage of the build that ends with something working that can be tested.
- **Design gate:** the step where the database design is written down and approved, before any database code is written.
- **Authority table:** the written list of who can do what, covering each role, each link and each action.
- **Revision:** one saved change to a record. A record's history is its list of revisions.
- **Clash:** two changes to the same part of a record, made from the same starting point.
- **Upload states:** the labels showing where a waiting change has got to.
- **Rule set:** a numbered set of scoring settings. Each report remembers which one it used.
- **Migration:** a saved file that makes one change to the database's structure.
- **Test project:** a second online database, filled with made-up children, used for building and testing.
- **DPIA:** a data protection impact assessment, a written check of the privacy risks and how they are handled.

## What the app is for

Teachers record each child's daily sabaq, sabaq para and dawr. Parents see only their own child's progress, and log home study and tarbiyah. The admin controls settings, staff and families. The app works on phones and computers, in English and Urdu, and keeps working when the Wi-Fi drops.

## Where this plan came from

- **Claude's audit** (17 September 2026): a code review, a build, and nine live browser tests.
- **Developer 1's review** of the original app, and **Developer 2's requests**: audio notes, calm phone-friendly screens, and Urdu and Arabic layouts.
- **Both developers' reviews** of version 1 of this plan.
- **Abu's decisions A to L**, including the assumptions he confirmed.

Each item shows where it came from: *[Dev 1]*, *[Dev 2]*, *[Claude]* or *[Decision]*.

---

## Locked decisions

**A. Who uses the app.** Teachers and parents, from the start.

**B. Scores, grades and trophies.** They stay, rebuilt properly.

**C. What counts towards grades and points.** A separate scoring engine with admin switches. Everything counts by default.
- One set of switches decides what counts towards grades; a separate set decides what earns trophy points.
- Changing a switch affects future grades only. Old reports keep the rules they were made with.
- A week with no home-study or tarbiyah entry scores zero for that part. Excused weeks are left out, and an app fault never counts as zero.

**D. How lessons are recorded.** In set fields, with defaults the admin can change.
- Sabaq: para → page → lines.
- Sabaq para: para → quarter.
- Dawr: para → quarter → page.
- "Sabaq dawr" is another name for sabaq para.
- Quarters use four tap-buttons.
- The 13-line mushaf is the default. The admin can switch to the IndoPak 15-line mushaf.

**E. Mistake types.** Each type is a separate counter with its own admin switch. Memory, fluency, tajwīd and mutashābihāt are on by default.
- Ghalṭī (error), aṭkan (stumble) and a single total counter are also available, off by default. Their labels show the English in brackets.
- The pass suggestion uses a limit on total mistakes, with optional limits for each type.

**F. How parents sign in.** Each method has its own admin switch.
- Email code is the default, and email and password is also available at launch.
- Text-message codes arrive in a later update (Decision L).
- Children don't get their own logins. They view their records through a parent's account.

**G. When the Wi-Fi drops.** Offline working is built in, with an admin switch. By default the app works online. If the connection drops, changes save on the device and upload when it returns, with a pop-up each way.
- Teachers own marks and attendance. Parents own home study, tarbiyah entries and signatures.
- If two people change the same thing, the app keeps both and asks which is right.
- The admin can change who has authority over marks.
- After signing in, a person can work offline for up to 7 days.
- A warning appears if changes have waited more than 24 hours to upload.

**H. Languages.** English and Urdu at launch. Arabic in a later update.

**I. Devices.** Teachers can mark lessons on their own phones and on shared madrasah tablets. Parents always use their own phones.

**J. Waiting marks on shared tablets.** An admin switch decides.
- By default, a teacher can't sign out until their waiting marks have uploaded.
- The alternative locks the marks away on the tablet until that teacher signs in there again.

**K. Deleting a student.** Everything about the child is deleted straight away, after a final report has been made.

**K2. The final report** goes to both the parents and the madrasah.

**L. Text-message sign-in** comes in a later update (Phase 8). It is not built now.

**Build order:** 0 → 1 → 2 → 3a-0 → 3a-1 → 3a-2 → 3b → 4 → 5 → launch → 6 → 7 → 8.

**Launch line.** Real use with children's data starts only when Phases 0 to 5 are finished and checked, including every part of Phase 3, with Urdu switched on.

---

## Working rules

1. Never present a feature as working unless it is built and tested.
2. Never describe a security feature, such as encryption, unless it has been checked in the live setup. *[Dev 1]*
3. Never send children's data to outside services, apart from the approved ones: Cloud SQL (PostgreSQL), Firebase Authentication, the email service and the hosting service.
4. Never use real children's data while building or testing. Use the test project.
5. Never change the live database by hand. Every change to its structure is a migration saved in GitHub. *[Dev 1]*
6. Never start Phase 3a-1 until DESIGN_GATE.md has been approved by Abu.
7. From Phase 4 on, change screens and workflow only, never the data design. *[Dev 1, Dev 2]*
8. Never add a feature this plan doesn't include without asking Abu first.
9. Build phase by phase, in order, and finish each phase's checks before starting the next.

## House style

- Islamic terms use full diacritics (ḥifẓ, Qurʾān, ṣalāh, tajwīd, mutashābihāt), taken from one spelling list used everywhere.
- ﷺ follows every mention of the Prophet, and ﷻ follows Allāh.
- Every ḥadīth has a reference.
- No pictures, icons or emoji showing people, faces, eyes, hands or animals. Use books, buildings, pens, locks and geometric shapes instead.
- Urdu uses Noto Nastaliq Urdu with extra line spacing.
- Arabic uses Amiri or Scheherazade New. Amiri lacks the newer honorific symbols (Unicode range U+FD40 to U+FD4F), so use Scheherazade New wherever those appear.
- No monospace fonts in the interface.
- Plain, warm wording, with no claims the app can't back up.

---

## Before each phase: what to settle or arrange

**Before Phases 0 to 2:** nothing blocks them. They can start now.

**Before the design gate (3a-0):**
- Name the madrasah's data protection lead, and complete item 35a.
- Set how long the madrasah keeps its copies of final reports (Decision K2).
- Create the Cloud SQL, Firebase Auth, email-service and deployment accounts in the madrasah's name. Turn on two-step sign-in, and add a second trusted admin to each.
- Choose Google Cloud's London region (europe-west2) when creating database projects.
- Choose the email service, and arrange access to the madrasah's web address settings (DNS).
- Use Cloud SQL Developer tier for the test environment, and budget for production before launch.
- Ask Developer 2 to draft DESIGN_GATE.md, and Developer 1 to check it.

**Before Phase 3b:**
- Draft the staff device-use policy (item 32d).

**Before Phase 4:**
- Choose the exact 15-line IndoPak printing.
- Have one teacher type where each para starts in both mushafs, and a second teacher check it.

**Before Phase 5:**
- Book the fluent Urdu reviewer.

**Before launch:** see the launch checklist.

## Running costs

- **Claude:** a paid plan (Pro or above) for Claude Code.
- **Cloud SQL & Firebase Auth:** Cloud SQL Developer edition with scale-to-zero free tier and automated backups. Firebase Authentication with email verification and token revocation.
- **Hosting:** Node/Express deployment with secure HTTPS.
- **Email service:** the cost depends on the service chosen.
- **Text messages:** none until Phase 8.

---

## Phase 0: Setup lesson

**Goal:** the app running on Abu's computer, safely backed up.

- **1.** Pause changes in AI Studio, so GitHub holds the one master copy. *[Claude]*
- **2.** Install the Claude desktop app and the helper tools, then open the project and run it on the computer. *[Claude]*
- **3.** Put this plan and CLAUDE.md in the project folder, so every Claude Code session follows them. *[Claude]*
- **3a.** Replace the "clean" command. It uses a Mac and Linux command that fails on Windows. *[Claude]*

**Done when:**
- **Build:** the app opens at http://localhost:3000, and the type check shows only the three known errors that Phase 1 fixes.
- **Behaviour:** CLAUDE.md and BUILD_PLAN.md are saved in the GitHub repository.
- **Security:** no passwords or keys are saved in the repository.

---

## 🔴 Phase 1: Safe and truthful

**Goal:** a safe, honest demo, built on the current app before any online database.

- **4.** Remove every fallback that shows another child's records. *[Dev 1, Claude]*
  - Where: in HifzContext.tsx, visibleStudents falls back to the first child for parents and to every child for teachers. Lesson, home-study, tarbiyah, parent-task and weekly-evaluation records fall back to the sample student std-1.
- **5.** Show "No records yet" wherever there is nothing to show, and add a safety net so one error shows a message instead of a blank page. *[Claude]*
  - Where: DashboardView and QuickAssessmentModal assume records exist. In testing, marking a student with no records blanked the whole app.
- **6.** New students start empty: lessons are "not yet assessed" and attendance is "not yet marked". *[Dev 1, Claude]*
  - Where: addStudent copies std-1's week, marks every lesson passed and every day present, and copies home study and tarbiyah. In testing, this gave a brand-new student 99/100 (A+).
- **7.** Use real dates. "Today" follows UK time (Europe/London), with a "Start today's record" button and a week picker. Remove every fixed date. *[Dev 1, Claude]*
  - Where: AttendanceView, DashboardView, DailyHifzLogView and QuickAssessmentModal treat Wednesday as today. Fixed dates appear as "14 / 09 / 2026", "19 / 09 / 2026" and "Week Commencing 14 September 2026". Nothing in the code creates a new day or week.
- **8.** A page refresh keeps everyone in their own role. *[Claude]*
  - Where: the user role isn't saved, so it resets to "teacher" on refresh while the parent portal stays open. In testing, a parent gained 24 mark-editing buttons.
- **9.** Remove false claims. *[Dev 1, Claude]*
  - Where: the Security Architecture screen, and wording such as "Zero-Leak", "AES-256", "TLS 1.3", "OAuth", "GDPR-K", "Encrypted & Live", "verified", "delivered", "dispatched", and the "Official Hifz Board Verified" seal.
- **10.** Remove pretend features and unused add-ons. *[Dev 1, Claude]*
  - Where: the timed sync (triggerManualSync), the Google setup (handleInitializeGoogleHub), the simulated email sending, and the security "handshake". The unused packages are @google/genai, express, dotenv and motion; check nothing uses them before removing them.
- **11.** Emails say "Prepare email", use the parent's stored address, and don't promise audio notes yet. *[Dev 1, Claude]*
  - Where: formatEmailReportText builds a Gmail address from the parent's name and mentions audio notes.
- **12.** Switch off the Urdu-to-English translator. *[Dev 1, Claude]*
  - Where: translationHelper.ts sends text to Google Translate, and its keyword matching flips meanings. In testing, "today's sabaq was not very good" became "Very well done." No screen uses it yet; keep it that way, or remove it.
- **13.** Stop-gap login fixes until Phase 3a: teacher login rejects anything that doesn't match, login boxes start empty, and no passcodes appear on screen. *[Claude]*
  - Where: the admin box is pre-filled with the real passcode, the login page shows 1234 and 9999, an error message reveals the default passcode, and teacher login accepts any text.
- **14.** Fix the three type errors in the trophy file. The full rebuild is item 25e. *[Dev 1, Claude, Decision B]*
  - Where: meritTrophies.ts imports types that don't exist, and reads fields the app never records.
- **15.** Sample data uses @example.com addresses, with a clear "Demo data" label and a one-tap clear button. *[Claude]*
- **16.** Move all saving and loading into one data layer. *[Claude, Dev 1]*
  - No screen talks directly to the backend database, device cache or browser storage directly. Screens ask the data layer (`apiClient.ts` / `dataRepository.ts`), which hides whether a save went online, joined the waiting list, clashed or failed.
  - Design it for later phases: record IDs are created on the device, times are stored in UTC, and each change is saved as a revision (item 52).
- **17.** Correct the ḥadīth, and keep the same one on a given report. *[Dev 1, Claude]*
  - Suggested wording, for Abu to approve:
    - The Prophet ﷺ said: "The best of you is the one who learns the Qurʾān and teaches it." (Ṣaḥīḥ al-Bukhārī, 5027)
    - The Prophet ﷺ said: "Whoever reads a letter from the Book of Allāh ﷻ will have a good deed for it, and a good deed is rewarded ten times over." (Jāmiʿ al-Tirmidhī, 2910)
    - The Prophet ﷺ said: "It will be said to the companion of the Qurʾān: 'Recite and rise…'" (Sunan Abī Dāwūd, 1464)
  - Where: hifzCalculations.ts picks a quote at random each time the screen refreshes.
- **17a.** Approved ḥadīth live in a small numbered file. Each entry has its Arabic wording, approved translation, source, number and approval date. A report stores the number of the ḥadīth it showed, so editing the file never changes an old report. *[Dev 1]*

**Done when:**
- **Build:** the type check shows no errors, and the build succeeds.
- **Behaviour:** audit checks marked Phase 1 pass, and no screen claims encryption, syncing or sending that doesn't happen.
- **Security:** no screen shows another child's records, and a new student has no invented results.

---

## 🟠 Phase 2: Honest scores and reports

**Goal:** grades and reports that can be trusted and printed.

- **18.** One shared set of calculations for every screen and export, with attendance counted the same way everywhere, including excused absences. *[Dev 1, Claude]*
  - Where: calculateWeeklySummary leaves out excused days, and the export uses a different attendance formula.
- **19.** "Not assessed" shows a dash, never 100%. No records means no grade. *[Dev 1, Claude]*
  - Where: pass rates default to 100% when nothing was assessed. In testing, a student with no records scored 76/100 (B).
- **20.** The app suggests "pass" or "repeat" from the mistake limits (item 42d), and the teacher has the final say. There is one home-study target. *[Claude]*
  - Where: the mistake limits, pass mark and daily home-study target are saved but never used, and three different weekly targets appear (4, 4½ and 5 hours).
- **21.** The weekly report puts plain words first ("Sabaq: strong. Dawr: needs reinforcement"), then the teacher's focus for next week, then the numbers. *[Dev 1]*
- **22.** Ṣalāh at home scores the same as ṣalāh in the masjid, so girls, and children who pray at home, aren't marked down. *[Dev 1, Claude]*
  - Where: the tarbiyah score gives 2 points for the masjid and 1 for home. In testing, a perfect week at home scored 64%.
- **23.** Home study is labelled "parent-confirmed", never "verified". *[Dev 1]*
- **24.** Roll numbers are unique and never reused. *[Claude]*
  - Where: new roll numbers come from the number of students, so a deletion can create duplicates. Roll numbers also work as parent logins until Phase 3a.
- **25.** The Excel export shows Arabic and Urdu correctly, stops cell contents running as formulas, and covers the dates chosen. *[Claude, Dev 2]*
- **25a.** One scoring rulebook sets out what counts and how much. It lives in the admin settings, and the app explains it on screen in plain words. *[Claude]*
  - Phase 2 starts with these provisional values from the current code, which staff confirm before launch:
    - Weights: sabaq 25, sabaq para 20, dawr 25, attendance 15, home study 8, tarbiyah 7.
    - Grade boundaries: 90, 80, 70 and 60.
- **25b.** Only real assessments count. Until a child has enough assessed lessons that week (provisionally three), the app shows "Not enough data yet" instead of a grade. *[Dev 1, Claude]*
- **25c.** Grade boundaries come from the grading setting, and the same boundaries apply everywhere. *[Claude]*
  - Where: the code uses 92/82/70/60, while the setting says 90/80/70/60.
- **25d.** A teacher can change a grade, and the reason is saved in the change log. *[Claude]*
- **25e.** Trophy points are rebuilt from the real records. Points come only from assessed work, and trophies sit in a tap-to-open section. *[Dev 1, Claude, Decision B]*
- **25f.** Parents never see class rankings or comparisons. *[Claude]*
- **25g.** Every trophy title gets a wording check before launch. *[Claude]*
  - Ḥāfiẓ al-Amānah (150 points): "Ḥāfiẓ" is the title earned by completing the whole Qurʾān, so using it this early may confuse children and parents.
  - Tāj al-Waqār (the top title): ḥadīth use this phrase for an honour in the Hereafter, for example for the martyr (Jāmiʿ al-Tirmidhī, 1663).
- **25h.** A separate scoring engine, in its own file, works out grades and trophy points. *[Decision C]*
- **25i.** Admin switches for sabaq, sabaq para, dawr, attendance, home study and tarbiyah. All are on by default. *[Decision C]*
- **25j.** One set of switches for grades, and a separate set for trophy points. *[Decision C]*
- **25k.** The admin sets how much each part counts. When a part is switched off, the rest rebalance to 100%. Weights are stored as exact fractions and rounded only for display, so every screen agrees. *[Claude, Dev 1]*
- **25l.** Scoring settings are saved as numbered rule sets. Each weekly report stores its rule set's number, so switch changes only affect future grades. Every switch change goes in the change log. *[Claude, Dev 1]*
- **25m.** A week with no home-study or tarbiyah entry scores zero for that part. An excused or not-applicable week is left out. A technical fault never counts as zero. *[Decision C, Dev 1]*
- **25n.** Each report tells parents which parts counted that week. *[Claude]*

**Done when:**
- **Build:** the type check shows no errors, and the build succeeds.
- **Behaviour:** excused absences never lower attendance, reports say which parts counted, and the Excel export opens in Excel on Windows with Arabic and Urdu intact.
- **Security:** audit checks marked Phase 2 pass.

---

## 🔵 Phase 3a-0: Design gate

**Goal:** the database design is written down, checked and approved before any database code is written. *[Dev 1, Dev 2]*

The design is saved as DESIGN_GATE.md. Developer 2 drafts it, Developer 1 checks it, and Abu approves it.

- **35a.** Before the design starts, the data protection lead lists every piece of data the app will hold. *[Dev 1, Dev 2]*
  - For each piece: why it's needed, who can see it, how long it's kept, whether it's stored on devices, and whether any outside service receives it.
  - The list also records the lawful basis, and the extra condition needed for records of religious practice, such as the tarbiyah log.
  - This is a starting list, not legal advice. The data protection lead confirms what applies.
- **50.** The authority table: who can do what. *[Dev 1, Dev 2]*
  - Three things are kept separate: **roles** (admin, teacher, parent), **links** (parent to child, teacher to circle, admin to the whole madrasah) and **actions** (view, add, change, delete, approve, override, export).
  - For every table and field, it lists the role, link, action and condition that allow access.
  - It covers marks, attendance, home study, tarbiyah, signatures, parent links, circle membership, settings, notifications, the change log, reports, final reports and voice notes.
  - It says who may resolve clashes, and which actions the admin can switch (items 29 and 34k).
- **51.** The data design. It lists every table, with the reason each field exists. *[Dev 1, Dev 2]*
  - Tables: students, parents (more than one per child), teachers, circles, lessons, attendance, home study, tarbiyah, signatures, notifications, reports, rule sets, settings, approved ḥadīth and voice-note records.
- **52.** The history design. *[Dev 1, Dev 2]*
  - Each record holds its current value plus a list of revisions.
  - A revision saves only the fields that changed. It also saves the author, device, device time, server time, the version it started from, and its status.
  - IDs are created on the device, and every change carries a unique key, so a retried upload can never create a duplicate.
  - A written rule explains how the current value is worked out from accepted revisions.
- **53.** The clash design. *[Dev 1, Dev 2]*
  - A clash happens when two changes touch the same field from the same starting version. This applies to marks, attendance and parent-owned entries alike.
  - A clash record keeps both versions, with their authors, times, devices and changed fields. It also records who resolved the clash, why, and the final value.
  - Resolving a clash adds a new revision. It never erases either original change.
- **54.** The lesson, mistake and mushaf design, from Decisions D and E. *[Dev 1, Dev 2]*
  - Every lesson record stores the mushaf version, para, quarter, page and line.
  - Mistake counters are stored by type. Section names and field switches are admin settings.
  - Phase 4 builds screens on this design and may not change it.
- **55.** The scoring and report design. *[Dev 1, Dev 2]*
  - Rule sets are numbered. Each holds the weights (as exact fractions), grade boundaries, mistake limits and switches.
  - Each weekly report stores its rule set number, the number of the ḥadīth it showed, and its figures.
- **56.** The offline design. *[Dev 1, Dev 2]*
  - **What each device stores.**
    - Teachers: their assigned students, the current week, the recent history needed for class, and their waiting changes.
    - Parents: their own children, recent reports, their own entries, and their waiting changes.
    - Admin: as little as possible.
  - **Upload states** (item 34l).
  - **What happens when the offline limit ends** (item 34o).
  - **What happens when someone's access is removed while they're offline** (item 34p).
  - **Device type:** personal phone or shared tablet (item 32a).
- **57.** The deletion design, from Decisions K and K2. *[Dev 1, Dev 2]*
  - It lists everything that is deleted, including stored files.
  - It covers the final report, the one anonymous change-log line, and how marks for a deleted child that arrive later are refused.
- **58.** DESIGN_GATE.md is approved. No Phase 3a-1 code starts before this. *[Dev 1, Dev 2]*

**Done when:**
- DESIGN_GATE.md covers items 50 to 57, Developer 1 has checked it, and Abu has approved it.
- Item 35a is complete.

---

## 🔵 Phase 3a-1: Online database and logins

**Goal:** a real app that teachers and parents can use on their own devices, while online, built against the test project with made-up children.

- **26.** Google Cloud SQL (PostgreSQL with Drizzle ORM) provides the persistent database, and Firebase Authentication handles user identity and token lifecycle, in the London region. *[Dev 1, Claude]*
- **26a.** Connect a verified email-sending service for madrasah communications and attendance alerts. *[Claude]*
- **26b.** Cloud SQL Developer tier with automated backups and failover. *[Claude]*
- **27.** Real accounts for the admin, teachers and parents. *[Dev 1, Claude]*
- **27a.** Parents can only sign in with the email address the madrasah holds for them, after the admin sends an invitation. *[Claude]*
- **27b.** A child can have more than one parent account, for example mother and father. *[Claude]*
- **27c.** Children don't get their own logins. *[Claude, confirmed by Abu]*
- **27d.** The admin signs in with a password plus a code from an authenticator app. Teachers can be switched onto this too. *[Claude]*
- **27e.** Each sign-in method has its own admin switch. At launch there are two: email code (on by default) and email and password. Text-message code arrives in Phase 8. *[Decision F, Decision L]*
- **27f.** The sign-in screen shows only the methods that are switched on. *[Claude]*
- **27g.** Before a method is switched off, the admin sees how many parents rely on it, so nobody gets locked out. *[Claude]*
- **28.** Database rules put the authority table (item 50) into force. *[Dev 1, Claude]*
  - Parents see only their own children, and teachers see only their own circle.
  - Only the people allowed under item 34k change marks.
  - Only the admin manages accounts and settings.
- **28a.** Every table that holds protected data has database rules switched on. *[Dev 1]*
- **28b.** Access always comes from the signed-in account and its links, never from a student number or other ID sent by the browser. *[Dev 1]*
- **28c.** Reading, adding, changing and deleting each have their own rules and their own tests. *[Dev 1]*
- **28d.** Roles are held on the server. Changing browser storage can never raise anyone's role. *[Dev 1]*
- **28e.** Teacher-to-circle links are stored in the database. *[Dev 1]*
- **28f.** Parent-to-child links are stored in the database, so a child can have several parents and a parent several children. *[Dev 1]*
- **28g.** Roll numbers are for display, search and printing only, and never grant access. *[Dev 1]*
- **28h.** Admin actions need the second sign-in step (item 27d) to be completed. *[Dev 2]*
- **29.** The database checks every change against the authority table. The admin switches change only the actions marked as switchable there. *[Dev 1, Dev 2]*
  - Where: only 6 of the app's 28 switches are checked anywhere, and the data actions don't check roles.
- **30.** A change log records who changed what, and when. Ordinary users can't edit or delete it. *[Dev 1, Dev 2]*
- **31.** Each notification is addressed to one person, and people see only their own. Notifications never contain another family's details. *[Claude, Dev 1]*
  - Where: every user currently sees every notification, including enrolment notices showing another family's email address and login code.
- **31a.** Parents get a reminder in the app before the week closes if they haven't logged home study or tarbiyah. Missing entries score zero (Decision C). *[Claude, approved by Abu]*
- **32.** Signing out really signs out. *[Claude]*
- **32a.** At sign-in, the app notes whether it's on a personal phone or a shared madrasah tablet. The admin can mark tablets as shared. *[Decision I]*
- **32b.** Shared tablets sign out sooner when left unused (an admin setting), have no "stay signed in" option, and follow item 34h at every sign-out. *[Decision I]*
- **32c.** On personal phones, staff policy requires a screen lock. The admin can remove a teacher's access at once if they leave or lose their phone. *[Decision I]*
- **32d.** A short device-use policy for staff, covering both kinds of device. Abu arranges this before Phase 3b. *[Claude]*
- **32e.** An app lock (PIN or Face ID) on teachers' own phones, since family members often use them. *[Claude, approved by Abu]*
- **33.** Deleting a student is admin-only and online-only, and needs a typed confirmation. Everything about the child is deleted at once, including stored files and voice notes. *[Decision K]*
- **33a.** Before deleting, the app emails a final report (PDF) to every parent account on file. The admin must also download the madrasah's copy before the delete button unlocks. If a parent's email fails, deletion waits until the admin fixes the address. *[Decision K, Decision K2]*
- **33b.** The final report is a summary: where the child has reached in the Qurʾān, paras completed, attendance and grades, and the teacher's last note. Tarbiyah entries are left out unless the admin includes them. *[Claude]*
- **33c.** The change log keeps one line with no details about the child: "a student record was deleted by [admin] on [date]". *[Claude]*
- **33d.** Saved class totals that contain no names stay as they are, so past class reports don't change. *[Claude]*
- **33e.** Marks for a deleted child that arrive later from an offline device are refused, and the teacher sees a message. *[Claude]*
- **33f.** Cloud SQL's automated backups and transaction logs retain snapshots, with restore instructions documented in `docs/ops/RESTORE.md`. *[Claude]*
- **33g.** For a formal deletion request, the admin can skip the madrasah's copy after checking with the data protection lead. *[Claude, approved by Abu]*
- **35b.** Before launch, the DPIA is finished and parents receive the privacy notice. *[Dev 1, Dev 2]*
- **36.** The app goes online at a secure (HTTPS) address on Netlify. *[Claude]*
- **36a.** A separate test site uses the test project. The live site is set up only after Phase 3a-2 passes. *[Dev 1]*
- **59.** Every change to the database's structure is a numbered migration file saved in GitHub. *[Dev 1]*
- **60.** Cloud SQL test instance, filled with made-up children, is used for building and security tests. *[Claude, Dev 1]*
- **61.** Repeated wrong codes or passwords slow down or lock further attempts. *[Dev 2]*
- **62.** Backups: a written restore procedure, and a test restore into the test project before launch. *[Dev 1]*

**Done when:**
- **Build:** the type check and build succeed, and every migration applies cleanly to the test project.
- **Behaviour:** a parent on their own phone sees their own children, and a teacher sees their own circle. Before a deletion, the final report reaches both the parents and the madrasah.
- **Security:** Phase 3a-2 covers this.

---

## 🔵 Phase 3a-2: Security tests

**Goal:** prove the database rules hold before any real child's data goes in. *[Dev 1, Dev 2]*

- Run audit checks 12 to 23 directly against the test project's database, signed in as each role.
- Fix any failure and test it again before moving on.

**Done when:** audit checks 12 to 23 all pass on the test project.

---

## 🔵 Phase 3b: Offline working

**Goal:** class carries on when the Wi-Fi drops, built on the design from items 52, 53 and 56.

- **34.** Offline working is built in, with an admin switch. By default the app works online. When the connection drops, changes save on the device and upload when it returns. *[Decision G]*
- **34a.** With the switch off, the app falls back to "warn and try again". *[Decision G]*
- **34b.** A pop-up appears when the connection drops ("Offline: changes are saved on this device") and when it returns ("Back online: uploading… All changes saved"). *[Decision G]*
- **34c.** A small counter always shows how many changes are waiting, and warns if any have waited more than 24 hours. *[Claude, confirmed by Abu]*
- **34d.** Every change is saved as a revision instead of overwriting what was there, so nothing is lost. *[Claude, Dev 1]*
- **34e.** Teachers own marks and attendance. Parents own home study, tarbiyah entries and signatures. Clashes keep both changes and ask which is right, for marks, attendance and parent entries alike. *[Claude, Dev 2, confirmed by Abu]*
- **34f.** Device time is recorded for information only. The server's time and the version numbers decide the order of changes. *[Dev 1, Dev 2]*
- **34g.** The first sign-in needs internet. After that, a person can work offline for up to 7 days, which the admin can change. The server's own inactivity limit is set to match. *[Claude, Dev 2, confirmed by Abu]*
- **34h.** Signing out never loses waiting marks. *[Decision J]*
  - On a personal phone, sign-out waits until the marks have uploaded.
  - On a shared tablet, the admin switch decides. By default the tablet shows a "waiting to upload" screen, uploads when the Wi-Fi returns, then signs the teacher out. Automatic sign-out follows the same rule.
- **34i.** Fonts and app files are stored on the device, so the app opens with no internet. The waiting list lives in the device's own database and survives closing the app. *[Claude, Dev 2]*
- **34j.** From this phase on, every phase ends with an airplane-mode test on Abu's iPhone. *[Claude]*
- **34k.** The admin can change who has authority over marks, for example letting cover teachers mark, or deciding whose change wins a clash. Item 34e is the default. *[Decision G]*
- **34l.** Every waiting change shows one of five states: saved on this device, uploading, uploaded, failed, or needs attention. *[Dev 1]*
- **34m.** When the switch is set to "lock marks away", the tablet keeps only the waiting marks, never the teacher's student list. *[Decision J, Claude]*
  - The marks are locked with a key that leaves the tablet when the teacher signs out, so nobody else can read them.
  - The key returns when that teacher signs in again, and the marks upload then.
  - If that teacher never signs in on the tablet again, the marks can't be recovered. That's why item 34n matters.
- **34n.** The admin can see which tablets hold locked marks, whose they are, and how long they've been waiting. *[Claude]*
- **34o.** When the 7-day offline limit ends, the app locks and asks the person to reconnect. Waiting marks stay safe and upload once it's back online. *[Claude]*
  - A read-only mode is deliberately not used, because it would still show children's data after someone's access might have been removed.
- **34p.** Offline access is a temporary permission, not a permanent one. *[Dev 1]*
  - Nobody can download new students or new permissions while offline.
  - When the device reconnects, any removal of access takes effect at once.
  - Changes queued by someone whose access was removed go to the admin to decide, rather than into the records.
- **34q.** The app asks the device to protect its stored data. On iPhones this has been possible since Safari 17, and it needs notification permission. *[Claude]*

**Built for iPhones:**
- iPhones don't let web apps upload in the background, so waiting changes only upload while the app is open. The "back online" pop-up covers this.
- Teachers use the home-screen app only, never a Safari tab. The two keep separate stored data, and the home-screen app's data is better protected.
- Offline features and the microphone only work on a secure (HTTPS) address, so iPhone tests use the online test site, not the computer's local address.

**Done when:**
- **Build:** the type check and build succeed.
- **Behaviour:** with airplane mode on, a teacher can mark a lesson; with it off, the change uploads and the counter returns to zero. Both pop-ups appear, and the home-screen app opens with no internet.
- **Security:** audit checks 27 to 34 pass, on both a personal phone and a shared tablet, with the Decision J switch in both positions.

---

## 🟢 Phase 4: Calm, teacher-first screens

**Goal:** fast, uncluttered screens for live class, for teachers and parents.

This phase changes screens and workflow only. The data design from items 51 to 57 stays as it is. *[Dev 1, Dev 2]*

- **37.** A "Today" screen shows one student at a time: Sabaq → Sabaq Para → Dawr → note → "Save & Next". *[Dev 1, Dev 2]*
- **38.** Extras sit under tap-to-open sections on teacher and parent screens, with a simple student list and a history page. *[Dev 1, Dev 2]*
- **39.** Screens are easy to read on phones: bigger text and buttons, and pinch-to-zoom switched back on. Each screen is checked on Abu's iPhone and at Android size. *[Dev 2, Claude]*
  - Where: 277 places use 9–11px text, and index.html blocks zooming.
- **40.** A "repeat tomorrow" list, colour-coded red, amber and green. *[Dev 1]*
- **41a.** Each section saves para, quarter, page and line numbers instead of free text, so the app can add up progress. *[Decision D]*
- **41b.** Default fields: sabaq uses para, page and lines; sabaq para uses para and quarter; dawr uses para, quarter and page. *[Decision D]*
- **41c.** Admin switches choose which fields each section shows. Old records keep the fields they were saved with. *[Decision D]*
- **41d.** Drop-down lists for para (1–30), then only that para's pages, then lines (1–13, or 1–15 with the 15-line mushaf). A sabaq can run from one page onto the next. *[Decision D]*
- **41e.** Quarters appear as four tap-buttons. Tapping the quarters recited records both how much and which part. *[Claude, confirmed by Abu]*
- **41f.** Today's sabaq starts where the last one ended, already filled in. The teacher only picks where it stops. *[Claude]*
- **41g.** A mushaf setting: 13-line by default, with the IndoPak 15-line mushaf as the admin's alternative. The page and line lists follow it. *[Decision D]*
  - Each mushaf needs a table of where every para starts and ends. One teacher types it from the physical book, and a second teacher checks it. The 13-line boundaries are the same ones being checked for the Quran Review App.
  - Records keep the mushaf they were saved with. If the setting changes mid-year, para and quarter totals carry on, but page and line totals start again.
- **41h.** The admin can rename the sections, for example to Sabaq Dawr or Sabqī. Today's names are the defaults. *[Claude]*
- **41i.** Progress totals for each week and term: lines and pages memorised, and paras revised. *[Claude]*
- **41j.** An optional note box for anything the lists can't capture. *[Claude]*
- **42a.** Each mistake type is a separate counter with its own admin switch. Memory, fluency, tajwīd and mutashābihāt are on by default. *[Decision E]*
- **42b.** Ghalṭī, aṭkan and a single total counter are also available, off by default. Their labels show the English in brackets: "Ghalṭī (error)" and "Aṭkan (stumble)". In Urdu, the Urdu word stands alone. *[Decision E]*
- **42c.** Each type has a one-line definition on screen, so every teacher counts the same way. *[Dev 1]*
  - Memory: forgot, skipped or needed a prompt.
  - Fluency: hesitated or kept stopping.
  - Tajwīd: pronunciation or recitation rules.
  - Mutashābihāt: mixed up with a similar āyah.
- **42d.** The pass suggestion uses a limit on total mistakes, with optional limits for each type, set by the admin. *[Claude, confirmed by Abu]*
- **42e.** Only the section being heard is open, with its counters in a compact grid and the total shown. *[Claude, Dev 2]*
- **42f.** Weekly reports show which mistake type came up most, and where. *[Dev 1]*
- **42g.** The admin decides whether parents see the full breakdown or just the total. *[Claude]*
- **42h.** Old records keep the counters they were saved with. *[Claude]*
- **43.** House style: icons without people, faces, eyes or hands, and one spelling list for all terms. *[Claude]*
  - Where: the User, Users, UserCheck, UserPlus, HeartHandshake, Eye and EyeOff icons, the writing-hand emoji on the welcome guide, and monospace text.
- **43a.** Section names carry a short English explanation in brackets, as the current app's legend already does. *[Claude, approved by Abu]*

**Done when:**
- **Build:** the type check and build succeed.
- **Behaviour:** a teacher can mark one student fully and press "Save & Next" without sideways scrolling, at iPhone and Android sizes. Lesson fields use drop-downs, today's sabaq starts where the last ended, and switching to the 15-line mushaf changes the line list to 1–15.
- **Security:** every earlier audit check still passes, and the data design is unchanged.

---

## 🟣 Phase 5: Urdu (before launch)

**Goal:** every screen works in Urdu.

- **44a.** Urdu is ready at launch, with every screen checked right-to-left on phone and computer. *[Decision H]*
  - Where: the translations already exist (APP_TRANSLATIONS in appTranslations.ts), but no screen uses them. In testing, the Urdu button changed nothing.
- **44c.** A fluent Urdu speaker checks the translations as each screen is finished, not all on the last day. This includes the names the admin can edit: sections, mistake types and trophy titles. *[Claude, Dev 1, Dev 2]*
- **44d.** Each person chooses their own language, and the app remembers it. *[Claude]*
- **44e.** Mixed text displays in the right order, for example an English name inside an Urdu sentence. *[Claude]*
  - Where: the Arabic subtitle in the header already shows its brackets out of order.
- **45.** Fonts follow the house style and are stored on the device for offline use. *[Dev 2, Claude]*
  - Where: index.html currently loads only Amiri and Plus Jakarta Sans.
- **46.** Every tab, button and border is checked for spilling text, in English and Urdu, on phone and computer. *[Dev 2]*
- **46a.** Automatic screenshot checks of the right-to-left layout cover short labels, long labels, numbers, dates, English names inside Urdu, Arabic inside Urdu, punctuation, drop-downs, tables and the Excel export. *[Dev 1]*

**Done when:**
- **Build:** the type check, build and screenshot checks pass.
- **Behaviour:** every Urdu screen reads right-to-left with no spilling text, and mixed text is in the right order.
- **Security:** every earlier audit check still passes with the app in Urdu.

---

## ✅ Launch checklist

Real use with children's data starts only when all of these are done:

- Phases 0 to 5 are finished, and every phase's checks pass.
- Audit checks 1 to 34 pass, and check 35 (the test restore) has been done.
- Item 35b is complete: the DPIA is finished, and parents have the privacy notice.
- Cloud SQL production instance is active, and the email service sends from the madrasah's address.
- A staff mashwarah has agreed the scoring weights, grade boundaries, trophy titles and mistake definitions, replacing the provisional values in item 25a.
- Abu has approved the ḥadīth wording for the approved-content file (item 17a).
- A fluent Urdu speaker has signed off the translations.
- The staff device-use policy is agreed (item 32d).
- Staff have had a short session on signing out, lost phones, the offline pop-ups, waiting marks on shared tablets, and using the home-screen app on iPhones.
- The office has a plan to help families who can't use email, until text-message sign-in arrives in Phase 8.
- The demo data is cleared, and the live site uses only the live database.

---

## 🟤 Phase 6: Audio notes (after launch)

- **47.** Teachers can record a short voice note for a session, with a clear "recording" sign. *[Dev 2]*
- **48.** Notes are stored privately. Only that child's teacher and parents can play them, on iPhone and Android. A note recorded offline uploads when the connection returns. *[Dev 2, Claude, Decision G]*
- **48a.** Stored files have their own access rules, separate from the database rules. A teacher being allowed to see a child never by itself grants access to the file. *[Dev 1]*
- **49.** Notes delete themselves after a set time, chosen when this phase starts. Deleting a student removes their notes at once (item 33). *[Claude]*

**Done when:**
- **Build:** the type check and build succeed.
- **Behaviour:** a note recorded on an iPhone plays on Android, and the other way round. A note recorded offline uploads when the connection returns.
- **Security:** a direct request for another child's file is refused, tested the same way as the database checks.

## Phase 7: Arabic (later update)

- **44b.** Arabic arrives with the same checks as Phase 5, including the screenshot checks. Its translations stay switched off until then. *[Decision H]*

## Phase 8: Text-message sign-in (later update)

- **27h.** A text-message provider that integrates with Firebase Auth SMS, such as Twilio or Google Cloud Identity Platform, is set up in the madrasah's name. *[Decision L]*
- **27i.** Parents' mobile numbers are checked, and the admin page shows which numbers have been confirmed. *[Claude]*
- **27j.** Codes go only to UK mobile numbers, and only a limited number can be sent each hour, so nobody can misuse the sign-in page to run up the bill. *[Claude]*
- **27k.** The provider is added to the DPIA, and its data-processing agreement is signed, before the switch goes on. *[Claude]*

---

## Audit checks

These must keep passing. Checks 1 to 11 come from Claude's live tests of the original app. Checks 12 to 35 come from both developers' reviews. Each applies from the phase shown.

- **1.** A wrong teacher password is rejected. *(from Phase 1)*
- **2.** The admin password box is empty when the login page opens. *(from Phase 1)*
- **3.** Refreshing as a parent never shows teacher controls. *(from Phase 1)*
- **4.** Changing saved browser data never opens the admin area. *(from Phase 3a-2)*
- **5.** A student with no records shows "No records yet", and marking never blanks the page. *(from Phase 1)*
- **6.** A parent sees only notifications about their own child. *(from Phase 3a-2)*
- **7.** Switching to Urdu changes the text and turns the layout right-to-left. *(from Phase 5, then every phase)*
- **8.** With the device clock set to a later month, the app shows that month's dates. *(from Phase 1)*
- **9.** Screens fit a phone's width without sideways scrolling. *(every phase)*
- **10.** A newly enrolled student has no grade and no "passed" lessons. *(from Phase 2)*
- **11.** A student with no records has no grade in the Excel export. *(from Phase 2)*
- **12.** Parent A can't read Parent B's child through the database. *(from Phase 3a-2)*
- **13.** Parent A can't add or change Parent B's child's records. *(from Phase 3a-2)*
- **14.** Teacher A can't read students outside their own circle. *(from Phase 3a-2)*
- **15.** Teacher A can't change a mark outside their authority. *(from Phase 3a-2)*
- **16.** Changing browser storage, or a request, can't raise anyone's role or permissions. *(from Phase 3a-2)*
- **17.** Changing a student or parent number in a request can't get past the database rules. *(from Phase 3a-2)*
- **18.** Someone who isn't the admin can't change settings, roles or switches. *(from Phase 3a-2)*
- **19.** Ordinary users can't edit or delete the change log. *(from Phase 3a-2)*
- **20.** Parent A can't read Parent B's notifications. *(from Phase 3a-2)*
- **21.** Exports follow exactly the same rules as screens. *(from Phase 3a-2)*
- **22.** After a deletion, no ordinary user can retrieve the child's records, files or voice notes, and the final report reached both the parents and the madrasah. *(from Phase 3a-2)*
- **23.** Repeated wrong codes or passwords are slowed down or locked out. *(from Phase 3a-2)*
- **24.** Changing scoring settings doesn't change a report that was already issued. *(from Phase 2)*
- **25.** Parents never see rankings or comparisons. *(from Phase 2)*
- **26.** Excel cells can't run as formulas. *(from Phase 2)*
- **27.** The waiting list survives closing the app and restarting the device. *(from Phase 3b)*
- **28.** Retrying an upload never creates a duplicate. *(from Phase 3b)*
- **29.** Two offline changes to the same field never silently overwrite each other, for marks, attendance and parent entries. Resolving a clash keeps both originals. *(from Phase 3b)*
- **30.** After sign-out on a shared tablet, the next user can't see the previous user's students, reports, notifications or waiting marks. Tested with the Decision J switch in both positions. *(from Phase 3b)*
- **31.** When offline access expires, the app locks and asks the person to reconnect. *(from Phase 3b)*
- **32.** A failed upload shows as failed, and never as saved online. *(from Phase 3b)*
- **33.** A wrong device clock doesn't change the order of changes or the dates recorded. *(from Phase 3b)*
- **34.** Changes queued by someone whose access was removed go to the admin, not into the records. *(from Phase 3b)*
- **35.** A test restore from a backup has succeeded. *(before launch)*

Turn these into automated tests as the build grows. The offline and sign-out checks run on both a personal phone and a shared tablet.

---

## To settle when we reach them

- How many assessed lessons a week are needed before a grade shows (item 25b, provisionally three).
- Which actions the admin can switch (settled in the authority table, item 50).
- The final scoring weights, grade boundaries and trophy titles, agreed by staff before launch (items 25a and 25g).
- Which 15-line IndoPak printing to use, since page numbers differ between printers (item 41g).
- How long voice notes are kept (item 49).
- When the Arabic update ships (Phase 7).
- Which text-message provider to use, and its budget (Phase 8).
