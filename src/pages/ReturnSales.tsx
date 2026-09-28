import React, { useState } from 'react';
import { ReturnSale, Sale } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { IconPlus } from '../components/common/Icons';

interface ReturnSalesProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const ReturnSales: React.FC<ReturnSalesProps> = ({ onShowToast, onRefreshData }) => {
  const [returnSales, setReturnSales] = useState<ReturnSale[]>(storageService.getReturnSales());
  const [sales] = useState<Sale[]>(storageService.getSales());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSaleId, setSelectedSaleId] = useState(sales[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [reason, setReason] = useState('Barang cacat / rusak kemasan');

  const selectedSale = sales.find((s) => s.id === selectedSaleId);

  // Initialize selected product when sale changes
  React.useEffect(() => {
    if (selectedSale && selectedSale.items.length > 0) {
      setSelectedProductId(selectedSale.items[0].productId);
    }
  }, [selectedSaleId]);

  const selectedItem = selectedSale?.items.find((it) => it.productId === selectedProductId);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSale || !selectedItem) {
      onShowToast('danger', 'Pilih transaksi dan produk yang valid!', 'Validasi');
      return;
    }

    if (returnQty <= 0) {
      onShowToast('danger', 'Kuantitas retur harus lebih besar dari 0!', 'Validasi');
      return;
    }

    if (returnQty > selectedItem.qty) {
      onShowToast(
        'danger',
        `Kuantitas retur (${returnQty}) tidak boleh melebihi jumlah pembelian (${selectedItem.qty})!`,
        'Validasi'
      );
      return;
    }

    const returnNumber = storageService.getNextReturnSaleNumber();
    const refundAmount = returnQty * selectedItem.sellPrice;

    const newReturn: ReturnSale = {
      id: 'ret-s-' + Date.now(),
      returnNumber,
      saleId: selectedSale.id,
      saleInvoice: selectedSale.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      customerName: selectedSale.customerName || 'Pelanggan Umum',
      items: [
        {
          productId: selectedItem.productId,
          code: selectedItem.code,
          name: selectedItem.name,
          qty: returnQty,
          price: selectedItem.sellPrice,
          subtotal: refundAmount,
        },
      ],
      totalRefund: refundAmount,
      reason,
    };

    storageService.addReturnSale(newReturn);
    setReturnSales(storageService.getReturnSales());

    if (onRefreshData) onRefreshData();

    onShowToast(
      'success',
      `Retur ${returnNumber} berhasil diproses. Stok barang ${selectedItem.name} bertambah +${returnQty}.`,
      'Retur Berhasil'
    );
    setIsModalOpen(false);
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Daftar Retur Penjualan (Customer Return)"
          subtitle="Pencatatan pengembalian barang dari pelanggan (stok kembali bertambah)"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Buat Retur Penjualan
            </Button>
          }
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. Retur</th>
                <th>Tanggal</th>
                <th>No. Faktur Asli</th>
                <th>Pelanggan</th>
                <th>Produk</th>
                <th>Qty Retur</th>
                <th>Pengembalian Dana</th>
                <th>Alasan</th>
              </tr>
            </thead>
            <tbody>
              {returnSales.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {r.returnNumber}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{r.date}</td>
                  <td style={{ fontWeight: 600 }}>{r.saleInvoice}</td>
                  <td>{r.customerName}</td>
                  <td style={{ fontWeight: 600 }}>
                    {r.items.map((it) => it.name).join(', ')}
                  </td>
                  <td>{r.items.reduce((s, it) => s + it.qty, 0)} unit</td>
                  <td style={{ fontWeight: 700, color: 'var(--danger)' }}>
                    {formatRupiah(r.totalRefund)}
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {r.reason}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {returnSales.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Belum ada catatan retur penjualan.
          </div>
        )}
      </Card>

      {/* Modal Input Retur Penjualan */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulir Retur Penjualan"
        size="medium"
      >
        <form onSubmit={handleSubmitReturn}>
          <Select
            label="Pilih Faktur Penjualan *"
            value={selectedSaleId}
            onChange={(e) => setSelectedSaleId(e.target.value)}
            options={sales.map((s) => ({
              value: s.id,
              label: `${s.invoiceNumber} - ${s.customerName || 'Umum'} (${formatRupiah(s.total)})`,
            }))}
          />

          {selectedSale && (
            <>
              <div className="form-group">
                <label className="form-label">Pilih Produk yang Diretur *</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {selectedSale.items.map((it) => (
                    <option key={it.productId} value={it.productId}>
                      {it.name} (Beli: {it.qty} unit @ {formatRupiah(it.sellPrice)})
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <Input
                    label={`Kuantitas Retur (Maks: ${selectedItem.qty}) *`}
                    type="number"
                    min="1"
                    max={selectedItem.qty}
                    value={returnQty}
                    onChange={(e) => setReturnQty(Number(e.target.value))}
                    required
                  />

                  <div>
                    <label className="form-label">Total Refund Dana</label>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--danger)', paddingTop: '8px' }}>
                      {formatRupiah(returnQty * selectedItem.sellPrice)}
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Alasan Pengembalian *"
                placeholder="Contoh: Barang kadaluarsa / kemasan bocor"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </>
          )}

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" variant="primary">
              Proses Retur (Stok Masuk)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
