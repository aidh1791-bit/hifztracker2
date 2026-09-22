# HifzTrack: instructions for Claude Code

## What this project is

HifzTrack is a web app for a UK madrasah's ḥifẓ (Qurʾān memorisation) class.
Teachers record each child's daily sabaq, sabaq para and dawr. Parents follow
their own child's progress. An admin controls settings, staff and families.

It began as a Google AI Studio prototype. It is being rebuilt, phase by phase,
into a real app. The full approved plan, with every locked decision, is here:

@BUILD_PLAN.md

## The rule above all others

The browser never decides what a person may see or change. The database decides.

## Who you are working with

- Abu is the product owner. He is new to coding. He builds on a Windows
  computer and tests on an iPhone and on the computer.
- Teach as if to a secondary school class: plain words, one step at a time.
  Say what you are about to change and why, then how to check it worked.
- Before any large change, explain it and wait for his approval.
- Ask one question at a time, with two to four clear choices where possible.
- Check whether Abu wants a plan or a build before producing either.
- If a request clashes with a locked decision in BUILD_PLAN.md, say so and ask
  before doing anything.
- When a step needs something only Abu can arrange, such as an account, an
  approval or a staff decision, stop and tell him exactly what is needed.

## Rules that must never be broken

1. Follow the ten system rules at the top of BUILD_PLAN.md.
2. Never show one child's or family's data to anyone else.
3. Never invent records, results or dates. Unknown means "not yet".
4. Never present a feature as working unless it is built and tested, and never
   describe a security feature that hasn't been checked in the live setup.
5. Never use real children's data while building or testing. Use the test
   project with made-up children.
6. Never change the live database by hand. Every change to its structure is a
   numbered migration file committed to GitHub.
7. Never start Phase 3a-1 until DESIGN_GATE.md exists and Abu has approved it.
8. From Phase 4 on, change screens and workflow only, never the data design.
9. Never send children's data to outside services, apart from Supabase, the
   email service and the hosting service.
10. Never add a feature BUILD_PLAN.md doesn't include without asking first.
    Text-message sign-in waits until Phase 8.
11. Build phase by phase, in order. Finish each phase's checks first.
12. Follow the house style in BUILD_PLAN.md: diacritics, honorifics, and no
    images, icons or emoji of people, faces, eyes, hands or animals.

## How to run the app

```
npm install     # first time, or after adding packages
npm run dev     # start the app at http://localhost:3000
npm run lint    # type check: must show no errors
npm run build   # production build: must succeed
```

The "clean" script uses rm -rf, which fails on Windows. Replace it in Phase 0
(item 3a).

Abu's computer does not run Docker. From Phase 3a, use the online test project
for migrations and security tests, and choose commands that work without a
local database.

## Working habits

- After each item passes its check, commit to GitHub with a plain-English
  message that names the item, for example "Item 7: real dates".
- Before calling a phase done, run its three checks in BUILD_PLAN.md: build,
  behaviour, and security.
- Run the audit checks that apply from the current phase. The offline and
  sign-out checks run on both a personal phone and a shared tablet.
- Keep all saving and loading inside the data layer (item 16). No screen talks
  to Supabase, the device's database or browser storage directly.
- Offline features and the microphone need a secure (HTTPS) address, so test
  them on the iPhone using the online test site, not the computer's local
  address.
- Keep this file short. Detail belongs in BUILD_PLAN.md.
