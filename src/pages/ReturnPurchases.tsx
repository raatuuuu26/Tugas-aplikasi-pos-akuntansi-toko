import React, { useState } from 'react';
import { ReturnPurchase, Purchase } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { IconPlus } from '../components/common/Icons';

interface ReturnPurchasesProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const ReturnPurchases: React.FC<ReturnPurchasesProps> = ({ onShowToast, onRefreshData }) => {
  const [returnPurchases, setReturnPurchases] = useState<ReturnPurchase[]>(storageService.getReturnPurchases());
  const [purchases] = useState<Purchase[]>(storageService.getPurchases());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPurchaseId, setSelectedPurchaseId] = useState(purchases[0]?.id || '');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [returnQty, setReturnQty] = useState(1);
  const [reason, setReason] = useState('Barang cacat pabrik / tidak sesuai pesanan');

  const selectedPurchase = purchases.find((p) => p.id === selectedPurchaseId);

  React.useEffect(() => {
    if (selectedPurchase && selectedPurchase.items.length > 0) {
      setSelectedProductId(selectedPurchase.items[0].productId);
    }
  }, [selectedPurchaseId]);

  const selectedItem = selectedPurchase?.items.find((it) => it.productId === selectedProductId);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSubmitReturn = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedPurchase || !selectedItem) {
      onShowToast('danger', 'Pilih faktur pembelian dan produk yang valid!', 'Validasi');
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

    // Check if store has enough stock to return
    const currentProducts = storageService.getProducts();
    const currentProd = currentProducts.find((p) => p.id === selectedItem.productId);
    if (!currentProd || currentProd.stock < returnQty) {
      onShowToast(
        'danger',
        `Stok saat ini (${currentProd?.stock || 0}) tidak mencukupi untuk diretur (${returnQty})!`,
        'Validasi Stok'
      );
      return;
    }

    const returnNumber = storageService.getNextReturnPurchaseNumber();
    const refundAmount = returnQty * selectedItem.buyPrice;

    const newReturn: ReturnPurchase = {
      id: 'ret-p-' + Date.now(),
      returnNumber,
      purchaseId: selectedPurchase.id,
      purchaseInvoice: selectedPurchase.invoiceNumber,
      date: new Date().toISOString().split('T')[0],
      supplierName: selectedPurchase.supplierName,
      items: [
        {
          productId: selectedItem.productId,
          code: selectedItem.code,
          name: selectedItem.name,
          qty: returnQty,
          price: selectedItem.buyPrice,
          subtotal: refundAmount,
        },
      ],
      totalRefund: refundAmount,
      reason,
    };

    storageService.addReturnPurchase(newReturn);
    setReturnPurchases(storageService.getReturnPurchases());

    if (onRefreshData) onRefreshData();

    onShowToast(
      'success',
      `Retur pembelian ${returnNumber} berhasil diproses. Stok barang ${selectedItem.name} berkurang -${returnQty}.`,
      'Retur Berhasil'
    );
    setIsModalOpen(false);
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Daftar Retur Pembelian ke Pemasok (Supplier Return)"
          subtitle="Pencatatan pengembalian barang rusak ke supplier (stok berkurang)"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Buat Retur Pembelian
            </Button>
          }
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. Retur</th>
                <th>Tanggal</th>
                <th>No. PO Asli</th>
                <th>Supplier</th>
                <th>Produk</th>
                <th>Qty Retur</th>
                <th>Klaim Pengembalian</th>
                <th>Alasan Retur</th>
              </tr>
            </thead>
            <tbody>
              {returnPurchases.map((r) => (
                <tr key={r.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {r.returnNumber}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{r.date}</td>
                  <td style={{ fontWeight: 600 }}>{r.purchaseInvoice}</td>
                  <td>{r.supplierName}</td>
                  <td style={{ fontWeight: 600 }}>
                    {r.items.map((it) => it.name).join(', ')}
                  </td>
                  <td>{r.items.reduce((s, it) => s + it.qty, 0)} unit</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
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

        {returnPurchases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Belum ada catatan retur pembelian ke supplier.
          </div>
        )}
      </Card>

      {/* Modal Input Retur Pembelian */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Formulir Retur Pembelian Supplier"
        size="medium"
      >
        <form onSubmit={handleSubmitReturn}>
          <Select
            label="Pilih Faktur Pembelian Asli *"
            value={selectedPurchaseId}
            onChange={(e) => setSelectedPurchaseId(e.target.value)}
            options={purchases.map((p) => ({
              value: p.id,
              label: `${p.invoiceNumber} - ${p.supplierName} (${formatRupiah(p.total)})`,
            }))}
          />

          {selectedPurchase && (
            <>
              <div className="form-group">
                <label className="form-label">Pilih Produk yang Akan Dikembalikan *</label>
                <select
                  className="form-select"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  {selectedPurchase.items.map((it) => (
                    <option key={it.productId} value={it.productId}>
                      {it.name} (Beli: {it.qty} unit @ {formatRupiah(it.buyPrice)})
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
                    <label className="form-label">Total Nilai Pengembalian</label>
                    <div style={{ fontWeight: 800, fontSize: '1.05rem', color: 'var(--success)', paddingTop: '8px' }}>
                      {formatRupiah(returnQty * selectedItem.buyPrice)}
                    </div>
                  </div>
                </div>
              )}

              <Input
                label="Alasan Pengembalian *"
                placeholder="Contoh: Barang cacat dari pabrik / segel rusak"
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
              Proses Retur (Kurangi Stok Toko)
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
