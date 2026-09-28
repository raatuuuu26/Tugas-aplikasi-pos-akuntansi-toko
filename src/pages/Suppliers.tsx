import React, { useState } from 'react';
import { Supplier } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '../components/common/Icons';

interface SuppliersProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
}

export const Suppliers: React.FC<SuppliersProps> = ({ onShowToast }) => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(storageService.getSuppliers());
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  // Delete Confirm
  const [deleteCandidate, setDeleteCandidate] = useState<Supplier | null>(null);

  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.code.toLowerCase().includes(search.toLowerCase()) ||
      s.address.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setCode(`SUP-${String(suppliers.length + 1).padStart(3, '0')}`);
    setName('');
    setPhone('');
    setAddress('');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (sup: Supplier) => {
    setEditingSupplier(sup);
    setCode(sup.code);
    setName(sup.name);
    setPhone(sup.phone);
    setAddress(sup.address);
    setStatus(sup.status);
    setIsModalOpen(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      onShowToast('danger', 'Kode dan nama supplier wajib diisi!', 'Validasi');
      return;
    }

    if (editingSupplier) {
      const updated = suppliers.map((s) =>
        s.id === editingSupplier.id ? { ...s, code, name, phone, address, status } : s
      );
      storageService.saveSuppliers(updated);
      setSuppliers(updated);
      onShowToast('success', `Supplier "${name}" berhasil diperbarui.`, 'Berhasil');
    } else {
      const newSup: Supplier = {
        id: 'sup-' + Date.now(),
        code,
        name,
        phone,
        address,
        status,
      };
      const updated = [newSup, ...suppliers];
      storageService.saveSuppliers(updated);
      setSuppliers(updated);
      onShowToast('success', `Supplier "${name}" berhasil ditambahkan.`, 'Berhasil');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteCandidate) return;
    const updated = suppliers.filter((s) => s.id !== deleteCandidate.id);
    storageService.saveSuppliers(updated);
    setSuppliers(updated);
    onShowToast('info', `Supplier "${deleteCandidate.name}" telah dihapus.`, 'Dihapus');
    setDeleteCandidate(null);
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Daftar Rekanan Supplier & Pemasok"
          subtitle="Data vendor pemasok barang dagang ke toko"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Tambah Supplier
            </Button>
          }
        />

        {/* Search */}
        <div style={{ maxWidth: '350px', position: 'relative', marginBottom: '16px' }}>
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
            placeholder="Cari kode, nama, atau kota supplier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Supplier</th>
                <th>No. Telepon / Kontak</th>
                <th>Alamat Kantor / Gudang</th>
                <th>Status</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSuppliers.map((s) => (
                <tr key={s.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{s.code}</td>
                  <td style={{ fontWeight: 600 }}>{s.name}</td>
                  <td>{s.phone}</td>
                  <td>{s.address}</td>
                  <td>
                    <Badge variant={s.status === 'Aktif' ? 'success' : 'neutral'}>
                      {s.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<IconEdit size={14} />}
                        onClick={() => handleOpenEditModal(s)}
                      />
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<IconTrash size={14} />}
                        onClick={() => setDeleteCandidate(s)}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredSuppliers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Tidak ada supplier yang ditemukan.
          </div>
        )}
      </Card>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSupplier ? `Edit Supplier: ${editingSupplier.name}` : 'Tambah Supplier Baru'}
        size="medium"
      >
        <form onSubmit={handleSaveSupplier}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Kode Supplier *"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="Nama Supplier / Badan Usaha *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Nomor Telepon / WhatsApp"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Select
              label="Status Kemitraan"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Nonaktif', label: 'Nonaktif' },
              ]}
            />
          </div>

          <Input
            label="Alamat Lengkap"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

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
              {editingSupplier ? 'Simpan Perubahan' : 'Simpan Supplier'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Hapus Supplier"
        message={`Apakah Anda yakin ingin menghapus data supplier "${deleteCandidate?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
