"use client";

import React, { useState } from "react";
import { RecurringBill, Wallet, Category } from "@/types";
import { formatRupiah, getMonthName } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { BillModal } from "./BillModal";
import { PayBillModal } from "./PayBillModal";
import { MonthSelector } from "../ui/MonthSelector";
import {
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Trash2,
  Edit2,
  AlertCircle,
  Receipt,
  RotateCcw,
} from "lucide-react";

interface BillsViewProps {
  bills: RecurringBill[];
  wallets: Wallet[];
  categories: Category[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  onCreateBill: (data: Omit<RecurringBill, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateBill: (id: string, data: Partial<RecurringBill>) => Promise<void>;
  onDeleteBill: (id: string) => Promise<void>;
  onPayBill: (billId: string, walletId: string, amount: number) => Promise<void>;
  onUnpayBill: (billId: string, year: number, month: number) => Promise<void>;
}

export function BillsView({
  bills,
  wallets,
  categories,
  currentMonth,
  currentYear,
  onMonthChange,
  onCreateBill,
  onUpdateBill,
  onDeleteBill,
  onPayBill,
  onUnpayBill,
}: BillsViewProps) {
  const [filterTab, setFilterTab] = useState<"all" | "unpaid" | "paid">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);
  const [payingBill, setPayingBill] = useState<RecurringBill | null>(null);

  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const todayDate = new Date();
  const todayDay = todayDate.getDate();

  // Financial Stats
  const totalBillsAmount = bills.reduce((sum, b) => sum + b.amount, 0);

  const paidBills = bills.filter((b) => !!b.paidMonths?.[monthKey]);
  const unpaidBills = bills.filter((b) => !b.paidMonths?.[monthKey]);

  const totalPaidAmount = paidBills.reduce((sum, b) => {
    const paidInfo = b.paidMonths?.[monthKey];
    return sum + (paidInfo?.paidAmount || b.amount);
  }, 0);

  const totalUnpaidAmount = unpaidBills.reduce((sum, b) => sum + b.amount, 0);
  const completionRate = totalBillsAmount > 0 ? (totalPaidAmount / totalBillsAmount) * 100 : 0;

  const filteredBills = bills.filter((b) => {
    const isPaid = !!b.paidMonths?.[monthKey];
    if (filterTab === "unpaid") return !isPaid;
    if (filterTab === "paid") return isPaid;
    return true;
  });

  const handleDelete = async (bill: RecurringBill) => {
    if (!confirm(`Hapus tagihan "${bill.title}"?`)) return;
    await onDeleteBill(bill.id);
  };

  const handleUnpay = async (bill: RecurringBill) => {
    if (!confirm(`Batalkan status lunas untuk "${bill.title}" di bulan ini?`)) return;
    await onUnpayBill(bill.id, currentYear, currentMonth);
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-2 lg:pt-0">
      {/* Month Selector for Mobile */}
      <div className="lg:hidden">
        <MonthSelector
          currentMonth={currentMonth}
          currentYear={currentYear}
          onMonthChange={onMonthChange}
        />
      </div>

      {/* Top Overview Bento Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <Receipt className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
                Tagihan & Langganan Rutin
              </h3>
              <p className="text-xs text-slate-400">
                Periode: {getMonthName(currentMonth - 1)} {currentYear}
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingBill(null);
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Tambah Tagihan</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Tagihan</span>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-tight">
              {formatRupiah(totalBillsAmount)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Sudah Dibayar</span>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatRupiah(totalPaidAmount)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Sisa Belum Lunas</span>
            <span className="text-xs md:text-sm font-bold text-rose-600 dark:text-rose-400 tracking-tight">
              {formatRupiah(totalUnpaidAmount)}
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        {totalBillsAmount > 0 && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${Math.min(completionRate, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Semua ({bills.length})
          </button>
          <button
            onClick={() => setFilterTab("unpaid")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "unpaid"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Belum Lunas ({unpaidBills.length})
          </button>
          <button
            onClick={() => setFilterTab("paid")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "paid"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Lunas ({paidBills.length})
          </button>
        </div>
      </div>

      {/* Bills Grid Cards */}
      {filteredBills.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <Receipt className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">
            Tidak ada data tagihan
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Catat tagihan rutin bulanan (Listrik, Internet, BPJS, Sekolah) agar tidak terlewat jatuh tempo.
          </p>
          <button
            onClick={() => {
              setEditingBill(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Tagihan Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBills.map((bill) => {
            const isPaid = !!bill.paidMonths?.[monthKey];
            const paidInfo = bill.paidMonths?.[monthKey];
            const defaultWallet = wallets.find((w) => w.id === bill.walletId);
            const category = categories.find((c) => c.id === bill.categoryId);

            // Due calculation
            const isPastDue = !isPaid && todayDay > bill.dueDay && currentMonth === todayDate.getMonth() + 1 && currentYear === todayDate.getFullYear();
            const isDueSoon = !isPaid && bill.dueDay - todayDay <= 3 && bill.dueDay >= todayDay;

            return (
              <div
                key={bill.id}
                className={`bg-white dark:bg-slate-900 rounded-3xl p-5 border shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition relative overflow-hidden ${
                  isPaid
                    ? "border-emerald-200/80 dark:border-emerald-900/50"
                    : isPastDue
                    ? "border-rose-300 dark:border-rose-900/60"
                    : "border-slate-100 dark:border-slate-800"
                }`}
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: bill.color || "#10B981" }}
                    >
                      <DynamicIcon name={bill.icon || "Receipt"} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {bill.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 truncate">
                        {category?.name || "Tagihan"} {defaultWallet ? `• ${defaultWallet.name}` : ""}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => {
                        setEditingBill(bill);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                      title="Ubah Tagihan"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(bill)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Hapus Tagihan"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Amount & Due Date Info */}
                <div className="space-y-2 pt-1">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-slate-400 font-medium">Nominal:</span>
                    <span className="text-base font-extrabold text-slate-900 dark:text-white">
                      {formatRupiah(bill.amount)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-50 dark:border-slate-800">
                    <span className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>Jatuh Tempo: Tgl {bill.dueDay}</span>
                    </span>

                    {isPaid ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Lunas</span>
                      </span>
                    ) : isPastDue ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 px-2 py-0.5 rounded-full border border-rose-200 dark:border-rose-800">
                        <AlertCircle className="w-3.5 h-3.5" />
                        <span>Lewat Tempo</span>
                      </span>
                    ) : isDueSoon ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Segera Bayar</span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-bold text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full">
                        Belum Bayar
                      </span>
                    )}
                  </div>

                  {bill.notes && (
                    <p className="text-[11px] text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-2 rounded-xl">
                      {bill.notes}
                    </p>
                  )}
                </div>

                {/* Bottom Action CTA */}
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800">
                  {isPaid ? (
                    <button
                      onClick={() => handleUnpay(bill)}
                      className="w-full py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Batalkan Status Lunas</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setPayingBill(bill)}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Bayar Tagihan Ini</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Bill Modal */}
      <BillModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingBill(null);
        }}
        bill={editingBill}
        categories={categories}
        wallets={wallets}
        onSave={async (data) => {
          if (editingBill) {
            await onUpdateBill(editingBill.id, data);
          } else {
            await onCreateBill(data);
          }
        }}
      />

      {/* Pay Bill Modal */}
      <PayBillModal
        isOpen={!!payingBill}
        onClose={() => setPayingBill(null)}
        bill={payingBill}
        wallets={wallets}
        currentMonth={currentMonth}
        currentYear={currentYear}
        onPay={async (billId, walletId, amount) => {
          await onPayBill(billId, walletId, amount);
          setPayingBill(null);
        }}
      />
    </div>
  );
}

