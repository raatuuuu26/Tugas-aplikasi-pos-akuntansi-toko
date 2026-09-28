import React, { useState } from 'react';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { IconPrinter, IconSearch } from '../components/common/Icons';

type ReportCategory = 'operasional' | 'transaksional' | 'keuangan';
type OperasionalSub = 'rekap-persediaan' | 'mutasi-stok';
type TransaksionalSub = 'penjualan' | 'pembelian' | 'retur-penjualan' | 'retur-pembelian';
type KeuanganSub = 'laba-rugi' | 'neraca' | 'arus-kas';

export const Reports: React.FC = () => {
  const [mainCategory, setMainCategory] = useState<ReportCategory>('keuangan');
  const [operasionalSub, setOperasionalSub] = useState<OperasionalSub>('rekap-persediaan');
  const [transaksionalSub, setTransaksionalSub] = useState<TransaksionalSub>('penjualan');
  const [keuanganSub, setKeuanganSub] = useState<KeuanganSub>('laba-rugi');

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [search, setSearch] = useState('');

  // Data from storage
  const products = storageService.getProducts();
  const sales = storageService.getSales();
  const purchases = storageService.getPurchases();
  const returnSales = storageService.getReturnSales();
  const returnPurchases = storageService.getReturnPurchases();
  const mutations = storageService.getMutations();
  const accounts = storageService.getAccounts();
  const settings = storageService.getSettings();

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  // Calculations for Financial Reports
  const totalSalesRevenue = sales.reduce((sum, s) => sum + s.total, 0);
  const totalPurchasesCost = purchases.reduce((sum, p) => sum + p.total, 0);
  const totalReturnSales = returnSales.reduce((sum, r) => sum + r.totalRefund, 0);
  const totalReturnPurchases = returnPurchases.reduce((sum, r) => sum + r.totalRefund, 0);

  // HPP estimate
  const totalHPP = sales.reduce((sum, s) => {
    const saleCost = s.items.reduce((c, it) => c + (it.buyPrice || 0) * it.qty, 0);
    return sum + saleCost;
  }, 0);

  const grossProfit = totalSalesRevenue - totalHPP;
  const operationalExpenses = 14400000; // Beban gaji + listrik + air
  const netProfit = grossProfit - operationalExpenses;

  // Inventory value
  const totalInventoryValue = products.reduce((sum, p) => sum + p.stock * p.buyPrice, 0);

  return (
    <div>
      {/* Category Navigation Tabs */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }} className="btn-no-print">
        <button
          className={`btn ${mainCategory === 'operasional' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainCategory('operasional')}
        >
          1. Operasional & Barang
        </button>
        <button
          className={`btn ${mainCategory === 'transaksional' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainCategory('transaksional')}
        >
          2. Transaksional Toko
        </button>
        <button
          className={`btn ${mainCategory === 'keuangan' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setMainCategory('keuangan')}
        >
          3. Keuangan & Akuntansi
        </button>

        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="outline"
            icon={<IconPrinter size={16} />}
            onClick={handlePrint}
          >
            Cetak Laporan Ini
          </Button>
        </div>
      </div>

      {/* Subcategory Navigation Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }} className="btn-no-print">
        {mainCategory === 'operasional' && (
          <>
            <button
              className={`btn btn-sm ${operasionalSub === 'rekap-persediaan' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOperasionalSub('rekap-persediaan')}
            >
              Rekap Nilai Persediaan
            </button>
            <button
              className={`btn btn-sm ${operasionalSub === 'mutasi-stok' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setOperasionalSub('mutasi-stok')}
            >
              Laporan Mutasi Stok
            </button>
          </>
        )}

        {mainCategory === 'transaksional' && (
          <>
            <button
              className={`btn btn-sm ${transaksionalSub === 'penjualan' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTransaksionalSub('penjualan')}
            >
              Laporan Penjualan
            </button>
            <button
              className={`btn btn-sm ${transaksionalSub === 'pembelian' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTransaksionalSub('pembelian')}
            >
              Laporan Pembelian
            </button>
            <button
              className={`btn btn-sm ${transaksionalSub === 'retur-penjualan' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTransaksionalSub('retur-penjualan')}
            >
              Laporan Retur Penjualan
            </button>
            <button
              className={`btn btn-sm ${transaksionalSub === 'retur-pembelian' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setTransaksionalSub('retur-pembelian')}
            >
              Laporan Retur Pembelian
            </button>
          </>
        )}

        {mainCategory === 'keuangan' && (
          <>
            <button
              className={`btn btn-sm ${keuanganSub === 'laba-rugi' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setKeuanganSub('laba-rugi')}
            >
              Laporan Laba Rugi
            </button>
            <button
              className={`btn btn-sm ${keuanganSub === 'neraca' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setKeuanganSub('neraca')}
            >
              Laporan Neraca Keuangan
            </button>
            <button
              className={`btn btn-sm ${keuanganSub === 'arus-kas' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => setKeuanganSub('arus-kas')}
            >
              Laporan Arus Kas (Cash Flow)
            </button>
          </>
        )}
      </div>

      {/* Main Report Document Container */}
      <Card className="print-area">
        {/* Printable Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px', borderBottom: '2px solid #1E293B', paddingBottom: '14px' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--dark)' }}>
            {settings.storeName.toUpperCase()}
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{settings.address} &bull; Telp: {settings.phone}</p>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginTop: '8px', color: 'var(--primary)', textTransform: 'uppercase' }}>
            {mainCategory === 'operasional' && operasionalSub === 'rekap-persediaan' && 'Laporan Rekapitulasi Nilai Persediaan Barang'}
            {mainCategory === 'operasional' && operasionalSub === 'mutasi-stok' && 'Laporan Mutasi Keluar Masuk Barang'}
            {mainCategory === 'transaksional' && transaksionalSub === 'penjualan' && 'Laporan Rincian Penjualan Kasir'}
            {mainCategory === 'transaksional' && transaksionalSub === 'pembelian' && 'Laporan Pembelian & Pengadaan Barang'}
            {mainCategory === 'transaksional' && transaksionalSub === 'retur-penjualan' && 'Laporan Retur Penjualan Pelanggan'}
            {mainCategory === 'transaksional' && transaksionalSub === 'retur-pembelian' && 'Laporan Retur Pembelian ke Supplier'}
            {mainCategory === 'keuangan' && keuanganSub === 'laba-rugi' && 'Laporan Laba Rugi Komprehensif'}
            {mainCategory === 'keuangan' && keuanganSub === 'neraca' && 'Laporan Posisi Keuangan (Neraca)'}
            {mainCategory === 'keuangan' && keuanganSub === 'arus-kas' && 'Laporan Arus Kas Operasional'}
          </h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Dicetak per tanggal: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}
          </p>
        </div>

        {/* 1. OPERASIONAL: REKAP PERSEDIAAN */}
        {mainCategory === 'operasional' && operasionalSub === 'rekap-persediaan' && (
          <div>
            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Kode</th>
                    <th>Nama Barang</th>
                    <th>Kategori</th>
                    <th>Stok</th>
                    <th>Harga Beli</th>
                    <th>Harga Jual</th>
                    <th style={{ textAlign: 'right' }}>Total Nilai Beli</th>
                    <th style={{ textAlign: 'right' }}>Potensi Omset Jual</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 700 }}>{p.code}</td>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.category}</td>
                      <td>{p.stock} {p.unit}</td>
                      <td>{formatRupiah(p.buyPrice)}</td>
                      <td>{formatRupiah(p.sellPrice)}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>
                        {formatRupiah(p.stock * p.buyPrice)}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 600, color: 'var(--primary)' }}>
                        {formatRupiah(p.stock * p.sellPrice)}
                      </td>
                    </tr>
                  ))}
                  <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                    <td colSpan={6} style={{ textAlign: 'right' }}>TOTAL KESELURUHAN:</td>
                    <td style={{ textAlign: 'right', color: 'var(--dark)' }}>
                      {formatRupiah(totalInventoryValue)}
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                      {formatRupiah(products.reduce((s, p) => s + p.stock * p.sellPrice, 0))}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 1. OPERASIONAL: MUTASI STOK */}
        {mainCategory === 'operasional' && operasionalSub === 'mutasi-stok' && (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Produk</th>
                  <th>Tipe Mutasi</th>
                  <th>Qty</th>
                  <th>Awal &rarr; Akhir</th>
                  <th>Referensi</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {mutations.map((m) => (
                  <tr key={m.id}>
                    <td>{m.date}</td>
                    <td style={{ fontWeight: 600 }}>{m.productName}</td>
                    <td>{m.type}</td>
                    <td style={{ fontWeight: 700 }}>{m.qty}</td>
                    <td>{m.initialStock} &rarr; {m.finalStock}</td>
                    <td>{m.reference}</td>
                    <td>{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TRANSAKSIONAL: PENJUALAN */}
        {mainCategory === 'transaksional' && transaksionalSub === 'penjualan' && (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No. Faktur</th>
                  <th>Waktu</th>
                  <th>Kasir</th>
                  <th>Pelanggan</th>
                  <th>Metode</th>
                  <th>Diskon</th>
                  <th style={{ textAlign: 'right' }}>Total Transaksi</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700 }}>{s.invoiceNumber}</td>
                    <td>{s.date}</td>
                    <td>{s.cashierName}</td>
                    <td>{s.customerName || 'Umum'}</td>
                    <td>{s.paymentMethod}</td>
                    <td>{formatRupiah(s.discount)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(s.total)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                  <td colSpan={6} style={{ textAlign: 'right' }}>TOTAL OMSET PENJUALAN:</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                    {formatRupiah(totalSalesRevenue)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TRANSAKSIONAL: PEMBELIAN */}
        {mainCategory === 'transaksional' && transaksionalSub === 'pembelian' && (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No. Pembelian</th>
                  <th>Tanggal</th>
                  <th>Supplier</th>
                  <th>Status Bayar</th>
                  <th style={{ textAlign: 'right' }}>Total Pembelian</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700 }}>{p.invoiceNumber}</td>
                    <td>{p.date}</td>
                    <td>{p.supplierName}</td>
                    <td>{p.paymentStatus}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700 }}>{formatRupiah(p.total)}</td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                  <td colSpan={4} style={{ textAlign: 'right' }}>TOTAL PEMBELIAN:</td>
                  <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                    {formatRupiah(totalPurchasesCost)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TRANSAKSIONAL: RETUR PENJUALAN */}
        {mainCategory === 'transaksional' && transaksionalSub === 'retur-penjualan' && (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No. Retur</th>
                  <th>Tanggal</th>
                  <th>Faktur Asli</th>
                  <th>Pelanggan</th>
                  <th>Alasan</th>
                  <th style={{ textAlign: 'right' }}>Total Refund</th>
                </tr>
              </thead>
              <tbody>
                {returnSales.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.returnNumber}</td>
                    <td>{r.date}</td>
                    <td>{r.saleInvoice}</td>
                    <td>{r.customerName}</td>
                    <td>{r.reason}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--danger)' }}>
                      {formatRupiah(r.totalRefund)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                  <td colSpan={5} style={{ textAlign: 'right' }}>TOTAL NILAI RETUR:</td>
                  <td style={{ textAlign: 'right', color: 'var(--danger)' }}>
                    {formatRupiah(totalReturnSales)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 2. TRANSAKSIONAL: RETUR PEMBELIAN */}
        {mainCategory === 'transaksional' && transaksionalSub === 'retur-pembelian' && (
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No. Retur</th>
                  <th>Tanggal</th>
                  <th>No. PO</th>
                  <th>Supplier</th>
                  <th>Alasan</th>
                  <th style={{ textAlign: 'right' }}>Klaim Pengembalian</th>
                </tr>
              </thead>
              <tbody>
                {returnPurchases.map((r) => (
                  <tr key={r.id}>
                    <td style={{ fontWeight: 700 }}>{r.returnNumber}</td>
                    <td>{r.date}</td>
                    <td>{r.purchaseInvoice}</td>
                    <td>{r.supplierName}</td>
                    <td>{r.reason}</td>
                    <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--success)' }}>
                      {formatRupiah(r.totalRefund)}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: '#F1F5F9', fontWeight: 800 }}>
                  <td colSpan={5} style={{ textAlign: 'right' }}>TOTAL RETUR SUPPLIER:</td>
                  <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                    {formatRupiah(totalReturnPurchases)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* 3. KEUANGAN: LABA RUGI */}
        {mainCategory === 'keuangan' && keuanganSub === 'laba-rugi' && (
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div className="table-container">
              <table className="app-table">
                <tbody>
                  <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                    <td colSpan={2}>PENDAPATAN USAHA</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Pendapatan Penjualan Bersih Toko</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(totalSalesRevenue)}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Retur & Potongan Penjualan</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatRupiah(totalReturnSales)}</td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td>Total Pendapatan Bersih</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(totalSalesRevenue - totalReturnSales)}</td>
                  </tr>

                  <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                    <td colSpan={2}>HARGA POKOK PENJUALAN (HPP)</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Beban Pokok Barang Terjual</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatRupiah(totalHPP)}</td>
                  </tr>
                  <tr style={{ fontWeight: 700, backgroundColor: '#EBF3FE' }}>
                    <td>LABA KOTOR (GROSS PROFIT)</td>
                    <td style={{ textAlign: 'right', color: 'var(--primary)', fontWeight: 800 }}>
                      {formatRupiah(grossProfit)}
                    </td>
                  </tr>

                  <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                    <td colSpan={2}>BEBAN OPERASIONAL TOKO</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Beban Gaji Karyawan & Kasir</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(11000000)}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Beban Listrik, Air & Internet</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(1850000)}</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '24px' }}>Beban Perlengkapan & Operasional</td>
                    <td style={{ textAlign: 'right' }}>{formatRupiah(1550000)}</td>
                  </tr>
                  <tr style={{ fontWeight: 700 }}>
                    <td>Total Beban Usaha</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)' }}>-{formatRupiah(operationalExpenses)}</td>
                  </tr>

                  <tr style={{ backgroundColor: '#DCFCE7', fontWeight: 800, fontSize: '1.05rem' }}>
                    <td>LABA BERSIH USAHA (NET PROFIT)</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                      {formatRupiah(netProfit)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 3. KEUANGAN: NERACA */}
        {mainCategory === 'keuangan' && keuanganSub === 'neraca' && (
          <div style={{ maxWidth: '850px', margin: '0 auto' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '20px' }}>
              {/* Sisi Kiri: Aset */}
              <div className="table-container">
                <table className="app-table">
                  <thead>
                    <tr style={{ backgroundColor: '#EBF3FE' }}>
                      <th colSpan={2} style={{ color: 'var(--primary)', fontWeight: 700 }}>ASET (AKTIVA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ fontWeight: 600 }}>
                      <td colSpan={2}>Aset Lancar:</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Kas Tunai Toko</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(14250000)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Bank BCA Operasional</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(35000000)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Piutang Usaha Pelanggan</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(8200000)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Persediaan Barang Dagang</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(totalInventoryValue > 0 ? totalInventoryValue : 32500000)}</td>
                    </tr>
                    <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 800 }}>
                      <td>TOTAL ASET</td>
                      <td style={{ textAlign: 'right', color: 'var(--primary)' }}>
                        {formatRupiah(14250000 + 35000000 + 8200000 + (totalInventoryValue > 0 ? totalInventoryValue : 32500000))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Sisi Kanan: Kewajiban & Ekuitas */}
              <div className="table-container">
                <table className="app-table">
                  <thead>
                    <tr style={{ backgroundColor: '#FEF3C7' }}>
                      <th colSpan={2} style={{ color: '#B45309', fontWeight: 700 }}>KEWAJIBAN & EKUITAS (PASIVA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ fontWeight: 600 }}>
                      <td colSpan={2}>Kewajiban Jangka Pendek:</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Hutang Usaha Supplier</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(5400000)}</td>
                    </tr>
                    <tr style={{ fontWeight: 600 }}>
                      <td colSpan={2}>Modal (Ekuitas):</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Modal Awal Pemilik</td>
                      <td style={{ textAlign: 'right' }}>{formatRupiah(60000000)}</td>
                    </tr>
                    <tr>
                      <td style={{ paddingLeft: '20px' }}>Laba Berjalan Toko</td>
                      <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                        {formatRupiah((14250000 + 35000000 + 8200000 + (totalInventoryValue > 0 ? totalInventoryValue : 32500000)) - 65400000)}
                      </td>
                    </tr>
                    <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 800 }}>
                      <td>TOTAL PASIVA</td>
                      <td style={{ textAlign: 'right', color: '#B45309' }}>
                        {formatRupiah(14250000 + 35000000 + 8200000 + (totalInventoryValue > 0 ? totalInventoryValue : 32500000))}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 3. KEUANGAN: ARUS KAS */}
        {mainCategory === 'keuangan' && keuanganSub === 'arus-kas' && (
          <div style={{ maxWidth: '750px', margin: '0 auto' }}>
            <div className="table-container">
              <table className="app-table">
                <tbody>
                  <tr style={{ backgroundColor: '#F8FAFC', fontWeight: 700 }}>
                    <td colSpan={2}>ARUS KAS DARI AKTIVITAS OPERASIONAL</td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '20px' }}>Penerimaan Kas dari Penjualan Pelanggan</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)', fontWeight: 600 }}>
                      +{formatRupiah(totalSalesRevenue)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '20px' }}>Pembayaran Kas untuk Pembelian Barang Dagang</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                      -{formatRupiah(totalPurchasesCost)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ paddingLeft: '20px' }}>Pembayaran Beban Gaji & Operasional Toko</td>
                    <td style={{ textAlign: 'right', color: 'var(--danger)', fontWeight: 600 }}>
                      -{formatRupiah(operationalExpenses)}
                    </td>
                  </tr>
                  <tr style={{ backgroundColor: '#DCFCE7', fontWeight: 800 }}>
                    <td>ARUS KAS BERSIH (NET CASH FLOW)</td>
                    <td style={{ textAlign: 'right', color: 'var(--success)' }}>
                      {formatRupiah(totalSalesRevenue - totalPurchasesCost - operationalExpenses)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
