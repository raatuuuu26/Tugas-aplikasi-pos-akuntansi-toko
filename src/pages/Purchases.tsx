import React, { useState } from 'react';
import { Purchase, PurchaseItem, Supplier, Product } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { IconPlus, IconTrash } from '../components/common/Icons';

interface PurchasesProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const Purchases: React.FC<PurchasesProps> = ({ onShowToast, onRefreshData }) => {
  const [purchases, setPurchases] = useState<Purchase[]>(storageService.getPurchases());
  const [suppliers] = useState<Supplier[]>(storageService.getSuppliers());
  const [products] = useState<Product[]>(storageService.getProducts());

  // Form Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState(suppliers[0]?.id || '');
  const [paymentStatus, setPaymentStatus] = useState<'Lunas' | 'Tempo'>('Lunas');
  const [dueDate, setDueDate] = useState('');
  const [notes, setNotes] = useState('');

  // Items in new purchase form
  const [formItems, setFormItems] = useState<
    { productId: string; qty: number; buyPrice: number }[]
  >([{ productId: products[0]?.id || '', qty: 10, buyPrice: products[0]?.buyPrice || 1000 }]);

  // Detail Modal state
  const [detailPurchase, setDetailPurchase] = useState<Purchase | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleAddItemRow = () => {
    const firstProd = products[0];
    setFormItems([
      ...formItems,
      { productId: firstProd?.id || '', qty: 1, buyPrice: firstProd?.buyPrice || 1000 },
    ]);
  };

  const handleRemoveItemRow = (index: number) => {
    if (formItems.length === 1) return;
    setFormItems(formItems.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: 'productId' | 'qty' | 'buyPrice', value: any) => {
    const updated = [...formItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index].productId = value;
      if (prod) updated[index].buyPrice = prod.buyPrice;
    } else {
      updated[index][field] = Number(value);
    }
    setFormItems(updated);
  };

  const formTotal = formItems.reduce((sum, item) => sum + item.qty * item.buyPrice, 0);

