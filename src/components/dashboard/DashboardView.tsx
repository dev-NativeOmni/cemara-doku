"use client";

import { useState } from "react";
import { RecurringBill, ShoppingItem, Category, Transaction, Wallet, UserProfile } from "@/types";
import { formatRupiah, formatDateTime } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { ExpenseDonutChart, CategoryBreakdownItem } from "../analytics/ExpenseDonutChart";
import { DailyTrendChart } from "../analytics/DailyTrendChart";
import { MonthSelector } from "../ui/MonthSelector";
import { TotalBalanceCard } from "./TotalBalanceCard";
import {
  TrendingDown,
  TrendingUp,
  Scale,
  ArrowRight,
  Wallet as WalletIcon,
  ShoppingBag,
  Trash2,
  Plus,
  PieChart,
  BarChart3,
  Users,
  Calendar,
  Receipt,
  ShoppingCart,
  CheckCircle2,
} from "lucide-react";

interface DashboardViewProps {
  wallets: Wallet[];
  categories: Category[];
  transactions: Transaction[];
  currentMonth: number;
  currentYear: number;
  totalBalance: number;
  onMonthChange?: (month: number, year: number) => void;
  onOpenQuickModal: () => void;
  onNavigateToTransactions: () => void;
  onNavigateToWallets: () => void;
  onDeleteTransaction: (tx: Transaction) => void;
  householdMembers?: UserProfile[];
  recurringBills?: RecurringBill[];
  shoppingItems?: ShoppingItem[];
  onNavigateToBills?: () => void;
  onNavigateToShopping?: () => void;
}

