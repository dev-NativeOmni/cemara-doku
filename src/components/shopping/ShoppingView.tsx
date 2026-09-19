"use client";

import React, { useState } from "react";
import { ShoppingItem, Wallet, Category } from "@/types";
import { formatRupiah } from "@/lib/formatters";
import { ShoppingItemModal } from "./ShoppingItemModal";
import { ShoppingCheckoutModal } from "./ShoppingCheckoutModal";
import {
  Plus,
  ShoppingCart,
  CheckCircle2,
  Circle,
  Trash2,
  Edit2,
  ArrowRight,
  ShoppingBag,
  Sparkles,
  User,
} from "lucide-react";

interface ShoppingViewProps {
  items: ShoppingItem[];
  wallets: Wallet[];
  categories: Category[];
  currentUserId: string;
  currentUserName?: string;
  onCreateItem: (data: Omit<ShoppingItem, "id" | "createdAt" | "updatedAt">) => Promise<void>;
  onUpdateItem: (id: string, data: Partial<ShoppingItem>) => Promise<void>;
  onToggleItem: (id: string, isCompleted: boolean) => Promise<void>;
  onDeleteItem: (id: string) => Promise<void>;
  onCheckout: (
    itemIds: string[],
    totalAmount: number,
    walletId: string,
    categoryId?: string,
    notes?: string
  ) => Promise<void>;
  onClearCompleted: () => Promise<void>;
}

