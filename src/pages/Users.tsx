import React, { useState } from 'react';
import { User, Role } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { IconPlus, IconEdit } from '../components/common/Icons';

interface UsersProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
}

export const Users: React.FC<UsersProps> = ({ onShowToast }) => {
  const [users, setUsers] = useState<User[]>(storageService.getUsers());

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('123456');
  const [role, setRole] = useState<Role>('Kasir');
  const [status, setStatus] = useState<'Aktif' | 'Nonaktif'>('Aktif');

  const handleOpenAddModal = () => {
    setEditingUser(null);
    setName('');
    setUsername('');
    setPassword('123456');
    setRole('Kasir');
    setStatus('Aktif');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (u: User) => {
    setEditingUser(u);
    setName(u.name);
    setUsername(u.username);
    setPassword(u.password || '123456');
    setRole(u.role);
    setStatus(u.status);
    setIsModalOpen(true);
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !username.trim()) {
      onShowToast('danger', 'Nama dan username wajib diisi!', 'Validasi');
      return;
    }

    if (editingUser) {
      const updated = users.map((u) =>
        u.id === editingUser.id ? { ...u, name, username, password, role, status } : u
      );
      storageService.saveUsers(updated);
      setUsers(updated);
      onShowToast('success', `Pengguna "${name}" berhasil diperbarui.`, 'Berhasil');
    } else {
      const newUser: User = {
        id: 'usr-' + Date.now(),
        name,
        username,
        password,
        role,
        status,
      };
      const updated = [...users, newUser];
      storageService.saveUsers(updated);
      setUsers(updated);
      onShowToast('success', `Pengguna baru "${name}" berhasil didaftarkan.`, 'Berhasil');
    }

    setIsModalOpen(false);
  };

  const rolePermissions: { role: Role; menus: string[] }[] = [
    { role: 'Owner', menus: ['Semua Modul (Akses Penuh)', 'Dashboard', 'POS', 'Inventori', 'Keuangan', 'Akuntansi', 'Laporan', 'Administrasi'] },
    { role: 'Kepala Toko', menus: ['Dashboard', 'POS', 'Riwayat Transaksi', 'Pembelian', 'Retur', 'Produk', 'Inventori', 'Stok Opname', 'Supplier', 'Customer', 'Laporan Operasional'] },
    { role: 'Bagian Keuangan', menus: ['Dashboard', 'POS', 'Riwayat Transaksi', 'Pembelian', 'Retur', 'Supplier', 'Customer', 'Buku Akuntansi', 'Jurnal Umum', 'Laporan Keuangan'] },
    { role: 'Accounting', menus: ['Dashboard', 'Riwayat Transaksi', 'Pembelian', 'Buku Akuntansi', 'Jurnal Umum', 'Laporan (Neraca, Laba Rugi, Cashflow)'] },
    { role: 'Kepala Gudang', menus: ['Dashboard', 'Data Produk', 'Status Stok & Mutasi', 'Stok Opname Fisik', 'Pembelian Supplier', 'Retur Pembelian'] },
    { role: 'Kasir', menus: ['Kasir (POS)', 'Riwayat Penjualan Kasir', 'Data Pelanggan (Customer)'] },
    { role: 'Sales', menus: ['Kasir (POS)', 'Riwayat Penjualan', 'Data Pelanggan (Customer)', 'Katalog Data Produk'] },
  ];

  return (
    <div>
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader
          title="Daftar Pengguna Sistem (User Accounts)"
          subtitle="Kelola akun pengguna, username, password demo, dan hak akses"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={handleOpenAddModal}
            >
              Tambah Pengguna Baru
            </Button>
          }
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Nama Pegawai</th>
                <th>Username</th>
                <th>Role / Jabatan</th>
                <th>Status Akun</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{u.username}</td>
                  <td>
                    <Badge variant="primary">{u.role}</Badge>
                  </td>
                  <td>
                    <Badge variant={u.status === 'Aktif' ? 'success' : 'neutral'}>
                      {u.status}
                    </Badge>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      icon={<IconEdit size={14} />}
                      onClick={() => handleOpenEditModal(u)}
                    >
                      Ubah
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Permissions Matrix */}
      <Card>
        <CardHeader
          title="Matriks Hak Akses & Permission Role"
          subtitle="Rincian menu yang dapat dibuka oleh masing-masing jabatan di toko"
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th style={{ width: '180px' }}>Role Jabatan</th>
                <th>Hak Akses Modul & Menu</th>
              </tr>
            </thead>
            <tbody>
              {rolePermissions.map((rp, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 700, color: 'var(--dark)' }}>{rp.role}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {rp.menus.map((m, mIdx) => (
                        <span
                          key={mIdx}
                          style={{
                            fontSize: '0.75rem',
                            backgroundColor: '#F1F5F9',
                            border: '1px solid var(--border)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            color: 'var(--text-main)',
                          }}
                        >
                          {m}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Modal Add / Edit */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingUser ? `Edit Pengguna: ${editingUser.name}` : 'Tambah Pengguna Baru'}
        size="medium"
      >
        <form onSubmit={handleSaveUser}>
          <Input
            label="Nama Lengkap *"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Input
              label="Username *"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <Input
              label="Password *"
              type="text"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <Select
              label="Role Jabatan *"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
              options={[
                { value: 'Owner', label: 'Owner (Pemilik Toko)' },
                { value: 'Kepala Toko', label: 'Kepala Toko' },
                { value: 'Bagian Keuangan', label: 'Bagian Keuangan' },
                { value: 'Accounting', label: 'Accounting' },
                { value: 'Kepala Gudang', label: 'Kepala Gudang' },
                { value: 'Kasir', label: 'Kasir' },
                { value: 'Sales', label: 'Sales' },
              ]}
            />
            <Select
              label="Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'Aktif' | 'Nonaktif')}
              options={[
                { value: 'Aktif', label: 'Aktif' },
                { value: 'Nonaktif', label: 'Nonaktif' },
              ]}
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
              Simpan Pengguna
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
