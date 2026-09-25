"use client";

import React, { useState } from "react";
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

import { createWallet, updateWallet } from "@/services/walletService";
import { deleteTransaction } from "@/services/transactionService";
import { setBudget, deleteBudget, copyPreviousMonthBudgets } from "@/services/budgetService";
import {
  createSavingsGoal,
  updateSavingsGoal,
  deleteSavingsGoal,
  depositToSavingsGoal,
} from "@/services/savingsService";
import {
  createRecurringBill,
  updateRecurringBill,
  deleteRecurringBill,
  payRecurringBill,
  unpayRecurringBill,
} from "@/services/billService";
import {
  createShoppingItem,
  updateShoppingItem,
  toggleShoppingItem,
  deleteShoppingItem,
  checkoutShoppingList,
  clearAllCompletedShoppingItems,
} from "@/services/shoppingService";
import { useHouseholdData } from "@/hooks/useHouseholdData";
import {
  NavigationTab,
  RecurringBill,
  SavingsGoal,
  ShoppingItem,
  Transaction,
  Wallet,
} from "@/types";
import { BillsView } from "@/components/bills/BillsView";
import { ShoppingView } from "@/components/shopping/ShoppingView";
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

  const {
    wallets,
    categories,
    transactions,
    budgets,
    savingsGoals,
    recurringBills,
    shoppingItems,
    householdMembers,
  } = useHouseholdData(household?.id, household?.memberUids, currentMonth, currentYear);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-emerald-500/20 p-2.5 flex items-center justify-center mb-3 shadow-xl shadow-slate-200/50 dark:shadow-none animate-bounce">
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
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus transaksi");
    }
  };

  const handleSaveBudget = async (categoryId: string, limitAmount: number) => {
    if (!household) return;
    await setBudget(household.id, categoryId, currentMonth, currentYear, limitAmount);
  };

  const handleDeleteBudget = async (categoryId: string) => {
    if (!household) return;
    await deleteBudget(household.id, categoryId, currentMonth, currentYear);
  };

  const handleCopyPreviousMonthBudgets = async (): Promise<number> => {
    if (!household) return 0;
    return copyPreviousMonthBudgets(household.id, currentMonth, currentYear);
  };

  const handleCreateWallet = async (data: Omit<Wallet, "id" | "updatedAt">) => {
    if (!household) return;
    await createWallet(household.id, data);
  };

  const handleUpdateWallet = async (id: string, data: Partial<Wallet>) => {
    if (!household) return;
    await updateWallet(household.id, id, data);
  };

  // Savings Goals Handlers
  const handleCreateSavingsGoal = async (data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => {
    if (!household) return;
    await createSavingsGoal(household.id, data);
  };

  const handleUpdateSavingsGoal = async (id: string, data: Partial<SavingsGoal>) => {
    if (!household) return;
    await updateSavingsGoal(household.id, id, data);
  };

  const handleDeleteSavingsGoal = async (id: string) => {
    if (!household) return;
    await deleteSavingsGoal(household.id, id);
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
  };

  // Recurring Bills Handlers
  const handleCreateBill = async (data: Omit<RecurringBill, "id" | "createdAt" | "updatedAt">) => {
    if (!household) return;
    await createRecurringBill(household.id, data);
  };

  const handleUpdateBill = async (id: string, data: Partial<RecurringBill>) => {
    if (!household) return;
    await updateRecurringBill(household.id, id, data);
  };

  const handleDeleteBill = async (id: string) => {
    if (!household) return;
    await deleteRecurringBill(household.id, id);
  };

  const handlePayBill = async (billId: string, walletId: string, amount: number) => {
    if (!household) return;
    await payRecurringBill(
      household.id,
      billId,
      currentYear,
      currentMonth,
      walletId,
      amount,
      user.uid,
      userProfile?.displayName || user.email?.split("@")[0]
    );
  };

  const handleUnpayBill = async (billId: string, year: number, month: number) => {
    if (!household) return;
    await unpayRecurringBill(household.id, billId, year, month);
  };

  // Shopping List Handlers
  const handleCreateShoppingItem = async (data: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">) => {
    if (!household) return;
    await createShoppingItem(household.id, data);
  };

  const handleUpdateShoppingItem = async (id: string, data: Partial<ShoppingItem>) => {
    if (!household) return;
    await updateShoppingItem(household.id, id, data);
  };

  const handleToggleShoppingItem = async (itemId: string, isCompleted: boolean) => {
    if (!household) return;
    await toggleShoppingItem(household.id, itemId, isCompleted);
  };

  const handleDeleteShoppingItem = async (id: string) => {
    if (!household) return;
    await deleteShoppingItem(household.id, id);
  };

  const handleCheckoutShopping = async (
    itemIds: string[],
    totalAmount: number,
    walletId: string,
    categoryId?: string,
    notes?: string
  ) => {
    if (!household) return;
    await checkoutShoppingList(
      household.id,
      itemIds,
      totalAmount,
      walletId,
      categoryId,
      notes,
      user.uid,
      userProfile?.displayName || user.email?.split("@")[0]
    );
  };

  const handleClearCompletedShopping = async () => {
    if (!household) return;
    await clearAllCompletedShoppingItems(household.id, shoppingItems);
  };

  const currentMonthKey = `${currentYear}-${String(currentMonth).padStart(2, "0")}`;
  const unpaidBillsCount = recurringBills.filter((b) => !b.paidMonths?.[currentMonthKey]).length;
  const shoppingPendingCount = shoppingItems.filter((i) => !i.isCompleted).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090D16] flex text-slate-900 dark:text-slate-100 selection:bg-emerald-200 dark:selection:bg-emerald-900/40 selection:text-emerald-900">
      {/* Offline Indicator & PWA prompt */}
      <OfflineIndicator />
      <PwaInstallPrompt />

      {/* Desktop Left Sidebar (Only visible on lg: screens) */}
      <DesktopSidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickModal={() => setQuickModalOpen(true)}
        transactionCount={transactions.length}
        unpaidBillsCount={unpaidBillsCount}
        shoppingPendingCount={shoppingPendingCount}
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
        <main className="flex-1 w-full max-w-5xl lg:max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {activeTab === "home" && (
            <DashboardView
              wallets={wallets}
              categories={categories}
              transactions={transactions}
              currentMonth={currentMonth}
              currentYear={currentYear}
              totalBalance={totalBalance}
              onMonthChange={handleMonthChange}
              onOpenQuickModal={() => setQuickModalOpen(true)}
              onNavigateToTransactions={() => setActiveTab("transactions")}
              onNavigateToWallets={() => setActiveTab("wallets")}
              onDeleteTransaction={handleDeleteTransaction}
              householdMembers={householdMembers}
              recurringBills={recurringBills}
              shoppingItems={shoppingItems}
              onNavigateToBills={() => setActiveTab("bills")}
              onNavigateToShopping={() => setActiveTab("shopping")}
              onNavigateToBudgets={() => setActiveTab("budgets")}
              onNavigateToSavings={() => setActiveTab("savings")}
            />
          )}

          {activeTab === "transactions" && (
            <TransactionsView
              transactions={transactions}
              wallets={wallets}
              categories={categories}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
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
              onMonthChange={handleMonthChange}
              onSaveBudget={handleSaveBudget}
              onDeleteBudget={handleDeleteBudget}
              onCopyPreviousMonth={handleCopyPreviousMonthBudgets}
            />
          )}

          {activeTab === "bills" && (
            <BillsView
              bills={recurringBills}
              wallets={wallets}
              categories={categories}
              currentMonth={currentMonth}
              currentYear={currentYear}
              onMonthChange={handleMonthChange}
              onCreateBill={handleCreateBill}
              onUpdateBill={handleUpdateBill}
              onDeleteBill={handleDeleteBill}
              onPayBill={handlePayBill}
              onUnpayBill={handleUnpayBill}
            />
          )}

          {activeTab === "shopping" && (
            <ShoppingView
              items={shoppingItems}
              wallets={wallets}
              categories={categories}
              currentUserId={user.uid}
              currentUserName={userProfile?.displayName || user.email?.split("@")[0] || "Saya"}
              onCreateItem={handleCreateShoppingItem}
              onUpdateItem={handleUpdateShoppingItem}
              onToggleItem={handleToggleShoppingItem}
              onDeleteItem={handleDeleteShoppingItem}
              onCheckout={handleCheckoutShopping}
              onClearCompleted={handleClearCompletedShopping}
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
            />
          )}
        </main>
      </div>

      {/* Bottom Navigation (Mobile Only: lg:hidden) */}
      <BottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenQuickModal={() => setQuickModalOpen(true)}
        unpaidBillsCount={unpaidBillsCount}
        shoppingPendingCount={shoppingPendingCount}
        onOpenReportModal={() => setReportModalOpen(true)}
      />

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={quickModalOpen}
        onClose={() => setQuickModalOpen(false)}
        wallets={wallets}
        categories={categories}
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
