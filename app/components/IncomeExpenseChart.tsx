"use client"

import React, { useMemo } from "react";

type Tx = {
  id: string;
  type: "income" | "expense";
  amount: number;
  date: string; // YYYY-MM-DD
};

export default function IncomeExpenseChart({
  transactions,
  mode = "monthly",
  year,
}: {
  transactions: Tx[];
  mode?: "monthly" | "yearly";
  year?: number; // used for monthly mode
}) {
  const series = useMemo(() => {
    if (mode === "yearly") {
      const map = new Map<number, { income: number; expense: number }>();
      for (const t of transactions) {
        const y = new Date(t.date).getFullYear();
        const cur = map.get(y) ?? { income: 0, expense: 0 };
        if (t.type === "income") cur.income += t.amount;
        else cur.expense += t.amount;
        map.set(y, cur);
      }
      const years = Array.from(map.keys()).sort((a, b) => a - b).slice(-6); // last 6 years
      return years.map((y) => ({ label: String(y), income: map.get(y)!.income, expense: map.get(y)!.expense }));
    }

    // monthly
    const y = year ?? new Date().getFullYear();
  const months = Array.from({ length: 12 }, () => ({ income: 0, expense: 0 }));
    for (const t of transactions) {
      const d = new Date(t.date);
      if (d.getFullYear() !== y) continue;
      const m = d.getMonth();
      if (t.type === "income") months[m].income += t.amount;
      else months[m].expense += t.amount;
    }
    return months.map((m, i) => ({ label: new Date(y, i, 1).toLocaleString(undefined, { month: "short" }), income: m.income, expense: m.expense }));
  }, [transactions, mode, year]);

  const max = Math.max(1, ...series.flatMap((s) => [s.income, s.expense]));
  const w = 600;
  const h = 200;
  const pad = 36;
  const innerW = w - pad * 2;
  const innerH = h - pad * 2;
  const barWidth = innerW / series.length / 2.5;

  return (
    <div className="w-full overflow-auto">
      <svg width={Math.min(w, Math.max(400, series.length * 50))} height={h}>
        <g transform={`translate(${pad}, ${pad})`}>
          {series.map((s, i) => {
            const x = (i * innerW) / series.length;
            const incomeH = (s.income / max) * innerH;
            const expenseH = (s.expense / max) * innerH;
            const fmt = new Intl.NumberFormat("th-TH", { style: "currency", currency: "THB", maximumFractionDigits: 0 });
            return (
              <g key={s.label} transform={`translate(${x},0)`}> 
                <rect x={0} y={innerH - incomeH} width={barWidth} height={incomeH} rx={4} fill="#10b981" />
                {s.income > 0 ? (
                  <text x={barWidth / 2} y={innerH - incomeH - 6} fontSize={10} textAnchor="middle" fill="#065f46">{fmt.format(s.income)}</text>
                ) : null}
                <rect x={barWidth + 4} y={innerH - expenseH} width={barWidth} height={expenseH} rx={4} fill="#ef4444" />
                {s.expense > 0 ? (
                  <text x={barWidth + 4 + barWidth / 2} y={innerH - expenseH - 6} fontSize={10} textAnchor="middle" fill="#7f1d1d">{fmt.format(s.expense)}</text>
                ) : null}
                <text x={barWidth / 2} y={innerH + 16} fontSize={10} textAnchor="middle" fill="#111827">{s.label}</text>
                <text x={(barWidth * 3) / 2 + 4} y={innerH + 16} fontSize={10} textAnchor="middle" fill="#111827" style={{ display: 'none' }} />
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
