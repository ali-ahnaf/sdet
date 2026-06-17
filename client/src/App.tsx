import { useEffect, useState } from "react";
import { AuthPage, type AuthUser } from "./auth/AuthPage";
import { TodoApp } from "./todos/TodoApp";
import { authApi } from "./auth/api";
import { tokenStore } from "./auth/token";

export function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  // True while we check localStorage for a token and validate it on first load,
  // so we don't flash the login page before the stored session is restored.
  const [checking, setChecking] = useState(true);

  // On mount, decide where the user belongs: if a token is saved in
  // localStorage, validate it and "redirect" home; otherwise show login.
  useEffect(() => {
    if (!tokenStore.get()) {
      setChecking(false);
      return;
    }

    let active = true;
    authApi
      .me()
      .then((me) => {
        if (active) setUser(me);
      })
      .catch(() => {
        // Stale or invalid token — drop it and fall back to login.
        tokenStore.clear();
      })
      .finally(() => {
        if (active) setChecking(false);
      });

    return () => {
      active = false;
    };
  }, []);

  if (checking) {
    return null;
  }

  if (!user) {
    return <AuthPage onAuthenticated={setUser} />;
  }

  return <TodoApp />;
}
