import { useState } from "react";
import type { CSSProperties, FormEvent, ReactNode } from "react";
import { Card } from "../components/Card";
import { Button } from "../components/Button";
import { Input } from "../components/Input";
import { Checkbox } from "../components/Checkbox";
import { Tag } from "../components/Tag";
import { Squiggle, Blob } from "../components/decorations";
import { EyeIcon, EyeOffIcon } from "../components/icons";
import { colors } from "../theme";
import type { User } from "@sdet/shared";
import { authApi } from "./api";

/** The signed-in account handed back to the caller. */
export type AuthUser = User;

interface AuthPageProps {
  /** Called with the signed-in user once the form validates and "submits". */
  onAuthenticated: (user: AuthUser) => void;
}

type Mode = "signin" | "signup";

type FieldKey = "name" | "email" | "password" | "confirm";
type Errors = Partial<Record<FieldKey, string>>;

const COPY: Record<Mode, { tag: string; title: string; subtitle: string; cta: string }> = {
  signin: {
    tag: "welcome back",
    title: "Sign in",
    subtitle: "Pick up your pencil where you left off.",
    cta: "Sign in",
  },
  signup: {
    tag: "nice to meet you",
    title: "Sign up",
    subtitle: "Grab a fresh page and start scribbling.",
    cta: "Create account",
  },
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * A single auth screen that toggles between Sign in and Sign up. UI-only:
 * validation runs locally and a successful submit hands the user back to the
 * caller (no backend — matches the app's mock-data theme).
 */
export function AuthPage({ onAuthenticated }: AuthPageProps) {
  const [mode, setMode] = useState<Mode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const copy = COPY[mode];
  const isSignup = mode === "signup";

  const switchTo = (next: Mode) => {
    setMode(next);
    setErrors({});
    setFormError(null);
    setPassword("");
    setConfirm("");
    setShowPassword(false);
  };

  // Clear a single field's error as soon as the user edits it.
  const clearError = (key: FieldKey) =>
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));

  const validate = (): Errors => {
    const next: Errors = {};
    if (isSignup && name.trim().length < 2) next.name = "Tell us what to call you.";
    if (!EMAIL_RE.test(email.trim())) next.email = "That doesn't look like an email.";
    if (password.length < 8) next.password = "Use at least 8 characters.";
    if (isSignup && confirm !== password) next.confirm = "Passwords don't match.";
    return next;
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setPending(true);
    setFormError(null);
    try {
      const user = isSignup
        ? await authApi.signup({ name: name.trim(), email: email.trim(), password })
        : await authApi.signin({ email: email.trim(), password });
      // The JWT is now persisted by authApi; hand the profile to the caller.
      onAuthenticated(user);
    } catch (err: unknown) {
      setFormError(toMessage(err));
    } finally {
      setPending(false);
    }
  };

  return (
    <main style={pageStyle}>
      <header style={{ position: "relative", textAlign: "center", marginBottom: "1.5rem" }}>
        <Tag background={colors.postit} color={colors.fg} tilt="-3deg">
          {copy.tag}
        </Tag>
        <h1 style={titleStyle}>{copy.title}</h1>
        <div style={{ display: "flex", justifyContent: "center" }}>
          <Squiggle width={180} />
        </div>
        <p style={subtitleStyle}>{copy.subtitle}</p>

        <Blob
          size={46}
          className="hd-desktop-only"
          style={{ position: "absolute", top: -6, right: 4 }}
        />
      </header>

      <Card decoration="tack" tilt="-1deg" style={{ padding: "1.75rem 1.5rem", overflow: "visible" }}>
        <div style={tabsStyle} role="tablist" aria-label="Choose sign in or sign up">
          <ModeTab label="Sign in" selected={!isSignup} onClick={() => switchTo("signin")} />
          <ModeTab label="Sign up" selected={isSignup} onClick={() => switchTo("signup")} />
        </div>

        <form onSubmit={submit} noValidate style={{ display: "grid", gap: "1.1rem" }}>
          {isSignup && (
            <Field
              id="name"
              label="Name"
              value={name}
              onChange={(v) => {
                setName(v);
                clearError("name");
              }}
              error={errors.name}
              placeholder="Ada Lovelace"
              autoComplete="name"
            />
          )}

          <Field
            id="email"
            label="Email"
            type="email"
            value={email}
            onChange={(v) => {
              setEmail(v);
              clearError("email");
            }}
            error={errors.email}
            placeholder="you@example.com"
            autoComplete="email"
          />

          <Field
            id="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(v) => {
              setPassword(v);
              clearError("password");
            }}
            error={errors.password}
            placeholder={isSignup ? "At least 8 characters" : "Your password"}
            autoComplete={isSignup ? "new-password" : "current-password"}
            trailing={
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                aria-pressed={showPassword}
                style={toggleStyle}
              >
                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
              </button>
            }
          />

          {isSignup && (
            <Field
              id="confirm"
              label="Confirm password"
              type={showPassword ? "text" : "password"}
              value={confirm}
              onChange={(v) => {
                setConfirm(v);
                clearError("confirm");
              }}
              error={errors.confirm}
              placeholder="Type it again"
              autoComplete="new-password"
            />
          )}

          {!isSignup && (
            <div style={rememberRowStyle}>
              <label style={rememberLabelStyle}>
                <Checkbox checked={remember} onChange={setRemember} label="Remember me" />
                Remember me
              </label>
              <a href="#" className="hd-link" onClick={(e) => e.preventDefault()}>
                Forgot password?
              </a>
            </div>
          )}

          {formError && (
            <p role="alert" style={formErrorBannerStyle}>
              {formError}
            </p>
          )}

          <Button type="submit" disabled={pending} style={{ width: "100%" }}>
            {pending ? "One sec…" : copy.cta}
          </Button>
        </form>
      </Card>

      <p style={switchStyle}>
        {isSignup ? "Already have an account? " : "New here? "}
        <button
          type="button"
          className="hd-link"
          style={switchButtonStyle}
          onClick={() => switchTo(isSignup ? "signin" : "signup")}
        >
          {isSignup ? "Sign in" : "Create one"}
        </button>
      </p>
    </main>
  );
}

