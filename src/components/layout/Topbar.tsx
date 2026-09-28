import React, { useState } from 'react';
import { PageId, User } from '../../types';
import { IconMenu, IconSearch, IconBell } from '../common/Icons';

interface TopbarProps {
  currentPage: PageId;
  currentUser: User | null;
  onToggleSidebar: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  lowStockCount: number;
}

const PAGE_TITLES: Record<PageId, string> = {
  dashboard: 'Dashboard Utama',
  pos: 'Kasir / Point of Sale (POS)',
  'sales-history': 'Riwayat Transaksi Penjualan',
  purchases: 'Pembelian & Pengadaan Barang',
  'return-sales': 'Retur Penjualan Customer',
  'return-purchases': 'Retur Pembelian ke Supplier',
  products: 'Manajemen Data Produk',
  inventory: 'Inventori & Mutasi Stok',
  'stock-opname': 'Stok Opname Fisik',
  suppliers: 'Daftar Supplier / Pemasok',
  customers: 'Daftar Pelanggan / Customer',
  accounting: 'Buku Besar & Akuntansi',
  journals: 'Jurnal Transaksi Umum',
  reports: 'Laporan Toko & Keuangan',
  users: 'Manajemen User & Hak Akses',
  settings: 'Pengaturan Profil Toko',
};

export const Topbar: React.FC<TopbarProps> = ({
  currentPage,
  currentUser,
  onToggleSidebar,
  searchQuery,
  onSearchChange,
  lowStockCount,
}) => {
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="menu-toggle-btn"
          onClick={onToggleSidebar}
          aria-label="Toggle menu"
        >
          <IconMenu size={22} />
        </button>
        <h2 className="topbar-title">{PAGE_TITLES[currentPage] || 'Sistem Toko'}</h2>
      </div>

      <div className="topbar-right">
        <div className="topbar-search">
          <IconSearch className="topbar-search-icon" size={16} />
          <input
            type="text"
            placeholder="Cari data di halaman..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        <div style={{ position: 'relative' }}>
          <button
            className="notification-btn"
            onClick={() => setShowNotificationMenu(!showNotificationMenu)}
            title="Pemberitahuan Sistem"
          >
            <IconBell size={20} />
            {lowStockCount > 0 && (
              <span className="notification-badge">{lowStockCount}</span>
            )}
          </button>

          {showNotificationMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: '40px',
                width: '280px',
                backgroundColor: '#fff',
                borderRadius: '8px',
                boxShadow: 'var(--shadow-lg)',
                border: '1px solid var(--border)',
                padding: '12px',
                zIndex: 100,
              }}
            >
              <div
                style={{
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  borderBottom: '1px solid var(--border)',
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                Notifikasi Sistem
              </div>
              {lowStockCount > 0 ? (
                <div style={{ fontSize: '0.8rem', color: 'var(--danger)' }}>
                  ⚠️ Terdapat <strong>{lowStockCount} produk</strong> dengan stok
                  menipis atau habis. Segera lakukan pengadaan!
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  ✅ Semua stok barang saat ini dalam status aman.
                </div>
              )}
            </div>
          )}
        </div>

        {currentUser && (
          <div className="topbar-user">
            <div className="user-avatar-initial">
              {currentUser.name.charAt(0).toUpperCase()}
            </div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{currentUser.name}</span>
              <span className="topbar-user-role">{currentUser.role}</span>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
