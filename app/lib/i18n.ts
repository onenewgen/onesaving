"use client";

import en from "../../locales/en.json";
import th from "../../locales/th.json";

type LocaleMap = Record<string, unknown>;
const LOCALES: Record<string, LocaleMap> = { en, th };

export function t(locale: string, path: string, fallback?: string) {
  const parts = path.split(".");
  let cur: unknown = LOCALES[locale] ?? LOCALES.th;
  for (const p of parts) {
    if (!cur || typeof cur !== 'object') return fallback ?? path;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : fallback ?? path;
}
