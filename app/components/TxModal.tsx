"use client";

import React, { useMemo, useRef, useState } from "react";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "./ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Textarea } from "./ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
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
  expense: ["อาหาร", "เดินทาง", "ช้อปปิ้ง", "บิลค่าใช้จ่าย", "สุขภาพ", "บันเทิง"],
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
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [type, setType] = useState<"" | TxType>("income");
  const [amount, setAmount] = useState<string>("");
  const [category, setCategory] = useState<string>("");
  const [date, setDate] = useState<string>(todayLocal());
  const [description, setDescription] = useState<string>("");
  const [receipt, setReceipt] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | TxType>("all");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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
    if (!type || !amount || !category || !date) return;
    const parsed = Number(amount);
    if (Number.isNaN(parsed) || parsed <= 0) return;

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
  };

  const filteredTx = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((t) => t.type === filter);
  }, [transactions, filter]);

  const totalIncome = useMemo(
    () => transactions.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0),
    [transactions]
  );
  const totalExpense = useMemo(
    () => transactions.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0),
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-600 py-6 px-4">
      <div className="mx-auto max-w-6xl rounded-2xl bg-white shadow-2xl">
        {/* Header */}
        <div className="rounded-t-2xl bg-gradient-to-tr from-sky-400 to-cyan-300 px-6 py-10 text-white">
          <h1 className="flex items-center gap-3 text-3xl font-bold drop-shadow-sm">
            <Wallet className="h-8 w-8" /> ระบบจัดการรายรับรายจ่าย
          </h1>
          <p className="mt-2 opacity-90">จัดการเงินของคุณอย่างง่ายดาย</p>
        </div>

        {/* Tabs */}
        <div className="px-6 pb-8 pt-6">
          <Tabs defaultValue="add" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="add" className="gap-2">
                <Plus className="h-4 w-4" /> เพิ่มรายการ
              </TabsTrigger>
              <TabsTrigger value="view" className="gap-2">
                <List className="h-4 w-4" /> ดูรายการ
              </TabsTrigger>
              <TabsTrigger value="summary" className="gap-2">
                <PieChart className="h-4 w-4" /> สรุปยอด
              </TabsTrigger>
            </TabsList>

            {/* Add Tab */}
            <TabsContent value="add" className="mt-6">
              <Card className="border-none shadow-xl">
                <CardHeader>
                  <CardTitle>เพิ่มรายการใหม่</CardTitle>
                  <CardDescription>บันทึกข้อมูลรายรับ/รายจ่าย พร้อมแนบสลิปได้</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="type">ประเภท</Label>
                        <Select value={type} onValueChange={(v: TxType) => { setType(v); setCategory(""); }}>
                          <SelectTrigger id="type">
                            <SelectValue placeholder="เลือกประเภท" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="income">รายรับ</SelectItem>
                            <SelectItem value="expense">รายจ่าย</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="amount">จำนวนเงิน</Label>
                        <Input
                          id="amount"
                          type="number"
                          placeholder="กรอกจำนวนเงิน"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min={0}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="category">หมวดหมู่</Label>
                        <Select value={category} onValueChange={setCategory} disabled={!type}>
                          <SelectTrigger id="category">
                            <SelectValue placeholder="เลือกหมวดหมู่" />
                          </SelectTrigger>
                          <SelectContent>
                            {(type ? CATEGORIES[type] : []).map((cat) => (
                              <SelectItem key={cat} value={cat}>
                                {cat}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="date">วันที่</Label>
                        <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="description">รายละเอียด</Label>
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
                            คลิกเพื่อเลือกไฟล์หรือวางไฟล์ที่นี่
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
                    <Button onClick={addTransaction} className="gap-2">
                      <Save className="h-4 w-4" /> บันทึกรายการ
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* View Tab */}
            <TabsContent value="view" className="mt-6">
              <div className="mb-4 max-w-xs">
                <Label htmlFor="filter">กรองตาม</Label>
                <Select value={filter} onValueChange={(v: "all" | TxType) => setFilter(v)}>
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
                  ยังไม่มีรายการ
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
                            {t.category} • {new Date(t.date).toLocaleDateString("th-TH")}
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
                        <div className={`shrink-0 text-right text-lg font-bold ${
                          t.type === "income" ? "text-emerald-600" : "text-rose-600"
                        }`}>
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
                    <CardTitle className="text-white/95">รายรับทั้งหมด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{THB.format(totalIncome)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white/95">รายจ่ายทั้งหมด</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-extrabold">{THB.format(totalExpense)}</div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-xl">
                  <CardHeader>
                    <CardTitle className="text-white/95">ยอดคงเหลือ</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-3xl font-extrabold ${balance >= 0 ? "" : "text-white"}`}>
                      {THB.format(balance)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Image Dialog */}
  <Dialog open={!!imagePreview} onOpenChange={(o: boolean) => !o && setImagePreview(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>ใบเสร็จ</DialogTitle>
          </DialogHeader>
          {imagePreview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imagePreview} alt="receipt" className="w-full rounded-lg" />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  );
}
