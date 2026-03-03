// app/api/auth/[...nextauth]/route.ts
//
// This is the NextAuth catch-all route.
// It must simply re-export the handlers from auth.ts.
// Do NOT add any custom logic here — keep it thin.

import { handlers } from "@/auth";

export const { GET, POST } = handlers;

// Required when running on a subdomain (app.localhost:3000) so Next.js
// doesn't cache the auth responses and break session reads.
export const dynamic = "force-dynamic";
