import React, { useState } from 'react';
import { User, Role } from '../types';
import { storageService } from '../services/storage';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [username, setUsername] = useState('owner');
  const [password, setPassword] = useState('123456');
  const [error, setError] = useState('');

  const users = storageService.getUsers();

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');

    if (!username.trim() || !password.trim()) {
      setError('Username dan password wajib diisi.');
      return;
    }

    const matchedUser = users.find(
      (u) =>
        u.username.toLowerCase() === username.trim().toLowerCase() &&
        u.password === password.trim()
    );

    if (matchedUser) {
      if (matchedUser.status === 'Nonaktif') {
        setError('Akun ini sedang dinonaktifkan. Hubungi Administrator.');
        return;
      }
      storageService.setCurrentUser(matchedUser);
      onLoginSuccess(matchedUser);
    } else {
      setError('Username atau password salah! Silakan coba lagi.');
    }
  };

  const handleQuickLogin = (roleUsername: string) => {
    setUsername(roleUsername);
    setPassword('123456');
    const matchedUser = users.find((u) => u.username === roleUsername);
    if (matchedUser) {
      storageService.setCurrentUser(matchedUser);
      onLoginSuccess(matchedUser);
    }
  };

  const demoRoles: { label: Role; username: string; desc: string }[] = [
    { label: 'Owner', username: 'owner', desc: 'Akses penuh ke semua modul sistem' },
    { label: 'Kepala Toko', username: 'kepala', desc: 'Operasional, penjualan, laporan & staf' },
    { label: 'Bagian Keuangan', username: 'keuangan', desc: 'Arus kas, piutang, hutang & transaksi' },
    { label: 'Accounting', username: 'accounting', desc: 'Buku besar, jurnal umum & laporan keuangan' },
    { label: 'Kepala Gudang', username: 'gudang', desc: 'Inventori, stok opname & pembelian barang' },
    { label: 'Kasir', username: 'kasir', desc: 'Transaksi POS, penjualan & cetak struk' },
    { label: 'Sales', username: 'sales', desc: 'Penjualan, katalog produk & relasi pelanggan' },
  ];

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#F5F8FC',
        padding: '24px',
      }}
    >
      <div style={{ maxWidth: '900px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              backgroundColor: '#0B5ED7',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              fontSize: '1.4rem',
              fontWeight: 800,
              margin: '0 auto 12px',
              boxShadow: '0 4px 10px rgba(11, 94, 215, 0.35)',
            }}
          >
            POS
          </div>
          <h1
            style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: '#123B70',
              marginBottom: '6px',
            }}
          >
            Sistem POS & Akuntansi Toko
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.92rem' }}>
            Aplikasi Point of Sale, Manajemen Inventori & Pembukuan Akuntansi Toko
          </p>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '24px',
          }}
        >
          {/* Form Login */}
          <Card style={{ padding: '28px' }}>
            <h2
              style={{
                fontSize: '1.15rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '4px',
              }}
            >
              Masuk ke Akun Anda
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '20px' }}>
              Masukkan username dan password demo untuk memulai
            </p>

            {error && (
              <div
                style={{
                  backgroundColor: 'var(--danger-light)',
                  color: 'var(--danger)',
                  padding: '10px 14px',
                  borderRadius: '6px',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  marginBottom: '16px',
                  border: '1px solid #FECACA',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleLogin}>
              <Input
                label="Username"
                placeholder="Contoh: owner / kasir"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
              />
              <Input
                label="Password"
                type="password"
                placeholder="Masukkan password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />

              <div style={{ marginTop: '20px' }}>
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  style={{ width: '100%' }}
                >
                  Masuk Sekarang
                </Button>
              </div>
            </form>
          </Card>

          {/* Quick Demo Login Selection */}
          <Card style={{ padding: '24px' }}>
            <h2
              style={{
                fontSize: '1.1rem',
                fontWeight: 700,
                color: '#1E293B',
                marginBottom: '4px',
              }}
            >
              Demo Akun Instan (1-Klik Login)
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#64748B', marginBottom: '14px' }}>
              Pilih role di bawah untuk mencoba hak akses masing-masing pengguna:
            </p>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                maxHeight: '380px',
                overflowY: 'auto',
                paddingRight: '4px',
              }}
            >
              {demoRoles.map((item) => (
                <div
                  key={item.username}
                  onClick={() => handleQuickLogin(item.username)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px',
                    borderRadius: '8px',
                    border: '1px solid #E2E8F0',
                    backgroundColor: '#F8FAFC',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#0B5ED7';
                    e.currentTarget.style.backgroundColor = '#EBF3FE';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#E2E8F0';
                    e.currentTarget.style.backgroundColor = '#F8FAFC';
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#123B70' }}>
                      {item.label}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      {item.desc}
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#FFFFFF',
                      padding: '4px 10px',
                      borderRadius: '12px',
                      border: '1px solid #CBD5E1',
                      color: '#0B5ED7',
                    }}
                  >
                    Masuk &rarr;
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
