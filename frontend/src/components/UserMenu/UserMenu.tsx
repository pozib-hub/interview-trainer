import { useEffect, useState } from "react";
import * as authApi from "@lib/authApi";
import { Button, Typography } from "@ui/index";
import AuthModal from "./AuthModal";

export default function UserMenu() {
  const [me, setMe] = useState<authApi.AuthInfo | null>(null);
  const [modal, setModal] = useState<"login" | "register" | null>(null);

  useEffect(() => {
    authApi.fetchMe().then(setMe).catch(() => setMe({ authenticated: false, login: null }));
  }, []);

  const handleLogout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    window.location.reload();
  };

  if (me === null) {
    return null;
  }

  return (
    <>
      {me.authenticated ? (
        <>
          <Typography tag="span" color="text-muted" size={12} mr={8}>
            👤 {me.login}
          </Typography>
          <Button size="sm" onClick={handleLogout} title="Выйти из аккаунта">
            Выйти
          </Button>
        </>
      ) : (
        <Button size="sm" onClick={() => setModal("login")} title="Войти или зарегистрироваться">
          Войти
        </Button>
      )}
      {modal && (
        <AuthModal
          initialMode={modal}
          onClose={() => setModal(null)}
          onAuthed={() => window.location.reload()}
        />
      )}
    </>
  );
}
