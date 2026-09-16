# Product Requirements Document (PRD)

## Proyek: Cemara (Aplikasi Keuangan Rumah Tangga)

**Domain Sasaran:** `cemara.web.app`  
**Versi:** 1.0.0 (MVP)  
**Status:** Disetujui untuk Pengembangan  
**Target Pengguna:** Pasangan suami-istri / keluarga inti

---

## 1\. Latar Belakang & Tujuan Produk

Mengelola keuangan rumah tangga sering kali mengalami kendala karena pencatatan yang terpecah di berbagai media (buku catatan, aplikasi chat, atau spreadsheet yang rumit dibuka di ponsel). Selain itu, keterlambatan pencatatan saat bertransaksi di luar rumah menyebabkan data pengeluaran tidak akurat.

**Tujuan Produk:**

1. Menyediakan aplikasi pencatatan keuangan rumah tangga yang ringan, cepat dibuka di ponsel (*mobile-first*), dan mudah digunakan bersama oleh suami dan istri.  
2. Memfasilitasi pemantauan anggaran (*budgeting*) secara real-time agar keluarga terhindar dari defisit bulanan.  
3. Menjamin biaya operasional infrastruktur **Rp 0 (100% gratis)** dengan memanfaatkan ekosistem Firebase Free Tier (*Spark Plan*).

---

## 2\. Pengguna Sasaran (User Personas)

* **Pengguna Utama (Kepala Keluarga / Pengelola Keuangan):** Memerlukan gambaran umum arus kas bulanan, alokasi tabungan, dan pemantauan apakah pengeluaran telah melewati batas pagu anggaran.  
* **Pengguna Kolaborator (Pasangan):** Memerlukan kemudahan input transaksi harian (belanja dapur, jajan, bensin, iuran) dalam hitungan detik langsung setelah transaksi terjadi.

---

## 3\. Ruang Lingkup Pencatatan Keuangan (Scope of Recording)

Sistem pencatatan dirancang modular sehingga mudah ditambah, diubah, atau disederhanakan:

### A. Dompet / Sumber Dana (*Wallets*)

1. **Kas Fisik (Tunai):** Uang belanja harian di dompet.  
2. **Rekening Bank Operasional:** Rekening bank utama penerima gaji dan transaksi harian (misal: BCA, Mandiri).  
3. **Dompet Digital (E-Wallet):** Saldo GoPay, OVO, ShopeePay, DANA.  
4. **Rekening Tabungan & Dana Darurat:** Pos simpanan yang tidak digunakan untuk operasional harian.

### B. Jenis Transaksi

1. **Pemasukan (*Income*):**  
   * Gaji bulanan  
   * Bonus / Tunjangan / THR  
   * Penghasilan sampingan / usaha  
   * Pemasukan lain (hadiah, cashback)  
2. **Pengeluaran (*Expense*):**  
   * *Kebutuhan Rutin & Dapur:* Sembako, makan harian, perlengkapan rumah tangga.  
   * *Tagihan & Utilitas:* Listrik PLN, PDAM, Internet/Wi-Fi, BPJS, IPL/Iuran lingkungan.  
   * *Keluarga & Anak:* Uang saku, SPP/Pendidikan, perlengkapan anak.  
   * *Transportasi:* Bahan bakar, servis rutin, parkir, transportasi umum.  
   * *Sosial & Ibadah:* Zakat, infaq, sedekah, amplop kondangan/hajatan.  
   * *Gaya Hidup & Hiburan:* Makan di luar, langganan streaming, liburan.  
   * *Darurat / Kesehatan:* Obat, dokter, perbaikan rumah darurat.  
3. **Mutasi Antar-Dompet (*Transfer*):**  
   * Tarik tunai dari ATM (Rekening Bank \-\> Kas Fisik).  
   * Top-up e-wallet (Rekening Bank \-\> GoPay/ShopeePay).  
   * Menabung (Rekening Operasional \-\> Tabungan Dana Darurat).  
   * *Catatan:* Mutasi tidak mempengaruhi total kekayaan bersih (*net worth*) dan tidak dicatat sebagai beban pengeluaran/pemasukan.

### C. Alokasi Anggaran Bulanan (*Monthly Budgeting*)

