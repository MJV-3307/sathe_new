import React, { useState } from "react";
import { useAuth } from "../../context/AuthContext";

export default function Login({ onDemoMode }) {
  const { login, apiOffline } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
    } catch (err) {
      setError(
        err?.detail?.reason === "LOGIN_BAD_CREDENTIALS" || err?.status === 400
          ? "Incorrect email or password."
          : "Couldn't reach the API. Is the backend running?"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-background font-sans text-on-surface min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-surface-container-lowest rounded-2xl shadow-stitch-card p-8 border border-outline-variant/30">
        <div className="flex items-center gap-2 mb-6">
          <span className="material-symbols-outlined text-primary text-3xl">auto_schedule</span>
          <h1 className="font-headline-sm text-headline-sm font-bold">CampusConnect</h1>
        </div>

        {apiOffline && (
          <div className="mb-4 p-3 rounded-xl bg-error-container text-on-error-container font-body-sm text-body-sm">
            Can't reach the API at the configured URL. Start the backend, or continue below in demo mode.
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              placeholder="you@college.edu"
            />
          </div>
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-11 px-3 bg-surface rounded-xl border border-outline-variant/40 font-body-sm text-body-sm focus:outline-none focus:ring-2 focus:ring-primary-container"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="font-body-sm text-body-sm text-error">{error}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-primary text-on-primary font-label-md font-bold disabled:opacity-60"
          >
            {isSubmitting ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <button
          onClick={onDemoMode}
          className="w-full mt-4 h-10 rounded-xl border border-outline-variant/40 text-on-surface-variant font-label-md text-label-md hover:bg-surface-container-low"
        >
          Continue in demo mode (mock data, no backend)
        </button>

        <p className="mt-4 font-label-sm text-[11px] text-outline">
          First time? Create the initial admin with
          <code className="mx-1 px-1.5 py-0.5 rounded bg-surface-container">python -m app.scripts.create_admin</code>
          on the backend.
        </p>
      </div>
    </div>
  );
}
