"use client";

import type { ReactNode } from "react";
import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  pendingLabel = "Un instant…",
  variant = "primary",
  name,
  value,
  className = "",
  pending: pendingOverride,
}: {
  children: ReactNode;
  pendingLabel?: string;
  variant?: "primary" | "secondary" | "danger" | "quiet";
  name?: string;
  value?: string;
  className?: string;
  pending?: boolean;
}) {
  const status = useFormStatus();
  const pending = pendingOverride ?? status.pending;
  const styles = {
    primary: "bg-emerald-950 text-emerald-50 hover:bg-emerald-900 focus-visible:outline-emerald-950",
    secondary: "border border-stone-400 bg-transparent text-stone-900 hover:border-stone-900 focus-visible:outline-stone-900",
    danger: "border border-rose-800/40 bg-transparent text-rose-900 hover:bg-rose-50 focus-visible:outline-rose-900",
    quiet: "bg-transparent px-2 text-stone-600 underline-offset-4 hover:text-stone-950 hover:underline",
  }[variant];
  return (
    <button
      type="submit"
      name={name}
      value={value}
      disabled={pending}
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-medium transition focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-60 ${styles} ${className}`}
    >
      {pending ? pendingLabel : children}
    </button>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  htmlFor: string;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-stone-800">
        {label}
      </label>
      {hint && <p className="mt-0.5 text-xs text-stone-500">{hint}</p>}
      <div className="mt-1.5">{children}</div>
      {error && (
        <p role="alert" className="mt-1.5 text-sm text-rose-800">
          {error}
        </p>
      )}
    </div>
  );
}

export const inputClass =
  "block min-h-11 w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-base text-stone-900 shadow-sm outline-none transition placeholder:text-stone-400 focus:border-emerald-800 focus:ring-2 focus:ring-emerald-800/15 sm:text-sm";
