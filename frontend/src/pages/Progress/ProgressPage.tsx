import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button, Typography } from "@ui/index";
import { useAppData } from "@hooks/useAppData";
import { fetchTopics } from "@lib/taskApi";
import type { TaskSummary } from "@lib/types";
import { humanInterval, daysUntil } from "@lib/review";
import styles from "./ProgressPage.module.css";

interface TopicStat {
  topic: string;
  total: number;
  solved: number;
  ratio: number;
}

const WEEKS = 26;

export default function ProgressPage() {
  const app = useAppData();
  const [topics, setTopics] = useState<Record<string, TaskSummary[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTopics()
      .then(setTopics)
      .finally(() => setLoading(false));
  }, []);

  const solvedSet = useMemo(() => new Set(app.solvedList), [app.solvedList]);

  const stats = useMemo<TopicStat[]>(() => {
    return Object.entries(topics)
      .map(([topic, tasks]) => {
        const solved = tasks.filter((t) => solvedSet.has(t.id)).length;
        return { topic, total: tasks.length, solved, ratio: tasks.length ? solved / tasks.length : 0 };
      })
      .sort((a, b) => a.ratio - b.ratio || b.total - a.total);
  }, [topics, solvedSet]);

  const totalTasks = useMemo(() => Object.values(topics).flat().length, [topics]);
  const solvedCount = app.solvedList.length;

  const noDateCount = useMemo(
    () => app.solvedList.filter((id) => !app.data?.solvedDates?.[id]).length,
    [app.solvedList, app.data],
  );

  // Дни без даты (решено до появления solvedDates) не портят heatmap — просто заметка.

  const heatmap = useMemo(() => {
    const byDay = new Map<string, number>();
    for (const at of Object.values(app.data?.solvedDates ?? {})) {
      const d = new Date(at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }
    // Выравниваем сетку на понедельник: колонки — недели, строки — дни.
    const today = new Date();
    const day = (today.getDay() + 6) % 7; // 0 = понедельник
    const lastMonday = new Date(today);
    lastMonday.setDate(today.getDate() - day);
    const weeks: { key: string; count: number; title: string }[][] = [];
    for (let w = WEEKS - 1; w >= 0; w--) {
      const col: { key: string; count: number; title: string }[] = [];
      for (let d = 0; d < 7; d++) {
        const date = new Date(lastMonday);
        date.setDate(lastMonday.getDate() - w * 7 + d);
        if (date > today) {
          col.push({ key: "future", count: -1, title: "" });
          continue;
        }
        const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
        col.push({
          key,
          count: byDay.get(key) ?? 0,
          title: `${String(date.getDate()).padStart(2, "0")}.${String(date.getMonth() + 1).padStart(2, "0")}: ${byDay.get(key) ?? 0} реш.`,
        });
      }
      weeks.push(col);
    }
    return weeks;
  }, [app.data]);

  const recommendation = useMemo(() => {
    // Самая слабая тема с достаточным числом задач и хотя бы одной нерешённой.
    const candidate = stats.find((s) => s.total >= 6 && s.solved < s.total);
    if (!candidate) return null;
    const next = topics[candidate.topic]?.find((t) => !solvedSet.has(t.id));
    return next ? { stat: candidate, next } : null;
  }, [stats, topics, solvedSet]);

  const sessions = app.sessions.slice(0, 8);

  // Интервальное повторение: статистика и ближайшие повторения.
  const reviewStats = useMemo(() => {
    const all = Object.entries(app.reviews);
    const now = Date.now();
    const due = all.filter(([, r]) => r.due <= now);
    const week = all.filter(([, r]) => r.due > now && r.due <= now + 7 * 86400000);
    return { inRotation: all.length, due: due.length, week: week.length };
  }, [app.reviews]);

  const upcomingReviews = useMemo(() => {
    const allTasks = Object.values(topics).flat();
    const byId = new Map(allTasks.map((t) => [t.id, t]));
    const now = Date.now();
    return Object.entries(app.reviews)
      .filter(([, r]) => r.due <= now + 7 * 86400000)
      .sort((a, b) => a[1].due - b[1].due)
      .slice(0, 6)
      .map(([id, r]) => ({ id, title: byId.get(id)?.title ?? id, r }));
  }, [topics, app.reviews]);
  const avgSessionScore = useMemo(() => {
    if (app.sessions.length === 0) return null;
    const scores = app.sessions.map((s) => {
      const vals = Object.values(s.results);
      return vals.length ? vals.filter(Boolean).length / vals.length : 0;
    });
    return Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 100);
  }, [app.sessions]);

  return (
    <div className={styles.Page}>
      <header className={styles.Header}>
        <Button size="sm" href="/tasks">← К задачам</Button>
        <Typography tag="h1" size={18}>Прогресс</Typography>
      </header>

      <div className={styles.Body}>
        <div className={styles.Cards}>
          <div className={styles.Card}>
            <Typography tag="span" size={12} color="text-muted">Решено</Typography>
            <div className={styles.CardValue}>
              {loading ? "…" : `${solvedCount} / ${totalTasks}`}
            </div>
            <Typography tag="span" size={12} color="text-muted">
              {totalTasks ? Math.round((solvedCount / totalTasks) * 100) : 0}% всех задач
            </Typography>
          </div>
          <div className={styles.Card}>
            <Typography tag="span" size={12} color="text-muted">Интервью пройдено</Typography>
            <div className={styles.CardValue}>{app.sessions.length}</div>
            <Typography tag="span" size={12} color="text-muted">
              {avgSessionScore !== null ? `средний результат ${avgSessionScore}%` : "ещё не было"}
            </Typography>
          </div>
          <div className={styles.Card}>
            <Typography tag="span" size={12} color="text-muted">Тем начато</Typography>
            <div className={styles.CardValue}>
              {stats.filter((s) => s.solved > 0).length} / {stats.length || "…"}
            </div>
            <Typography tag="span" size={12} color="text-muted">
              {stats.filter((s) => s.ratio === 1 && s.total > 0).length} тем закрыто на 100%
            </Typography>
          </div>
        </div>

        <section className={styles.Section}>
          <Typography tag="h2" size={14} mb={12}>Активность (последние {WEEKS} недель)</Typography>
          <div className={styles.HeatmapWrap}>
            <div className={styles.Weekdays}>
              <span>Пн</span>
              <span />
              <span>Ср</span>
              <span />
              <span>Пт</span>
              <span />
              <span />
            </div>
            <div className={styles.Heatmap}>
              {heatmap.map((week, wi) => (
                <div key={wi} className={styles.HeatCol}>
                  {week.map((cell, di) => (
                    <div
                      key={di}
                      className={`${styles.Cell} ${cellLevel(cell.count)}`}
                      title={cell.title}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
          <Typography tag="span" size={11} color="text-muted">
            {noDateCount > 0
              ? `Ещё ${noDateCount} решённых задач без даты (решены до появления истории) — в календарь не попали.`
              : "Цвет клетки — сколько задач решено в этот день."}
          </Typography>
        </section>

        <section className={styles.Section}>
          <Typography tag="h2" size={14} mb={12}>Темы — от самых слабых</Typography>
          <div className={styles.Topics}>
            {stats.map((s) => (
              <div key={s.topic} className={styles.TopicRow}>
                <span className={styles.TopicName} title={s.topic}>{s.topic}</span>
                <div className={styles.TopicBar}>
                  <div
                    className={`${styles.TopicFill} ${s.ratio === 1 ? styles.TopicFillDone : ""}`}
                    style={{ width: `${Math.round(s.ratio * 100)}%` }}
                  />
                </div>
                <span className={styles.TopicCount}>{s.solved}/{s.total}</span>
              </div>
            ))}
            {loading && <Typography color="text-muted" size={12}>Загрузка…</Typography>}
          </div>
        </section>

        {recommendation && (
          <section className={styles.Section}>
            <Typography tag="h2" size={14} mb={8}>💡 Рекомендация</Typography>
            <div className={styles.Reco}>
              <Typography tag="p" size={13} mb={10}>
                Слабое место — <strong>{recommendation.stat.topic}</strong>: решено{" "}
                {recommendation.stat.solved} из {recommendation.stat.total}. Подтяни его —
                на собеседованиях это спрашивают часто.
              </Typography>
              <Button size="sm" variant="primary" href={`/tasks/${encodeURIComponent(recommendation.next.id)}`}>
                Решить: {recommendation.next.title}
              </Button>
            </div>
          </section>
        )}

        {reviewStats.inRotation > 0 && (
          <section className={styles.Section}>
            <Typography tag="h2" size={14} mb={12}>🔁 Интервальное повторение</Typography>
            <div className={styles.ReviewStats}>
              <div className={styles.ReviewStat}>
                <span className={styles.ReviewStatValue}>{reviewStats.due}</span>
                <span className={styles.ReviewStatLabel}>к повторению сегодня</span>
              </div>
              <div className={styles.ReviewStat}>
                <span className={styles.ReviewStatValue}>{reviewStats.week}</span>
                <span className={styles.ReviewStatLabel}>на этой неделе</span>
              </div>
              <div className={styles.ReviewStat}>
                <span className={styles.ReviewStatValue}>{reviewStats.inRotation}</span>
                <span className={styles.ReviewStatLabel}>в ротации</span>
              </div>
            </div>
            {upcomingReviews.length > 0 && (
              <div className={styles.ReviewList}>
                {upcomingReviews.map(({ id, title, r }) => (
                  <Link key={id} to={`/tasks/${encodeURIComponent(id)}`} className={styles.ReviewRow}>
                    <span className={styles.ReviewTitle}>{title}</span>
                    <span className={styles.ReviewWhen}>
                      {r.due <= Date.now() ? "пора" : humanInterval(daysUntil(r))}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </section>
        )}

        {sessions.length > 0 && (
          <section className={styles.Section}>
            <Typography tag="h2" size={14} mb={12}>Последние интервью</Typography>
            <div className={styles.Sessions}>
              {sessions.map((s) => {
                const vals = Object.values(s.results);
                const score = vals.length
                  ? Math.round((vals.filter(Boolean).length / vals.length) * 100)
                  : 0;
                return (
                  <Link key={s.id} to="/interview" className={styles.SessionRow}>
                    <span className={styles.SessionDate}>
                      {new Date(s.date).toLocaleDateString("ru-RU")}
                    </span>
                    <span className={styles.SessionTasks}>{s.taskIds.length} задач</span>
                    <span className={`${styles.SessionScore} ${score >= 80 ? styles.ScoreOk : score >= 50 ? styles.ScoreMid : styles.ScoreBad}`}>
                      {score}%
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function cellLevel(count: number): string {
  if (count < 0) return styles.CellFuture;
  if (count === 0) return styles.Cell0;
  if (count === 1) return styles.Cell1;
  if (count <= 3) return styles.Cell2;
  return styles.Cell3;
}
