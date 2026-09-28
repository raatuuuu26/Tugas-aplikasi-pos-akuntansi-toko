# Sistem POS & Akuntansi Toko (Prototype Tugas Kuliah)

Aplikasi web modern Point of Sale (POS), Manajemen Inventori, dan Pembukuan Akuntansi Toko yang stabil, interaktif, dan siap pakai untuk demo tugas kuliah.

Dibuat menggunakan:
- **React 18**
- **TypeScript**
- **Vite**
- **CSS Murni** (Modern Custom Properties & Responsive Flex/Grid)
- **localStorage** (Penyimpanan data lokal persisten tanpa backend/database rumit)

---

## 🚀 Cara Menjalankan Aplikasi

1. Buka terminal di direktori proyek ini:
   ```bash
   cd pos-akuntansi-toko
   ```

2. Pasang dependensi:
   ```bash
   npm install
   ```

3. Jalankan server pengembang:
   ```bash
   npm run dev
   ```

4. Buka tautan di browser:
   ```
   http://localhost:3000
   ```

---

## 👥 Akun Demo & Hak Akses (Role)

Semua akun demo menggunakan password yang sama: **`123456`**

| Role | Username | Password | Deskripsi Hak Akses |
| :--- | :--- | :--- | :--- |
| **Owner** | `owner` | `123456` | Akses penuh ke seluruh menu dan laporan toko |
| **Kepala Toko** | `kepala` | `123456` | Operasional toko, kasir, pembelian, stok & laporan |
| **Bagian Keuangan** | `keuangan` | `123456` | Arus kas, piutang, hutang, pembelian & penjualan |
| **Accounting** | `accounting` | `123456` | Buku besar akuntansi, jurnal umum, neraca & laba rugi |
| **Kepala Gudang** | `gudang` | `123456` | Data produk, mutasi stok, stok opname & pembelian |
| **Kasir** | `kasir` | `123456` | Kasir POS, riwayat penjualan, data customer & struk |
| **Sales** | `sales` | `123456` | Kasir POS, data customer & katalog produk |

*(Pada halaman login, tersedia tombol **1-Klik Demo Login** untuk mencoba setiap role dengan instan tanpa mengetik).*

---

## 📦 Fitur-Fitur Utama

1. **Dashboard Eksekutif**:
   - Card indikator: Penjualan Hari Ini, Penjualan Bulan Ini, Jumlah Transaksi, Nilai Persediaan, Piutang Pelanggan, Hutang Pemasok.
   - Grafik tren penjualan 7 hari terakhir (SVG interaktif).
   - Daftar produk terlaris & peringatan stok menipis/habis.
   - Tabel transaksi kasir terbaru.

2. **Point of Sale (POS) / Kasir Interaktif**:
   - Pencarian produk instan & filter kategori (Makanan, Minuman, Sembako, Kebutuhan Rumah).
   - Klik kartu produk untuk langsung menambah ke keranjang belanja.
   - Kontrol kuantitas (`+` / `-`), hapus barang, dan pengosongan keranjang.
   - Perhitungan otomatis Subtotal, Diskon (Rp), dan Total Akhir.
   - Pilihan metode bayar: Tunai, Transfer Bank, atau QRIS.
   - Tombol nominal uang cepat (Uang Pas, 50rb, 100rb, 200rb) dan kalkulasi kembalian otomatis.
   - Pembuatan nomor faktur otomatis berurutan (`TRX-001`, `TRX-002`, dst.).
   - Pengurangan stok barang secara otomatis saat transaksi berhasil.
   - Pencatatan jurnal akuntansi otomatis (Kas/Bank bertambah, Pendapatan bertambah, HPP dan Persediaan berkurang).

3. **Struk Pembayaran Siap Cetak**:
   - Modal bukti pembayaran formal berisi nama toko, alamat, kasir, rincian barang, total, dan kembalian.
   - Tombol **Cetak Struk** menggunakan fungsi native `window.print()` dengan layout khusus kertas struk thermal.

4. **Riwayat Penjualan**:
   - Filter pencarian nomor transaksi, nama pelanggan, tanggal, dan metode bayar.
   - Modal detail belanja lengkap dan cetak ulang struk kasir.

5. **Pengadaan Barang (Pembelian / PO)**:
   - Input faktur pembelian dari supplier dengan opsi status Lunas (Kas) atau Tempo (Hutang Usaha).
   - Penambahan stok otomatis saat pembelian disimpan.
   - Pembuatan jurnal akuntansi pembelian otomatis.

6. **Retur Transaksi**:
   - **Retur Penjualan**: Pelanggan mengembalikan barang rusak/cacat &rarr; stok toko otomatis bertambah kembali.
   - **Retur Pembelian**: Toko mengembalikan barang cacat ke supplier &rarr; stok toko otomatis berkurang.

7. **Katalog & Master Data Produk**:
   - Manajemen produk lengkap (Kode, Nama, Kategori, Harga Beli, Harga Jual, Stok, Min Stok, Satuan).
   - Status stok otomatis: **Aman**, **Menipis**, atau **Habis**.
   - Tambah, edit, dan hapus produk dengan dialog konfirmasi.

8. **Inventori & Kartu Stok**:
   - Kartu statistik kondisi gudang.
   - Log seluruh mutasi pergerakan barang (Masuk, Keluar, Retur, Opname).
   - Kartu stok khusus per masing-masing produk terpilih.

9. **Stok Opname Fisik**:
   - Lembar kerja pencocokan stok sistem vs stok fisik nyata.
   - Perhitungan selisih surplus/defisit secara otomatis.
   - Penerapan hasil opname langsung memperbarui stok sistem dan mencatat berita acara.

10. **Data Rekanan (Supplier & Customer)**:
    - Master data vendor supplier dan pelanggan toko lengkap dengan riwayat total transaksi dan nilai belanja.

11. **Akuntansi & Jurnal Umum**:
    - Buku besar akun standar (Kas, Bank, Piutang, Persediaan, Hutang, Modal, Pendapatan, HPP, Beban).
    - Jurnal umum dengan sistem pencatatan berpasangan (Debit & Kredit berimbang).
    - Fitur tambah jurnal manual untuk beban operasional (listrik, internet, dsb.).

12. **Laporan Toko Komprehensif (3 Kategori)**:
    - **Operasional & Barang**: Rekapitulasi Nilai Persediaan, Laporan Mutasi Stok.
    - **Transaksional**: Laporan Penjualan, Pembelian, Retur Penjualan, Retur Pembelian.
    - **Keuangan**: Laporan Laba Rugi Komprehensif, Neraca Keuangan, dan Laporan Arus Kas (Cash Flow).
    - Dilengkapi tombol cetak laporan rapi tanpa tampilan sidebar.

13. **User & Hak Akses (Role-Based Access Control)**:
    - Manajemen akun user dan tabel matriks permission untuk 7 jabatan toko.
    - Menu sidebar otomatis menyesuaikan hak akses akun yang login.

14. **Pengaturan & Manajemen Data**:
    - Profil toko (Nama, Alamat, Telepon, Footer Struk).
    - Ekspor data lengkap ke file cadangan JSON (Backup).
    - Fitur **Reset ke Data Demo Default** untuk mengembalikan data awal presentasi kuliah sewaktu-waktu.
