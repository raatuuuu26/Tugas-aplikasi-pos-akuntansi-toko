import React, { useState } from 'react';
import { StoreSettings } from '../types';
import { storageService, resetToDefaultData } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { IconSettings } from '../components/common/Icons';

interface SettingsProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onResetComplete: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onShowToast, onResetComplete }) => {
  const [settings, setSettings] = useState<StoreSettings>(storageService.getSettings());
  const [storeName, setStoreName] = useState(settings.storeName);
  const [address, setAddress] = useState(settings.address);
  const [phone, setPhone] = useState(settings.phone);
  const [receiptFooter, setReceiptFooter] = useState(settings.receiptFooter);

  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();

    if (!storeName.trim()) {
      onShowToast('danger', 'Nama toko tidak boleh kosong!', 'Validasi');
      return;
    }

    const updated: StoreSettings = {
      storeName,
      address,
      phone,
      receiptFooter,
    };

    storageService.saveSettings(updated);
    setSettings(updated);
    onShowToast('success', 'Pengaturan profil toko berhasil disimpan!', 'Tersimpan');
  };

  const handleDownloadBackup = () => {
    const backupData = {
      products: storageService.getProducts(),
      sales: storageService.getSales(),
      purchases: storageService.getPurchases(),
      suppliers: storageService.getSuppliers(),
      customers: storageService.getCustomers(),
      journals: storageService.getJournals(),
      accounts: storageService.getAccounts(),
      settings: storageService.getSettings(),
      dateExported: new Date().toISOString(),
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `backup_pos_toko_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    onShowToast('success', 'File backup JSON berhasil diunduh.', 'Backup Selesai');
  };

  const handleConfirmReset = () => {
    resetToDefaultData();
    setIsResetConfirmOpen(false);
    onShowToast('info', 'Semua data toko telah dikembalikan ke data default demo!', 'Reset Berhasil');
    onResetComplete();
  };

  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Profil Toko */}
      <Card style={{ marginBottom: '24px' }}>
        <CardHeader
          title="Profil & Informasi Toko"
          subtitle="Identitas toko yang dicetak pada kepala struk kasir dan dokumen laporan"
        />

        <form onSubmit={handleSaveSettings}>
          <Input
            label="Nama Toko *"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            required
          />

          <Input
            label="Alamat Toko"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <Input
            label="Nomor Telepon / WhatsApp"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="form-group">
            <label className="form-label">Catatan Kaki Struk (Receipt Footer)</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={receiptFooter}
              onChange={(e) => setReceiptFooter(e.target.value)}
            />
          </div>

          <div style={{ marginTop: '20px' }}>
            <Button type="submit" variant="primary">
              Simpan Pengaturan
            </Button>
          </div>
        </form>
      </Card>

      {/* Backup & Reset */}
      <Card>
        <CardHeader
          title="Manajemen Penyimpanan Data (LocalStorage)"
          subtitle="Unduh salinan cadangan atau reset data demo jika diperlukan"
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              backgroundColor: '#F8FAFC',
              borderRadius: '8px',
              border: '1px solid var(--border)',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>Cadangkan Data (Backup JSON)</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Ekspor semua data produk, transaksi, dan akuntansi ke file JSON di komputer Anda.
              </div>
            </div>
            <Button variant="secondary" onClick={handleDownloadBackup}>
              Unduh Backup
            </Button>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px',
              backgroundColor: '#FEF2F2',
              borderRadius: '8px',
              border: '1px solid #FECACA',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--danger)' }}>
                Reset ke Data Demo Awal
              </div>
              <div style={{ fontSize: '0.78rem', color: '#991B1B' }}>
                Kembalikan semua tabel produk, transaksi kasir, dan jurnal ke nilai awal contoh demo kuliah.
              </div>
            </div>
            <Button
              variant="danger"
              onClick={() => setIsResetConfirmOpen(true)}
            >
              Reset Data Default
            </Button>
          </div>
        </div>
      </Card>

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        title="Reset Semua Data Toko?"
        message="Tindakan ini akan menghapus data transaksi terbaru Anda dan menggantinya dengan data demo bawaan tugas kuliah. Anda yakin?"
        confirmLabel="Ya, Reset Sekarang"
        confirmVariant="danger"
        onConfirm={handleConfirmReset}
        onCancel={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
};
