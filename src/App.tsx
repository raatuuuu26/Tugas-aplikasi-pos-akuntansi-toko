import React, { useState, useEffect } from 'react';
import { PageId, User, ToastMessage } from './types';
import { storageService } from './services/storage';
import { Sidebar, canUserAccessPage } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { ToastContainer } from './components/common/Toast';

// Pages
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { POS } from './pages/POS';
import { SalesHistory } from './pages/SalesHistory';
import { Purchases } from './pages/Purchases';
import { ReturnSales } from './pages/ReturnSales';
import { ReturnPurchases } from './pages/ReturnPurchases';
import { Products } from './pages/Products';
import { Inventory } from './pages/Inventory';
import { StockOpname } from './pages/StockOpname';
import { Suppliers } from './pages/Suppliers';
import { Customers } from './pages/Customers';
import { Accounting } from './pages/Accounting';
import { Journals } from './pages/Journals';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';
import { Settings } from './pages/Settings';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    storageService.getCurrentUser()
  );

  const [currentPage, setCurrentPage] = useState<PageId>(() => {
    const user = storageService.getCurrentUser();
    if (user?.role === 'Kasir' || user?.role === 'Sales') return 'pos';
    return 'dashboard';
  });

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [, setRefreshTick] = useState(0);

  // Trigger re-render across views
  const triggerRefresh = () => {
    setRefreshTick((prev) => prev + 1);
  };

  const showToast = (
    type: 'success' | 'warning' | 'danger' | 'info',
    message: string,
    title?: string
  ) => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
    const newToast: ToastMessage = { id, type, message, title };
    setToasts((prev) => [...prev, newToast]);

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'Kasir' || user.role === 'Sales') {
      setCurrentPage('pos');
    } else {
      setCurrentPage('dashboard');
    }
    showToast('success', `Selamat datang, ${user.name} (${user.role})!`, 'Login Berhasil');
  };

  const handleLogout = () => {
    storageService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentPage('dashboard');
    showToast('info', 'Anda telah keluar dari aplikasi.', 'Sampai Jumpa');
  };

  // Check access permissions whenever role or page changes
  useEffect(() => {
    if (currentUser && !canUserAccessPage(currentUser.role, currentPage)) {
      if (currentUser.role === 'Kasir' || currentUser.role === 'Sales') {
        setCurrentPage('pos');
      } else {
        setCurrentPage('dashboard');
      }
    }
  }, [currentUser, currentPage]);

  if (!currentUser) {
    return (
      <>
        <Login onLoginSuccess={handleLoginSuccess} />
        <ToastContainer toasts={toasts} onDismiss={dismissToast} />
      </>
    );
  }

  // Calculate low stock alert count for Topbar notification
  const products = storageService.getProducts();
  const lowStockCount = products.filter((p) => p.stock <= p.minStock).length;

  return (
    <div className="app-container">
      {/* Left Sidebar */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        currentUser={currentUser}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="main-content">
        <Topbar
          currentPage={currentPage}
          currentUser={currentUser}
          onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          lowStockCount={lowStockCount}
        />

        <main className="page-body">
          {currentPage === 'dashboard' && (
            <Dashboard currentUser={currentUser} onNavigate={setCurrentPage} />
          )}

          {currentPage === 'pos' && (
            <POS
              currentUser={currentUser}
              onShowToast={showToast}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentPage === 'sales-history' && <SalesHistory />}

          {currentPage === 'purchases' && (
            <Purchases onShowToast={showToast} onRefreshData={triggerRefresh} />
          )}

          {currentPage === 'return-sales' && (
            <ReturnSales onShowToast={showToast} onRefreshData={triggerRefresh} />
          )}

          {currentPage === 'return-purchases' && (
            <ReturnPurchases onShowToast={showToast} onRefreshData={triggerRefresh} />
          )}

          {currentPage === 'products' && (
            <Products onShowToast={showToast} onRefreshData={triggerRefresh} />
          )}

          {currentPage === 'inventory' && (
            <Inventory onNavigate={setCurrentPage} />
          )}

          {currentPage === 'stock-opname' && (
            <StockOpname
              currentUser={currentUser}
              onShowToast={showToast}
              onRefreshData={triggerRefresh}
            />
          )}

          {currentPage === 'suppliers' && <Suppliers onShowToast={showToast} />}

          {currentPage === 'customers' && <Customers onShowToast={showToast} />}

          {currentPage === 'accounting' && (
            <Accounting onNavigate={setCurrentPage} />
          )}

          {currentPage === 'journals' && (
            <Journals onShowToast={showToast} onRefreshData={triggerRefresh} />
          )}

          {currentPage === 'reports' && <Reports />}

          {currentPage === 'users' && <Users onShowToast={showToast} />}

          {currentPage === 'settings' && (
            <Settings
              onShowToast={showToast}
              onResetComplete={triggerRefresh}
            />
          )}
        </main>
      </div>

      {/* Toast Notification Container */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: '40px 24px',
            maxWidth: '540px',
            margin: '80px auto',
            textAlign: 'center',
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            border: '1px solid #E2E8F0',
            boxShadow: '0 10px 25px rgba(0,0,0,0.06)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⚠️</div>
          <h2 style={{ color: '#123B70', fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
            Terjadi Kendala Memuat Aplikasi
          </h2>
          <p style={{ color: '#64748B', fontSize: '0.85rem', marginBottom: '20px' }}>
            {this.state.error?.message || 'Sistem mendeteksi kendala pada cache data lokal.'}
          </p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: '1px solid #CBD5E1',
                backgroundColor: '#F8FAFC',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
              onClick={() => window.location.reload()}
            >
              Muat Ulang Halaman
            </button>
            <button
              style={{
                padding: '8px 16px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: '#0B5ED7',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Reset Data Demo Toko
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function Root() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

