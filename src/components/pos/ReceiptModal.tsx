import React from 'react';
import { Sale, StoreSettings } from '../../types';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { IconPrinter } from '../common/Icons';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: Sale | null;
  settings: StoreSettings;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  sale,
  settings,
}) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Struk Bukti Pembayaran"
      size="small"
      footer={
        <div style={{ display: 'flex', gap: '8px', width: '100%', justifyContent: 'flex-end' }}>
          <Button variant="secondary" onClick={onClose} className="btn-no-print">
            Tutup
          </Button>
          <Button
            variant="primary"
            icon={<IconPrinter size={16} />}
            onClick={handlePrint}
            className="btn-no-print"
          >
            Cetak Struk
          </Button>
        </div>
      }
    >
      <div className="receipt-paper print-area">
        <div className="receipt-header">
          <div className="receipt-title">{settings.storeName.toUpperCase()}</div>
          <div style={{ fontSize: '0.72rem', marginTop: '2px' }}>{settings.address}</div>
          <div style={{ fontSize: '0.72rem' }}>Telp: {settings.phone}</div>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-row">
          <span>No. Struk</span>
          <strong>{sale.invoiceNumber}</strong>
        </div>
        <div className="receipt-row">
          <span>Tanggal</span>
          <span>{sale.date}</span>
        </div>
        <div className="receipt-row">
          <span>Kasir</span>
          <span>{sale.cashierName}</span>
        </div>
        {sale.customerName && (
          <div className="receipt-row">
            <span>Pelanggan</span>
            <span>{sale.customerName}</span>
          </div>
        )}

        <div className="receipt-divider" />

        <div style={{ marginBottom: '8px' }}>
          {sale.items.map((item, index) => (
            <div key={index} style={{ marginBottom: '6px' }}>
              <div style={{ fontWeight: 600 }}>{item.name}</div>
              <div className="receipt-row" style={{ color: '#333' }}>
                <span>
                  {item.qty} x {formatRupiah(item.sellPrice)}
                </span>
                <span>{formatRupiah(item.subtotal)}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="receipt-double-divider" />

        <div className="receipt-row">
          <span>Subtotal</span>
          <span>{formatRupiah(sale.subtotal)}</span>
        </div>
        {sale.discount > 0 && (
          <div className="receipt-row">
            <span>Diskon</span>
            <span>-{formatRupiah(sale.discount)}</span>
          </div>
        )}
        <div className="receipt-row" style={{ fontWeight: 700, fontSize: '0.9rem' }}>
          <span>TOTAL</span>
          <span>{formatRupiah(sale.total)}</span>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-row">
          <span>Metode Bayar</span>
          <span>{sale.paymentMethod}</span>
        </div>
        <div className="receipt-row">
          <span>Bayar (Tunai)</span>
          <span>{formatRupiah(sale.amountPaid)}</span>
        </div>
        <div className="receipt-row" style={{ fontWeight: 600 }}>
          <span>Kembalian</span>
          <span>{formatRupiah(sale.change)}</span>
        </div>

        <div className="receipt-divider" />

        <div className="receipt-footer">
          <p>{settings.receiptFooter}</p>
          <p style={{ marginTop: '4px', fontSize: '0.68rem', color: '#666' }}>
            *** TERIMA KASIH ***
          </p>
        </div>
      </div>
    </Modal>
  );
};
