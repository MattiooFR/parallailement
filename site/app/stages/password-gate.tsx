import { club } from "@/lib/content";
import { unlockStages } from "./actions";

type StagesPasswordGateProps = {
  error?: "configuration" | "mot-de-passe";
};

function LockMark() {
  return (
    <svg
      viewBox="0 0 48 48"
      aria-hidden="true"
      className="h-12 w-12 text-amber-300"
    >
      <path
        d="M15 21v-5a9 9 0 0 1 18 0v5M12 21h24v20H12z"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      />
      <path
        d="M24 29v5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

export function StagesPasswordGate({ error }: StagesPasswordGateProps) {
  const isConfigurationError = error === "configuration";

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-emerald-950 px-6 py-16 text-emerald-50 sm:px-10">
      <div
        className="pointer-events-none absolute -right-40 -top-36 h-[34rem] w-[34rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -bottom-56 -left-48 h-[38rem] w-[38rem] rounded-full border border-emerald-100/10"
        aria-hidden="true"
      />

      <div className="relative mx-auto grid w-full max-w-6xl gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(21rem,0.72fr)] lg:items-end">
        <section>
          <p className="text-xs uppercase tracking-[0.24em] text-amber-200">
            {club.name} · espace de travail
          </p>
          <h1 className="mt-6 max-w-3xl font-serif text-[clamp(3.8rem,9vw,7.4rem)] leading-[0.84] tracking-[-0.055em]">
            Page en cours
            <br />
            de <span className="italic text-amber-200">préparation.</span>
          </h1>
          <p className="mt-9 max-w-xl text-lg leading-relaxed text-emerald-100/70">
            L’annuaire des stages n’est pas encore public. Saisis le mot de
            passe partagé pour consulter sa version de travail.
          </p>
        </section>

        <section className="border-t border-emerald-100/20 pt-8 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <LockMark />
          <form action={unlockStages} className="mt-8">
            <label
              htmlFor="stages-password"
              className="text-xs uppercase tracking-[0.2em] text-emerald-100/60"
            >
              Mot de passe
            </label>
            <input
              id="stages-password"
              name="password"
              type="password"
              autoComplete="current-password"
              autoFocus
              required
              minLength={12}
              aria-describedby={error ? "stages-access-error" : undefined}
              className="mt-3 min-h-14 w-full border-b border-emerald-100/40 bg-transparent px-0 text-lg text-emerald-50 outline-none transition placeholder:text-emerald-100/25 focus:border-amber-300"
              placeholder="••••••••••••"
            />

            {error && (
              <p
                id="stages-access-error"
                role="alert"
                className="mt-4 text-sm leading-relaxed text-amber-200"
              >
                {isConfigurationError
                  ? "L’accès privé n’est pas encore configuré sur ce serveur."
                  : "Ce mot de passe n’est pas le bon. Vérifie-le puis réessaie."}
              </p>
            )}

            <button
              type="submit"
              className="mt-7 inline-flex min-h-12 w-full items-center justify-center rounded-full bg-amber-300 px-7 py-3 text-sm font-medium text-stone-950 transition hover:bg-amber-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-amber-300"
            >
              Ouvrir la page
            </button>
          </form>
          <p className="mt-5 text-xs leading-relaxed text-emerald-100/45">
            L’accès reste ouvert 12 heures sur cet appareil.
          </p>
        </section>
      </div>
    </main>
  );
}