export function ShoppingView({
  items,
  wallets,
  categories,
  currentUserId,
  currentUserName,
  onCreateItem,
  onUpdateItem,
  onToggleItem,
  onDeleteItem,
  onCheckout,
  onClearCompleted,
}: ShoppingViewProps) {
  const [filterTab, setFilterTab] = useState<"pending" | "completed" | "all">("pending");
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const pendingItems = items.filter((i) => !i.isCompleted);
  const completedItems = items.filter((i) => i.isCompleted);

  const totalEstimatedCost = pendingItems.reduce(
    (sum, i) => sum + (i.estimatedPrice || 0),
    0
  );

  const totalCompletedCost = completedItems.reduce(
    (sum, i) => sum + (i.actualPrice || i.estimatedPrice || 0),
    0
  );

  const filteredItems = items.filter((i) => {
    if (filterTab === "pending") return !i.isCompleted;
    if (filterTab === "completed") return i.isCompleted;
    return true;
  });

  const handleDelete = async (item: ShoppingItem) => {
    if (!confirm(`Hapus "${item.name}" dari daftar belanja?`)) return;
    await onDeleteItem(item.id);
  };

  const handleClearCompleted = async () => {
    if (!confirm("Hapus semua barang yang sudah dicentang tanpa membukukan ke kas?")) return;
    await onClearCompleted();
  };

  return (
    <div className="space-y-6 pb-28 max-w-5xl lg:max-w-7xl mx-auto px-4 lg:px-0 pt-2 lg:pt-0">
      {/* Top Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 md:p-6 border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShoppingCart className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-slate-800 dark:text-white">
                Daftar Belanja Bersama
              </h3>
              <p className="text-xs text-slate-400">
                Catat kebutuhan rumah tangga bersama pasangan secara real-time
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setEditingItem(null);
                setIsItemModalOpen(true);
              }}
              className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-2xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Tambah Belanjaan</span>
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 pt-1">
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Perlu Dibeli</span>
            <span className="text-xs md:text-sm font-bold text-slate-800 dark:text-white tracking-tight">
              {pendingItems.length} Barang
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Estimasi Biaya</span>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {formatRupiah(totalEstimatedCost)}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-3 border border-slate-100 dark:border-slate-700/60">
            <span className="text-[11px] font-medium text-slate-400 block">Sudah Dicentang</span>
            <span className="text-xs md:text-sm font-bold text-emerald-600 dark:text-emerald-400 tracking-tight">
              {completedItems.length} Barang
            </span>
          </div>
        </div>

        {/* Checkout Banner if completed items exist */}
        {completedItems.length > 0 && (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>{completedItems.length} barang</strong> telah dibeli (Total:{" "}
                <strong>{formatRupiah(totalCompletedCost)}</strong>).
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="flex-1 sm:flex-none px-4 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Selesai & Catat ke Kas</span>
              </button>

              <button
                onClick={handleClearCompleted}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                title="Hapus centang tanpa catat ke kas"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterTab("pending")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "pending"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Belum Dibeli ({pendingItems.length})
          </button>
          <button
            onClick={() => setFilterTab("completed")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "completed"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Sudah Dicentang ({completedItems.length})
          </button>
          <button
            onClick={() => setFilterTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              filterTab === "all"
                ? "bg-emerald-600 text-white shadow-sm"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700"
            }`}
          >
            Semua ({items.length})
          </button>
        </div>
      </div>

      {/* Shopping List Items */}
      {filteredItems.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h4 className="font-bold text-slate-800 dark:text-white text-sm">
            Daftar belanja masih kosong
          </h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tambahkan kebutuhan belanja rumah tangga atau titipan belanja pasangan agar tidak lupa saat di pasar/supermarket.
          </p>
          <button
            onClick={() => {
              setEditingItem(null);
              setIsItemModalOpen(true);
            }}
            className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 inline-flex items-center gap-1.5 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Barang Belanjaan</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => {
            const category = categories.find((c) => c.id === item.categoryId);

            return (
              <div
                key={item.id}
                className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border shadow-sm flex items-center justify-between gap-3 transition ${
                  item.isCompleted
                    ? "border-emerald-200/80 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10"
                    : "border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700"
                }`}
              >
                {/* Left: Checkbox & Name */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button
                    onClick={() => onToggleItem(item.id, !item.isCompleted)}
                    className="shrink-0 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
                  >
                    {item.isCompleted ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100 dark:fill-emerald-950" />
                    ) : (
                      <Circle className="w-6 h-6 stroke-[1.5]" />
                    )}
                  </button>

                  <div className="min-w-0">
                    <p
                      className={`text-sm font-bold truncate ${
                        item.isCompleted
                          ? "line-through text-slate-400 dark:text-slate-500"
                          : "text-slate-800 dark:text-white"
                      }`}
                    >
                      {item.name}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 pt-0.5 text-xs text-slate-400">
                      {item.quantity && (
                        <span className="font-semibold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-[11px] text-slate-600 dark:text-slate-300">
                          {item.quantity}
                        </span>
                      )}

                      {category && (
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          • {category.name}
                        </span>
                      )}

                      {item.addedByName && (
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>{item.addedByName}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Estimated / Actual Price & Actions */}
                <div className="flex items-center gap-3 shrink-0">
                  {(item.estimatedPrice || item.actualPrice) && (
                    <div className="text-right">
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {formatRupiah(item.actualPrice || item.estimatedPrice || 0)}
                      </span>
                      <span className="text-[10px] text-slate-400 block">
                        {item.actualPrice ? "Harga Riil" : "Estimasi"}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setIsItemModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                      title="Ubah Item"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                      title="Hapus Item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Shopping Item Modal */}
      <ShoppingItemModal
        isOpen={isItemModalOpen}
        onClose={() => {
          setIsItemModalOpen(false);
          setEditingItem(null);
        }}
        item={editingItem}
        categories={categories}
        currentUserId={currentUserId}
        currentUserName={currentUserName}
        onSave={async (data) => {
          if (editingItem) {
            await onUpdateItem(editingItem.id, data);
          } else {
            await onCreateItem(data);
          }
        }}
      />

      {/* Shopping Checkout Modal */}
      <ShoppingCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        completedItems={completedItems}
        wallets={wallets}
        categories={categories}
        onCheckout={async (itemIds, total, walletId, catId, notes) => {
          await onCheckout(itemIds, total, walletId, catId, notes);
          setIsCheckoutOpen(false);
        }}
      />
    </div>
  );
}

