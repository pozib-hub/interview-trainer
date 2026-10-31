import { Button } from "@ui/index";
import styles from "../interview.module.css";

interface IConfirmFinishModalProps {
  open: boolean;
  answered: number;
  total: number;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmFinishModal(props: IConfirmFinishModalProps) {
  const { open, answered, total, onCancel, onConfirm } = props;
  if (!open) return null;

  const none = answered === 0;

  return (
    <div
      className={styles.ModalOverlay}
      onMouseDown={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className={styles.ModalPanel} onMouseDown={(e) => e.stopPropagation()}>
        <h3 className={styles.ModalTitle}>Завершить собеседование досрочно?</h3>
        <p className={styles.ModalText}>
          {none
            ? "Вы ещё не ответили ни на один вопрос. Чтобы получить разбор, ответьте хотя бы на один — голосом или текстом."
            : `Отвечено ${answered} из ${total} вопросов. Неотвеченные не попадут в разбор.`}
        </p>
        <div className={styles.ModalActions}>
          <Button size="lg" onClick={onCancel}>
            Продолжить собеседование
          </Button>
          <Button
            size="lg"
            variant="primary"
            disabled={none}
            onClick={onConfirm}
            title={none ? "Сначала ответьте хотя бы на один вопрос" : undefined}
          >
            Завершить и отправить на разбор
          </Button>
        </div>
      </div>
    </div>
  );
}
