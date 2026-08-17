"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  createStagesAccessToken,
  isStagesAccessConfigured,
  STAGES_ACCESS_COOKIE,
  STAGES_ACCESS_DURATION,
  verifyStagesPassword,
} from "@/lib/stages-auth";

export async function unlockStages(formData: FormData) {
  if (!isStagesAccessConfigured()) {
    redirect("/stages?erreur=configuration");
  }

  const candidate = formData.get("password");

  if (typeof candidate !== "string" || !verifyStagesPassword(candidate)) {
    redirect("/stages?erreur=mot-de-passe");
  }

  const cookieStore = await cookies();
  cookieStore.set(STAGES_ACCESS_COOKIE, createStagesAccessToken(), {
    httpOnly: true,
    maxAge: STAGES_ACCESS_DURATION,
    path: "/stages",
    priority: "high",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/stages");
}

export async function lockStages() {
  const cookieStore = await cookies();
  cookieStore.set(STAGES_ACCESS_COOKIE, "", {
    httpOnly: true,
    maxAge: 0,
    path: "/stages",
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/stages");
}
