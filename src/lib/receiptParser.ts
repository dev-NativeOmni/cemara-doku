export interface ParsedReceipt {
  rawText: string;
  merchantName?: string;
  amount: number;
  date?: string; // YYYY-MM-DD
  suggestedCategoryKeyword?: string;
}

const COMMON_MERCHANTS = [
  "Indomaret",
  "Alfamart",
  "Alfamidi",
  "Super Indo",
  "Hypermart",
  "Transmart",
  "Hero",
  "Farmers Market",
  "Ranch Market",
  "Lotte Mart",
  "FamilyMart",
  "Lawson",
  "Circle K",
  "Starbucks",
  "KFC",
  "McDonald's",
  "MCDONALDS",
  "Hokben",
  "J.CO",
  "Chatime",
  "Kopi Kenangan",
  "Janji Jiwa",
  "Point Coffee",
  "Apotek Kimia Farma",
  "Apotek K-24",
  "Guardian",
  "Watsons",
  "Century",
  "Pertamina",
  "Shell",
  "BP-AKR",
  "Ace Hardware",
  "Informa",
  "IKEA",
  "Uniqlo",
  "H&M",
  "Gramedia",
];

export function parseReceiptText(text: string): ParsedReceipt {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  let merchantName: string | undefined;
  let amount = 0;
  let date: string | undefined;
  let suggestedCategoryKeyword: string | undefined;

  // 1. Detect Merchant Name (Usually on first few lines or matching known merchants)
  for (const line of lines.slice(0, 8)) {
    for (const m of COMMON_MERCHANTS) {
      if (line.toLowerCase().includes(m.toLowerCase())) {
        merchantName = m;
        break;
      }
    }
    if (merchantName) break;
  }

  // Fallback merchant name from first prominent uppercase line
  if (!merchantName && lines.length > 0) {
    for (const line of lines.slice(0, 4)) {
      if (line.length >= 3 && line.length <= 30 && !/^\d+$/.test(line) && !line.includes(":")) {
        merchantName = line;
        break;
      }
    }
  }

  // 2. Detect Date
  const dateRegexes = [
    /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})/, // 19/09/2026 or 19-09-2026
    /(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})/, // 2026-09-19
    /(\d{1,2})\s+(Jan|Feb|Mar|Apr|Mei|Jun|Jul|Agu|Agu|Sep|Okt|Nov|Des|Januari|Februari|Maret|April|Mei|Juni|Juli|Agustus|September|Oktober|November|Desember)[a-z]*\s+(\d{4})/i,
  ];

  for (const line of lines) {
    for (const reg of dateRegexes) {
      const match = line.match(reg);
      if (match) {
        if (match[3] && match[3].length === 4) {
          // DD/MM/YYYY
          const d = String(match[1]).padStart(2, "0");
          const m = String(match[2]).padStart(2, "0");
          const y = match[3];
          date = `${y}-${m}-${d}`;
        } else if (match[1] && match[1].length === 4) {
          // YYYY-MM-DD
          const y = match[1];
          const m = String(match[2]).padStart(2, "0");
          const d = String(match[3]).padStart(2, "0");
          date = `${y}-${m}-${d}`;
        }
        break;
      }
    }
    if (date) break;
  }

  // 3. Detect Amount (Total / Grand Total / Bayar / Tunai)
  const totalKeywords = [
    "grand total",
    "total akhir",
    "total belanja",
    "total bayar",
    "total tagihan",
    "total harga",
    "total net",
    "total",
    "subtotal",
    "jumlah",
    "bayar",
    "tunai",
    "cash",
    "debit",
    "qris",
    "kartu",
    "amount",
  ];

  const foundAmounts: { priority: number; amount: number }[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    // Look for lines containing total keywords
    for (let kIdx = 0; kIdx < totalKeywords.length; kIdx++) {
      const keyword = totalKeywords[kIdx];
      if (lower.includes(keyword)) {
        // Extract all numbers from this line or next line
        const numbersInLine = extractNumbersFromText(line);
        const numbersInNextLine = i + 1 < lines.length ? extractNumbersFromText(lines[i + 1]) : [];

        const candidates = [...numbersInLine, ...numbersInNextLine];
        for (const num of candidates) {
          if (num >= 500 && num <= 100000000) {
            foundAmounts.push({
              priority: 100 - kIdx * 5, // Higher priority for earlier keywords (grand total > total > bayar)
              amount: num,
            });
          }
        }
      }
    }
  }

  // If amounts found with keywords, pick the highest priority (or largest among top priority)
  if (foundAmounts.length > 0) {
    foundAmounts.sort((a, b) => {
      if (b.priority !== a.priority) return b.priority - a.priority;
      return b.amount - a.amount;
    });
    amount = foundAmounts[0].amount;
  } else {
    // Fallback: search all numbers in the entire document and pick the most reasonable max amount
    const allNumbers: number[] = [];
    for (const line of lines) {
      allNumbers.push(...extractNumbersFromText(line));
    }
    const reasonable = allNumbers.filter((n) => n >= 1000 && n <= 50000000);
    if (reasonable.length > 0) {
      amount = Math.max(...reasonable);
    }
  }

  // 4. Suggest Category Keyword
  const textLower = text.toLowerCase();
  if (
    textLower.includes("indomaret") ||
    textLower.includes("alfamart") ||
    textLower.includes("superindo") ||
    textLower.includes("hypermart") ||
    textLower.includes("sembako") ||
    textLower.includes("sayur") ||
    textLower.includes("pasar")
  ) {
    suggestedCategoryKeyword = "belanja";
  } else if (
    textLower.includes("resto") ||
    textLower.includes("cafe") ||
    textLower.includes("kfc") ||
    textLower.includes("mcdonald") ||
    textLower.includes("kopi") ||
    textLower.includes("makan")
  ) {
    suggestedCategoryKeyword = "makanan";
  } else if (
    textLower.includes("apotek") ||
    textLower.includes("kimia farma") ||
    textLower.includes("k-24") ||
    textLower.includes("obat") ||
    textLower.includes("dokter")
  ) {
    suggestedCategoryKeyword = "kesehatan";
  } else if (
    textLower.includes("pertamina") ||
    textLower.includes("spbu") ||
    textLower.includes("bensin") ||
    textLower.includes("shell")
  ) {
    suggestedCategoryKeyword = "transportasi";
  }

  return {
    rawText: text,
    merchantName,
    amount,
    date,
    suggestedCategoryKeyword,
  };
}

function extractNumbersFromText(text: string): number[] {
  const clean = text.replace(/rp\.?/gi, "").trim();
  const results: number[] = [];

  // Match numbers with possible thousand separators (.) or (,)
  // Examples: 150.000, 150,000, 150000, 150.000,00, 150,000.00
  const matches = clean.match(/\b\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{2})?\b|\b\d{3,9}\b/g);
  if (!matches) return results;

  for (const m of matches) {
    let numStr = m;
    // Check if ends with ,00 or .00 (cents)
    if (/[.,]\d{2}$/.test(numStr)) {
      numStr = numStr.slice(0, -3);
    }
    // Remove all periods and commas
    const parsed = parseInt(numStr.replace(/[.,]/g, ""), 10);
    if (!isNaN(parsed) && parsed > 0) {
      results.push(parsed);
    }
  }

  return results;
}
