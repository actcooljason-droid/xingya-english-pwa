# Kindergarten English PWA Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a child-led, installable kindergarten-to-primary English learning PWA with a five-question daily session and a protected parent progress view.

**Architecture:** A dependency-free static single-page application separates curriculum data, pure learning/progress logic, and DOM rendering. Browser APIs provide speech, local-only persistence, and offline caching; core behavior remains directly testable with Node's built-in test runner.

**Tech Stack:** HTML5, CSS3, JavaScript ES modules, Web Speech API, localStorage, Service Worker, Web App Manifest, Node.js `node:test`.

**Spec:** `docs/superpowers/specs/2026-09-13-kindergarten-english-pwa-design.md`

## Global Constraints

The app is a one-route PWA with no account, backend, microphone, analytics, or child-data upload. A session contains five activities and should take about 8–10 minutes. The first theme is “彩虹野餐”, visible touch targets are at least 56 px high, progress is local-only, and the parent area opens through a three-second hold.

---

### Task 1: Learning engine and progress model

**Files:** Create `tests/learning-engine.test.js`, `dist/js/learning-engine.js`, and `package.json`.

**Interfaces:** Produces `createSession(activities, size, random)`, `checkAnswer(activity, selectedId)`, `scoreSession(results)`, `mergeProgress(progress, summary, completedAt)`, and `emptyProgress()` for the interface layer.

- [x] Write tests with literal expectations showing that a five-item session is produced without adjacent duplicate activities, answers are judged by option ID, stars are awarded without penalties, and cumulative progress aggregates attempts and activity-type accuracy.
- [x] Run `npm test` and verify failure because `dist/js/learning-engine.js` does not exist.
- [x] Implement the smallest pure functions needed by the tests, using serializable objects and injected randomness.
- [x] Run `npm test` and verify all learning-engine tests pass.

### Task 2: Curriculum and interactive child flow

**Files:** Create `dist/js/curriculum.js`, `dist/js/app.js`, and `dist/index.html`.

**Interfaces:** Consumes the Task 1 engine. Produces a DOM application with the states `home`, `lesson`, `feedback`, `complete`, and `parent`; exposes the same start-session action through visible controls and WebMCP when supported.

- [x] Add a failing integration-oriented test to `tests/learning-engine.test.js` proving the real curriculum can generate a valid five-activity session and every activity has exactly one correct option.
- [x] Run `npm test` and verify the new curriculum contract fails because the curriculum module is absent.
- [x] Add the “彩虹野餐” curriculum and build semantic HTML for the home, lesson, completion, and parent surfaces.
- [x] Implement answer handling, automatic persistence, three-second parent hold, confirmation-based reset, speech synthesis fallback, and imperative `start_daily_lesson` WebMCP registration.
- [x] Run `npm test` and verify all tests pass.

### Task 3: Responsive visual system and original mascot

**Files:** Create `dist/css/styles.css` and `dist/assets/owl-guide.png`; modify `dist/index.html` to load the asset and stylesheet.

**Interfaces:** Consumes the DOM structure from Task 2. Produces responsive mobile/desktop layouts, visible focus states, reduced-motion behavior, and fixed-dimension mascot rendering.

- [x] Generate one child-friendly standalone owl guide illustration with no embedded text, inspect it, and save it as `dist/assets/owl-guide.png`.
- [x] Implement the blue, yellow, green, and sky-blue token system; 56 px touch targets; responsive layouts; answer-state styling; and restrained motion.
- [x] Verify the asset exists, is a valid image, and every local URL referenced by `dist/index.html` resolves to an existing file.

### Task 4: PWA packaging and final verification

**Files:** Create `dist/manifest.webmanifest`, `dist/sw.js`, `dist/assets/icon.svg`, and `.openai/hosting.json`; modify `dist/index.html` and `dist/js/app.js` for PWA registration.

**Interfaces:** Produces an installable static site rooted at `dist`, with an offline cache named by explicit version and a `start_url` of `./`.

- [x] Add static verification that parses the manifest, checks the service-worker cache list against real files, and validates JavaScript syntax.
- [x] Run the static check and verify it fails until the PWA files are present.
- [x] Add the manifest, icon, service worker, registration logic, and static hosting configuration.
- [x] Run `npm test`, the static verification, and a local HTTP request to the served root; require zero failures and a non-error response before reporting completion.
