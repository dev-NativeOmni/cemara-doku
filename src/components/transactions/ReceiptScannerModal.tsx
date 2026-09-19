"use client";

import React, { useState, useRef } from "react";
import { X, Camera, Upload, Sparkles, Check, RefreshCw, AlertCircle } from "lucide-react";
import { formatRupiah } from "@/lib/formatters";
import { parseReceiptText, ParsedReceipt } from "@/lib/receiptParser";
import { createWorker } from "tesseract.js";

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult: (result: { amount: number; merchantName?: string; date?: string; categoryKeyword?: string }) => void;
}

export function ReceiptScannerModal({
  isOpen,
  onClose,
  onApplyResult,
}: ReceiptScannerModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [progressPercent, setProgressPercent] = useState(0);
  const [parsedData, setParsedData] = useState<ParsedReceipt | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable parsed fields
  const [customAmountStr, setCustomAmountStr] = useState("");
  const [customMerchant, setCustomMerchant] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setErrorMsg(null);
    setParsedData(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target?.result as string;
      setImageSrc(dataUrl);
      await processImage(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const processImage = async (dataUrl: string) => {
    setIsProcessing(true);
    setProgressText("Mempersiapkan pemindai...");
    setProgressPercent(10);
    setErrorMsg(null);

    let worker: any = null;
    try {
      setProgressText("Memuat mesin OCR...");
      setProgressPercent(25);

      worker = await createWorker("ind+eng", 1, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            const p = Math.round((m.progress || 0) * 60) + 30;
            setProgressPercent(Math.min(90, p));
            setProgressText(`Membaca struk belanja (${Math.round((m.progress || 0) * 100)}%)...`);
          }
        },
      });

      setProgressText("Mengekstrak teks struk...");
      const ret = await worker.recognize(dataUrl);
      const text = ret.data.text;

      setProgressPercent(95);
      setProgressText("Menganalisis nominal & merchant...");

      const parsed = parseReceiptText(text);
      setParsedData(parsed);
      setCustomAmountStr(parsed.amount > 0 ? parsed.amount.toLocaleString("id-ID") : "");
      setCustomMerchant(parsed.merchantName || "");
      setProgressPercent(100);

      if (parsed.amount === 0 && !parsed.merchantName) {
        setErrorMsg("Teks struk terbaca kurang jelas. Anda bisa memasukkan nominal secara manual.");
      }
    } catch (err: any) {
      console.error("Gagal OCR:", err);
      setErrorMsg("Gagal memproses gambar struk. Pastikan foto struk cukup terang dan tegak.");
    } finally {
      if (worker) {
        await worker.terminate();
      }
      setIsProcessing(false);
    }
  };

  const handleApply = () => {
    const finalAmount = parseInt(customAmountStr.replace(/\D/g, "") || "0", 10);
    onApplyResult({
      amount: finalAmount,
      merchantName: customMerchant.trim() || undefined,
      date: parsedData?.date,
      categoryKeyword: parsedData?.suggestedCategoryKeyword,
    });
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setImageSrc(null);
    setParsedData(null);
    setErrorMsg(null);
    setProgressPercent(0);
    setProgressText("");
    setCustomAmountStr("");
    setCustomMerchant("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-slate-900 w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom duration-300 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-base flex items-center gap-1.5">
                <span>Pindai Struk Belanja</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-extrabold">
                  OCR AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">Deteksi nominal otomatis dari foto struk</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* No Image State: Upload CTA */}
          {!imageSrc && (
            <div className="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-3xl p-8 text-center space-y-4 hover:border-emerald-500/60 transition bg-slate-50/50 dark:bg-slate-800/30">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
                <Upload className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 dark:text-white text-sm">
                  Pilih Foto atau Jepret Struk
                </h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  Mendukung struk Indomaret, Alfamart, Superindo, restoran, dan berbagai struk kasir lainnya.
                </p>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition"
                >
                  <Camera className="w-4 h-4" />
                  <span>Ambil Foto / Pilih Gambar</span>
                </button>
              </div>
            </div>
          )}

          {/* Image Uploaded / Scanning State */}
          {imageSrc && (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-700 bg-slate-900 flex items-center justify-center group">
                <img
                  src={imageSrc}
                  alt="Struk Belanja"
                  className="w-full h-full object-contain max-h-48 opacity-90"
                />

                <button
                  type="button"
                  onClick={handleReset}
                  className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-xl text-xs transition flex items-center gap-1 backdrop-blur-sm"
                  title="Ganti Foto"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Ganti</span>
                </button>
              </div>

              {/* Progress Bar while scanning */}
              {isProcessing && (
                <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl space-y-2.5 animate-pulse">
                  <div className="flex items-center justify-between text-xs font-bold text-emerald-800 dark:text-emerald-300">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-emerald-500 animate-spin" />
                      <span>{progressText}</span>
                    </span>
                    <span>{progressPercent}%</span>
                  </div>

                  <div className="w-full bg-emerald-200/60 dark:bg-emerald-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-600 transition-all duration-300"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Error Alert */}
              {errorMsg && !isProcessing && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-2xl flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-300">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Extracted Data Confirmation Box */}
              {!isProcessing && parsedData && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-200/70 dark:border-slate-700 pb-2">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      Hasil Deteksi OCR:
                    </span>
                    <span className="text-[10px] text-slate-400">Dapat diedit jika perlu</span>
                  </div>

                  {/* Nominal Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Total Nominal Belanja (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center font-bold text-slate-400 text-xs pointer-events-none">
                        Rp
                      </span>
                      <input
                        type="text"
                        inputMode="numeric"
                        value={customAmountStr}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setCustomAmountStr(raw ? Number(raw).toLocaleString("id-ID") : "");
                        }}
                        className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  </div>

                  {/* Merchant Field */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                      Nama Toko / Keterangan
                    </label>
                    <input
                      type="text"
                      value={customMerchant}
                      onChange={(e) => setCustomMerchant(e.target.value)}
                      placeholder="Contoh: Indomaret, Super Indo"
                      className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
                    />
                  </div>

                  {parsedData.date && (
                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                      <span>Tanggal Terdeteksi:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {parsedData.date}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-2xl transition"
            >
              Batal
            </button>

            {imageSrc && !isProcessing && (
              <button
                type="button"
                onClick={handleApply}
                disabled={!customAmountStr}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-95 text-white font-bold text-xs rounded-2xl shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-1.5 transition disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>Pakai Hasil Struk</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

