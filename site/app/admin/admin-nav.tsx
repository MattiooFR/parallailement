"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ items }: { items: Array<{ href: string; label: string; badge?: number }> }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Administration" className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
      <ul className="flex min-w-max gap-1 border-b border-stone-300">
        {items.map((item) => {
          const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-sm transition ${
                  active ? "border-emerald-900 font-medium text-stone-950" : "border-transparent text-stone-600 hover:text-stone-950"
                }`}
              >
                {item.label}
                {item.badge ? (
                  <span className="rounded-full bg-amber-300 px-1.5 text-xs font-semibold text-stone-950">{item.badge}</span>
                ) : null}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
