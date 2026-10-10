// app/profile/page.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AuthModal from "@/components/AuthModal";
import { useUser } from "@/hooks/useUser";
import { PROFILE_UPDATED_EVENT, useProfile } from "@/hooks/useProfile";
import { createClient } from "@/lib/supabase/client";
import { isAdmin } from "@/lib/auth";
import { USERNAME_PATTERN, USTA_LEVELS } from "@/types/profile";

const inputClass =
  "w-full rounded-lg border-2 border-gray-300 px-4 py-3 text-gray-900 focus:border-green-500 focus:outline-none";
const labelClass = "block text-sm font-bold text-gray-700 mb-1";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading: userLoading, signOut } = useUser();
  const { profile, loading: profileLoading } = useProfile(user);
  const [authOpen, setAuthOpen] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [username, setUsername] = useState("");
  const [utr, setUtr] = useState("");
  const [ustaLevel, setUstaLevel] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Fill the form once the profile loads
  useEffect(() => {
    if (!profile) return;
    setFirstName(profile.first_name);
    setUsername(profile.username);
    setUtr(profile.utr === null ? "" : profile.utr.toFixed(2));
    setUstaLevel(profile.usta_level === null ? "" : profile.usta_level.toFixed(1));
  }, [profile]);

  useEffect(() => {
    if (user) setAuthOpen(false);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);

    const { error } = await createClient()
      .from("profiles")
      .update({
        first_name: firstName.trim(),
        username,
        utr: utr === "" ? null : Number(utr),
        usta_level: ustaLevel === "" ? null : Number(ustaLevel),
      })
      .eq("id", user.id);

    if (error) {
      setError(error.code === "23505" ? "That username is taken. Try another one." : error.message);
    } else {
      setSaved(true);
      window.dispatchEvent(new Event(PROFILE_UPDATED_EVENT));
      setTimeout(() => setSaved(false), 3000);
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  if (userLoading || (user && profileLoading)) {
    return <div className="max-w-xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>;
  }

  if (!user) {
    return (
      <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
        <AuthModal
          open={authOpen}
          reason="manual"
          initialMode="signin"
          onClose={() => setAuthOpen(false)}
        />
        <div className="bg-white rounded-xl shadow-2xl p-8 border-4 border-green-600 text-center">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Sign in to view your profile</h1>
          <p className="text-gray-600 mb-6">Your profile and swing history are saved to your account.</p>
          <button
            onClick={() => setAuthOpen(true)}
            className="bg-yellow-400 text-green-900 px-6 py-3 rounded-lg font-bold hover:bg-yellow-300 border-2 border-yellow-500"
          >
            Sign in
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900">Your profile</h1>
          <p className="text-gray-600 mt-1">{user.email}</p>
        </div>
        {isAdmin(user) && (
          <span className="shrink-0 bg-green-700 text-white text-xs font-black uppercase tracking-wide px-3 py-1.5 rounded-full">
            Admin
          </span>
        )}
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 border-4 border-green-600 space-y-5"
      >
        <div>
          <label htmlFor="first_name" className={labelClass}>First name</label>
          <input
            id="first_name"
            type="text"
            required
            maxLength={50}
            autoComplete="given-name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className={inputClass}
          />
        </div>

        <div>
          <label htmlFor="username" className={labelClass}>Username</label>
          <input
            id="username"
            type="text"
            required
            pattern={USERNAME_PATTERN}
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value.toLowerCase())}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-gray-500">3–20 letters, numbers, or _</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="utr" className={labelClass}>UTR</label>
            <input
              id="utr"
              type="number"
              min={1}
              max={16.5}
              step={0.01}
              inputMode="decimal"
              placeholder="e.g. 6.50"
              value={utr}
              onChange={(e) => setUtr(e.target.value)}
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="usta_level" className={labelClass}>USTA level</label>
            <select
              id="usta_level"
              value={ustaLevel}
              onChange={(e) => setUstaLevel(e.target.value)}
              className={inputClass}
            >
              <option value="">Not set</option>
              {USTA_LEVELS.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border-2 border-red-300 text-red-800 px-4 py-2 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
        {saved && (
          <div className="bg-green-50 border-2 border-green-300 text-green-800 px-4 py-2 rounded-lg text-sm font-medium">
            Profile saved.
          </div>
        )}

        <button
          type="submit"
          disabled={saving}
          className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-black text-lg
            hover:from-green-700 hover:to-green-800 disabled:opacity-60 border-4 border-green-800 transition-all"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={handleSignOut}
          className="text-sm font-bold text-gray-600 hover:text-red-700 underline underline-offset-4"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}
