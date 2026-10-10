"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { useUser } from "@/hooks/useUser";
import { useProfile } from "@/hooks/useProfile";

// Greeting + profile link when signed in, Sign in button when not.
export default function HeaderAuth() {
  const { user, loading } = useUser();
  const { profile } = useProfile(user);
  const [modalOpen, setModalOpen] = useState(false);

  // Close the modal once sign-in completes
  useEffect(() => {
    if (user) setModalOpen(false);
  }, [user]);

  if (loading) return null;

  const name = profile?.first_name ?? user?.email?.split("@")[0] ?? "";

  return (
    <>
      <AuthModal
        open={modalOpen}
        reason="manual"
        initialMode="signin"
        onClose={() => setModalOpen(false)}
      />
      <div className="flex items-center gap-3 text-sm">
        {user ? (
          <>
            <span className="text-green-100 font-semibold truncate max-w-[9rem] sm:max-w-[14rem]">
              <span className="sm:hidden">Hi, </span>
              <span className="hidden sm:inline">Hello, </span>
              <span className="text-white">{name}</span>
            </span>
            <Link
              href="/profile"
              aria-label="Your profile"
              className="shrink-0 w-10 h-10 rounded-full bg-yellow-400 text-green-900 border-2 border-yellow-500 flex items-center justify-center hover:bg-yellow-300"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
                />
              </svg>
            </Link>
          </>
        ) : (
          <button
            onClick={() => setModalOpen(true)}
            className="bg-yellow-400 text-green-900 px-4 py-2 rounded-lg font-bold hover:bg-yellow-300 border-2 border-yellow-500"
          >
            Sign in
          </button>
        )}
      </div>
    </>
  );
}
