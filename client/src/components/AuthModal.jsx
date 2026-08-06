import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext.jsx";
import { useStore } from "../context/StoreContext.jsx";

export default function AuthModal() {
  const { authOpen, closeAuth, login, signup } = useAuth();
  const { toast } = useStore();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    document.body.style.overflow = authOpen ? "hidden" : "";
    if (authOpen) setError(""); // keep the last-used tab (login or signup)
    return () => {
      document.body.style.overflow = "";
    };
  }, [authOpen]);

  if (!authOpen) return null;

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    if (mode === "signup") {
      if (!form.name.trim()) return setError("Please enter your name");
      if (form.password.length < 6) return setError("Password must be at least 6 characters");
      if (form.password !== form.confirm) return setError("Passwords do not match");
    }
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setError("Enter a valid email address");
    if (form.password.length < 6) return setError("Password must be at least 6 characters");

    setBusy(true);
    try {
      if (mode === "login") {
        await login({ email: form.email, password: form.password });
        toast("Welcome back! 👋");
      } else {
        await signup({ name: form.name, email: form.email, password: form.password });
        toast(`Welcome to Nova Market, ${form.name.split(" ")[0]}! 🎉`);
      }
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={closeAuth}>
      <div className="modal auth-modal" onClick={(e) => e.stopPropagation()}>
        <div className="auth-head">
          <span className="logo-mark">N</span>
          <div>
            <h3>{mode === "login" ? "Welcome back" : "Create your account"}</h3>
            <p>{mode === "login" ? "Sign in to track orders & save addresses." : "Join Nova Market in seconds — it's free."}</p>
          </div>
          <button className="close-btn" onClick={closeAuth} aria-label="Close">✕</button>
        </div>

        <div className="auth-tabs">
          <button className={mode === "login" ? "active" : ""} onClick={() => { setMode("login"); setError(""); }}>Sign in</button>
          <button className={mode === "signup" ? "active" : ""} onClick={() => { setMode("signup"); setError(""); }}>Create account</button>
        </div>

        <form onSubmit={submit} noValidate>
          {mode === "signup" && (
            <div className="field">
              <label>Full name</label>
              <input
                type="text"
                placeholder="Ada Lovelace"
                value={form.name}
                onChange={set("name")}
                autoFocus
              />
            </div>
          )}

          <div className="field">
            <label>Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={set("email")}
              autoFocus={mode === "login"}
            />
          </div>

          <div className="field">
            <label>Password</label>
            <input
              type="password"
              placeholder={mode === "signup" ? "At least 6 characters" : "••••••••"}
              value={form.password}
              onChange={set("password")}
            />
          </div>

          {mode === "signup" && (
            <div className="field">
              <label>Confirm password</label>
              <input
                type="password"
                placeholder="Repeat your password"
                value={form.confirm}
                onChange={set("confirm")}
              />
            </div>
          )}

          {error && (
            <div className="auth-error">
              <span>⚠️</span> {error}
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-lg" style={{ width: "100%" }} disabled={busy}>
            {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
          </button>
        </form>

        <p className="auth-foot">
          {mode === "login" ? (
            <>New here? <button onClick={() => { setMode("signup"); setError(""); }}>Create an account</button></>
          ) : (
            <>Already a member? <button onClick={() => { setMode("login"); setError(""); }}>Sign in</button></>
          )}
        </p>
      </div>
    </div>
  );
}
