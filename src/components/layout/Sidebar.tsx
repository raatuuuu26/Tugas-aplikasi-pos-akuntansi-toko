import React from 'react';
import { PageId, User } from '../../types';
import {
  IconDashboard,
  IconPOS,
  IconHistory,
  IconPurchase,
  IconReturnSale,
  IconReturnPurchase,
  IconProduct,
  IconInventory,
  IconOpname,
  IconSupplier,
  IconCustomer,
  IconAccounting,
  IconJournal,
  IconReport,
  IconUsers,
  IconSettings,
  IconLogout,
} from '../common/Icons';

interface NavItem {
  id: PageId;
  label: string;
  icon: React.ReactNode;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  currentPage: PageId;
  onNavigate: (page: PageId) => void;
  currentUser: User | null;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const canUserAccessPage = (role: string | undefined, pageId: PageId): boolean => {
  if (!role || role === 'Owner') return true;

  switch (role) {
    case 'Kepala Toko':
      return [
        'dashboard',
        'pos',
        'sales-history',
        'purchases',
        'return-sales',
        'return-purchases',
        'products',
        'inventory',
        'stock-opname',
        'suppliers',
        'customers',
        'akuntansi',
        'reports',
        'users',
        'settings',
      ].includes(pageId);

    case 'Bagian Keuangan':
      return [
        'dashboard',
        'pos',
        'sales-history',
        'purchases',
        'return-sales',
        'return-purchases',
        'suppliers',
        'customers',
        'accounting',
        'journals',
        'reports',
      ].includes(pageId);

    case 'Accounting':
      return [
        'dashboard',
        'sales-history',
        'purchases',
        'accounting',
        'journals',
        'reports',
      ].includes(pageId);

    case 'Kepala Gudang':
      return [
        'dashboard',
        'products',
        'inventory',
        'stock-opname',
        'purchases',
        'return-purchases',
        'suppliers',
        'reports',
      ].includes(pageId);

    case 'Kasir':
      return ['pos', 'sales-history', 'customers'].includes(pageId);

    case 'Sales':
      return ['pos', 'sales-history', 'customers', 'products'].includes(pageId);

    default:
      return true;
  }
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isOpen,
  onClose,
}) => {
  const userRole = currentUser?.role;

  const sections: NavSection[] = [
    {
      title: 'Utama',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: <IconDashboard size={18} /> },
      ],
    },
    {
      title: 'Transaksi',
      items: [
        { id: 'pos', label: 'POS / Penjualan', icon: <IconPOS size={18} /> },
        { id: 'sales-history', label: 'Riwayat Penjualan', icon: <IconHistory size={18} /> },
        { id: 'purchases', label: 'Pembelian', icon: <IconPurchase size={18} /> },
        { id: 'return-sales', label: 'Retur Penjualan', icon: <IconReturnSale size={18} /> },
        { id: 'return-purchases', label: 'Retur Pembelian', icon: <IconReturnPurchase size={18} /> },
      ],
    },
    {
      title: 'Inventori',
      items: [
        { id: 'products', label: 'Data Produk', icon: <IconProduct size={18} /> },
        { id: 'inventory', label: 'Status Stok & Mutasi', icon: <IconInventory size={18} /> },
        { id: 'stock-opname', label: 'Stok Opname', icon: <IconOpname size={18} /> },
      ],
    },
    {
      title: 'Kontak & Rekanan',
      items: [
        { id: 'suppliers', label: 'Supplier', icon: <IconSupplier size={18} /> },
        { id: 'customers', label: 'Customer', icon: <IconCustomer size={18} /> },
      ],
    },
    {
      title: 'Keuangan & Akuntansi',
      items: [
        { id: 'accounting', label: 'Buku Akuntansi', icon: <IconAccounting size={18} /> },
        { id: 'journals', label: 'Jurnal Umum', icon: <IconJournal size={18} /> },
      ],
    },
    {
      title: 'Laporan',
      items: [
        { id: 'reports', label: 'Laporan Toko', icon: <IconReport size={18} /> },
      ],
    },
    {
      title: 'Administrasi',
      items: [
        { id: 'users', label: 'User & Role', icon: <IconUsers size={18} /> },
        { id: 'settings', label: 'Pengaturan Toko', icon: <IconSettings size={18} /> },
      ],
    },
  ];

  return (
    <>
      {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo-icon">POS</div>
          <div className="sidebar-brand">
            <h1>POS & Akuntansi</h1>
            <p>Sistem Toko Modern</p>
          </div>
        </div>

        <nav className="sidebar-nav">
          {sections.map((section, idx) => {
            const filteredItems = section.items.filter((item) =>
              canUserAccessPage(userRole, item.id)
            );
            if (filteredItems.length === 0) return null;

            return (
              <div key={idx} style={{ marginBottom: '8px' }}>
                <div className="nav-section-title">{section.title}</div>
                {filteredItems.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
                    onClick={() => {
                      onNavigate(item.id);
                      onClose();
                    }}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          {currentUser && (
            <div className="user-mini-card">
              <div className="user-avatar-initial">
                {currentUser.name.charAt(0).toUpperCase()}
              </div>
              <div className="user-mini-info">
                <div className="user-mini-name">{currentUser.name}</div>
                <div className="user-mini-role">{currentUser.role}</div>
              </div>
            </div>
          )}
          <button className="btn-logout" onClick={onLogout}>
            <IconLogout size={16} />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>
    </>
  );
};
