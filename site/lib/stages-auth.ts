import "server-only";

import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

export const STAGES_ACCESS_COOKIE = "parallailement_stages_access";
export const STAGES_ACCESS_DURATION = 60 * 60 * 12;

const TOKEN_VERSION = "stages-access-v1";

function getPassword() {
  return process.env.STAGES_PASSWORD ?? "";
}

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();

  return timingSafeEqual(leftHash, rightHash);
}

function sign(expiresAt: string, password: string) {
  return createHmac("sha256", password)
    .update(`${TOKEN_VERSION}:${expiresAt}`)
    .digest("base64url");
}

export function isStagesAccessConfigured() {
  return getPassword().length >= 12;
}

export function verifyStagesPassword(candidate: string) {
  const password = getPassword();

  return password.length >= 12 && safeEqual(candidate, password);
}

export function createStagesAccessToken() {
  const password = getPassword();

  if (password.length < 12) {
    throw new Error("STAGES_PASSWORD doit contenir au moins 12 caractères.");
  }

  const expiresAt = String(
    Math.floor(Date.now() / 1000) + STAGES_ACCESS_DURATION,
  );

  return `${expiresAt}.${sign(expiresAt, password)}`;
}

export function verifyStagesAccessToken(token: string | undefined) {
  const password = getPassword();

  if (!token || password.length < 12) return false;

  const [expiresAt, signature, extra] = token.split(".");
  const expiresAtNumber = Number(expiresAt);

  if (
    extra !== undefined ||
    !expiresAt ||
    !signature ||
    !Number.isInteger(expiresAtNumber) ||
    expiresAtNumber <= Math.floor(Date.now() / 1000)
  ) {
    return false;
  }

  return safeEqual(signature, sign(expiresAt, password));
}

export async function hasStagesAccess() {
  const cookieStore = await cookies();

  return verifyStagesAccessToken(
    cookieStore.get(STAGES_ACCESS_COOKIE)?.value,
  );
}
