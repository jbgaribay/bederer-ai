"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface AuthModalProps {
  open: boolean;
  onClose: () => void;
  // "limit" = shown after the guest's free scan is used up
  reason?: "limit" | "manual";
  initialMode?: "signup" | "signin";
}

export default function AuthModal({
  open,
  onClose,
  reason = "manual",
  initialMode = "signup",
}: AuthModalProps) {
  const [mode, setMode] = useState<"signup" | "signin">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkEmail, setCheckEmail] = useState(false);
  const [wasOpen, setWasOpen] = useState(open);

  // Start on the requested form each time the modal opens
  if (open !== wasOpen) {
    setWasOpen(open);
    if (open) {
      setMode(initialMode);
      setError(null);
    }
  }

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const supabase = createClient();

    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=/upload`,
        },
      });
      if (error) setError(error.message);
      else if (!data.session) setCheckEmail(true);
      else onClose();
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else onClose();
    }

    setSubmitting(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border-4 border-green-600 p-8"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700"
        >
          ×
        </button>

        {checkEmail ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📬</div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Check your email</h2>
            <p className="text-gray-600">
              We sent a confirmation link to <span className="font-bold">{email}</span>.
              Click it to finish creating your account.
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="text-5xl mb-3">🎾</div>
              <h2 className="text-2xl font-black text-gray-900 mb-2">
                {reason === "limit"
                  ? "Nice swing! Want more feedback?"
                  : mode === "signup"
                  ? "Create your free account"
                  : "Welcome back"}
              </h2>
              <p className="text-gray-600 text-sm">
                {reason === "limit"
                  ? "You've used your free analysis. Sign up free to keep analyzing and track your progress over time."
                  : "Save every swing and watch your scores improve."}
              </p>
            </div>

            {reason === "limit" && mode === "signup" && (
              <ul className="mb-6 space-y-2 text-sm text-gray-700">
                <li className="flex gap-2"><span className="text-green-600 font-black">✓</span> Keep analyzing your swings</li>
                <li className="flex gap-2"><span className="text-green-600 font-black">✓</span> Swing history saved to your account</li>
                <li className="flex gap-2"><span className="text-green-600 font-black">✓</span> Progress chart on any device</li>
              </ul>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none"
              />
              <input
                type="password"
                required
                minLength={6}
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                placeholder="Password (6+ characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none"
              />

              {error && (
                <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-black text-lg
                  hover:from-green-700 hover:to-green-800 disabled:opacity-60 border-4 border-green-800 transition-all"
              >
                {submitting ? "One sec..." : mode === "signup" ? "Sign Up Free" : "Sign In"}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-gray-600">
              {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
              <button
                onClick={() => {
                  setMode(mode === "signup" ? "signin" : "signup");
                  setError(null);
                }}
                className="font-bold text-green-700 hover:text-green-900"
              >
                {mode === "signup" ? "Sign in" : "Create an account"}
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
