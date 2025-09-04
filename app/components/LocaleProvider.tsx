"use client";

import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Locale = "en" | "th";

const LocaleContext = createContext({ locale: "th" as Locale, setLocale: (l: Locale) => {} });

export function useLocale() {
  return useContext(LocaleContext);
}

export default function LocaleProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    try {
      return (localStorage.getItem("onesaving.locale") as Locale) || "th";
    } catch {
      return "th";
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("onesaving.locale", locale);
    } catch {}
  }, [locale]);

  // setLocale intentionally not included in dependencies since it's stable
  const ctx = useMemo(() => ({ locale, setLocale }), [locale]);

  return <LocaleContext.Provider value={ctx}>{children}</LocaleContext.Provider>;
}
