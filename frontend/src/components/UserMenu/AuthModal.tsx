import { useEffect, useState, type FormEvent } from "react";
import * as authApi from "@lib/authApi";
import { Button, Typography } from "@ui/index";
import styles from "./AuthModal.module.css";

interface IAuthModalProps {
  initialMode: "login" | "register";
  onClose: () => void;
  onAuthed: () => void;
}

export default function AuthModal(props: IAuthModalProps) {
  const { initialMode, onClose, onAuthed } = props;
  const [mode, setMode] = useState<"login" | "register">(initialMode);
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError(null);
    setLoading(true);
    try {
      if (mode === "register") {
        await authApi.register(login, password);
      } else {
        await authApi.login(login, password);
      }
      onAuthed();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Что-то пошло не так");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.Overlay} onMouseDown={onClose}>
      <div className={styles.Panel} onMouseDown={(e) => e.stopPropagation()}>
        <Typography tag="h2" size={18} mb={4}>
          {mode === "register" ? "Регистрация" : "Вход"}
        </Typography>
        <Typography tag="p" color="text-muted" size={12} mb={16}>
          {mode === "register"
            ? "Весь ваш текущий прогресс сохранится в аккаунте"
            : "Гостевой прогресс, если он есть, присоединится к аккаунту"}
        </Typography>

        <form onSubmit={submit} className={styles.Form}>
          <input
            className={styles.Input}
            type="text"
            placeholder="Логин"
            value={login}
            autoComplete="username"
            onChange={(e) => setLogin(e.target.value)}
            autoFocus
          />
          <input
            className={styles.Input}
            type="password"
            placeholder="Пароль"
            value={password}
            autoComplete={mode === "register" ? "new-password" : "current-password"}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && (
            <Typography color="red" size={12} mb={4}>
              {error}
            </Typography>
          )}

          <Button type="submit" variant="primary" block disabled={loading}>
            {loading ? "…" : mode === "register" ? "Создать аккаунт" : "Войти"}
          </Button>
        </form>

        <div className={styles.Switch}>
          <Typography tag="span" color="text-muted" size={12}>
            {mode === "register" ? "Уже есть аккаунт?" : "Нет аккаунта?"}
          </Typography>{" "}
          <button
            type="button"
            className={styles.SwitchBtn}
            onClick={() => {
              setMode(mode === "register" ? "login" : "register");
              setError(null);
            }}
          >
            {mode === "register" ? "Войти" : "Зарегистрироваться"}
          </button>
        </div>
      </div>
    </div>
  );
}
