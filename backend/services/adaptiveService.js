// backend/services/adaptiveService.js
const evaluateCondition = (condition, context) => {
  try {
    // very simple parser for expressions like "score<70" or "timeSpent>300"
    // context may include lastScore, totalTimeSpent, etc.
    if (!condition) return false;
    const replaced = condition
      .replace(/score/g, String(context.lastScore ?? 0))
      .replace(/timeSpent/g, String(context.totalTimeSpent ?? 0));
    // eslint-disable-next-line no-eval
    return !!eval(replaced);
  } catch {
    return false;
  }
};

const flattenLessons = (course) => {
  const items = [];
  for (const week of course.structure || []) {
    for (const unit of week.units || []) {
      for (const lesson of unit.lessons || []) {
        items.push(lesson);
      }
    }
  }
  return items;
};

exports.getNextLesson = ({ course, progress, profile }) => {
  const lessons = flattenLessons(course);
  const visited = new Set((progress?.lessons || []).map((l) => String(l.lessonId)));
  const masteryMap = new Map((progress?.lessons || []).map((l) => [String(l.lessonId), l]));

  // preference scoring
  const preferredTypes = new Set(profile?.preferences?.preferredContentTypes || []);

  // compute a simple score for candidate lessons
  const scored = [];
  for (const lesson of lessons) {
    const lessonId = String(lesson._id);
    if (visited.has(lessonId) && (masteryMap.get(lessonId)?.status === 'completed' || masteryMap.get(lessonId)?.status === 'mastered')) {
      continue;
    }

    // prerequisites check
    let prerequisitesPassed = true;
    for (const pre of lesson.prerequisites || []) {
      const lp = masteryMap.get(String(pre.lessonId));
      const scoreOk = typeof pre.requiredScore === 'number' ? (lp?.score ?? 0) >= pre.requiredScore : (lp?.status === 'completed' || lp?.status === 'mastered');
      if (!lp || !scoreOk) {
        prerequisitesPassed = false;
        break;
      }
    }
    if (!prerequisitesPassed) continue;

    let score = 0;
    // prioritize preferred content types
    if (preferredTypes.has(lesson.type)) score += 2;

    // adjust by pace: fast -> shorter estimated minutes
    if (profile?.preferences?.pace === 'fast' && typeof lesson.estimatedMinutes === 'number') {
      score += lesson.estimatedMinutes <= 15 ? 1 : 0;
    }
    if (profile?.preferences?.pace === 'slow' && typeof lesson.estimatedMinutes === 'number') {
      score += lesson.estimatedMinutes >= 20 ? 1 : 0;
    }

    // basic skill gap boost: if user mastery < 0.6 for any skill in lesson
    const skillMastery = new Map((profile?.skillMastery || []).map((s) => [s.skillId, s.mastery]));
    let gapBoost = 0;
    for (const s of lesson.skills || []) {
      const m = skillMastery.get(s) ?? 0;
      if (m < 0.6) gapBoost += 0.5;
    }
    score += gapBoost;

    scored.push({ lesson, score });
  }

  scored.sort((a, b) => b.score - a.score);
  return scored[0]?.lesson || null;
};

exports.getSupplementaryMaterials = ({ course, progress, profile, limit = 3 }) => {
  const lessons = flattenLessons(course);
  const masteryMap = new Map((progress?.lessons || []).map((l) => [String(l.lessonId), l]));
  const weakLessons = lessons
    .filter((lesson) => {
      const lp = masteryMap.get(String(lesson._id));
      return lp && typeof lp.score === 'number' && lp.score < (course?.settings?.masteryScore ?? 70);
    })
    .slice(0, limit);
  return weakLessons.map((l) => ({ lessonId: l._id, title: l.title, type: l.type }));
};


