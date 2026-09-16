\# Technical Design Document (Design.md)

\#\# Proyek: Cemara (Aplikasi Keuangan Rumah Tangga)

\*\*Domain Sasaran:\*\* \`cemara.web.app\`&nbsp;&nbsp;

\*\*Arsitektur:\*\* Jamstack / Single Page Application (Next.js Static Export / Vite React) \+ Firebase BaaS&nbsp;&nbsp;

\*\*Database:\*\* Cloud Firestore (NoSQL Document Store)&nbsp;&nbsp;

\*\*Autentikasi:\*\* Firebase Authentication&nbsp;&nbsp;

\*\*Hosting & CI/CD:\*\* Firebase Hosting via GitHub Actions&nbsp;&nbsp;

&nbsp;

\---

&nbsp;

\#\# 1\. Diagram Arsitektur Sistem

&nbsp;

\`\`\`text

\+-------------------------------------------------------------------------+

|                              CLIENT TIER                                |

|  Next.js (App Router / Static Export) \+ Tailwind CSS \+ Lucide Icons    |

|  \- PWA Capabilities (Service Worker, Web App Manifest)                  |

|  \- Firebase Modular SDK v10 (Client-side directly to BaaS)              |

\+--------------------+-------------------------------+--------------------+

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|                               |

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;v                               v

\+------------------------------------+  \+---------------------------------+

|          FIREBASE AUTH             |  |         CLOUD FIRESTORE         |

|  \- Email / Password Provider       |  |  \- NoSQL Document Collections   |

|  \- Google OAuth Provider           |  |  \- Row/Document-level Security  |

|  \- JWT Session Token               |  |  \- Offline Cache Persistence    |

\+------------------------------------+  \+---------------------------------+

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;^                               ^

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|                               |

\+--------------------+-------------------------------+--------------------+

|                         DEPLOYMENT & HOSTING                            |

|  \- GitHub Repository (Push to 'main' branch)                           |

|  \- GitHub Actions Runner (Build & Deploy workflow)                      |

|  \- Firebase Hosting Target: cemara (URL: https://cemara.web.app)        |

\+-------------------------------------------------------------------------+

\`\`\`

&nbsp;

\---

&nbsp;

\#\# 2\. Struktur Skema Data Cloud Firestore

&nbsp;

Setiap data diikat ke dalam \`householdId\` (Rumah Tangga) agar data dapat diakses bersama oleh pasangan suami-istri.

&nbsp;

\#\#\# A. Collection: \`households\`

Path: \`/households/{householdId}\`

\`\`\`typescript

interface Household {

&nbsp;&nbsp;id: string;

&nbsp;&nbsp;name: string;                   // misal: "Keluarga Cemara"

&nbsp;&nbsp;currency: string;               // "IDR"

&nbsp;&nbsp;memberUids: string\[\];           // \[uid\_suami, uid\_istri\]

&nbsp;&nbsp;createdAt: FirebaseFirestore.Timestamp;

&nbsp;&nbsp;updatedAt: FirebaseFirestore.Timestamp;

}

\`\`\`

&nbsp;

\#\#\# B. Collection: \`users\`

Path: \`/users/{uid}\`

\`\`\`typescript

interface UserProfile {

&nbsp;&nbsp;uid: string;

&nbsp;&nbsp;email: string;

&nbsp;&nbsp;displayName: string;

&nbsp;&nbsp;householdId: string;            // Relasi ke dokumen households

&nbsp;&nbsp;role: 'owner' | 'member';

&nbsp;&nbsp;createdAt: FirebaseFirestore.Timestamp;

}

\`\`\`

&nbsp;

\#\#\# C. Sub-Collection: \`wallets\`

Path: \`/households/{householdId}/wallets/{walletId}\`

\`\`\`typescript

interface Wallet {

&nbsp;&nbsp;id: string;

&nbsp;&nbsp;name: string;                   // misal: "BCA Tabungan", "Kas Tunai", "GoPay"

&nbsp;&nbsp;type: 'bank' | 'cash' | 'ewallet' | 'savings' | 'investment';

&nbsp;&nbsp;currentBalance: number;         // Saldo berjalan (dalam integer Rupiah)

&nbsp;&nbsp;color: string;                  // Hex color, misal: "\#1E3A8A"

&nbsp;&nbsp;icon: string;                   // "banknote", "wallet", "credit-card"

&nbsp;&nbsp;isArchived: boolean;

&nbsp;&nbsp;updatedAt: FirebaseFirestore.Timestamp;

}

\`\`\`

&nbsp;

\#\#\# D. Sub-Collection: \`categories\`

Path: \`/households/{householdId}/categories/{categoryId}\`

\`\`\`typescript

interface Category {

&nbsp;&nbsp;id: string;

&nbsp;&nbsp;name: string;                   // misal: "Belanja Dapur", "Listrik & Air"

&nbsp;&nbsp;type: 'income' | 'expense';

&nbsp;&nbsp;icon: string;                   // Lucide icon name

&nbsp;&nbsp;color: string;

&nbsp;&nbsp;isDefault: boolean;

}

\`\`\`

&nbsp;

\#\#\# E. Sub-Collection: \`transactions\`

Path: \`/households/{householdId}/transactions/{transactionId}\`

\`\`\`typescript

interface Transaction {

&nbsp;&nbsp;id: string;

&nbsp;&nbsp;type: 'income' | 'expense' | 'transfer';

&nbsp;&nbsp;amount: number;                 // Integer Rupiah

&nbsp;&nbsp;walletId: string;               // Dompet sumber

&nbsp;&nbsp;destinationWalletId?: string;   // Dompet tujuan (khusus type \=== 'transfer')

&nbsp;&nbsp;categoryId?: string;            // Kategori (khusus income/expense)

&nbsp;&nbsp;transactionDate: FirebaseFirestore.Timestamp;

&nbsp;&nbsp;notes: string;

&nbsp;&nbsp;createdById: string;            // UID pembuat transaksi

&nbsp;&nbsp;createdAt: FirebaseFirestore.Timestamp;

}

\`\`\`

&nbsp;

\#\#\# F. Sub-Collection: \`budgets\`

Path: \`/households/{householdId}/budgets/{budgetId}\`

\`\`\`typescript

interface Budget {

&nbsp;&nbsp;id: string;

&nbsp;&nbsp;categoryId: string;

&nbsp;&nbsp;month: number;                  // 1 \- 12

&nbsp;&nbsp;year: number;                   // misal: 2026

&nbsp;&nbsp;limitAmount: number;            // Batas maksimal anggaran

&nbsp;&nbsp;updatedAt: FirebaseFirestore.Timestamp;

}

\`\`\`

&nbsp;

\---

&nbsp;

\#\# 3\. Integritas Transaksi & Saldo Atomik

&nbsp;

Untuk mencegah ketidaksinkronan saldo saat pasangan mencatat transaksi secara bersamaan, setiap mutasi saldo \*\*wajib\*\* menggunakan \`runTransaction\`:

&nbsp;

\`\`\`typescript

// Contoh implementasi transaksi pengeluaran (Expense)

async function recordExpense(householdId: string, data: CreateExpenseDTO) {

&nbsp;&nbsp;const db \= getFirestore();

&nbsp;&nbsp;const walletRef \= doc(db, \`households/${householdId}/wallets/${data.walletId}\`);

&nbsp;&nbsp;const txRef \= doc(collection(db, \`households/${householdId}/transactions\`));

&nbsp;

&nbsp;&nbsp;await runTransaction(db, async (t) \=\> {

&nbsp;&nbsp;&nbsp;&nbsp;const walletDoc \= await t.get(walletRef);

&nbsp;&nbsp;&nbsp;&nbsp;if (\!walletDoc.exists()) throw new Error("Dompet tidak ditemukan");

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;const currentBalance \= walletDoc.data().currentBalance;

&nbsp;&nbsp;&nbsp;&nbsp;const newBalance \= currentBalance \- data.amount;

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// 1\. Simpan data transaksi

&nbsp;&nbsp;&nbsp;&nbsp;t.set(txRef, {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;...data,

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;id: txRef.id,

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;createdAt: serverTimestamp(),

&nbsp;&nbsp;&nbsp;&nbsp;});

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// 2\. Perbarui saldo dompet secara atomik

&nbsp;&nbsp;&nbsp;&nbsp;t.update(walletRef, {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;currentBalance: newBalance,

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;updatedAt: serverTimestamp(),

&nbsp;&nbsp;&nbsp;&nbsp;});

&nbsp;&nbsp;});

}

\`\`\`

&nbsp;

\---

&nbsp;

\#\# 4\. Aturan Keamanan Firestore (\`firestore.rules\`)

&nbsp;

Aturan keamanan menjamin bahwa hanya anggota yang terdaftar dalam \`memberUids\` suatu rumah tangga yang dapat membaca dan mengubah data buku kas tersebut.

&nbsp;

\`\`\`javascript

rules\_version \= '2';

service cloud.firestore {

&nbsp;&nbsp;match /databases/{database}/documents {

&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// Fungsi pembantu verifikasi user login

&nbsp;&nbsp;&nbsp;&nbsp;function isAuthenticated() {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return request.auth \!= null;

&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// Fungsi pembantu verifikasi keanggotaan rumah tangga

&nbsp;&nbsp;&nbsp;&nbsp;function isHouseholdMember(householdId) {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;return isAuthenticated() &&&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;request.auth.uid in get(/databases/$(database)/documents/households/$(householdId)).data.memberUids;

&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// Profil User

&nbsp;&nbsp;&nbsp;&nbsp;match /users/{userId} {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if isAuthenticated() && request.auth.uid \== userId;

&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;// Dokumen Rumah Tangga

&nbsp;&nbsp;&nbsp;&nbsp;match /households/{householdId} {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow create: if isAuthenticated();

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, update: if isAuthenticated() && request.auth.uid in resource.data.memberUids;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;// Sub-koleksi di bawah Rumah Tangga

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;match /{allChildren=\*\*} {

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;allow read, write: if isHouseholdMember(householdId);

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;&nbsp;&nbsp;&nbsp;}

&nbsp;&nbsp;}

}

\`\`\`

&nbsp;

\---

&nbsp;

\#\# 5\. Rancangan Antarmuka Pengguna (UI/UX Design System)

&nbsp;

\#\#\# A. Palet Warna & Tipografi

\* \*\*Primary Theme:\*\* Hijau Hutan (\*Forest Green\* / \`\#15803D\`) dan Zamrud (\*Emerald\* / \`\#10B981\`) melambangkan kesuburan, ketenangan, dan keteduhan pohon cemara.

\* \*\*Secondary / Neutral:\*\* Slate Gray (\`\#F8FAFC\` untuk background, \`\#1E293B\` untuk teks primer).

\* \*\*Indikator Arus Kas:\*\*

&nbsp;&nbsp;\* Pemasukan: Emerald Green (\`\#059669\`)

&nbsp;&nbsp;\* Pengeluaran: Crimson Red (\`\#DC2626\`)

&nbsp;&nbsp;\* Transfer: Indigo Blue (\`\#4F46E5\`)

\* \*\*Tipografi:\*\* Plus Jakarta Sans atau Inter (bersih, jelas, angka mudah dibaca).

&nbsp;

\#\#\# B. Pola Navigasi Mobile-First

1\. \*\*Header:\*\* Sapaan user, pemilih bulan aktif (misal: "September 2026"), dan total saldo gabungan.

2\. \*\*Bottom Navigation Bar (Fixed di Bawah Layar):\*\*

&nbsp;&nbsp;&nbsp;\* \*Beranda\* (Dashboard & Ringkasan)

&nbsp;&nbsp;&nbsp;\* \*Transaksi\* (Daftar riwayat lengkap)

&nbsp;&nbsp;&nbsp;\* \*Tombol Cepat (+)\* (Floating button di tengah untuk modal input transaksi instan)

&nbsp;&nbsp;&nbsp;\* \*Anggaran\* (Progress bar pagu per kategori)

&nbsp;&nbsp;&nbsp;\* \*Dompet\* (Manajemen akun bank, kas, e-wallet)

3\. \*\*Modal Input Transaksi Cepat:\*\*

&nbsp;&nbsp;&nbsp;\* Tab switch: \`Pengeluaran\` | \`Pemasukan\` | \`Transfer\`.

&nbsp;&nbsp;&nbsp;\* Input nominal besar di bagian atas dengan format Rupiah otomatis.

&nbsp;&nbsp;&nbsp;\* Tombol \*quick-select\* kategori dengan ikon visual.

&nbsp;

\---

&nbsp;

\#\# 6\. Alur CI/CD ke \`cemara.web.app\`

&nbsp;

\#\#\# File: \`.github/workflows/firebase-hosting.yml\`

\`\`\`yaml

name: Deploy to Firebase Hosting on merge

on:

&nbsp;&nbsp;push:

&nbsp;&nbsp;&nbsp;&nbsp;branches:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- main

jobs:

&nbsp;&nbsp;build\_and\_deploy:

&nbsp;&nbsp;&nbsp;&nbsp;runs-on: ubuntu-latest

&nbsp;&nbsp;&nbsp;&nbsp;steps:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- uses: actions/checkout@v4

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- uses: actions/setup-node@v4

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;node-version: 20

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;cache: 'npm'

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- run: npm ci

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- run: npm run build

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;\- uses: FirebaseExtended/action-hosting-deploy@v0

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;with:

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;repoToken: '${{ secrets.GITHUB\_TOKEN }}'

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;firebaseServiceAccount: '${{ secrets.FIREBASE\_SERVICE\_ACCOUNT\_CEMARA }}'

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;channelId: live

&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;projectId: cemara

\`\`\`

&nbsp;

\---

&nbsp;

\#\# 7\. Optimasi Kuota Gratis (\*Spark Plan Compliance\*)

&nbsp;

Untuk memastikan operasional tetap \*\*Rp 0\*\*:

1\. \*\*Paging Transaksi:\*\* Batasi query riwayat transaksi maksimal 25 item per halaman (\`limit(25)\` dan \`startAfter(lastVisible)\`) agar tidak menghabiskan kuota \*read\* Firestore (50.000 read/hari).

2\. \*\*Offline Persistence:\*\* Aktifkan \`enableIndexedDbPersistence()\` pada Firestore SDK agar aplikasi membaca data dari cache lokal ponsel saat data belum berubah.

3\. \*\*Penghitungan Saldo Realtime:\*\* Simpan \`currentBalance\` langsung pada dokumen \`wallets\`. Saat menampilkan total saldo, sistem hanya perlu membaca sejumlah dokumen dompet (3–5 dokumen), bukan melakukan \*query read\* ke ribuan dokumen transaksi.

&nbsp;