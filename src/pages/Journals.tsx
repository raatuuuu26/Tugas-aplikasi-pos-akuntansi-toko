import React, { useState } from 'react';
import { JournalEntry, Account } from '../types';
import { storageService } from '../services/storage';
import { Card, CardHeader } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Modal } from '../components/common/Modal';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { IconPlus, IconSearch } from '../components/common/Icons';

interface JournalsProps {
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const Journals: React.FC<JournalsProps> = ({ onShowToast, onRefreshData }) => {
  const [journals, setJournals] = useState<JournalEntry[]>(storageService.getJournals());
  const [accounts] = useState<Account[]>(storageService.getAccounts());
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  // Modal input jurnal manual
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [journalDate, setJournalDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState('');
  const [debitAccountCode, setDebitAccountCode] = useState(accounts[0]?.code || '1-1000');
  const [creditAccountCode, setCreditAccountCode] = useState(accounts[6]?.code || '4-1000');
  const [amount, setAmount] = useState(0);

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const filteredJournals = journals.filter((j) => {
    const matchSearch =
      j.journalNumber.toLowerCase().includes(search.toLowerCase()) ||
      j.description.toLowerCase().includes(search.toLowerCase()) ||
      j.reference.toLowerCase().includes(search.toLowerCase());
    const matchDate = !dateFilter || j.date === dateFilter;
    return matchSearch && matchDate;
  });

  const handleSaveManualJournal = (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      onShowToast('danger', 'Keterangan jurnal wajib diisi!', 'Validasi');
      return;
    }

    if (amount <= 0) {
      onShowToast('danger', 'Nominal harus lebih dari Rp 0!', 'Validasi');
      return;
    }

    if (debitAccountCode === creditAccountCode) {
      onShowToast('danger', 'Akun Debit dan Kredit tidak boleh sama!', 'Validasi');
      return;
    }

    const debitAcc = accounts.find((a) => a.code === debitAccountCode);
    const creditAcc = accounts.find((a) => a.code === creditAccountCode);

    const journalNumber = `JRN-${String(journals.length + 1).padStart(3, '0')}`;

    const newJournal: JournalEntry = {
      id: 'jrn-' + Date.now(),
      journalNumber,
      date: journalDate,
      reference: 'MANUAL',
      description,
      lines: [
        {
          accountCode: debitAccountCode,
          accountName: debitAcc ? debitAcc.name : 'Akun Debit',
          debit: amount,
          credit: 0,
        },
        {
          accountCode: creditAccountCode,
          accountName: creditAcc ? creditAcc.name : 'Akun Kredit',
          debit: 0,
          credit: amount,
        },
      ],
    };

    storageService.addJournal(newJournal);
    setJournals(storageService.getJournals());

    if (onRefreshData) onRefreshData();

    onShowToast('success', `Jurnal ${journalNumber} berhasil disimpan secara seimbang!`, 'Berhasil');
    setIsModalOpen(false);

    // Reset
    setDescription('');
    setAmount(0);
  };

  return (
    <div>
      <Card>
        <CardHeader
          title="Buku Jurnal Umum (General Journal)"
          subtitle="Catatan kronologis debit dan kredit dari seluruh aktivitas toko secara berpasangan"
          action={
            <Button
              variant="primary"
              icon={<IconPlus size={16} />}
              onClick={() => setIsModalOpen(true)}
            >
              Tambah Jurnal Manual
            </Button>
          }
        />

        {/* Filters */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
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
              placeholder="Cari No. Jurnal / Ref / Keterangan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ width: '160px' }}>
            <input
              type="date"
              className="form-input"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>

          {(search || dateFilter) && (
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                setSearch('');
                setDateFilter('');
              }}
            >
              Reset
            </button>
          )}
        </div>

        {/* Journal Entries List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredJournals.map((j) => (
            <div
              key={j.id}
              style={{
                borderRadius: '8px',
                border: '1px solid var(--border)',
                backgroundColor: '#FFFFFF',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  backgroundColor: '#F8FAFC',
                  padding: '10px 16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.9rem' }}>
                    {j.journalNumber}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Tanggal: {j.date}
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      backgroundColor: '#E2E8F0',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontWeight: 600,
                    }}
                  >
                    Ref: {j.reference}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                  {j.description}
                </div>
              </div>

              <div className="table-container" style={{ border: 'none', borderRadius: 0 }}>
                <table className="app-table">
                  <thead>
                    <tr>
                      <th style={{ width: '140px' }}>Kode Akun</th>
                      <th>Keterangan Akun</th>
                      <th style={{ textAlign: 'right', width: '180px' }}>Debit</th>
                      <th style={{ textAlign: 'right', width: '180px' }}>Kredit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {j.lines.map((line, idx) => (
                      <tr key={idx}>
                        <td style={{ fontWeight: 600, color: 'var(--text-muted)' }}>
                          {line.accountCode}
                        </td>
                        <td style={{ paddingLeft: line.credit > 0 ? '36px' : '16px' }}>
                          <span style={{ fontWeight: line.debit > 0 ? 600 : 500 }}>
                            {line.accountName}
                          </span>
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: line.debit > 0 ? 700 : 400 }}>
                          {line.debit > 0 ? formatRupiah(line.debit) : '-'}
                        </td>
                        <td style={{ textAlign: 'right', fontWeight: line.credit > 0 ? 700 : 400 }}>
                          {line.credit > 0 ? formatRupiah(line.credit) : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>

        {filteredJournals.length === 0 && (
          <div style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
            Tidak ada entri jurnal yang ditemukan.
          </div>
        )}
      </Card>

      {/* Modal Input Jurnal Manual */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Input Entri Jurnal Umum Manual"
        size="medium"
      >
        <form onSubmit={handleSaveManualJournal}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
            <Input
              label="Tanggal Jurnal *"
              type="date"
              value={journalDate}
              onChange={(e) => setJournalDate(e.target.value)}
              required
            />
            <Input
              label="Keterangan Transaksi *"
              placeholder="Contoh: Pembayaran Rekening Listrik & Air Toko"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <Select
              label="Akun Debit (Bertambah/Masuk) *"
              value={debitAccountCode}
              onChange={(e) => setDebitAccountCode(e.target.value)}
              options={accounts.map((a) => ({
                value: a.code,
                label: `${a.code} - ${a.name}`,
              }))}
            />

            <Select
              label="Akun Kredit (Berkurang/Keluar) *"
              value={creditAccountCode}
              onChange={(e) => setCreditAccountCode(e.target.value)}
              options={accounts.map((a) => ({
                value: a.code,
                label: `${a.code} - ${a.name}`,
              }))}
            />
          </div>

          <Input
            label="Nominal Transaksi (Rp) *"
            type="number"
            min="1000"
            prefix="Rp"
            value={amount || ''}
            onChange={(e) => setAmount(Number(e.target.value))}
            required
          />

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
              Posting Jurnal Seimbang
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
