import test from "node:test";
import assert from "node:assert/strict";

import {
  checkAnswer,
  createSession,
  emptyProgress,
  mergeProgress,
  scoreSession,
} from "../dist/js/learning-engine.js";
import { rainbowPicnicActivities } from "../dist/js/curriculum.js";

const activities = [
  { id: "a1", type: "letter", correctOptionId: "a" },
  { id: "w1", type: "word", correctOptionId: "apple" },
  { id: "a2", type: "letter", correctOptionId: "b" },
  { id: "l1", type: "listen", correctOptionId: "cat" },
  { id: "w2", type: "word", correctOptionId: "blue" },
  { id: "s1", type: "sentence", correctOptionId: "hello" },
];

test("createSession returns five unique activities without adjacent matching types", () => {
  const session = createSession(activities, 5, () => 0.42);

  assert.equal(session.length, 5);
  assert.equal(new Set(session.map((activity) => activity.id)).size, 5);
  for (let index = 1; index < session.length; index += 1) {
    assert.notEqual(session[index].type, session[index - 1].type);
  }
});

test("checkAnswer compares the selected option ID with the activity answer", () => {
  assert.equal(checkAnswer(activities[0], "a"), true);
  assert.equal(checkAnswer(activities[0], "b"), false);
  assert.equal(checkAnswer(activities[0], ""), false);
});

test("scoreSession awards two stars per correct answer and never subtracts stars", () => {
  const summary = scoreSession([
    { type: "letter", correct: true },
    { type: "word", correct: false },
    { type: "listen", correct: true },
  ]);

  assert.deepEqual(summary, {
    attempts: 3,
    correct: 2,
    stars: 4,
    byType: {
      letter: { attempts: 1, correct: 1 },
      word: { attempts: 1, correct: 0 },
      listen: { attempts: 1, correct: 1 },
    },
  });
});

test("mergeProgress accumulates totals and counts each calendar date once", () => {
  const first = mergeProgress(
    emptyProgress(),
    {
      attempts: 5,
      correct: 4,
      stars: 8,
      byType: { letter: { attempts: 2, correct: 2 } },
    },
    "2026-09-13T08:00:00+08:00",
  );
  const second = mergeProgress(
    first,
    {
      attempts: 5,
      correct: 3,
      stars: 6,
      byType: { letter: { attempts: 1, correct: 0 } },
    },
    "2026-09-13T19:00:00+08:00",
  );

  assert.equal(second.sessions, 2);
  assert.equal(second.learningDays, 1);
  assert.equal(second.totalAttempts, 10);
  assert.equal(second.totalCorrect, 7);
  assert.equal(second.stars, 14);
  assert.deepEqual(second.byType.letter, { attempts: 3, correct: 2 });
});

test("the real curriculum supports a valid five-activity daily session", () => {
  const session = createSession(rainbowPicnicActivities, 5, () => 0.3);

  assert.equal(session.length, 5);
  for (const activity of session) {
    assert.ok(["letter", "listen", "word", "sentence"].includes(activity.type));
    assert.equal(activity.options.length, 3);
    assert.equal(
      activity.options.filter((option) => option.id === activity.correctOptionId).length,
      1,
    );
    assert.ok(activity.speech.length > 0);
  }
});
