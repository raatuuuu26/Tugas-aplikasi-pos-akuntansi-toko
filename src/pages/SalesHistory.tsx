import React, { useState } from 'react';
import { Sale } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import { IconSearch, IconPrinter } from '../components/common/Icons';

export const SalesHistory: React.FC = () => {
  const [sales] = useState<Sale[]>(storageService.getSales());
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('Semua');
  const [dateFilter, setDateFilter] = useState('');

  // Selected sale for detail modal / receipt print
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredSales = sales.filter((s) => {
    const matchSearch =
      s.invoiceNumber.toLowerCase().includes(search.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(search.toLowerCase())) ||
      s.cashierName.toLowerCase().includes(search.toLowerCase());

    const matchMethod = methodFilter === 'Semua' || s.paymentMethod === methodFilter;
    const matchDate = !dateFilter || s.date.startsWith(dateFilter);

    return matchSearch && matchMethod && matchDate;
  });

  const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);

  return (
    <div>
      {/* Summary Mini Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Transaksi
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--primary)', marginTop: '4px' }}>
            {filteredSales.length} Faktur
          </div>
        </Card>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Total Pendapatan (Omset)
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--success)', marginTop: '4px' }}>
            {formatRupiah(totalRevenue)}
          </div>
        </Card>
        <Card style={{ padding: '16px' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase' }}>
            Rata-rata per Struk
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--dark)', marginTop: '4px' }}>
            {filteredSales.length > 0 ? formatRupiah(Math.round(totalRevenue / filteredSales.length)) : 'Rp 0'}
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Daftar Riwayat Penjualan Kasir"
          subtitle="Semua transaksi pembayaran kasir yang tersimpan"
        />

        {/* Filters */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            marginBottom: '16px',
          }}
        >
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <span
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--text-muted)',
              }}
            >
              <IconSearch size={16} />
            </span>
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '38px' }}
              placeholder="Cari No. TRX / Pelanggan / Kasir..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '160px' }}>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              title="Filter Tanggal"
            />
          </div>

          <div style={{ display: 'flex', gap: '6px' }}>
            {['Semua', 'Tunai', 'Transfer', 'QRIS'].map((method) => (
              <button
                key={method}
                className={`btn btn-sm ${
                  methodFilter === method ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => setMethodFilter(method)}
              >
                {method}
              </button>
            ))}
          </div>

          {(search || dateFilter || methodFilter !== 'Semua') && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setDateFilter('');
                setMethodFilter('Semua');
              }}
            >
              Reset Filter
            </button>
          )}
        </div>

        {/* Table */}
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. Transaksi</th>
                <th>Tanggal & Waktu</th>
                <th>Pelanggan</th>
                <th>Kasir</th>
                <th>Metode</th>
                <th>Total Belanja</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {s.invoiceNumber}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{s.date}</td>
                  <td style={{ fontWeight: 500 }}>{s.customerName || 'Umum'}</td>
                  <td>{s.cashierName}</td>
                  <td>
                    <Badge
                      variant={
                        s.paymentMethod === 'Tunai'
                          ? 'success'
                          : s.paymentMethod === 'QRIS'
                          ? 'warning'
                          : 'primary'
                      }
                    >
                      {s.paymentMethod}
                    </Badge>
                  </td>
                  <td style={{ fontWeight: 700 }}>{formatRupiah(s.total)}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setSelectedSale(s);
                          setIsDetailOpen(true);
                        }}
                      >
                        Detail
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        icon={<IconPrinter size={14} />}
                        onClick={() => {
                          setSelectedSale(s);
                          setIsReceiptOpen(true);
                        }}
                      >
                        Struk
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Tidak ada transaksi yang cocok dengan kriteria filter.
          </div>
        )}
      </Card>

      {/* Detail Modal */}
      {selectedSale && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detail Transaksi: ${selectedSale.invoiceNumber}`}
          size="medium"
          footer={
            <>
              <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
                Tutup
              </Button>
              <Button
                variant="primary"
                icon={<IconPrinter size={16} />}
                onClick={() => {
                  setIsDetailOpen(false);
                  setIsReceiptOpen(true);
                }}
              >
                Cetak Struk
              </Button>
            </>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px', fontSize: '0.85rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Tanggal:</span>{' '}
              <strong>{selectedSale.date}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Kasir:</span>{' '}
              <strong>{selectedSale.cashierName}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Pelanggan:</span>{' '}
              <strong>{selectedSale.customerName || 'Umum'}</strong>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Metode Bayar:</span>{' '}
              <Badge variant="primary">{selectedSale.paymentMethod}</Badge>
            </div>
          </div>

          <div className="table-container" style={{ marginBottom: '16px' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Harga</th>
                  <th style={{ textAlign: 'center' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedSale.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{it.name}</td>
                    <td>{formatRupiah(it.sellPrice)}</td>
                    <td style={{ textAlign: 'center' }}>{it.qty}</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>
                      {formatRupiah(it.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', fontSize: '0.9rem', lineHeight: '1.8' }}>
            <div>
              Subtotal: <strong>{formatRupiah(selectedSale.subtotal)}</strong>
            </div>
            {selectedSale.discount > 0 && (
              <div style={{ color: 'var(--danger)' }}>
                Diskon: -{formatRupiah(selectedSale.discount)}
              </div>
            )}
            <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
              Total: {formatRupiah(selectedSale.total)}
            </div>
            <div>
              Uang Diterima: {formatRupiah(selectedSale.amountPaid)} | Kembalian:{' '}
              {formatRupiah(selectedSale.change)}
            </div>
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={selectedSale}
        settings={storageService.getSettings()}
      />
    </div>
  );
};
