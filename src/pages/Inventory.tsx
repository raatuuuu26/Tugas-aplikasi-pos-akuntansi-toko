import React, { useState } from 'react';
import { PageId } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { StatCard } from '../components/common/StatCard';
import { Badge } from '../components/common/Badge';
import { Button } from '../components/common/Button';
import { Select } from '../components/common/Select';
import {
  IconInventory,
  IconAlert,
  IconProduct,
  IconOpname,
} from '../components/common/Icons';

interface InventoryProps {
  onNavigate: (page: PageId) => void;
}

export const Inventory: React.FC<InventoryProps> = ({ onNavigate }) => {
  const products = storageService.getProducts();
  const mutations = storageService.getMutations();

  const [activeTab, setActiveTab] = useState<'ringkasan' | 'mutasi' | 'kartu-stok'>('ringkasan');
  const [selectedProductId, setSelectedProductId] = useState<string>(products[0]?.id || '');

  // Stats
  const totalProducts = products.length;
  const safeStock = products.filter((p) => p.status === 'Aman').length;
  const lowStock = products.filter((p) => p.status === 'Menipis').length;
  const outOfStock = products.filter((p) => p.status === 'Habis').length;

  const productMutations = mutations.filter((m) => m.productId === selectedProductId);

  return (
    <div>
      {/* 4 Stat Cards */}
      <div className="stat-card-grid">
        <StatCard
          label="Total Produk Terdaftar"
          value={`${totalProducts} SKU`}
          color="blue"
          icon={<IconProduct size={22} />}
        />
        <StatCard
          label="Stok Aman"
          value={`${safeStock} SKU`}
          color="green"
          icon={<IconInventory size={22} />}
        />
        <StatCard
          label="Stok Menipis"
          value={`${lowStock} SKU`}
          color="orange"
          icon={<IconAlert size={22} />}
        />
        <StatCard
          label="Stok Habis"
          value={`${outOfStock} SKU`}
          color="red"
          icon={<IconAlert size={22} />}
        />
      </div>

      {/* Tabs Bar */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button
          className={`btn ${activeTab === 'ringkasan' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('ringkasan')}
        >
          Status & Monitoring Stok
        </button>
        <button
          className={`btn ${activeTab === 'mutasi' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('mutasi')}
        >
          Log Seluruh Mutasi Stok
        </button>
        <button
          className={`btn ${activeTab === 'kartu-stok' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('kartu-stok')}
        >
          Kartu Stok Per Produk
        </button>

        <div style={{ marginLeft: 'auto' }}>
          <Button
            variant="outline"
            icon={<IconOpname size={16} />}
            onClick={() => onNavigate('stock-opname')}
          >
            Buka Stok Opname Fisik &rarr;
          </Button>
        </div>
      </div>

      {/* TAB 1: Ringkasan Stok */}
      {activeTab === 'ringkasan' && (
        <Card>
          <CardHeader
            title="Daftar Kondisi Stok Produk"
            subtitle="Pantau jumlah persediaan dan ketersediaan di rak toko"
          />
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Kode</th>
                  <th>Nama Produk</th>
                  <th>Kategori</th>
                  <th>Stok Sekarang</th>
                  <th>Batas Minimum</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.code}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>{p.category}</td>
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 2: Mutasi Stok Log */}
      {activeTab === 'mutasi' && (
        <Card>
          <CardHeader
            title="Riwayat Mutasi Pergerakan Stok Toko"
            subtitle="Catatan otomatis aliran barang keluar, masuk, retur, dan penyesuaian opname"
          />
          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tanggal & Waktu</th>
                  <th>Produk</th>
                  <th>Jenis Mutasi</th>
                  <th>Jumlah (Qty)</th>
                  <th>Stok Awal &rarr; Akhir</th>
                  <th>No. Referensi</th>
                  <th>Keterangan</th>
                </tr>
              </thead>
              <tbody>
                {mutations.map((m) => (
                  <tr key={m.id}>
                    <td style={{ fontSize: '0.8rem' }}>{m.date}</td>
                    <td style={{ fontWeight: 600 }}>{m.productName}</td>
                    <td>
                      <Badge
                        variant={
                          m.type === 'IN' || m.type === 'RETURN_IN'
                            ? 'success'
                            : m.type === 'OUT' || m.type === 'RETURN_OUT'
                            ? 'danger'
                            : 'warning'
                        }
                      >
                        {m.type === 'IN'
                          ? 'Masuk (Beli)'
                          : m.type === 'OUT'
                          ? 'Keluar (Jual)'
                          : m.type === 'RETURN_IN'
                          ? 'Retur Jual (+)'
                          : m.type === 'RETURN_OUT'
                          ? 'Retur Beli (-)'
                          : 'Opname / Sesuaikan'}
                      </Badge>
                    </td>
                    <td
                      style={{
                        fontWeight: 700,
                        color:
                          m.type === 'IN' || m.type === 'RETURN_IN'
                            ? 'var(--success)'
                            : 'var(--danger)',
                      }}
                    >
                      {m.type === 'IN' || m.type === 'RETURN_IN' ? '+' : '-'}
                      {m.qty}
                    </td>
                    <td>
                      {m.initialStock} &rarr; <strong>{m.finalStock}</strong>
                    </td>
                    <td style={{ fontWeight: 600, color: 'var(--primary)' }}>
                      {m.reference}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {m.notes}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {mutations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Belum ada mutasi stok yang tercatat.
            </div>
          )}
        </Card>
      )}

      {/* TAB 3: Kartu Stok Per Produk */}
      {activeTab === 'kartu-stok' && (
        <Card>
          <CardHeader
            title="Buku Kartu Stok Individu"
            subtitle="Lihat riwayat pergerakan khusus untuk satu produk terpilih"
          />

          <div style={{ maxWidth: '380px', marginBottom: '16px' }}>
            <Select
              label="Pilih Produk"
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              options={products.map((p) => ({
                value: p.id,
                label: `${p.code} - ${p.name} (Sisa: ${p.stock})`,
              }))}
            />
          </div>

          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Keterangan / Ref</th>
                  <th>Masuk</th>
                  <th>Keluar</th>
                  <th>Sisa Saldo</th>
                </tr>
              </thead>
              <tbody>
                {productMutations.map((m) => {
                  const isPositive = m.type === 'IN' || m.type === 'RETURN_IN';
                  return (
                    <tr key={m.id}>
                      <td style={{ fontSize: '0.8rem' }}>{m.date}</td>
                      <td>
                        <strong>{m.reference}</strong> - {m.notes}
                      </td>
                      <td style={{ color: 'var(--success)', fontWeight: 600 }}>
                        {isPositive ? `+${m.qty}` : '-'}
                      </td>
                      <td style={{ color: 'var(--danger)', fontWeight: 600 }}>
                        {!isPositive ? `-${m.qty}` : '-'}
                      </td>
                      <td style={{ fontWeight: 800 }}>{m.finalStock}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {productMutations.length === 0 && (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
              Belum ada mutasi untuk produk yang dipilih.
            </div>
          )}
        </Card>
      )}
    </div>
  );
};
