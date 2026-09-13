import test from "node:test";
import assert from "node:assert/strict";

import { courseUnits } from "../dist/js/course-data.js";
import {
  buildReviewSession,
  completeLesson,
  flattenLessons,
  getCourseMap,
  getNextLesson,
  updateReviewQueue,
  validateCourse,
} from "../dist/js/course-engine.js";
import { emptyProgress } from "../dist/js/learning-engine.js";

test("the course contains 6 units, 24 lessons, 168 valid activities and A-Z coverage", () => {
  const report = validateCourse(courseUnits);

  assert.deepEqual(report, {
    units: 6,
    lessons: 24,
    activities: 168,
    letters: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  });

  const lessons = flattenLessons(courseUnits);
  assert.equal(new Set(lessons.map((lesson) => lesson.id)).size, 24);
  for (const lesson of lessons) {
    assert.equal(lesson.activities.length, 7);
    assert.ok(lesson.goals.length >= 2);
    for (const activity of lesson.activities) {
      assert.equal(activity.options.length, 3);
      assert.equal(
        activity.options.filter((option) => option.id === activity.correctOptionId).length,
        1,
      );
    }
  }
});

test("course map unlocks only the first unfinished lesson in sequence", () => {
  const initialMap = getCourseMap(courseUnits, []);
  assert.equal(initialMap[0].lessons[0].status, "current");
  assert.equal(initialMap[0].lessons[1].status, "locked");
  assert.equal(initialMap[1].lessons[0].status, "locked");

  const afterTwo = getCourseMap(courseUnits, ["u1-l1", "u1-l2"]);
  assert.equal(afterTwo[0].lessons[0].status, "complete");
  assert.equal(afterTwo[0].lessons[1].status, "complete");
  assert.equal(afterTwo[0].lessons[2].status, "current");
});

test("completing a lesson records it once and advances to the next lesson", () => {
  const progress = completeLesson(emptyProgress(), "u1-l1");
  const repeated = completeLesson(progress, "u1-l1");

  assert.deepEqual(repeated.completedLessonIds, ["u1-l1"]);
  assert.equal(repeated.lastLessonId, "u1-l1");
  assert.equal(getNextLesson(courseUnits, repeated.completedLessonIds).id, "u1-l2");
});

test("review session prioritizes missed activities from completed lessons", () => {
  const lessons = flattenLessons(courseUnits);
  const missedId = lessons[0].activities[3].id;
  const review = buildReviewSession(
    courseUnits,
    { completedLessonIds: ["u1-l1", "u1-l2"], wrongActivityIds: [missedId] },
    7,
  );

  assert.equal(review.length, 7);
  assert.equal(review[0].id, missedId);
  assert.equal(new Set(review.map((activity) => activity.id)).size, 7);
  assert.ok(review.every((activity) => activity.lessonId === "u1-l1" || activity.lessonId === "u1-l2"));
});

test("review queue adds mistakes and removes an item after a correct retry", () => {
  const afterLesson = updateReviewQueue(
    { ...emptyProgress(), wrongActivityIds: ["old-miss"] },
    [
      { activityId: "new-miss", correct: false },
      { activityId: "old-miss", correct: true },
    ],
  );

  assert.deepEqual(afterLesson.wrongActivityIds, ["new-miss"]);
});
