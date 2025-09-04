"use client";

import React from "react";
import { Wallet } from "lucide-react";
import { useLocale } from "./LocaleProvider";
import { t } from "../lib/i18n";

const MESSAGES: Record<string, { header: { title: string } }> = {
  th: { header: { title: "ระบบจัดการรายรับรายจ่าย" } },
  en: { header: { title: "Income & Expense Manager" } },
};

export default function Header() {
  const { locale } = useLocale();
  const title = t(locale, "header.title", MESSAGES.th.header.title);
  return (
    <div className="rounded-t-2xl bg-gradient-to-tr from-sky-400 to-cyan-300 px-6 py-10 text-white">
      <h1 suppressHydrationWarning className="flex items-center gap-3 text-3xl font-bold drop-shadow-sm">
        <Wallet className="h-8 w-8" /> {title}
      </h1>
    </div>
  );
}
