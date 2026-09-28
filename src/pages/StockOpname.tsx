import React, { useState } from 'react';
import { Product, StockOpname as StockOpnameType, StockOpnameItem, User } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { IconOpname, IconCheck } from '../components/common/Icons';

interface StockOpnameProps {
  currentUser: User | null;
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const StockOpname: React.FC<StockOpnameProps> = ({
  currentUser,
  onShowToast,
  onRefreshData,
}) => {
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [opnameHistory, setOpnameHistory] = useState<StockOpnameType[]>(
    storageService.getOpnames()
  );

  // Temporary state for the current opname session
  const [physicalStocks, setPhysicalStocks] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    products.forEach((p) => {
      initial[p.id] = p.stock;
    });
    return initial;
  });

  const [notes, setNotes] = useState<Record<string, string>>({});
  const [generalNote, setGeneralNote] = useState('Pengecekan fisik rutin gudang toko');

  // History detail modal
  const [selectedOpname, setSelectedOpname] = useState<StockOpnameType | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const handlePhysicalChange = (productId: string, val: number) => {
    setPhysicalStocks((prev) => ({
      ...prev,
      [productId]: Math.max(0, val),
    }));
  };

  const handleNoteChange = (productId: string, text: string) => {
    setNotes((prev) => ({
      ...prev,
      [productId]: text,
    }));
  };

  const handleSaveOpname = () => {
    const opnameNumber = storageService.getNextOpnameNumber();

    const items: StockOpnameItem[] = products.map((p) => {
      const physical = physicalStocks[p.id] !== undefined ? physicalStocks[p.id] : p.stock;
      const difference = physical - p.stock;
      return {
        productId: p.id,
        code: p.code,
        name: p.name,
        systemStock: p.stock,
        physicalStock: physical,
        difference,
        notes: notes[p.id] || '',
      };
    });

    const totalDiscrepancy = items.reduce((acc, it) => acc + Math.abs(it.difference), 0);

    const newOpname: StockOpnameType = {
      id: 'so-' + Date.now(),
      opnameNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      operatorName: currentUser?.name || 'Petugas Gudang',
      items,
      totalDiscrepancy,
      notes: generalNote,
    };

    storageService.addOpname(newOpname);

    // Refresh products & opnames list
    const updated = storageService.getProducts();
    setProducts(updated);
    setOpnameHistory(storageService.getOpnames());

    if (onRefreshData) onRefreshData();

    onShowToast(
      'success',
      `Stok Opname ${opnameNumber} berhasil disimpan. Stok sistem telah disesuaikan dengan hasil fisik!`,
      'Opname Selesai'
    );
  };

  return (
    <div>
      {/* Active Opname Form Card */}
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader
          title="Lembar Kerja Stok Opname Fisik"
          subtitle="Masukkan jumlah fisik barang yang dihitung nyata di rak / gudang. Selisih akan otomatis dihitung."
          action={
            <Button
              variant="success"
              icon={<IconCheck size={16} />}
              onClick={handleSaveOpname}
            >
              Simpan & Terapkan Hasil Opname
            </Button>
          }
        />

        <div style={{ marginBottom: '16px', maxWidth: '450px' }}>
          <label className="form-label">Keterangan / Alasan Opname</label>
          <input
            type="text"
            className="form-input"
            value={generalNote}
            onChange={(e) => setGeneralNote(e.target.value)}
          />
        </div>

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>Kode</th>
                <th>Nama Produk</th>
                <th>Stok Sistem</th>
                <th style={{ width: '150px' }}>Stok Fisik Nyata</th>
                <th>Selisih</th>
                <th>Catatan Khusus</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const physical =
                  physicalStocks[p.id] !== undefined ? physicalStocks[p.id] : p.stock;
                const difference = physical - p.stock;

                return (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{p.code}</td>
                    <td style={{ fontWeight: 600 }}>{p.name}</td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{p.stock}</span> {p.unit}
                    </td>
                    <td>
                      <input
                        type="number"
                        min="0"
                        className="form-input"
                        style={{
                          fontWeight: 700,
                          textAlign: 'center',
                          backgroundColor: difference !== 0 ? '#FEF3C7' : '#FFFFFF',
                        }}
                        value={physical}
                        onChange={(e) => handlePhysicalChange(p.id, Number(e.target.value))}
                      />
                    </td>
                    <td>
                      {difference === 0 ? (
                        <Badge variant="success">Sesuai (0)</Badge>
                      ) : difference > 0 ? (
                        <Badge variant="primary">+{difference} (Surplus)</Badge>
                      ) : (
                        <Badge variant="danger">{difference} (Defisit)</Badge>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        placeholder="Contoh: 1 hilang / rusak"
                        className="form-input"
                        style={{ padding: '6px 10px', fontSize: '0.8rem' }}
                        value={notes[p.id] || ''}
                        onChange={(e) => handleNoteChange(p.id, e.target.value)}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Opname History Table */}
      <Card>
        <CardHeader
          title="Riwayat Berita Acara Stok Opname"
          subtitle="Catatan pelaksanaan opname berkala yang pernah dilakukan"
        />

        <div className="table-container">
          <table className="app-table">
            <thead>
              <tr>
                <th>No. Opname</th>
                <th>Tanggal & Waktu</th>
                <th>Pemeriksa</th>
                <th>Total Selisih</th>
                <th>Keterangan</th>
                <th style={{ textAlign: 'center' }}>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {opnameHistory.map((op) => (
                <tr key={op.id}>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>
                    {op.opnameNumber}
                  </td>
                  <td style={{ fontSize: '0.8rem' }}>{op.date}</td>
                  <td>{op.operatorName}</td>
                  <td>
                    {op.totalDiscrepancy === 0 ? (
                      <Badge variant="success">0 Selisih</Badge>
                    ) : (
                      <Badge variant="warning">{op.totalDiscrepancy} Unit Selisih</Badge>
                    )}
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {op.notes}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSelectedOpname(op);
                        setIsDetailOpen(true);
                      }}
                    >
                      Detail
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {opnameHistory.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Belum ada riwayat stok opname yang tersimpan.
          </div>
        )}
      </Card>

      {/* Opname Detail Modal */}
      {selectedOpname && (
        <Modal
          isOpen={isDetailOpen}
          onClose={() => setIsDetailOpen(false)}
          title={`Detail Hasil Stok Opname: ${selectedOpname.opnameNumber}`}
          size="large"
          footer={
            <Button variant="secondary" onClick={() => setIsDetailOpen(false)}>
              Tutup
            </Button>
          }
        >
          <div style={{ marginBottom: '14px', fontSize: '0.85rem' }}>
            <div>Pemeriksa: <strong>{selectedOpname.operatorName}</strong></div>
            <div>Tanggal: <strong>{selectedOpname.date}</strong></div>
            <div>Keterangan: {selectedOpname.notes}</div>
          </div>

          <div className="table-container">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Produk</th>
                  <th>Stok Sistem</th>
                  <th>Stok Fisik</th>
                  <th>Selisih</th>
                  <th>Catatan</th>
                </tr>
              </thead>
              <tbody>
                {selectedOpname.items.map((it, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: 600 }}>{it.name}</td>
                    <td>{it.systemStock}</td>
                    <td style={{ fontWeight: 700 }}>{it.physicalStock}</td>
                    <td>
                      {it.difference === 0 ? (
                        <Badge variant="success">0</Badge>
                      ) : (
                        <Badge variant={it.difference > 0 ? 'primary' : 'danger'}>
                          {it.difference > 0 ? `+${it.difference}` : it.difference}
                        </Badge>
                      )}
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {it.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Modal>
      )}
    </div>
  );
};
