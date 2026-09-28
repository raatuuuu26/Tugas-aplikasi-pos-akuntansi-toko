import React, { useState } from 'react';
import { Customer } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { IconPlus, IconSearch, IconEdit, IconTrash } from '../components/common/Icons';

interface CustomersProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
}

export const Customers: React.FC<CustomersProps> = ({ onShowToast }) => {
  const [customers, setCustomers] = useState<Customer[]>(storageService.getCustomers());
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

  // Form Fields
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  // Delete Confirm
  const [deleteCandidate, setDeleteCandidate] = useState<Customer | null>(null);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingCustomer(null);
    setCode(`CUST-${String(customers.length).padStart(3, '0')}`);
    setName('');
    setPhone('');
    setAddress('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cust: Customer) => {
    setEditingCustomer(cust);
    setCode(cust.code);
    setName(cust.name);
    setPhone(cust.phone);
    setAddress(cust.address);
    setIsModalOpen(true);
  };

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim() || !name.trim()) {
      onShowToast('danger', 'Kode dan nama pelanggan wajib diisi!', 'Validasi');
      return;
    }

    if (editingCustomer) {
      const updated = customers.map((c) =>
        c.id === editingCustomer.id ? { ...c, code, name, phone, address } : c
      );
      storageService.saveCustomers(updated);
      setCustomers(updated);
      onShowToast('success', `Data pelanggan "${name}" berhasil diperbarui.`, 'Berhasil');
    } else {
      const newCust: Customer = {
        id: 'cust-' + Date.now(),
        code,
        name,
        phone,
        address,
        totalTransactions: 0,
        totalSpent: 0,
      };
      const updated = [...customers, newCust];
      storageService.saveCustomers(updated);
      setCustomers(updated);
      onShowToast('success', `Pelanggan baru "${name}" berhasil ditambahkan.`, 'Berhasil');
    }

    setIsModalOpen(false);
  };

  const handleDelete = () => {
    if (!deleteCandidate) return;
    if (deleteCandidate.id === 'cust-0') {
      onShowToast('danger', 'Pelanggan Umum bawaan sistem tidak boleh dihapus!', 'Perhatian');
      setDeleteCandidate(null);
      return;
    }
    const updated = customers.filter((c) => c.id !== deleteCandidate.id);
    storageService.saveCustomers(updated);
    setCustomers(updated);
    onShowToast('info', `Pelanggan "${deleteCandidate.name}" telah dihapus.`, 'Dihapus');
    setDeleteCandidate(null);
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Daftar Pelanggan (Customer Relationship)"
          subtitle="Basis data pelanggan setia, toko langganan, dan riwayat belanja"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Tambah Pelanggan Baru
            </Button>
          }
        />

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
            placeholder="Cari nama, kode, atau telepon..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Pelanggan</th>
                <th>No. Telepon</th>
                <th>Alamat</th>
                <th>Total Kunjungan</th>
                <th>Total Belanja (Akumulasi)</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCustomers.map((c) => (
                <tr key={c.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{c.code}</td>
                  <td style={{ fontWeight: 600 }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>{c.address}</td>
                  <td>{c.totalTransactions} Transaksi</td>
                  <td style={{ fontWeight: 700, color: 'var(--success)' }}>
                    {formatRupiah(c.totalSpent)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                      <Button
                        variant="secondary"
                        size="sm"
                        icon={<IconEdit size={14} />}
                        onClick={() => handleOpenEditModal(c)}
                      />
                      {c.id !== 'cust-0' && (
                        <Button
                          variant="danger"
                          size="sm"
                          icon={<IconTrash size={14} />}
                          onClick={() => setDeleteCandidate(c)}
                        />
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredCustomers.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Tidak ada pelanggan yang ditemukan.
          </div>
        )}
      </Card>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCustomer ? `Edit Pelanggan: ${editingCustomer.name}` : 'Tambah Pelanggan Baru'}
        size="medium"
      >
        <form onSubmit={handleSaveCustomer}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Kode Pelanggan *"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              required
            />
            <Input
              label="Nama Lengkap Pelanggan *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Nomor Telepon / WA"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              label="Alamat Tempat Tinggal / Toko"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
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
              {editingCustomer ? 'Simpan Perubahan' : 'Simpan Pelanggan'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteCandidate}
        title="Hapus Pelanggan"
        message={`Apakah Anda yakin ingin menghapus data pelanggan "${deleteCandidate?.name}"?`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteCandidate(null)}
      />
    </div>
  );
};
