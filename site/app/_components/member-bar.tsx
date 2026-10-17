import Link from "next/link";
import { canOpenAdmin, canViewStages, isAdmin } from "@/lib/access";
import type { Profile } from "@/lib/auth";
import { club } from "@/lib/content";
import { signOut } from "@/app/_actions/auth";

type Section = "espace" | "admin" | "evenement";

export function MemberBar({ profile, current }: { profile: Profile | null; current?: Section }) {
  const link = (href: string, label: string, active: boolean) => (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={
        active
          ? "border-b border-amber-300 py-1 text-amber-200"
          : "py-1 text-emerald-100/70 transition hover:text-emerald-50"
      }
    >
      {label}
    </Link>
  );

  return (
    <header className="border-b border-emerald-100/10 bg-emerald-950 text-emerald-50">
      <nav className="mx-auto flex min-h-16 max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-8">
        <Link href="/" className="font-serif text-lg tracking-tight transition hover:text-amber-200">
          {club.name}
        </Link>
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          {profile ? (
            <>
              {link("/espace", "Mon espace", current === "espace")}
              {canViewStages(profile) && link("/stages", "Stages", false)}
              {canOpenAdmin(profile) && link("/admin", isAdmin(profile) ? "Admin" : "Calendrier", current === "admin")}
              <form action={signOut}>
                <button type="submit" className="py-1 text-emerald-100/60 transition hover:text-emerald-50">
                  Déconnexion
                </button>
              </form>
            </>
          ) : (
            <>
              {link("/connexion", "Connexion", false)}
              <Link
                href="/inscription"
                className="rounded-full bg-amber-300 px-4 py-1.5 font-medium text-stone-950 transition hover:bg-amber-200"
              >
                Devenir membre
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