/** Turn a thrown auth error into a friendly, user-facing message. */
function toMessage(err: unknown): string {
  if (err instanceof Error) {
    return err.message.toLowerCase().includes("fetch")
      ? "Couldn't reach the server — is the API running on :3001?"
      : err.message;
  }
  return "Something went wrong. Please try again.";
}

interface FieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  /** Optional control pinned to the right edge, e.g. a show-password toggle. */
  trailing?: ReactNode;
}

/** Labelled input row with an inline, screen-reader-linked error message. */
function Field({
  id,
  label,
  value,
  onChange,
  type = "text",
  error,
  placeholder,
  autoComplete,
  trailing,
}: FieldProps) {
  const errorId = `${id}-error`;
  return (
    <div style={{ display: "grid", gap: "0.4rem" }}>
      <label htmlFor={id} style={labelStyle}>
        {label}
      </label>
      <div style={{ position: "relative" }}>
        <Input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
          style={trailing ? { paddingRight: "3rem" } : undefined}
        />
        {trailing && <span style={trailingWrapStyle}>{trailing}</span>}
      </div>
      {error && (
        <span id={errorId} role="alert" style={fieldErrorStyle}>
          {error}
        </span>
      )}
    </div>
  );
}

function ModeTab({
  label,
  selected,
  onClick,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
}) {
  const style: CSSProperties = {
    flex: 1,
    fontFamily: "var(--hd-font-body)",
    fontSize: "1.05rem",
    cursor: "pointer",
    padding: "0.4rem 0.95rem",
    color: selected ? "#fff" : "var(--hd-fg)",
    background: selected ? "var(--hd-fg)" : "transparent",
    border: "2px solid var(--hd-fg)",
    borderRadius: "120px 14px 120px 16px / 14px 120px 16px 120px",
    transform: selected ? "rotate(-1.5deg)" : "none",
    transition: "transform 100ms ease, background-color 100ms ease, color 100ms ease",
  };
  return (
    <button type="button" role="tab" aria-selected={selected} onClick={onClick} style={style}>
      {label}
    </button>
  );
}

const pageStyle: CSSProperties = {
  maxWidth: 460,
  margin: "0 auto",
  padding: "3.5rem 1.25rem 2.5rem",
};

const titleStyle: CSSProperties = {
  fontSize: "clamp(2.2rem, 6vw, 3rem)",
  margin: "0.5rem 0 0.25rem",
};

const subtitleStyle: CSSProperties = {
  margin: "0.75rem 0 0",
  fontSize: "1.1rem",
  color: "rgba(45,45,45,0.7)",
};

const tabsStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
};

const labelStyle: CSSProperties = {
  fontSize: "1rem",
  color: "rgba(45,45,45,0.75)",
};

const fieldErrorStyle: CSSProperties = {
  fontSize: "0.95rem",
  color: colors.accent,
};

const formErrorBannerStyle: CSSProperties = {
  margin: 0,
  padding: "0.6rem 0.85rem",
  fontSize: "0.98rem",
  color: colors.accent,
  background: "rgba(255, 77, 77, 0.1)",
  border: `2px solid ${colors.accent}`,
  borderRadius: "120px 14px 120px 16px / 14px 120px 16px 120px",
};

const trailingWrapStyle: CSSProperties = {
  position: "absolute",
  top: "50%",
  right: "0.6rem",
  transform: "translateY(-50%)",
  display: "inline-flex",
};

const toggleStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "0.25rem",
  border: "none",
  background: "transparent",
  color: "rgba(45,45,45,0.6)",
  cursor: "pointer",
};

const rememberRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "0.75rem",
  flexWrap: "wrap",
};

const rememberLabelStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "0.6rem",
  fontSize: "1rem",
  color: "rgba(45,45,45,0.75)",
  cursor: "pointer",
};

const switchStyle: CSSProperties = {
  textAlign: "center",
  marginTop: "1.5rem",
  fontSize: "1.05rem",
  color: "rgba(45,45,45,0.7)",
};

const switchButtonStyle: CSSProperties = {
  font: "inherit",
  background: "none",
  border: "none",
  borderBottom: "2px dashed currentColor",
  padding: 0,
  cursor: "pointer",
};
