import type { Metadata } from "next";
import type { ReactNode } from "react";
import { isAdmin } from "@/lib/access";
import { requireCalendarManager } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { MemberBar } from "@/app/_components/member-bar";
import { AdminNav } from "./admin-nav";

export const metadata: Metadata = {
  title: "Administration — Parallailement",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await requireCalendarManager("/admin");
  const admin = isAdmin(profile);
  let pending = 0;
  if (admin) {
    const { count } = await createAdminSupabaseClient()
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending");
    pending = count ?? 0;
  }

  const items = [
    { href: "/admin", label: "Tableau de bord" },
    { href: "/admin/evenements", label: "Événements" },
    ...(admin ? [{ href: "/admin/membres", label: "Membres", badge: pending }] : []),
    { href: "/admin/lieux", label: admin ? "Lieux et types" : "Lieux" },
    ...(admin ? [{ href: "/admin/alertes", label: "Alertes email" }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#f2efe7] text-stone-900">
      <MemberBar profile={profile} current="admin" />
      <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-8">
        <AdminNav items={items} />
      </div>
      <main className="mx-auto max-w-6xl px-4 pb-24 pt-8 sm:px-8">{children}</main>
    </div>
  );
}
