import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSession(request);
}

export const config = {
  // Seules les pages qui dépendent du compte ont besoin d'une session fraîche.
  matcher: ["/espace/:path*", "/admin/:path*", "/evenements/:path*", "/stages/:path*", "/connexion", "/inscription"],
};
