// lib/auth.ts

// Admin is stored in app_metadata, which users can't edit (unlike user_metadata).
// Works with both JWT claims (server) and the Supabase User object (client).
export function isAdmin(subject: { app_metadata?: object } | null | undefined) {
  const appMetadata = subject?.app_metadata as { role?: unknown } | undefined;
  return appMetadata?.role === "admin";
}
