// proxy.ts

import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  matcher: [
    // Skip static assets and images, and the analyze route, which reads (and refreshes) the
    // session itself. Requests through the proxy also have their body capped at 10 MB.
    "/((?!_next/static|_next/image|favicon.ico|api/analyze|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
