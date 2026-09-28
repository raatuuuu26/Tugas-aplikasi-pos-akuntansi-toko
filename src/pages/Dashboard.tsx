import React from 'react';
import { PageId, User } from '../types';
import { storageService } from '../services/storage';
import { StatCard } from '../components/common/StatCard';
import { Card, CardHeader } from '../components/common/Card';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import {
  IconDollar,
  IconTrendingUp,
  IconPOS,
  IconInventory,
  IconProduct,
  IconAlert,
} from '../components/common/Icons';

interface DashboardProps {
  currentUser: User | null;
  onNavigate: (page: PageId) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ currentUser, onNavigate }) => {
  const products = storageService.getProducts();
  const sales = storageService.getSales();
  const accounts = storageService.getAccounts();

  // Metrics calculation
  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.stock * p.buyPrice,
    0
  );

  const piutangAccount = accounts.find((a) => a.code === '1-1200');
  const hutangAccount = accounts.find((a) => a.code === '2-1000');
  const piutangValue = piutangAccount?.balance || 8200000;
  const hutangValue = hutangAccount?.balance || 5400000;

  // Calculate today's sales from local sales or fallback
  const todayStr = new Date().toISOString().split('T')[0];
  const todaySalesTotal = sales
    .filter((s) => s.date.startsWith(todayStr))
    .reduce((sum, s) => sum + s.total, 0);

  // If newly created and total is 0, show the demo requested standard Rp 4.250.000
  const displayTodaySales = todaySalesTotal > 0 ? todaySalesTotal : 4250000;
  const displayMonthSales = 48750000;
  const displayTotalTransactions = 125 + sales.length;

  const lowStockProducts = products.filter(
    (p) => p.stock <= p.minStock
  );

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Top products calculation
  const productSalesCount: Record<string, { name: string; qty: number; total: number }> = {};
  sales.forEach((s) => {
    s.items.forEach((item) => {
      if (!productSalesCount[item.name]) {
        productSalesCount[item.name] = { name: item.name, qty: 0, total: 0 };
      }
      productSalesCount[item.name].qty += item.qty;
      productSalesCount[item.name].total += item.subtotal;
    });
  });

  const topProducts = Object.values(productSalesCount)
    .sort((a, b) => b.qty - a.qty)
    .slice(0, 5);

  // 7-day sales chart data
  const chartDays = [
    { day: 'Sen', amount: 3800000 },
    { day: 'Sel', amount: 4100000 },
    { day: 'Rab', amount: 4950000 },
    { day: 'Kam', amount: 5200000 },
    { day: 'Jum', amount: 6400000 },
    { day: 'Sab', amount: 7850000 },
    { day: 'Min (Hari ini)', amount: displayTodaySales },
  ];

  const maxAmount = Math.max(...chartDays.map((d) => d.amount));

  return (
    <div>
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--dark)' }}>
            Selamat Datang, {currentUser?.name}!
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Berikut adalah ringkasan kinerja toko dan keuangan terkini hari ini.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Button
            variant="primary"
            icon={<IconPOS size={16} />}
            onClick={() => onNavigate('pos')}
          >
            Buka Kasir (POS)
          </Button>
          <Button
            variant="outline"
            icon={<IconProduct size={16} />}
            onClick={() => onNavigate('products')}
          >
            Data Produk
          </Button>
        </div>
      </div>

      {/* 6 Key Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          label="Penjualan Hari Ini"
          value={formatRupiah(displayTodaySales)}
          subtitle="Target harian tercapai 85%"
          color="blue"
          icon={<IconDollar size={24} />}
        />
        <StatCard
          label="Penjualan Bulan Ini"
          value={formatRupiah(displayMonthSales)}
          subtitle="+14.2% dibanding bulan lalu"
          color="green"
          icon={<IconTrendingUp size={24} />}
        />
        <StatCard
          label="Jumlah Transaksi"
          value={`${displayTotalTransactions} Trx`}
          subtitle="Rata-rata Rp 380.000 / struk"
          color="dark"
          icon={<IconPOS size={24} />}
        />
        <StatCard
          label="Nilai Persediaan"
          value={formatRupiah(totalInventoryValue > 0 ? totalInventoryValue : 32500000)}
          subtitle={`${products.length} SKU terdaftar di sistem`}
          color="blue"
          icon={<IconInventory size={24} />}
        />
        <StatCard
          label="Piutang Pelanggan"
          value={formatRupiah(piutangValue)}
          subtitle="Jatuh tempo minggu ini"
          color="orange"
          icon={<IconDollar size={24} />}
        />
        <StatCard
          label="Hutang Supplier"
          value={formatRupiah(hutangValue)}
          subtitle="4 faktur tempo aktif"
          color="red"
          icon={<IconAlert size={24} />}
        />
      </div>

      {/* Charts & Top Products Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
          marginBottom: '24px',
        }}
      >
        {/* 7-Day Sales SVG/CSS Chart */}
        <Card>
          <CardHeader
            title="Tren Penjualan 7 Hari Terakhir"
            subtitle="Grafik omset harian kasir & transaksi toko"
          />
          <div style={{ height: '240px', display: 'flex', alignItems: 'flex-end', gap: '14px', paddingTop: '20px' }}>
            {chartDays.map((item, idx) => {
              const heightPercent = Math.round((item.amount / maxAmount) * 100);
              const isToday = idx === chartDays.length - 1;
              return (
                <div
                  key={idx}
                  style={{
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <div
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 600,
                      color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                      marginBottom: '6px',
                      textAlign: 'center',
                    }}
                  >
                    {(item.amount / 1000000).toFixed(1)}Jt
                  </div>
                  <div
                    style={{
                      width: '100%',
                      maxWidth: '42px',
                      height: `${heightPercent}%`,
                      backgroundColor: isToday ? 'var(--primary)' : '#93C5FD',
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.4s ease',
                      boxShadow: isToday ? '0 4px 10px rgba(11, 94, 215, 0.3)' : 'none',
                    }}
                    title={`${item.day}: ${formatRupiah(item.amount)}`}
                  />
                  <div
                    style={{
                      marginTop: '8px',
                      fontSize: '0.72rem',
                      fontWeight: isToday ? 700 : 500,
                      color: isToday ? 'var(--primary)' : 'var(--text-muted)',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {item.day}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top Selling Products */}
        <Card>
          <CardHeader
            title="Produk Terlaris"
            subtitle="Barang dengan kuantitas penjualan tertinggi"
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {topProducts.length > 0 ? (
              topProducts.map((p, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    backgroundColor: '#F8FAFC',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        backgroundColor: idx === 0 ? 'var(--primary)' : '#E2E8F0',
                        color: idx === 0 ? '#fff' : 'var(--text-main)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                      }}
                    >
                      {idx + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{p.name}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                        Terjual {p.qty} unit
                      </div>
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--success)' }}>
                    {formatRupiah(p.total)}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Belum ada transaksi penjualan yang dicatat.
              </p>
            )}
          </div>
        </Card>
      </div>

      {/* Low Stock & Recent Transactions */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Stok Menipis */}
        <Card>
          <CardHeader
            title="Peringatan Stok Menipis & Habis"
            subtitle="Produk yang berada di bawah batas minimum stok"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('inventory')}
              >
                Lihat Semua
              </Button>
            }
          />
          {lowStockProducts.length > 0 ? (
            <div className="table-container">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>Produk</th>
                    <th>Kategori</th>
                    <th>Sisa Stok</th>
                    <th>Batas Min.</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {lowStockProducts.map((p) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.name}</td>
                      <td>{p.category}</td>
                      <td style={{ fontWeight: 700, color: p.stock === 0 ? 'var(--danger)' : 'var(--warning)' }}>
                        {p.stock} {p.unit}
                      </td>
                      <td>{p.minStock} {p.unit}</td>
                      <td>
                        <Badge variant={p.status === 'Habis' ? 'danger' : 'warning'}>
                          {p.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              🎉 Semua stok produk dalam batas aman!
            </div>
          )}
        </Card>

        {/* Transaksi Terbaru */}
        <Card>
          <CardHeader
            title="Transaksi Penjualan Terbaru"
            subtitle="Aktivitas struk penjualan terakhir kasir"
            action={
              <Button
                variant="outline"
                size="sm"
                onClick={() => onNavigate('sales-history')}
              >
                Lihat Riwayat
              </Button>
            }
          />
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>No. Faktur</th>
                  <th>Waktu</th>
                  <th>Metode</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {sales.slice(0, 5).map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                      {s.invoiceNumber}
                    </td>
                    <td style={{ fontSize: '0.78rem' }}>{s.date}</td>
                    <td>
                      <Badge
                        variant={
                          s.paymentMethod === 'Tunai'
                            ? 'success'
                            : s.paymentMethod === 'QRIS'
                            ? 'warning'
                            : 'primary'
                        }
                      >
                        {s.paymentMethod}
                      </Badge>
                    </td>
                    <td style={{ fontWeight: 700 }}>{formatRupiah(s.total)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};
