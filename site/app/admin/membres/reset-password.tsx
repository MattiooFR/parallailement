"use client";

import { useActionState } from "react";
import { resetMemberPassword, type SimpleState } from "@/app/admin/actions";
import { SubmitButton } from "@/app/_components/ui";

export function ResetPasswordButton({ memberId }: { memberId: string }) {
  const [state, action] = useActionState<SimpleState, FormData>(resetMemberPassword, {});
  return (
    <form action={action} className="space-y-2">
      <input type="hidden" name="id" value={memberId} />
      {state.secret ? (
        <div role="status" className="rounded-lg bg-amber-50 p-3 text-sm">
          <p>{state.ok}</p>
          <p className="mt-2 select-all font-mono text-lg tracking-wider">{state.secret}</p>
        </div>
      ) : (
        <SubmitButton variant="secondary" pendingLabel="…">
          Mot de passe provisoire
        </SubmitButton>
      )}
      {state.error && <p className="text-sm text-rose-800">{state.error}</p>}
    </form>
  );
}
