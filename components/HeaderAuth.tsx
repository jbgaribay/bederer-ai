"use client";

import { useEffect, useState } from "react";
import AuthModal from "@/components/AuthModal";
import { useUser } from "@/hooks/useUser";

// Sign in / sign out control for pages without their own auth UI.
export default function HeaderAuth() {
  const { user, loading, signOut } = useUser();
  const [modalOpen, setModalOpen] = useState(false);

  // Close the modal once sign-in completes
  useEffect(() => {
    if (user) setModalOpen(false);
  }, [user]);

  if (loading) return null;

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
            <span className="hidden sm:inline text-green-100 truncate max-w-[12rem]">{user.email}</span>
            <button
              onClick={signOut}
              className="text-yellow-300 hover:text-yellow-200 font-semibold"
            >
              Sign out
            </button>
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
