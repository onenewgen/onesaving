"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useLocale } from "./components/LocaleProvider";
import { t } from "./lib/i18n";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Wallet,
  Plus,
  List,
  PieChart,
  CloudUpload,
  Save,
  Image as ImageIcon,
  Check,
} from "lucide-react";
import IncomeExpenseChart from "./components/IncomeExpenseChart";

// ---------- Types ----------

type TxType = "income" | "expense";

type Transaction = {
  id: string;
  type: TxType;
  amount: number;
  category: string;
  date: string; // YYYY-MM-DD
  description?: string;
  receipt?: string | null; // data URL
};

// ---------- Constants ----------

const CATEGORIES: Record<TxType, string[]> = {
  income: ["เงินเดือน", "โบนัส", "ค่าคอมมิชชั่น", "รายได้พิเศษ", "เงินลงทุน"],
  expense: [
    "อาหาร",
    "เดินทาง",
    "ช้อปปิ้ง",
    "บิลค่าใช้จ่าย",
    "สุขภาพ",
    "บันเทิง",
  ],
};

const THB = new Intl.NumberFormat("th-TH", {
  style: "currency",
  currency: "THB",
  maximumFractionDigits: 0,
});

const todayLocal = () => {
  // Get local date in YYYY-MM-DD
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ---------- Component ----------

export default function FinanceManagerPage() {
  const { locale } = useLocale();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<"" | TxType>("income");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>(todayLocal());
  const [description, setDescription] = useState<string>("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [chartMode, setChartMode] = useState<"monthly" | "yearly">("monthly");
  const [chartYear, setChartYear] = useState<number>(new Date().getFullYear());
  const fileRef = useRef<HTMLInputElement | null>(null);
  // toast notifications
  type Toast = { id: string; message: string; kind: "success" | "error" };
  const [toasts, setToasts] = useState<Toast[]>([]);
  const addToast = (
    message: string,
    kind: "success" | "error" = "success",
    ttl = 3500
  ) => {
    const id = crypto.randomUUID();
    const t: Toast = { id, message, kind };
    setToasts((s) => [t, ...s]);
    if (ttl > 0)
      setTimeout(() => setToasts((s) => s.filter((x) => x.id !== id)), ttl);
  };
  const removeToast = (id: string) =>
    setToasts((s) => s.filter((x) => x.id !== id));
  const [categories, setCategories] = useState<Record<TxType, string[]>>({
    income: [],
    expense: [],
  });
  const [isCatOpen, setIsCatOpen] = useState(false);
  const [catEditIndex, setCatEditIndex] = useState<number | null>(null);
  const [catEditType, setCatEditType] = useState<TxType | null>(null);
  const [catEditValue, setCatEditValue] = useState("");
  const editInputRef = useRef<HTMLInputElement | null>(null);

  // Load transactions from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onesaving.transactions");
      if (raw) {
        const parsed = JSON.parse(raw) as Transaction[];
        if (Array.isArray(parsed)) setTransactions(parsed);
      }
    } catch (e) {
      // ignore parse errors
      console.debug("Failed to load transactions from localStorage", e);
    }
  }, []);

  // Load categories from localStorage on mount (migrates old array shape to per-type)
  useEffect(() => {
    try {
      const raw = localStorage.getItem("onesaving.categories");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          // legacy: single array -> treat as expense defaults
          setCategories({ income: [], expense: parsed });
        } else if (parsed && typeof parsed === "object") {
          // expected shape: { income: string[], expense: string[] }
          const inc = Array.isArray(parsed.income) ? parsed.income : [];
          const exp = Array.isArray(parsed.expense) ? parsed.expense : [];
          setCategories({ income: inc, expense: exp });
        }
      } else {
        // default categories per-type
        setCategories({
          income: [
            "เงินเดือน",
            "โบนัส",
            "ค่าคอมมิชชั่น",
            "รายได้พิเศษ",
            "เงินลงทุน",
          ],
          expense: [
            "อาหาร",
            "เดินทาง",
            "ช้อปปิ้ง",
            "บิลค่าใช้จ่าย",
            "สุขภาพ",
            "บันเทิง",
          ],
        });
      }
    } catch (e) {
      console.debug("Failed to load categories from localStorage", e);
    }
  }, []);

  // focus the edit input when editing a category
  useEffect(() => {
    if (catEditIndex !== null) {
      // delay to ensure element is rendered
      setTimeout(() => editInputRef.current?.focus(), 0);
    }
  }, [catEditIndex]);

  // Save transactions to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem(
        "onesaving.transactions",
        JSON.stringify(transactions)
      );
    } catch (e) {
      console.debug("Failed to save transactions to localStorage", e);
    }
  }, [transactions]);

  // persist categories
  useEffect(() => {
    try {
      localStorage.setItem("onesaving.categories", JSON.stringify(categories));
    } catch (e) {
      console.debug("Failed to save categories to localStorage", e);
    }
  }, [categories]);

  const resetForm = () => {
    setType("income");
    setAmount("");
    setCategory("");
    setDate(todayLocal());
    setDescription("");
    setReceipt(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const addTransaction = () => {
    if (!type || !amount || !category || !date) {
      addToast(
        t(locale, "messages.missingFields", "กรุณากรอกข้อมูลให้ครบ"),
        "error"
      );
      return;
    }
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) {
      addToast(
        t(locale, "messages.invalidAmount", "จำนวนเงินไม่ถูกต้อง"),
        "error"
      );
      return;
    }

    const tx: Transaction = {
      id: crypto.randomUUID(),
      type,
      amount: parsed,
      category,
      date,
      description: description?.trim() || undefined,
      receipt: receipt || undefined,
    };

    setTransactions((prev) => [tx, ...prev]);
    resetForm();
    addToast(t(locale, "messages.saved", "บันทึกรายการสำเร็จ"), "success");
  };

  const filteredTx = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const totalIncome = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () =>
      transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const balance = totalIncome - totalExpense;

  const onSelectFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setReceipt(null);
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setReceipt(String(e.target?.result || null));
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <div className="px-6 pb-8 pt-6">
        <Tabs defaultValue="add" className="w-full">
          <TabsList className="flex w-full gap-2 overflow-x-auto rounded-lg p-1">
            <TabsTrigger
              value="add"
              className="flex-1 min-w-[92px] px-3 py-2 sm:px-4 sm:py-2.5 justify-center gap-2"
            >
              <div className="flex items-center justify-center gap-2">
                <Plus className="h-4 w-4" />
                <span suppressHydrationWarning className="hidden sm:inline">
                  {t(locale, "page.add", "เพิ่มรายการ")}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="view"
              className="flex-1 min-w-[92px] px-3 py-2 sm:px-4 sm:py-2.5 justify-center gap-2"
            >
              <div className="flex items-center justify-center gap-2">
                <List className="h-4 w-4" />
                <span suppressHydrationWarning className="hidden sm:inline">
                  {t(locale, "page.view", "ดูรายการ")}
                </span>
              </div>
            </TabsTrigger>

            <TabsTrigger
              value="summary"
              className="flex-1 min-w-[92px] px-3 py-2 sm:px-4 sm:py-2.5 justify-center gap-2"
            >
              <div className="flex items-center justify-center gap-2">
                <PieChart className="h-4 w-4" />
                <span suppressHydrationWarning className="hidden sm:inline">
                  {t(locale, "page.summary", "สรุปยอด")}
                </span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Add Tab */}
          <TabsContent value="add" className="mt-6">
            <Card className="border-none shadow-xl">
              <CardHeader>
                <CardTitle>{t(locale, "page.add", "เพิ่มรายการ")}</CardTitle>
                <CardDescription>
                  {t(
                    locale,
                    "page.addDescription",
                    "บันทึกข้อมูลรายรับ/รายจ่าย พร้อมแนบสลิปได้"
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>{t(locale, "form.type", "ประเภท")}</Label>
                      <div className="flex items-center gap-2">
                        <label
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 ${
                            type === "income"
                              ? "bg-green-600 text-white"
                              : "bg-muted/10"
                          }`}
                        >
                          <input
                            type="radio"
                            name="tx-type"
                            value="income"
                            checked={type === "income"}
                            onChange={() => {
                              setType("income");
                              setCategory("");
                            }}
                            className="hidden"
                          />
                          {t(locale, "type.income", "รายรับ")}
                        </label>

                        <label
                          className={`inline-flex cursor-pointer items-center gap-2 rounded-md px-3 py-1.5 ${
                            type === "expense"
                              ? "bg-red-600 text-white"
                              : "bg-muted/10"
                          }`}
                        >
                          <input
                            type="radio"
                            name="tx-type"
                            value="expense"
                            checked={type === "expense"}
                            onChange={() => {
                              setType("expense");
                              setCategory("");
                            }}
                            className="hidden"
                          />
                          {t(locale, "type.expense", "รายจ่าย")}
                        </label>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="amount">
                        {t(locale, "form.amount", "จำนวนเงิน")}
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        placeholder={t(
                          locale,
                          "placeholders.amount",
                          "กรอกจำนวนเงิน"
                        )}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        min={0}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">
                        {t(locale, "form.category", "หมวดหมู่")}
                      </Label>
                      <div className="flex items-center gap-2">
                        <Select
                          value={category}
                          onValueChange={setCategory}
                          disabled={!type}
                        >
                          <SelectTrigger id="category">
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                          <SelectContent>
                            {(type ? categories[type] : []).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => {
                            setIsCatOpen(true);
                            setCatEditType("income");
                            setCatEditIndex(null);
                            setCatEditValue("");
                          }}
                          className="ml-2 inline-flex items-center gap-2"
                        >
                          <span className="text-sm">✏️</span>
                          <span
                            suppressHydrationWarning
                            className="hidden sm:inline"
                          >
                            {t(
                              locale,
                              "buttons.manageCategories",
                              "จัดการหมวดหมู่"
                            )}
                          </span>
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="date">
                        {t(locale, "form.date", "วันที่")}
                      </Label>
                      <Input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="description">
                        {t(locale, "form.description", "รายละเอียด")}
                      </Label>
                      <Textarea
                        id="description"
                        placeholder="กรอกรายละเอียด"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="min-h-[120px]"
                      />
                    </div>

                    <div className="space-y-3">
                      <Label>อัพโหลดสลิป/ใบเสร็จ</Label>
                      <div
                        className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-sky-300 p-6 transition hover:bg-sky-50"
                        onClick={() => fileRef.current?.click()}
                      >
                        <CloudUpload className="h-10 w-10" />
                        <p className="mt-2 text-sm text-muted-foreground">
                          {t(
                            locale,
                            "placeholders.uploadHelp",
                            "คลิกเพื่อเลือกไฟล์หรือวางไฟล์ที่นี่"
                          )}
                        </p>
                        <Input
                          ref={fileRef}
                          id="receipt"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) onSelectFile(file);
                          }}
                        />
                        {receipt && (
                          <div className="mt-4 flex flex-col items-center">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={receipt}
                              alt="receipt preview"
                              className="max-h-40 rounded-lg object-cover"
                            />
                            <div className="mt-2 inline-flex items-center gap-1 text-sm text-green-600">
                              <Check className="h-4 w-4" /> แนบไฟล์แล้ว
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Button
                    onClick={addTransaction}
                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Save className="h-4 w-4" />{" "}
                    {t(locale, "buttons.save", "บันทึกรายการ")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* View Tab */}
          <TabsContent value="view" className="mt-6">
            <div className="mb-4 max-w-xs">
              <Label htmlFor="filter">กรองตาม</Label>
              <Select
                value={filter}
                onValueChange={(v: "all" | TxType) => setFilter(v)}
              >
                <SelectTrigger id="filter" className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">ทั้งหมด</SelectItem>
                  <SelectItem value="income">รายรับ</SelectItem>
                  <SelectItem value="expense">รายจ่าย</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredTx.length === 0 ? (
              <div className="rounded-xl bg-muted/40 p-10 text-center text-muted-foreground">
                {t(locale, "empty.noTransactions", "ยังไม่มีรายการ")}
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredTx.map((t) => (
                  <Card key={t.id} className="transition hover:shadow-lg">
                    <CardContent className="flex items-center justify-between gap-4 p-5">
                      <div className="min-w-0">
                        <div className="text-base font-semibold text-foreground">
                          {t.description || t.category}
                        </div>
                        <div className="mt-1 text-sm text-muted-foreground">
                          {t.category} •{" "}
                          {new Date(t.date).toLocaleDateString("th-TH")}
                        </div>
                        {t.receipt ? (
                          <button
                            className="mt-3 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm"
                            onClick={() => setImagePreview(t.receipt!)}
                          >
                            <ImageIcon className="h-4 w-4" /> ดูใบเสร็จ
                          </button>
                        ) : null}
                      </div>
                      <div
                        className={`shrink-0 text-right text-lg font-bold ${
                          t.type === "income"
                            ? "text-emerald-600"
                            : "text-rose-600"
                        }`}
                      >
                        {t.type === "income" ? "+" : "-"}
                        {THB.format(t.amount)}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Summary Tab */}
          <TabsContent value="summary" className="mt-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white/95">
                    {t(locale, "summary.incomeTotal", "รายรับทั้งหมด")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold">
                    {THB.format(totalIncome)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white/95">
                    {t(locale, "summary.expenseTotal", "รายจ่ายทั้งหมด")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold">
                    {THB.format(totalExpense)}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                <CardHeader>
                  <CardTitle className="text-white/95">ยอดคงเหลือ</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className={`text-3xl font-extrabold ${
                      balance >= 0 ? "" : "text-white"
                    }`}
                  >
                    {THB.format(balance)}
                  </div>
                </CardContent>
              </Card>
            </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant={chartMode === "monthly" ? undefined : "secondary"}
                      onClick={() => setChartMode("monthly")}
                    >
                      {t(locale, "chart.monthly", "รายเดือน")}
                    </Button>
                    <Button
                      variant={chartMode === "yearly" ? undefined : "secondary"}
                      onClick={() => setChartMode("yearly")}
                    >
                      {t(locale, "chart.yearly", "รายปี")}
                    </Button>
                  </div>
                  <div>
                    {chartMode === "monthly" ? (
                      <Select
                        value={String(chartYear)}
                        onValueChange={(v) => setChartYear(Number(v))}
                      >
                        <SelectTrigger className="w-36">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from(
                            { length: 5 },
                            (_, i) => new Date().getFullYear() - i
                          ).map((y) => (
                            <SelectItem key={y} value={String(y)}>
                              {String(y)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : null}
                  </div>
                </div>
                <IncomeExpenseChart
                  transactions={transactions}
                  mode={chartMode}
                  year={chartYear}
                />
              </div>
            </TabsContent>
        </Tabs>

        {/* Image Dialog */}
        <Dialog
          open={!!imagePreview}
          onOpenChange={(o: boolean) => !o && setImagePreview(null)}
        >
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {t(locale, "dialog.receipt", "ใบเสร็จ")}
              </DialogTitle>
            </DialogHeader>
            {imagePreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imagePreview as string}
                alt="receipt"
                className="w-full rounded-lg"
              />
            ) : null}
          </DialogContent>
        </Dialog>

        {/* Categories Dialog */}
        <Dialog open={isCatOpen} onOpenChange={(o: boolean) => setIsCatOpen(o)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {t(locale, "dialog.manageCategories", "จัดการหมวดหมู่")}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-3 p-4">
              <div className="flex gap-2">
                <Button
                  variant={catEditType === "income" ? undefined : "secondary"}
                  className={
                    catEditType === "income"
                      ? "bg-sky-600 text-white hover:bg-sky-700"
                      : ""
                  }
                  onClick={() => {
                    setCatEditType("income");
                    setCatEditIndex(null);
                    setCatEditValue("");
                  }}
                >
                  รายรับ
                </Button>
                <Button
                  variant={catEditType === "expense" ? undefined : "secondary"}
                  className={
                    catEditType === "expense"
                      ? "bg-sky-600 text-white hover:bg-sky-700"
                      : ""
                  }
                  onClick={() => {
                    setCatEditType("expense");
                    setCatEditIndex(null);
                    setCatEditValue("");
                  }}
                >
                  รายจ่าย
                </Button>
              </div>

              <div className="space-y-2">
                {(catEditType ? categories[catEditType] : []).map((c, idx) => (
                  <div key={c + idx} className="flex items-center gap-2">
                    <Input
                      ref={catEditIndex === idx ? editInputRef : undefined}
                      value={catEditIndex === idx ? catEditValue : c}
                      onChange={(e) => {
                        if (catEditIndex === idx)
                          setCatEditValue(e.target.value);
                      }}
                      readOnly={catEditIndex !== idx}
                    />
                    {catEditIndex === idx ? (
                      <>
                        <Button
                          onClick={() => {
                            if (catEditValue.trim() && catEditType) {
                              setCategories((s) => ({
                                ...s,
                                [catEditType]: s[catEditType].map((x, i) =>
                                  i === idx ? catEditValue.trim() : x
                                ),
                              }));
                              addToast(
                                t(
                                  locale,
                                  "messages.categoryEdited",
                                  "แก้ไขหมวดหมู่เรียบร้อย"
                                ),
                                "success"
                              );
                            }
                            setCatEditIndex(null);
                            setCatEditValue("");
                          }}
                        >
                          {t(locale, "buttons.save", "บันทึก")}
                        </Button>
                        <Button
                          onClick={() => {
                            setCatEditIndex(null);
                            setCatEditValue("");
                          }}
                        >
                          {t(locale, "buttons.cancel", "ยกเลิก")}
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button
                          className="bg-emerald-600 text-white hover:bg-emerald-700"
                          onClick={() => {
                          setCatEditIndex(idx);
                          setCatEditValue(c);
                          }}
                        >
                          {t(locale, "buttons.edit", "แก้ไข")}
                        </Button>
                        <Button
                          className="bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => {
                          if (catEditType) {
                            setCategories((s) => ({
                            ...s,
                            [catEditType]: s[catEditType].filter(
                              (_, i) => i !== idx
                            ),
                            }));
                            addToast(
                            t(
                              locale,
                              "messages.categoryDeleted",
                              "ลบหมวดหมู่เรียบร้อย"
                            ),
                            "success"
                            );
                          }
                          }}
                        >
                          {t(locale, "buttons.delete", "ลบ")}
                        </Button>
                      </>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <Input
                  placeholder={t(
                    locale,
                    "placeholders.newCategory",
                    "เพิ่มหมวดใหม่"
                  )}
                  value={catEditIndex === null ? catEditValue : ""}
                  onChange={(e) => setCatEditValue(e.target.value)}
                />
                <Select
                  value={catEditType ?? undefined}
                  onValueChange={(v) => setCatEditType(v as TxType)}
                >
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(locale, "form.type", "ประเภท")}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">
                      {t(locale, "type.income", "รายรับ")}
                    </SelectItem>
                    <SelectItem value="expense">
                      {t(locale, "type.expense", "รายจ่าย")}
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  className="bg-sky-600 text-white hover:bg-sky-700"
                  onClick={() => {
                    const v = catEditValue.trim();
                    if (!catEditType) {
                      addToast("โปรดเลือกประเภทก่อนเพิ่ม", "error");
                      return;
                    }
                    if (v) {
                      setCategories((s) => ({
                        ...s,
                        [catEditType]: Array.from(new Set([...s[catEditType], v])),
                      }));
                      setCatEditValue("");
                      addToast(
                        t(locale, "messages.categoryAdded", "เพิ่มหมวดหมู่เรียบร้อย"),
                        "success"
                      );
                    } else {
                      addToast(
                        t(locale, "messages.categoryEmpty", "กรุณากรอกชื่อหมวดหมู่"),
                        "error"
                      );
                    }
                  }}
                >
                   {t(locale, "buttons.add", "เพิ่ม")}
                </Button>
              </div>

              {/* <div className="flex justify-end gap-2">
                <Button onClick={() => setIsCatOpen(false)}>
                  {t(locale, "buttons.close", "ปิด")}
                </Button>
              </div> */}
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Toast container */}
      <div className="fixed top-4 right-4 z-50 flex flex-col items-end gap-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`max-w-sm rounded-md px-4 py-2 text-sm shadow-lg ${
              t.kind === "success"
                ? "bg-emerald-600 text-white"
                : "bg-rose-600 text-white"
            }`}
          >
            <div className="flex items-center justify-between gap-4">
              <div>{t.message}</div>
              <button
                onClick={() => removeToast(t.id)}
                className="opacity-80 hover:opacity-100"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
