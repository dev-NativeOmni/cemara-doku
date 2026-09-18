"use client";

import React, { useState } from "react";
import { SavingsGoal, Wallet } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { DynamicIcon } from "../ui/DynamicIcon";
import { SavingsGoalModal } from "./SavingsGoalModal";
import { DepositSavingsModal } from "./DepositSavingsModal";
import {
  Target,
  Plus,
  Sparkles,
  Calendar,
  CheckCircle2,
  Trash2,
  Edit2,
  PiggyBank,
  TrendingUp,
} from "lucide-react";

interface SavingsViewProps {
  savingsGoals: SavingsGoal[];
  wallets: Wallet[];
  onCreateGoal: (data: Omit<SavingsGoal, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateGoal: (id: string, data: Partial<SavingsGoal>) => Promise<void>;
  onDeleteGoal: (id: string) => Promise<void>;
  onDeposit: (goalId: string, amount: number, walletId?: string) => Promise<void>;
}

export function SavingsView({
  savingsGoals,
  wallets,
  onCreateGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDeposit,
}: SavingsViewProps) {
  const [filterTab, setFilterTab] = useState<"all" | "active" | "completed">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);
  const [depositingGoal, setDepositingGoal] = useState<SavingsGoal | null>(null);

  const totalTarget = savingsGoals.reduce((sum, g) => sum + g.targetAmount, 0);
  const totalCollected = savingsGoals.reduce((sum, g) => sum + g.currentAmount, 0);
  const overallPercentage = totalTarget > 0 ? (totalCollected / totalTarget) * 100 : 0;

  const filteredGoals = savingsGoals.filter((g) => {
    const isCompleted = g.currentAmount >= g.targetAmount;
    if (filterTab === "active") return !isCompleted;
    if (filterTab === "completed") return isCompleted;
    return true;
  });

  const handleDelete = async (goal: SavingsGoal) => {
    if (!confirm(`Hapus target tabungan "${goal.title}"?`)) return;
    await onDeleteGoal(goal.id);
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-2 lg:pt-0">
      {/* Top Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#0F2C59]/10 dark:bg-amber-400/10 text-[#0F2C59] dark:text-amber-400 flex items-center justify-center shrink-0">
              <PiggyBank className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
                Celengan & Target Impian
              </h3>
              <p className="text-xs text-slate-400">
                Wujudkan impian keluarga dengan tabungan terencana
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setEditingGoal(null);
              setIsCreateModalOpen(true);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-[#0F2C59] via-[#153464] to-[#1A365D] hover:from-[#0A1F3F] hover:to-[#0F2C59] text-white rounded-2xl text-xs font-bold shadow-md shadow-[#0F2C59]/20 border border-amber-400/25 flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 stroke-[2.5] text-amber-300" />
            <span>Target Baru</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Total Target</span>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-tight">
              {formatRupiah(totalTarget)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Terkumpul</span>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatRupiah(totalCollected)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Pencapaian</span>
            <span className="text-xs md:text-sm font-bold text-[#0F2C59] dark:text-amber-400 tracking-tight">
              {overallPercentage.toFixed(0)}%
            </span>
          </div>
        </div>

        {/* Global Progress Bar */}
        {totalTarget > 0 && (
          <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#0F2C59] to-[#254B8C] dark:from-amber-500 dark:to-amber-300 transition-all duration-500"
              style={{ width: `${Math.min(overallPercentage, 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Goals Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "all"
                ? "bg-[#0F2C59] dark:bg-amber-400 text-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Semua ({savingsGoals.length})
          </button>
          <button
            onClick={() => setFilterTab("active")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "active"
                ? "bg-[#0F2C59] dark:bg-amber-400 text-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Sedang Berjalan
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "completed"
                ? "bg-[#0F2C59] dark:bg-amber-400 text-white dark:text-slate-900 shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Tercapai
          </button>
        </div>
      </div>

      {/* Goals Cards List */}
      {filteredGoals.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-[#0F2C59]/10 dark:bg-amber-400/10 text-[#0F2C59] dark:text-amber-400 flex items-center justify-center mx-auto">
            <Target className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">
            Belum ada celengan impian
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Mulai rencanakan liburan, dana darurat, qurban, atau kebutuhan masa depan lainnya.
          </p>
          <button
            onClick={() => {
              setEditingGoal(null);
              setIsCreateModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-[#0F2C59] via-[#153464] to-[#1A365D] hover:from-[#0A1F3F] hover:to-[#0F2C59] text-white rounded-xl text-xs font-bold shadow-md shadow-[#0F2C59]/20 border border-amber-400/25 inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>Buat Target Pertama</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGoals.map((goal) => {
            const percent = goal.targetAmount > 0 ? (goal.currentAmount / goal.targetAmount) * 100 : 0;
            const isDone = goal.currentAmount >= goal.targetAmount;
            const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 hover:shadow-md transition group relative overflow-hidden"
              >
                {/* Top Card Row */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-sm shrink-0"
                      style={{ backgroundColor: goal.color || "#0F2C59" }}
                    >
                      <DynamicIcon name={goal.icon} className="w-6 h-6" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate">
                        {goal.title}
                      </h4>
                      <p className="text-xs font-semibold text-slate-400">
                        Target: {formatRupiah(goal.targetAmount)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingGoal(goal);
                        setIsCreateModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                      title="Ubah Target"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Hapus Target"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="font-extrabold text-slate-900 dark:text-white text-base">
                      {formatRupiah(goal.currentAmount)}
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        isDone
                          ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                      }`}
                    >
                      {percent.toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(percent, 100)}%`,
                        backgroundColor: goal.color || "#0F2C59",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span>{isDone ? "Target Tercapai 🎉" : `Sisa ${formatRupiah(remaining)}`}</span>
                    {goal.targetDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span>Target: {goal.targetDate}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Action CTA */}
                <div className="pt-2 border-t border-slate-50 dark:border-slate-800 flex items-center justify-between">
                  <button
                    onClick={() => setDepositingGoal(goal)}
                    className="w-full py-2.5 bg-[#0F2C59]/10 dark:bg-amber-400/10 hover:bg-[#0F2C59]/20 text-[#0F2C59] dark:text-amber-300 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-[#0F2C59]/20 dark:border-amber-400/20"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Setor Tabungan</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Goal Modal */}
      <SavingsGoalModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingGoal(null);
        }}
        goal={editingGoal}
        wallets={wallets}
        onSave={async (data) => {
          if (editingGoal) {
            await onUpdateGoal(editingGoal.id, data);
          } else {
            await onCreateGoal(data);
          }
        }}
      />

      {/* Deposit Modal */}
      <DepositSavingsModal
        isOpen={!!depositingGoal}
        onClose={() => setDepositingGoal(null)}
        goal={depositingGoal}
        wallets={wallets}
        onDeposit={onDeposit}
      />
    </div>
  );
}

