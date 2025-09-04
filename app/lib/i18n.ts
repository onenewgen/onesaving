"use client";

import en from "../../locales/en.json";
import th from "../../locales/th.json";

const LOCALES: Record<string, any> = { en, th };

export function t(locale: string, path: string, fallback?: string) {
  const parts = path.split(".");
  let cur: any = LOCALES[locale] ?? LOCALES.th;
  for (const p of parts) {
    if (!cur) return fallback ?? path;
    cur = cur[p];
  }
  return typeof cur === "string" ? cur : fallback ?? path;
}
