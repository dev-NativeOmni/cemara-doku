"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { WalletsView } from "@/components/wallets/WalletsView";
import { SettingsView } from "@/components/settings/SettingsView";
import { QuickTransactionModal } from "@/components/transactions/QuickTransactionModal";
import { getWallets, createWallet, updateWallet } from "@/services/walletService";
import { getCategories } from "@/services/categoryService";
import { getMonthTransactions, deleteTransaction } from "@/services/transactionService";
import { getBudgets, setBudget } from "@/services/budgetService";
import { Budget, Category, NavigationTab, Transaction, Wallet } from "@/types";
import { Trees, Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, household, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [quickModalOpen, setQuickModalOpen] = useState<boolean>(false);

  // Date selection state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());

  // Data states
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    if (!household) return;
    setDataLoading(true);
    try {
      const [w, c, txs, b] = await Promise.all([
        getWallets(household.id),
        getCategories(household.id),
        getMonthTransactions(household.id, currentYear, currentMonth),
        getBudgets(household.id, currentMonth, currentYear),
      ]);
      setWallets(w);
      setCategories(c);
      setTransactions(txs);
      setBudgets(b);
    } catch (err) {
      console.error("Error loading household data:", err);
    } finally {
      setDataLoading(false);
    }
  }, [household, currentYear, currentMonth]);

  useEffect(() => {
    if (household) {
      loadAllData();
    }
  }, [household, loadAllData]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-emerald-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="w-16 h-16 bg-emerald-800 rounded-2xl flex items-center justify-center shadow-lg border border-emerald-700 animate-pulse">
          <Trees className="w-8 h-8 text-emerald-300" />
        </div>
        <div className="flex items-center gap-2 text-emerald-200 text-sm font-medium">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Memuat Cemara...</span>
        </div>
      </div>
    );
  }

  // If unauthenticated or no household onboarded
  if (!user || !household) {
    return <AuthScreen />;
  }

  const totalBalance = wallets.reduce((sum, w) => sum + (w.currentBalance || 0), 0);

  const handleMonthChange = (month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  };

  const handleDeleteTransaction = async (tx: Transaction) => {
    if (!confirm("Hapus transaksi ini? Saldo dompet akan disesuaikan secara otomatis.")) return;
    if (!household) return;
    try {
      await deleteTransaction(household.id, tx);
      await loadAllData();
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus transaksi");
    }
  };

  const handleSaveBudget = async (categoryId: string, limitAmount: number) => {
    if (!household) return;
    await setBudget(household.id, categoryId, currentMonth, currentYear, limitAmount);
    await loadAllData();
  };

  const handleCreateWallet = async (data: Omit<Wallet, "id" | "updatedAt">) => {
    if (!household) return;
    await createWallet(household.id, data);
    await loadAllData();
  };

  const handleUpdateWallet = async (id: string, data: Partial<Wallet>) => {
    if (!household) return;
    await updateWallet(household.id, id, data);
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 selection:bg-emerald-200">
      {/* Header */}
      <Header
        currentMonth={currentMonth}
        currentYear={currentYear}
        totalBalance={totalBalance}
        onMonthChange={handleMonthChange}
        onOpenSettings={() => setActiveTab("settings")}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto -mt-2">
        {activeTab === "home" && (
          <DashboardView
            wallets={wallets}
            categories={categories}
            transactions={transactions}
            onOpenQuickModal={() => setQuickModalOpen(true)}
            onNavigateToTransactions={() => setActiveTab("transactions")}
            onNavigateToWallets={() => setActiveTab("wallets")}
            onDeleteTransaction={handleDeleteTransaction}
          />
        )}

        {activeTab === "transactions" && (
          <TransactionsView
            transactions={transactions}
            wallets={wallets}
            categories={categories}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenQuickModal={() => setQuickModalOpen(true)}
          />
        )}

        {activeTab === "budgets" && (
          <BudgetsView
            categories={categories}
            budgets={budgets}
            transactions={transactions}
            currentMonth={currentMonth}
            currentYear={currentYear}
            onSaveBudget={handleSaveBudget}
          />
        )}

        {activeTab === "wallets" && (
          <WalletsView
            wallets={wallets}
            onCreateWallet={handleCreateWallet}
            onUpdateWallet={handleUpdateWallet}
          />
        )}

        {activeTab === "settings" && (
          <SettingsView
            categories={categories}
            onRefreshCategories={loadAllData}
          />
        )}
      </main>

      {/* Bottom Navigation */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickModal={() => setQuickModalOpen(true)}
      />

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        wallets={wallets}
        categories={categories}
        onSuccess={loadAllData}
      />
    </div>
  );
}
