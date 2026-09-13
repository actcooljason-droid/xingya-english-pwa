const KNOWN_TYPES = ["letter", "listen", "word", "sentence"];

export function emptyProgress() {
  return {
    sessions: 0,
    learningDays: 0,
    totalAttempts: 0,
    totalCorrect: 0,
    stars: 0,
    completedDates: [],
    byType: {},
    recentSessions: [],
  };
}

export function createSession(activities, size = 5, random = Math.random) {
  if (!Array.isArray(activities) || activities.length < size || size < 1) {
    throw new RangeError("Not enough activities for this session size.");
  }

  const shuffled = [...activities];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }

  const session = [];
  while (session.length < size) {
    const previousType = session.at(-1)?.type;
    const nextIndex = shuffled.findIndex((item) => item.type !== previousType);
    const pickedIndex = nextIndex === -1 ? 0 : nextIndex;
    session.push(shuffled.splice(pickedIndex, 1)[0]);
  }

  return session;
}

export function checkAnswer(activity, selectedId) {
  return Boolean(selectedId) && activity?.correctOptionId === selectedId;
}

export function scoreSession(results) {
  const byType = {};
  let correct = 0;

  for (const result of results) {
    const type = KNOWN_TYPES.includes(result.type) ? result.type : "other";
    byType[type] ??= { attempts: 0, correct: 0 };
    byType[type].attempts += 1;
    if (result.correct) {
      correct += 1;
      byType[type].correct += 1;
    }
  }

  return {
    attempts: results.length,
    correct,
    stars: correct * 2,
    byType,
  };
}

export function mergeProgress(progress, summary, completedAt = new Date().toISOString()) {
  const current = progress && typeof progress === "object" ? progress : emptyProgress();
  const date = String(completedAt).slice(0, 10);
  const completedDates = Array.from(new Set([...(current.completedDates ?? []), date])).sort();
  const byType = structuredClone(current.byType ?? {});

  for (const [type, typeSummary] of Object.entries(summary.byType ?? {})) {
    byType[type] ??= { attempts: 0, correct: 0 };
    byType[type].attempts += typeSummary.attempts;
    byType[type].correct += typeSummary.correct;
  }

  const recentSession = {
    completedAt,
    attempts: summary.attempts,
    correct: summary.correct,
    stars: summary.stars,
  };

  return {
    sessions: (current.sessions ?? 0) + 1,
    learningDays: completedDates.length,
    totalAttempts: (current.totalAttempts ?? 0) + summary.attempts,
    totalCorrect: (current.totalCorrect ?? 0) + summary.correct,
    stars: (current.stars ?? 0) + summary.stars,
    completedDates,
    byType,
    recentSessions: [recentSession, ...(current.recentSessions ?? [])].slice(0, 7),
  };
}
