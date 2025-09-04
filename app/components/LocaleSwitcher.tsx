"use client";

import React from "react";
import { useLocale } from "./LocaleProvider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function LocaleSwitcher(){
  const { locale, setLocale } = useLocale();
  return (
    <div className="p-2">
      <Select value={locale} onValueChange={(v:string)=> setLocale(v as any)}>
        <SelectTrigger className="w-28"><SelectValue/></SelectTrigger>
        <SelectContent>
          <SelectItem value="th">ไทย</SelectItem>
          <SelectItem value="en">English</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
