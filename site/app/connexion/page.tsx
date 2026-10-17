import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { safeNextPath } from "@/lib/access";
import { getCurrentProfile } from "@/lib/auth";
import { AuthShell } from "@/app/_components/auth-shell";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Connexion — Parallailement",
  robots: { index: false, follow: false },
};

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ suite?: string }> }) {
  const { suite } = await searchParams;
  const next = safeNextPath(suite);
  if (await getCurrentProfile()) redirect(next);

  return (
    <AuthShell
      eyebrow="Espace membres"
      title="Bon retour"
      accent="parmi nous."
      intro={<p>Connecte-toi pour voir les événements du club et t’y inscrire.</p>}
    >
      <h2 className="font-serif text-3xl">Connexion</h2>
      <div className="mt-6">
        <SignInForm next={next} />
      </div>
    </AuthShell>
  );
}
