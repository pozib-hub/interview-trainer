import { useEffect, useRef, useState } from "react";
import * as authApi from "@lib/authApi";
import { useAppData } from "@hooks/useAppData";
import AuthModal from "./AuthModal";
import styles from "./UserMenu.module.css";

export default function UserMenu() {
  const [me, setMe] = useState<authApi.AuthInfo | null>(null);
  const [modal, setModal] = useState<"login" | "register" | null>(null);
  const [open, setOpen] = useState(false);
  const app = useAppData();
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    authApi.fetchMe().then(setMe).catch(() => setMe({ authenticated: false, login: null }));
  }, []);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleLogout = async () => {
    setOpen(false);
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  const handleResetProgress = () => {
    setOpen(false);
    if (app.solvedList.length === 0) return;
    if (confirm(`Сбросить все решённые задачи (${app.solvedList.length})?`)) {
      app.clearSolved();
    }
  };

  if (me === null) {
    return null;
  }

  return (
    <div className={styles.UserMenuWrap} ref={wrapRef}>
      <button
        type="button"
        className={styles.Trigger}
        onClick={() => setOpen((v) => !v)}
        title={me.authenticated ? `Профиль: ${me.login}` : "Профиль"}
      >
        👤 {me.authenticated && <span className={styles.TriggerLogin}>{me.login}</span>}
      </button>

      {open && (
        <div className={styles.Menu}>
          {me.authenticated ? (
            <div className={styles.MenuHeader}>👤 {me.login}</div>
          ) : (
            <button
              type="button"
              className={styles.MenuItem}
              onClick={() => {
                setOpen(false);
                setModal("login");
              }}
            >
              Войти / Зарегистрироваться
            </button>
          )}
          <div className={styles.MenuDivider} />
          <button type="button" className={styles.MenuItem} onClick={handleResetProgress}>
            🗑 Сбросить решённые{app.solvedList.length > 0 ? ` (${app.solvedList.length})` : ""}
          </button>
          {me.authenticated && (
            <button type="button" className={styles.MenuItem} onClick={handleLogout}>
              Выйти
            </button>
          )}
        </div>
      )}

      {modal && (
        <AuthModal
          initialMode={modal}
          onClose={() => setModal(null)}
          onAuthed={() => window.location.reload()}
        />
      )}
    </div>
  );
}