export function DashboardView({
  wallets,
  categories,
  transactions,
  currentMonth,
  currentYear,
  totalBalance,
  onMonthChange,
  onOpenQuickModal,
  onNavigateToTransactions,
  onNavigateToWallets,
  onDeleteTransaction,
  householdMembers = [],
  recurringBills = [],
  shoppingItems = [],
  onNavigateToBills,
  onNavigateToShopping,
}: DashboardViewProps) {
  const [chartViewTab, setChartViewTab] = useState<"donut" | "trend">("donut");

  const monthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const unpaidBills = recurringBills.filter((b) => !b.paidMonths?.[monthKey]);
  const pendingShopping = shoppingItems.filter((i) => !i.isCompleted);

  // Calculate month income & expense
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const netCashflow = totalIncome - totalExpense;

  // Category breakdown for expenses
  const categoryExpenses: { [catId: string]: number } = {};
  transactions
    .filter((t) => t.type === "expense" && t.categoryId)
    .forEach((t) => {
      const catId = t.categoryId!;
      categoryExpenses[catId] = (categoryExpenses[catId] || 0) + t.amount;
    });

  const categoryBreakdown: CategoryBreakdownItem[] = Object.entries(categoryExpenses)
    .map(([catId, amount]) => {
      const cat = categories.find((c) => c.id === catId);
      const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
      return {
        id: catId,
        name: cat?.name || "Lainnya",
        color: cat?.color || "#10B981",
        icon: cat?.icon || "MoreHorizontal",
        amount,
        percentage,
      };
    })
    .sort((a, b) => b.amount - a.amount);

  // Member spending contribution (Poin 5)
  const memberExpenses: { [userId: string]: { name: string; amount: number; photoURL?: string; avatar?: string } } = {};
  transactions
    .filter((t) => t.type === "expense")
    .forEach((t) => {
      const uid = t.createdById || "unknown";
      const member = householdMembers.find((m) => m.uid === uid);
      const name = member?.displayName || t.creatorName || (uid === "unknown" ? "Keluarga" : "Anggota");

      if (!memberExpenses[uid]) {
        memberExpenses[uid] = {
          name,
          amount: 0,
          photoURL: member?.photoURL,
          avatar: member?.avatar,
        };
      }
      memberExpenses[uid].amount += t.amount;
    });

  const memberContributions = Object.entries(memberExpenses)
    .map(([uid, data]) => ({
      uid,
      ...data,
      percentage: totalExpense > 0 ? (data.amount / totalExpense) * 100 : 0,
    }))
    .sort((a, b) => b.amount - a.amount);

  const recentTransactions = transactions.slice(0, 8);

  return (
    <div className="space-y-5 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-3 lg:pt-0">
      {/* Month Selector on Mobile / Tablet (lg:hidden because desktop has it in the top navbar) */}
      {onMonthChange && (
        <div className="block lg:hidden">
          <MonthSelector
            currentMonth={currentMonth}
            currentYear={currentYear}
            onMonthChange={onMonthChange}
          />
        </div>
      )}

      {/* Dedicated Total Saldo Hero Card */}
      <TotalBalanceCard
        totalBalance={totalBalance}
        walletCount={wallets.length}
        onOpenQuickModal={onOpenQuickModal}
        onNavigateToWallets={onNavigateToWallets}
      />

      {/* Top Cashflow Summary Bento (3 cols on md/lg, 2 cols on mobile) */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {/* Income Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Pemasukan</span>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              {formatRupiah(totalIncome)}
            </p>
          </div>
        </div>

        {/* Expense Card */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-rose-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 mb-2">
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
            <span className="text-xs font-semibold">Pengeluaran</span>
          </div>
          <div>
            <p className="text-lg md:text-xl font-bold text-slate-800 dark:text-white tracking-tight">
              {formatRupiah(totalExpense)}
            </p>
          </div>
        </div>

        {/* Net Cashflow Banner (Full width on mobile, 3rd column on desktop) */}
        <div className="col-span-2 md:col-span-1 bg-gradient-to-br from-emerald-600 to-teal-700 text-white rounded-2xl p-4 shadow-sm border border-emerald-500/20 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-100">
                <Scale className="w-4 h-4" />
              </div>
              <span className="text-xs text-emerald-100/90 font-semibold">Arus Kas (Net)</span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                netCashflow >= 0 ? "bg-emerald-400/20 text-emerald-200 border border-emerald-400/30" : "bg-rose-500/20 text-rose-200 border border-rose-500/30"
              }`}
            >
              {netCashflow >= 0 ? "Surplus" : "Defisit"}
            </span>
          </div>
          <div>
            <p
              className={`text-lg md:text-xl font-bold tracking-tight ${
                netCashflow >= 0 ? "text-white" : "text-rose-200"
              }`}
            >
              {netCashflow >= 0 ? `+${formatRupiah(netCashflow)}` : formatRupiah(netCashflow)}
            </p>
          </div>
        </div>
      </div>

      {/* Main Responsive Grid Layout (1 col mobile, 2 cols on lg) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (lg: 7 cols) -> Visual Analytics & Transactions */}
        <div className="lg:col-span-7 space-y-6">
          {/* Visual Analytics Card (Donut Chart & Daily Trend Chart) */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <PieChart className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                  Analisis Pengeluaran
                </h3>
              </div>

              {/* Chart Toggle Tabs */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                <button
                  onClick={() => setChartViewTab("donut")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    chartViewTab === "donut"
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <PieChart className="w-3.5 h-3.5" />
                  <span>Donat</span>
                </button>
                <button
                  onClick={() => setChartViewTab("trend")}
                  className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition ${
                    chartViewTab === "trend"
                      ? "bg-white dark:bg-slate-700 text-emerald-700 dark:text-emerald-300 shadow-sm"
                      : "text-slate-500 hover:text-slate-800 dark:text-slate-400"
                  }`}
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Tren Harian</span>
                </button>
              </div>
            </div>

            {/* Chart Content */}
            {chartViewTab === "donut" ? (
              <ExpenseDonutChart data={categoryBreakdown} totalExpense={totalExpense} />
            ) : (
              <DailyTrendChart
                transactions={transactions}
                currentMonth={currentMonth}
                currentYear={currentYear}
              />
            )}
          </div>

          {/* Recent Transactions Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                Transaksi Terkini
              </h3>
              <div className="flex items-center gap-3">
                <button
                  onClick={onOpenQuickModal}
                  className="hidden sm:flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Catat Cepat</span>
                </button>
                <button
                  onClick={onNavigateToTransactions}
                  className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                >
                  <span>Lihat Semua</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {recentTransactions.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
                <p className="text-sm text-slate-400">Belum ada transaksi di bulan ini</p>
                <button
                  onClick={onOpenQuickModal}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-md shadow-emerald-600/20 transition"
                >
                  + Catat Transaksi Pertama
                </button>
              </div>
            ) : (
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm divide-y divide-slate-100 dark:divide-slate-800 overflow-hidden">
                {recentTransactions.map((tx) => {
                  const category = categories.find((c) => c.id === tx.categoryId);
                  const sourceWallet = wallets.find((w) => w.id === tx.walletId);
                  const destWallet = wallets.find((w) => w.id === tx.destinationWalletId);

                  return (
                    <div
                      key={tx.id}
                      className="p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{
                            backgroundColor:
                              tx.type === "transfer"
                                ? "#059669"
                                : category?.color || (tx.type === "income" ? "#10B981" : "#EF4444"),
                          }}
                        >
                          <DynamicIcon
                            name={
                              tx.type === "transfer"
                                ? "ArrowLeftRight"
                                : category?.icon || (tx.type === "income" ? "TrendingUp" : "ShoppingBag")
                            }
                            className="w-5 h-5"
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {tx.type === "transfer"
                              ? `Mutasi: ${sourceWallet?.name || "Dompet"} → ${destWallet?.name || "Dompet"}`
                              : category?.name || tx.notes || "Transaksi"}
                          </p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mt-0.5">
                            {tx.notes ? `${tx.notes} • ` : ""}
                            {sourceWallet?.name} • {formatDateTime(tx.transactionDate)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`text-xs md:text-sm font-bold ${
                            tx.type === "income"
                              ? "text-emerald-600 dark:text-emerald-400"
                              : tx.type === "expense"
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-700 dark:text-emerald-400"
                          }`}
                        >
                          {tx.type === "income" ? "+" : tx.type === "expense" ? "-" : ""}
                          {formatRupiah(tx.amount)}
                        </span>

                        <button
                          onClick={() => onDeleteTransaction(tx)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-slate-300 hover:text-rose-500 rounded transition"
                          title="Hapus Transaksi"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (lg: 5 cols) -> Wallets & Member Contribution */}
        <div className="lg:col-span-5 space-y-6">
          {/* Wallets Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white text-sm flex items-center gap-2">
                <WalletIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Dompet & Sumber Dana</span>
              </h3>
              <button
                onClick={onNavigateToWallets}
                className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <span>Kelola</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {wallets.slice(0, 4).map((w) => (
                <div
                  key={w.id}
                  className="bg-white dark:bg-slate-900 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
                    style={{ backgroundColor: w.color || "#10B981" }}
                  >
                    <DynamicIcon name={w.icon} className="w-5 h-5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                      {w.name}
                    </p>
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {formatRupiah(w.currentBalance)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recurring Bills Widget */}
          {recurringBills.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                    <Receipt className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      Tagihan Rutin
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {unpaidBills.length > 0 ? `${unpaidBills.length} tagihan belum dibayar` : "Semua tagihan lunas"}
                    </p>
                  </div>
                </div>

                {onNavigateToBills && (
                  <button
                    onClick={onNavigateToBills}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {recurringBills.slice(0, 3).map((bill) => {
                  const isPaid = !!bill.paidMonths?.[monthKey];
                  return (
                    <div
                      key={bill.id}
                      className="p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 flex items-center justify-between gap-2"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 text-xs shadow-sm"
                          style={{ backgroundColor: bill.color || "#10B981" }}
                        >
                          <DynamicIcon name={bill.icon || "Receipt"} className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                            {bill.title}
                          </p>
                          <p className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>Tgl {bill.dueDay}</span>
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                          {formatRupiah(bill.amount)}
                        </p>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full font-semibold ${
                            isPaid
                              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                              : "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                          }`}
                        >
                          {isPaid ? "Lunas" : "Belum Bayar"}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Collaborative Shopping List Widget */}
          {shoppingItems.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 flex items-center justify-center">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      Daftar Belanja
                    </h3>
                    <p className="text-[10px] text-slate-400">
                      {pendingShopping.length} item perlu dibeli
                    </p>
                  </div>
                </div>

                {onNavigateToShopping && (
                  <button
                    onClick={onNavigateToShopping}
                    className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Lihat Semua</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="space-y-1.5">
                {shoppingItems.slice(0, 4).map((item) => (
                  <div
                    key={item.id}
                    className="p-2 rounded-xl flex items-center justify-between gap-2 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center text-white ${
                          item.isCompleted
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}
                      >
                        {item.isCompleted && <CheckCircle2 className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs truncate ${
                          item.isCompleted
                            ? "line-through text-slate-400"
                            : "font-medium text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        {item.name}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 text-[11px] text-slate-500">
                      {item.quantity && (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {item.quantity}
                        </span>
                      )}
                      {item.estimatedPrice ? (
                        <span className="text-[10px] text-slate-400">
                          ({formatRupiah(item.estimatedPrice)})
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Member Spending Contribution */}
          {memberContributions.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800 dark:text-white text-sm">
                      Kontribusi Pengeluaran
                    </h3>
                    <p className="text-[10px] text-slate-400">Pembagian belanja per anggota keluarga</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                {memberContributions.map((m) => (
                  <div key={m.uid} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        {m.photoURL ? (
                          <img
                            src={m.photoURL}
                            alt={m.name}
                            className="w-6 h-6 rounded-full object-cover border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {m.avatar || m.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                          {m.name}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-extrabold text-slate-900 dark:text-white">
                          {formatRupiah(m.amount)}
                        </span>
                        <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 w-10 text-right">
                          {m.percentage.toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${m.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
