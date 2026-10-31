import { useState } from "react";
import { Link } from "react-router-dom";
import type { QuestionsIndex, StoredInterviewSession } from "@lib/types";
import { Spinner, Typography } from "@ui/index";
import styles from "../interview.module.css";
import qStyles from "../../questions.module.css";

interface ISetupPhaseProps {
  index: QuestionsIndex | null;
  savedSession: StoredInterviewSession | null;
  onResume: () => void;
  onDiscard: () => void;
  onStart: (direction: string, technologies: string[]) => void;
  busy: boolean;
  error: string;
}

export default function SetupPhase(props: ISetupPhaseProps) {
  const { index, savedSession, onResume, onDiscard, onStart, busy, error } = props;

  const [directionId, setDirectionId] = useState("");
  const [techIds, setTechIds] = useState<Set<string>>(new Set());

  const direction = index?.directions.find((d) => d.id === directionId) ?? null;

  const toggleTech = (id: string) => {
    setTechIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canStart = !!direction && !busy;

  const handleStart = () => {
    if (!direction) return;
    onStart(direction.id, [...techIds]);
  };

  return (
    <div className={qStyles.Container}>
      <div className={qStyles.PageHead}>
        <div className={qStyles.Breadcrumb}>
          <Link to="/questions" className={qStyles.CrumbLink}>← Вопросы</Link>
        </div>
        <h1 className={qStyles.PageTitle}>Устное собеседование</h1>
        <p className={qStyles.PageDesc}>
          ИИ подберёт список вопросов на 30 минут. Отвечайте голосом — текст
          распознается автоматически, а в конце ИИ разберёт каждый ответ.
        </p>
      </div>

      {savedSession && !busy && (
        <div className={`${styles.Banner} ${styles.BannerInfo}`}>
          <span>
            У вас незавершённое собеседование: {savedSession.questions.length} вопросов,
            отвечено {Object.values(savedSession.answers ?? {}).filter((a) => a.trim()).length}.
          </span>
          <button className={qStyles.ToolbarButton} onClick={onResume}>
            ▶ Продолжить
          </button>
          <button className={qStyles.ToolbarButton} onClick={onDiscard}>
            Сбросить
          </button>
        </div>
      )}

      {error && <div className={`${styles.Banner} ${styles.BannerError}`}>⚠️ {error}</div>}

      {busy ? (
        <div className={styles.PlanningBox}>
          <Spinner />
          <div className={styles.PlanningTitle} style={{ marginTop: 14 }}>
            ИИ подбирает вопросы…
          </div>
          <p className={styles.PlanningHint}>
            Оцениваем выборку на соответствие 30 минутам, при необходимости
            корректируем список. Это может занять до минуты.
          </p>
        </div>
      ) : (
        <>
          <div className={qStyles.PageMeta}>1. Выберите направление</div>
          <div className={qStyles.Grid} style={{ margin: "10px 0 20px" }}>
            {(index?.directions ?? []).map((d) => (
              <button
                key={d.id}
                className={qStyles.Card}
                style={{
                  textAlign: "left",
                  cursor: "pointer",
                  fontFamily: "inherit",
                  borderColor: directionId === d.id ? "var(--accent)" : undefined,
                  borderWidth: directionId === d.id ? "2px" : undefined,
                }}
                onClick={() => {
                  setDirectionId(d.id);
                  setTechIds(new Set());
                }}
              >
                <h3 className={qStyles.CardTitle}>{d.title}</h3>
                <p className={qStyles.CardDesc}>{d.description}</p>
              </button>
            ))}
          </div>

          {direction && direction.technologies.length > 0 && (
            <>
              <div className={qStyles.PageMeta}>
                2. Выберите технологии (можно несколько — или оставьте пустым для всех)
              </div>
              <div className={styles.Chips}>
                {direction.technologies.map((t) => (
                  <button
                    key={t.id}
                    className={`${styles.Chip} ${techIds.has(t.id) ? styles.ChipActive : ""}`}
                    onClick={() => toggleTech(t.id)}
                  >
                    {t.title}
                  </button>
                ))}
              </div>
              <p className={styles.ChipsHint}>
                {techIds.size === 0
                  ? "Не выбрано — вопросы будут из всех технологий направления"
                  : `Выбрано: ${techIds.size}`}
              </p>
            </>
          )}

          <div style={{ marginTop: 24 }}>
            <button
              className={`${styles.MicBtn} ${canStart ? "" : styles.MicBtnActive}`}
              disabled={!canStart}
              onClick={handleStart}
              style={canStart ? undefined : { opacity: 0.5, cursor: "not-allowed" }}
            >
              🎤 Начать собеседование · 30 минут
            </button>
          </div>

          {!index && (
            <Typography color="text-muted" size={12} mt={12}>
              <Spinner mr={6} />
              Загрузка направлений…
            </Typography>
          )}
        </>
      )}
    </div>
  );
}
