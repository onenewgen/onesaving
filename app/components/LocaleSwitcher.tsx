"use client";

import React from "react";
import { useLocale } from "./LocaleProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type Locale = "en" | "th";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useLocale();
  const onChange = (v: string) => {
    const val = v as Locale;
    setLocale(val);
  };

  return (
    <div className="p-2">
      <Select value={locale} onValueChange={onChange}>
        <SelectTrigger className="w-28">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="th">ไทย</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
