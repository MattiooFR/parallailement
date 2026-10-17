import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { AuthShell } from "@/app/_components/auth-shell";
import { SignUpForm } from "./sign-up-form";

export const metadata: Metadata = {
  title: "Devenir membre — Parallailement",
  description: "Crée ton compte membre du club Parallailement.",
};

export default async function SignUpPage() {
  if (await getCurrentProfile()) redirect("/espace");

  return (
    <AuthShell
      eyebrow="Rejoindre le club"
      title="Voler"
      accent="ensemble."
      intro={
        <>
          <p>Crée ton compte en une minute.</p>
          <p className="mt-4">
            Un membre du bureau le valide ensuite à la main. Tu pourras alors voir le calendrier du club et t’inscrire aux
            sorties.
          </p>
        </>
      }
    >
      <h2 className="font-serif text-3xl">Créer un compte</h2>
      <div className="mt-6">
        <SignUpForm />
      </div>
    </AuthShell>
  );
}
