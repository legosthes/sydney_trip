import { useState, type FormEvent } from "react";
import { Languages } from "lucide-react";
import { useTranslation } from "@/i18n/LanguageContext";
import { Button } from "@/components/ui/button";

const inputClass =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-1 text-sm transition-colors placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";

export function Login({
  onSignIn,
}: {
  onSignIn: (username: string, password: string, remember: boolean) => Promise<boolean>;
}) {
  const { lang, setLang, t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(false);
    const ok = await onSignIn(username.trim(), password, remember);
    if (!ok) {
      setError(true);
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Language toggle, top-right */}
      <div className="flex justify-end p-4 sm:p-6">
        <button
          onClick={() => setLang(lang === "en" ? "zh" : "en")}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Languages className="size-4" />
          {lang === "en" ? "中文" : "EN"}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-4 pb-24">
        <div className="w-full max-w-sm animate-fade">
          {/* Editorial header */}
          <p className="bracket-label text-muted-foreground">{t("auth.eyebrow")}</p>
          <h1 className="mt-3 font-heading text-4xl sm:text-5xl leading-[1.05] tracking-tight">
            {t("auth.title")}
          </h1>
          <p className="mt-3 text-sm text-muted-foreground">{t("auth.subtitle")}</p>

          <form onSubmit={handleSubmit} className="mt-10 space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="login-username" className="eyebrow">
                {t("auth.username")}
              </label>
              <input
                id="login-username"
                type="text"
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className={inputClass}
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="login-password" className="eyebrow">
                {t("auth.password")}
              </label>
              <input
                id="login-password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClass}
              />
            </div>

            <label className="flex items-center gap-2 pt-1 text-sm text-muted-foreground select-none cursor-pointer">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 accent-primary"
              />
              {t("auth.remember")}
            </label>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {t("auth.invalid")}
              </p>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={busy}>
              {busy ? t("auth.signingIn") : t("auth.signIn")}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
