"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { AuthScreen } from "@/components/auth/AuthScreen";
import { Header } from "@/components/layout/Header";
import { BottomNav } from "@/components/layout/BottomNav";
import { DashboardView } from "@/components/dashboard/DashboardView";
import { TransactionsView } from "@/components/transactions/TransactionsView";
import { BudgetsView } from "@/components/budgets/BudgetsView";
import { SavingsView } from "@/components/savings/SavingsView";
import { WalletsView } from "@/components/wallets/WalletsView";
import { SettingsView } from "@/components/settings/SettingsView";
import { QuickTransactionModal } from "@/components/transactions/QuickTransactionModal";
import { MonthlyReportModal } from "@/components/reports/MonthlyReportModal";
import { DesktopSidebar } from "@/components/layout/DesktopSidebar";
import { OfflineIndicator } from "@/components/ui/OfflineIndicator";
import { PwaInstallPrompt } from "@/components/ui/PwaInstallPrompt";

import { getWallets, createWallet, updateWallet } from "@/services/walletService";
import { getCategories } from "@/services/categoryService";
import { getMonthTransactions, deleteTransaction } from "@/services/transactionService";
import { getBudgets, setBudget, deleteBudget, copyPreviousMonthBudgets } from "@/services/budgetService";
import {
  getSavingsGoals,
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  depositToSavingsGoal,
} from "@/services/savingsService";
import { getHouseholdMembers } from "@/services/authService";
import { Budget, Category, NavigationTab, SavingsGoal, Transaction, UserProfile, Wallet } from "@/types";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { user, userProfile, household, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState<NavigationTab>("home");
  const [quickModalOpen, setQuickModalOpen] = useState<boolean>(false);
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);

  // Date selection state
  const now = new Date();
  const [currentMonth, setCurrentMonth] = useState<number>(now.getMonth() + 1); // 1-12
  const [currentYear, setCurrentYear] = useState<number>(now.getFullYear());

  // Data states
  const [wallets, setWallets] = useState<Wallet[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [householdMembers, setHouseholdMembers] = useState<UserProfile[]>([]);
  const [dataLoading, setDataLoading] = useState<boolean>(false);

  const loadAllData = useCallback(async () => {
    if (!household) return;
    setDataLoading(true);
    try {
      const [w, c, txs, b, g] = await Promise.all([
        getWallets(household.id),
        getCategories(household.id),
        getMonthTransactions(household.id, currentYear, currentMonth),
        getBudgets(household.id, currentMonth, currentYear),
        getSavingsGoals(household.id),
      ]);
      setWallets(w);
      setCategories(c);
      setTransactions(txs);
      setBudgets(b);
      setSavingsGoals(g);

      if (household.memberUids && household.memberUids.length > 0) {
        const members = await getHouseholdMembers(household.memberUids);
        setHouseholdMembers(members);
      }
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

  if (authLoading || (dataLoading && !household)) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 p-2.5 flex items-center justify-center mb-3 shadow-xl shadow-slate-200/50 dark:shadow-none animate-bounce">
          <img src="/logo.png" alt="Cemara" className="w-full h-full object-contain drop-shadow" />
        </div>
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
          Memuat Cemara...
        </p>
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

  const handleDeleteBudget = async (categoryId: string) => {
    if (!household) return;
    await deleteBudget(household.id, categoryId, currentMonth, currentYear);
    await loadAllData();
  };

  const handleCopyPreviousMonthBudgets = async (): Promise<number> => {
    if (!household) return 0;
    const count = await copyPreviousMonthBudgets(household.id, currentMonth, currentYear);
    if (count > 0) {
      await loadAllData();
    }
    return count;
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

  // Savings Goals Handlers
  const handleCreateSavingsGoal = async (data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => {
    if (!household) return;
    await createSavingsGoal(household.id, data);
    await loadAllData();
  };

  const handleUpdateSavingsGoal = async (id: string, data: Partial<SavingsGoal>) => {
    if (!household) return;
    await updateSavingsGoal(household.id, id, data);
    await loadAllData();
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    if (!household) return;
    await deleteSavingsGoal(household.id, id);
    await loadAllData();
  };

  const handleDepositSavingsGoal = async (goalId: string, amount: number, walletId?: string) => {
    if (!household) return;
    await depositToSavingsGoal(
      household.id,
      goalId,
      amount,
      walletId,
      user.uid,
      userProfile?.displayName || user.email?.split("@")[0]
    );
    await loadAllData();
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex text-slate-900 dark:text-slate-100 selection:bg-emerald-200">
      {/* Offline Indicator & PWA prompt */}
      <OfflineIndicator />
      <PwaInstallPrompt />

      {/* Desktop Left Sidebar (Only visible on lg: screens) */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickModal={() => setQuickModalOpen(true)}
        transactionCount={transactions.length}
      />

      {/* Main App Container */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Header (Adapts between mobile banner & desktop top bar) */}
        <Header
          currentMonth={currentMonth}
          currentYear={currentYear}
          totalBalance={totalBalance}
          onMonthChange={handleMonthChange}
          onOpenSettings={() => setActiveTab("settings")}
          activeTab={activeTab}
          onOpenQuickModal={() => setQuickModalOpen(true)}
          onOpenReportModal={() => setReportModalOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full max-w-5xl lg:max-w-7xl mx-auto -mt-2 lg:mt-0 lg:p-8">
          {activeTab === "home" && (
            <DashboardView
              wallets={wallets}
              categories={categories}
              transactions={transactions}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onOpenQuickModal={() => setQuickModalOpen(true)}
              onNavigateToTransactions={() => setActiveTab("transactions")}
              onNavigateToWallets={() => setActiveTab("wallets")}
              onDeleteTransaction={handleDeleteTransaction}
              householdMembers={householdMembers}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsView
              transactions={transactions}
              wallets={wallets}
              categories={categories}
              onDeleteTransaction={handleDeleteTransaction}
              onOpenQuickModal={() => setQuickModalOpen(true)}
              householdMembers={householdMembers}
              onOpenReportModal={() => setReportModalOpen(true)}
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
              onDeleteBudget={handleDeleteBudget}
              onCopyPreviousMonth={handleCopyPreviousMonthBudgets}
            />
          )}

          {activeTab === "savings" && (
            <SavingsView
              savingsGoals={savingsGoals}
              wallets={wallets}
              onCreateGoal={handleCreateSavingsGoal}
              onUpdateGoal={handleUpdateSavingsGoal}
              onDeleteGoal={handleDeleteSavingsGoal}
              onDeposit={handleDepositSavingsGoal}
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
      </div>

      {/* Bottom Navigation (Mobile Only: lg:hidden) */}
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

      {/* Monthly Printable Report Modal */}
      <MonthlyReportModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        household={household}
        currentMonth={currentMonth}
        currentYear={currentYear}
        transactions={transactions}
        wallets={wallets}
        categories={categories}
        budgets={budgets}
      />
    </div>
  );
}
