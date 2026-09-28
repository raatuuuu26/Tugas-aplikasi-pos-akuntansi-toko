import React, { useState } from 'react';
import { Product, ProductStatus } from '../types';
import { storageService, calculateProductStatus } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '../components/common/Icons';

interface ProductsProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const Products: React.FC<ProductsProps> = ({ onShowToast, onRefreshData }) => {
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Semua');

  // Form Modal (Add / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Makanan');
  const [buyPrice, setBuyPrice] = useState(0);
  const [sellPrice, setSellPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [minStock, setMinStock] = useState(10);
  const [unit, setUnit] = useState('Pcs');

  // Delete Confirm Dialog
  const [deleteCandidate, setDeleteCandidate] = useState<Product | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    const matchCat = categoryFilter === 'Semua' || p.category === categoryFilter;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const handleOpenAddModal = () => {
    setEditingProduct(null);
    const nextCodeNum = products.length + 1;
    setCode(`PRD-${String(nextCodeNum).padStart(3, '0')}`);
    setName('');
    setCategory('Makanan');
    setBuyPrice(0);
    setSellPrice(0);
    setStock(10);
    setMinStock(10);
    setUnit('Pcs');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (prod: Product) => {
    setEditingProduct(prod);
    setCode(prod.code);
    setName(prod.name);
    setCategory(prod.category);
    setBuyPrice(prod.buyPrice);
    setSellPrice(prod.sellPrice);
    setStock(prod.stock);
    setMinStock(prod.minStock);
    setUnit(prod.unit || 'Pcs');
    setIsModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !code.trim()) {
      onShowToast('danger', 'Kode dan nama produk wajib diisi!', 'Validasi');
      return;
    }

    if (buyPrice < 0 || sellPrice < 0 || stock < 0 || minStock < 0) {
      onShowToast('danger', 'Harga dan kuantitas stok tidak boleh bernilai negatif!', 'Validasi');
      return;
    }

    const currentStatus: ProductStatus = calculateProductStatus(stock, minStock);

    if (editingProduct) {
      // Edit
      const updatedList = products.map((p) =>
        p.id === editingProduct.id
          ? {
              ...p,
              code,
              name,
              category,
              buyPrice,
              sellPrice,
              stock,
              minStock,
              status: currentStatus,
              unit,
            }
          : p
      );
      storageService.saveProducts(updatedList);
      setProducts(updatedList);
      onShowToast('success', `Produk "${name}" berhasil diperbarui.`, 'Berhasil');
    } else {
      // Add
      const newProduct: Product = {
        id: 'prd-' + Date.now(),
        code,
        name,
        category,
        buyPrice,
        sellPrice,
        stock,
        minStock,
        status: currentStatus,
        unit,
      };
      const updatedList = [newProduct, ...products];
      storageService.saveProducts(updatedList);
      setProducts(updatedList);
      onShowToast('success', `Produk baru "${name}" berhasil ditambahkan.`, 'Berhasil');
    }

    if (onRefreshData) onRefreshData();
    setIsModalOpen(false);
  };

  const handleDeleteProduct = () => {
    if (!deleteCandidate) return;
    const updatedList = products.filter((p) => p.id !== deleteCandidate.id);
    storageService.saveProducts(updatedList);
    setProducts(updatedList);
    onShowToast('info', `Produk "${deleteCandidate.name}" telah dihapus.`, 'Dihapus');
    setDeleteCandidate(null);
    if (onRefreshData) onRefreshData();
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Katalog & Master Data Produk"
          subtitle="Daftar produk, penetapan harga jual, dan status ketersediaan stok"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Tambah Produk Baru
            </Button>
          }
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
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
              placeholder="Cari kode atau nama produk..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${
                  categoryFilter === cat ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Products Table */}
        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Kategori</th>
                <th>Harga Beli</th>
                <th>Harga Jual</th>
                <th>Stok Toko</th>
                <th>Min. Stok</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.code}</td>
                  <td style={{ fontWeight: 600 }}>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{formatRupiah(p.buyPrice)}</td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                    {formatRupiah(p.sellPrice)}
                  </td>
                  <td style={{ fontWeight: 700 }}>
                    {p.stock} {p.unit}
                  </td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {p.minStock} {p.unit}
                  </td>
                  <td>
                    <Badge
                      variant={
                        p.status === 'Aman'
                          ? 'success'
                          : p.status === 'Menipis'
                          ? 'warning'
                          : 'danger'
                      }
                    >
                      {p.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<IconEdit size={14} />}
                        onClick={() => handleOpenEditModal(p)}
                        title="Edit"
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<IconTrash size={14} />}
                        onClick={() => setDeleteCandidate(p)}
                        title="Hapus"
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Tidak ada produk yang cocok dengan pencarian.
          </div>
        )}
      </Card>

      {/* Modal Form Tambah/Edit Produk */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? `Edit Produk: ${editingProduct.name}` : 'Tambah Produk Baru'}
        size="medium"
      >
        <form onSubmit={handleSaveProduct}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Kode Produk *"
              placeholder="Contoh: PRD-011"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="Nama Produk *"
              placeholder="Contoh: Kopi Bubuk 200g"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Kategori *"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              options={[
                { value: 'Makanan', label: 'Makanan' },
                { value: 'Minuman', label: 'Minuman' },
                { value: 'Sembako', label: 'Sembako' },
                { value: 'Kebutuhan Rumah', label: 'Kebutuhan Rumah' },
                { value: 'Elektronik / Alat', label: 'Elektronik / Alat' },
                { value: 'Lainnya', label: 'Lainnya' },
              ]}
            />
            <Input
              label="Satuan Unit *"
              placeholder="Pcs / Bungkus / Kg / Botol"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Harga Beli (Modal) *"
              type="number"
              min="0"
              prefix="Rp"
              value={buyPrice}
              onChange={(e) => setBuyPrice(Number(e.target.value))}
              required
            />
            <Input
              label="Harga Jual *"
              type="number"
              min="0"
              prefix="Rp"
              value={sellPrice}
              onChange={(e) => setSellPrice(Number(e.target.value))}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Stok Awal *"
              type="number"
              min="0"
              value={stock}
              onChange={(e) => setStock(Number(e.target.value))}
              required
            />
            <Input
              label="Batas Minimum Stok *"
              type="number"
              min="0"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
              required
            />
          </div>

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
              {editingProduct ? 'Simpan Perubahan' : 'Tambahkan Produk'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Konfirmasi Hapus Produk"
        message={`Apakah Anda yakin ingin menghapus produk "${deleteCandidate?.name}" (${deleteCandidate?.code})? Data yang dihapus tidak dapat dikembalikan.`}
        confirmLabel="Hapus Produk"
        confirmVariant="danger"
        onConfirm={handleDeleteProduct}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