* Penetapan batas nominal pengeluaran untuk kategori tertentu per bulan.  
* Pemantauan persentase realisasi anggaran (Hijau \< 70%, Kuning 70-90%, Merah \> 90%).

---

## 4\. Kebutuhan Fungsional (Functional Requirements)

* **FR-1: Autentikasi & Profil Rumah Tangga**  
  * Login dan Registrasi menggunakan Email/Password atau Google Sign-In via Firebase Auth.  
  * Fitur *Shared Household*: Satu pengguna dapat membuat entitas "Rumah Tangga" dan mengundang pasangan via kode unik/email agar berbagi buku kas yang sama.  
* **FR-2: Manajemen Dompet & Saldo**  
  * Pengguna dapat menambah, mengedit, dan mengarsipkan dompet.  
  * Setiap transaksi otomatis memperbarui saldo berjalan (*current balance*) dompet terkait secara atomik.  
* **FR-3: Pencatatan Transaksi Cepat**  
  * Form input cepat: Nominal, Jenis (Masuk/Keluar/Transfer), Dompet, Kategori, Tanggal, dan Catatan.  
  * Nilai default tanggal adalah hari dan jam saat ini.  
* **FR-4: Manajemen Kategori**  
  * Tersedia kategori bawaan (*default presets*) yang dapat disesuaikan (tambah/edit/hapus).  
  * Pemilihan ikon dan warna untuk visualisasi kategori.  
* **FR-5: Pelacakan Anggaran (*Budget Tracker*)**  
  * Pengaturan pagu anggaran per kategori per bulan kalender.  
  * Tampilan progres persentase terpakai vs sisa pagu.  
* **FR-6: Laporan & Visualisasi Ringkas**  
  * Kartu ringkasan: Total Saldo Seluruh Dompet, Total Pemasukan Bulan Ini, Total Pengeluaran Bulan Ini, Selisih Arus Kas (*Net Cashflow*).  
  * Grafik lingkaran (*Donut Chart*) distribusi pengeluaran per kategori.  
  * Riwayat transaksi dengan filter rentang tanggal, kategori, dan dompet.  
* **FR-7: Ekspor Data & Cadangan**  
  * Kemampuan mengunduh riwayat transaksi ke format CSV / Excel untuk analisis mandiri.

---

## 5\. Kebutuhan Non-Fungsional (Non-Functional Requirements)

* **NFR-1: Bebas Biaya (Rp 0\)**  
  * Seluruh arsitektur harus mematuhi batas kuota Firebase Spark Plan (Hosting gratis, Firestore 50.000 read/hari, 20.000 write/hari, storage 1 GB).  
* **NFR-2: Antarmuka Mobile-First & Responsif**  
  * Tampilan dioptimalkan untuk layar ponsel (lebar 360px – 430px) dengan navigasi bawah (*Bottom Navigation Bar*) dan tombol cepat (*Floating Action Button*).  
* **NFR-3: Performa & Latensi Rendah**  
  * *First Contentful Paint (FCP)* di bawah 1,5 detik pada jaringan seluler 4G.  
  * Memanfaatkan Firestore Offline Persistence agar input tetap dapat dibuka saat sinyal lemah.  
* **NFR-4: Keamanan & Privasi Data**  
  * Data terisolasi per rumah tangga (*Household ID*) menggunakan Firestore Security Rules yang ketat.  
* **NFR-5: Subdomain & Hosting**  
  * Web app dapat diakses secara publik melalui URL resmi `https://cemara.web.app`.  
  * Mendukung otomatisasi *Continuous Deployment* dari repositori GitHub.

---

## 6\. Kriteria Keberhasilan MVP (Definition of Done)

1. Aplikasi berhasil online dan teruji di `cemara.web.app`.  
2. Pengguna dapat login dan mendaftarkan pasangan dalam satu buku kas bersama.  
3. Pencatatan transaksi pemasukan, pengeluaran, dan transfer berjalan lancar dengan saldo dompet terupdate secara akurat.  
4. Dashboard menampilkan total saldo dan rincian pengeluaran bulan berjalan.  
5. Biaya tagihan Firebase terverifikasi $0.00.

&nbsp;