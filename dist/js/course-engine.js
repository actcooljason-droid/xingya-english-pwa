export function flattenLessons(units) {
  return units.flatMap((unit) => unit.lessons);
}

export function validateCourse(units) {
  if (!Array.isArray(units) || units.length === 0) throw new TypeError("Course units are required.");
  const lessons = flattenLessons(units);
  const lessonIds = new Set();
  const activityIds = new Set();
  const letters = new Set();

  for (const lesson of lessons) {
    if (lessonIds.has(lesson.id)) throw new Error(`Duplicate lesson id: ${lesson.id}`);
    lessonIds.add(lesson.id);
    if (!Array.isArray(lesson.activities) || lesson.activities.length !== 7) {
      throw new Error(`Lesson ${lesson.id} must have seven activities.`);
    }
    for (const letter of lesson.letters ?? []) letters.add(letter.toUpperCase());
    for (const activity of lesson.activities) {
      if (activityIds.has(activity.id)) throw new Error(`Duplicate activity id: ${activity.id}`);
      activityIds.add(activity.id);
      if (!Array.isArray(activity.options) || activity.options.length !== 3) {
        throw new Error(`Activity ${activity.id} must have three options.`);
      }
      if (activity.options.filter((item) => item.id === activity.correctOptionId).length !== 1) {
        throw new Error(`Activity ${activity.id} must have exactly one correct option.`);
      }
    }
  }

  return {
    units: units.length,
    lessons: lessons.length,
    activities: activityIds.size,
    letters: [...letters].sort().join(""),
  };
}

export function getCourseMap(units, completedLessonIds = []) {
  const completed = new Set(completedLessonIds);
  let currentAssigned = false;
  return units.map((unit) => ({
    ...unit,
    lessons: unit.lessons.map((lesson) => {
      let status = "locked";
      if (completed.has(lesson.id)) status = "complete";
      else if (!currentAssigned) {
        status = "current";
        currentAssigned = true;
      }
      return { ...lesson, status };
    }),
  }));
}

export function getNextLesson(units, completedLessonIds = []) {
  const completed = new Set(completedLessonIds);
  return flattenLessons(units).find((lesson) => !completed.has(lesson.id)) ?? null;
}

export function completeLesson(progress, lessonId) {
  const completedLessonIds = Array.from(new Set([...(progress.completedLessonIds ?? []), lessonId]));
  return { ...progress, completedLessonIds, lastLessonId: lessonId };
}

export function updateReviewQueue(progress, results) {
  const missed = new Set(progress.wrongActivityIds ?? []);
  for (const result of results) {
    if (!result.activityId) continue;
    if (result.correct) missed.delete(result.activityId);
    else missed.add(result.activityId);
  }
  return { ...progress, wrongActivityIds: [...missed].slice(-40) };
}

export function buildReviewSession(units, progress, size = 7) {
  const lessons = flattenLessons(units);
  const completed = new Set(progress.completedLessonIds ?? []);
  const availableLessons = lessons.filter((lesson) => completed.has(lesson.id));
  const sourceLessons = availableLessons.length ? availableLessons : lessons.slice(0, 1);
  const activities = sourceLessons.flatMap((lesson) => lesson.activities);
  const activityById = new Map(activities.map((activity) => [activity.id, activity]));
  const review = [];

  for (const id of progress.wrongActivityIds ?? []) {
    const activity = activityById.get(id);
    if (activity && !review.some((item) => item.id === id)) review.push(activity);
    if (review.length === size) return review;
  }

  const types = ["listening", "phonics", "vocabulary", "speaking", "reading"];
  for (const type of types) {
    for (const activity of activities) {
      if (activity.type === type && !review.some((item) => item.id === activity.id)) review.push(activity);
      if (review.length === size) return review;
    }
  }
  for (const activity of activities) {
    if (!review.some((item) => item.id === activity.id)) review.push(activity);
    if (review.length === size) break;
  }
  return review;
}