  const handleSubmitPurchase = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedSupplierId) {
      onShowToast('danger', 'Silakan pilih supplier!', 'Validasi');
      return;
    }

    if (formItems.some((it) => it.qty <= 0 || it.buyPrice < 0)) {
      onShowToast('danger', 'Kuantitas harus lebih dari 0 dan harga tidak boleh negatif!', 'Validasi');
      return;
    }

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    const invoiceNumber = storageService.getNextPurchaseNumber();

    const items: PurchaseItem[] = formItems.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        code: prod?.code || 'PRD-UNK',
        name: prod?.name || 'Produk Tidak Dikenal',
        buyPrice: it.buyPrice,
        qty: it.qty,
        subtotal: it.qty * it.buyPrice,
      };
    });

    const newPurchase: Purchase = {
      id: 'po-' + Date.now(),
      invoiceNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      supplierId: selectedSupplierId,
      supplierName: supplier ? supplier.name : 'Supplier Umum',
      items,
      total: formTotal,
      paymentStatus,
      dueDate: paymentStatus === 'Tempo' ? dueDate : undefined,
      notes,
    };

    storageService.addPurchase(newPurchase);
    setPurchases(storageService.getPurchases());

    if (onRefreshData) onRefreshData();

    onShowToast('success', `Pembelian ${invoiceNumber} berhasil disimpan. Stok bertambah!`, 'Berhasil');
    setIsModalOpen(false);

    // Reset
    setFormItems([{ productId: products[0]?.id || '', qty: 10, buyPrice: products[0]?.buyPrice || 1000 }]);
    setNotes('');
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Daftar Pembelian & Pengadaan Barang"
          subtitle="Kelola pesanan barang masuk dari supplier"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Tambah Pembelian Baru
            </Button>
          }
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. Pembelian</th>
                <th>Tanggal</th>
                <th>Supplier</th>
                <th>Jumlah Item</th>
                <th>Total Nominal</th>
                <th>Status Bayar</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {p.invoiceNumber}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{p.date}</td>
                  <td style={{ fontWeight: 600 }}>{p.supplierName}</td>
                  <td>{p.items.reduce((s, it) => s + it.qty, 0)} unit</td>
                  <td style={{ fontWeight: 700 }}>{formatRupiah(p.total)}</td>
                  <td>
                    <Badge variant={p.paymentStatus === 'Lunas' ? 'success' : 'warning'}>
                      {p.paymentStatus}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setDetailPurchase(p);
                        setIsDetailOpen(true);
                      }}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {purchases.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Belum ada data pembelian barang.
          </div>
        )}
      </Card>

      {/* Form Modal Tambah Pembelian */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Faktur Pembelian Supplier"
        size="large"
      >
        <form onSubmit={handleSubmitPurchase}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
            <Select
              label="Pilih Supplier *"
              value={selectedSupplierId}
              onChange={(e) => setSelectedSupplierId(e.target.value)}
              options={suppliers.map((s) => ({ value: s.id, label: s.name }))}
            />

            <Select
              label="Status Pembayaran *"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value as 'Lunas' | 'Tempo')}
              options={[
                { value: 'Lunas', label: 'Lunas (Kas Tunai)' },
                { value: 'Tempo', label: 'Tempo (Hutang Usaha)' },
              ]}
            />

            {paymentStatus === 'Tempo' && (
              <Input
                label="Tanggal Jatuh Tempo *"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
              />
            )}
          </div>

          <div style={{ margin: '16px 0 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)' }}>
              Daftar Barang Masuk
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              icon={<IconPlus size={14} />}
              onClick={handleAddItemRow}
            >
              Tambah Baris Produk
            </Button>
          </div>

          {/* Form Item Rows */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
            {formItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '2fr 1fr 1.5fr 1.5fr 40px',
                  gap: '10px',
                  alignItems: 'center',
                  backgroundColor: '#F8FAFC',
                  padding: '10px',
                  borderRadius: '6px',
                  border: '1px solid var(--border)',
                }}
              >
                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Produk</label>
                  <select
                    className="form-select"
                    value={item.productId}
                    onChange={(e) => handleItemChange(idx, 'productId', e.target.value)}
                  >
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Stok: {p.stock})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Qty</label>
                  <input
                    type="number"
                    min="1"
                    className="form-input"
                    value={item.qty}
                    onChange={(e) => handleItemChange(idx, 'qty', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Harga Beli</label>
                  <input
                    type="number"
                    min="0"
                    className="form-input"
                    value={item.buyPrice}
                    onChange={(e) => handleItemChange(idx, 'buyPrice', e.target.value)}
                  />
                </div>

                <div>
                  <label style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Subtotal</label>
                  <div style={{ fontWeight: 700, paddingTop: '8px', fontSize: '0.85rem' }}>
                    {formatRupiah(item.qty * item.buyPrice)}
                  </div>
                </div>

                <div style={{ paddingTop: '18px' }}>
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--danger)', cursor: 'pointer' }}
                    onClick={() => handleRemoveItemRow(idx)}
                    disabled={formItems.length === 1}
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Input
            label="Catatan Pembelian"
            placeholder="Contoh: No faktur cetak supplier / info kurir"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginTop: '16px',
              paddingTop: '16px',
              borderTop: '1px solid var(--border)',
            }}
          >
            <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
              Total: <span style={{ color: 'var(--primary)' }}>{formatRupiah(formTotal)}</span>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" variant="primary">
                Simpan & Tambah Stok
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      {detailPurchase && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detail Faktur: ${detailPurchase.invoiceNumber}`}
          size="medium"
          footer={
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          }
        >
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px', fontSize: '0.85rem' }}>
            <div>
              Supplier: <strong>{detailPurchase.supplierName}</strong>
            </div>
            <div>
              Tanggal: <strong>{detailPurchase.date}</strong>
            </div>
            <div>
              Status: <Badge variant={detailPurchase.paymentStatus === 'Lunas' ? 'success' : 'warning'}>{detailPurchase.paymentStatus}</Badge>
            </div>
            {detailPurchase.dueDate && (
              <div>
                Jatuh Tempo: <strong>{detailPurchase.dueDate}</strong>
              </div>
            )}
          </div>

          <div className="table-container" style={{ marginBottom: '14px' }}>
            <table className="app-table">
              <thead>
                <tr>
                  <th>Nama Barang</th>
                  <th>Harga Beli</th>
                  <th>Kuantitas</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {detailPurchase.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{it.name}</td>
                    <td>{formatRupiah(it.buyPrice)}</td>
                    <td>{it.qty} unit</td>
                    <td style={{ textAlign: 'right', fontWeight: 600 }}>{formatRupiah(it.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ textAlign: 'right', fontSize: '1.1rem', fontWeight: 800, color: 'var(--primary)' }}>
            Total Pembelian: {formatRupiah(detailPurchase.total)}
          </div>
        </Modal>
      )}
    </div>
  );
};
