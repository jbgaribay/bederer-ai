import { useCallback, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/profile";

// Dispatched after the profile page saves, so other components (the header) refetch
export const PROFILE_UPDATED_EVENT = "profile-updated";

export function useProfile(user: User | null) {
  const userId = user?.id ?? null;
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const { data, error } = await createClient()
      .from("profiles")
      .select("id, first_name, username, utr, usta_level")
      .eq("id", userId)
      .maybeSingle();
    if (error) console.error("Failed to load profile:", error);
    setProfile(
      data
        ? {
            ...data,
            utr: data.utr === null ? null : Number(data.utr),
            usta_level: data.usta_level === null ? null : Number(data.usta_level),
          }
        : null
    );
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    setLoading(true);
    refresh();
    window.addEventListener(PROFILE_UPDATED_EVENT, refresh);
    return () => window.removeEventListener(PROFILE_UPDATED_EVENT, refresh);
  }, [refresh]);

  return { profile, loading, refresh };
}
