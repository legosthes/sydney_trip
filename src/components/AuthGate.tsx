import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { authMe, authLogin, authLogout, type AuthUser } from "@/lib/api";
import { Login } from "@/pages/Login";

interface AuthContextType {
  user: AuthUser;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Gates the whole app behind login. Checks the session cookie on mount;
 * shows the Login screen until authenticated.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    authMe()
      .then(setUser)
      .finally(() => setChecking(false));
  }, []);

  const signIn = useCallback(
    async (username: string, password: string, remember: boolean) => {
      const u = await authLogin(username, password, remember);
      if (u) setUser(u);
      return u !== null;
    },
    []
  );

  const signOut = useCallback(async () => {
    await authLogout();
    setUser(null);
  }, []);

  // Avoid flashing the login form while the cookie check is in flight
  if (checking) {
    return <div className="min-h-screen bg-background" />;
  }

  if (!user) {
    return <Login onSignIn={signIn} />;
  }

  return (
    <AuthContext.Provider value={{ user, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthGate");
  return ctx;
}
