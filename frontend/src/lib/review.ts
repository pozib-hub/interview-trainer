// Интервальное повторение решённых задач (упрощённый Anki/SM-2):
// успешное повторение увеличивает интервал по лестнице, провал — сброс.

export interface ReviewState {
  due: number; // unix ms — когда пора повторить
  interval: number; // текущий интервал, дней
  reps: number; // успешных повторений подряд
}

const DAY = 24 * 60 * 60 * 1000;

// Лестница интервалов после N-го успешного повторения (в днях).
const LADDER = [1, 3, 7, 14, 30, 60, 120];

/** Начальное состояние после первого решения: повторить через день. */
export function initialReview(now = Date.now()): ReviewState {
  return { due: now + LADDER[0] * DAY, interval: LADDER[0], reps: 0 };
}

/**
 * Следующее состояние после попытки повторения.
 * passed=true — интервал растёт по лестнице; passed=false — сброс на день.
 */
export function nextReview(prev: ReviewState, passed: boolean, now = Date.now()): ReviewState {
  if (!passed) {
    return { due: now + LADDER[0] * DAY, interval: LADDER[0], reps: 0 };
  }
  const reps = prev.reps + 1;
  const interval = LADDER[Math.min(reps, LADDER.length - 1)];
  return { due: now + interval * DAY, interval, reps };
}

/** Задача пора повторить? */
export function isDue(state: ReviewState | undefined, now = Date.now()): boolean {
  return !!state && state.due <= now;
}

/** Сколько дней до повторения (может быть отрицательным = просрочено). */
export function daysUntil(state: ReviewState, now = Date.now()): number {
  return Math.ceil((state.due - now) / DAY);
}

/** Человекочитаемое описание интервала. */
export function humanInterval(days: number): string {
  if (days <= 0) return "сегодня";
  if (days === 1) return "завтра";
  if (days < 7) return `через ${days} дн.`;
  if (days < 30) return `через ${Math.round(days / 7)} нед.`;
  return `через ${Math.round(days / 30)} мес.`;
}
