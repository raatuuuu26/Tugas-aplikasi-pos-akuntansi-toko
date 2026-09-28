import React, { useState } from 'react';
import { Product, CartItem, PaymentMethod, Sale, Customer, User } from '../types';
import { storageService } from '../services/storage';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Select } from '../components/common/Select';
import { Badge } from '../components/common/Badge';
import { ReceiptModal } from '../components/pos/ReceiptModal';
import {
  IconSearch,
  IconTrash,
  IconPlus,
  IconDollar,
} from '../components/common/Icons';

interface POSProps {
  currentUser: User | null;
  onShowToast: (type: 'success' | 'warning' | 'danger' | 'info', message: string, title?: string) => void;
  onRefreshData?: () => void;
}

export const POS: React.FC<POSProps> = ({ currentUser, onShowToast, onRefreshData }) => {
  const [products, setProducts] = useState<Product[]>(storageService.getProducts());
  const [customers] = useState<Customer[]>(storageService.getCustomers());
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('cust-0');

  // Search & Category Filter
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Semua');

  // Cart State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [amountPaid, setAmountPaid] = useState<number>(0);

  // Receipt Modal State
  const [completedSale, setCompletedSale] = useState<Sale | null>(null);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  const categories = ['Semua', ...Array.from(new Set(products.map((p) => p.category)))];

  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchCategory = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.code.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      onShowToast('danger', `Stok barang "${product.name}" sudah habis!`, 'Stok Habis');
      return;
    }

    const existingIndex = cart.findIndex((item) => item.product.id === product.id);

    if (existingIndex > -1) {
      const existing = cart[existingIndex];
      if (existing.qty >= product.stock) {
        onShowToast('warning', `Jumlah melebihi stok yang tersedia (${product.stock})!`, 'Batas Stok');
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex] = {
        ...existing,
        qty: existing.qty + 1,
        subtotal: (existing.qty + 1) * product.sellPrice,
      };
      setCart(newCart);
    } else {
      setCart([
        ...cart,
        {
          product,
          qty: 1,
          subtotal: product.sellPrice,
        },
      ]);
    }
  };

  const updateQuantity = (productId: string, newQty: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }

    if (newQty > product.stock) {
      onShowToast('warning', `Stok maksimal produk ini adalah ${product.stock}`, 'Batas Stok');
      return;
    }

    setCart(
      cart.map((item) =>
        item.product.id === productId
          ? { ...item, qty: newQty, subtotal: newQty * item.product.sellPrice }
          : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAmountPaid(0);
  };

  // Computations
  const subtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const total = Math.max(0, subtotal - discount);
  const change = Math.max(0, amountPaid - total);

  // Quick cash buttons
  const setQuickPaid = (amount: number) => {
    setAmountPaid(amount);
  };

  // Handle Checkout / Payment
  const handleCheckout = () => {
    if (cart.length === 0) {
      onShowToast('warning', 'Keranjang belanja masih kosong!', 'Perhatian');
      return;
    }

    if (amountPaid < total) {
      onShowToast(
        'danger',
        `Uang pembayaran kurang ${formatRupiah(total - amountPaid)}!`,
        'Pembayaran Kurang'
      );
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const invoiceNumber = storageService.getNextInvoiceNumber();

    const saleItems = cart.map((item) => ({
      productId: item.product.id,
      code: item.product.code,
      name: item.product.name,
      buyPrice: item.product.buyPrice,
      sellPrice: item.product.sellPrice,
      qty: item.qty,
      subtotal: item.subtotal,
    }));

    const newSale: Sale = {
      id: 'sale-' + Date.now(),
      invoiceNumber,
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cashierName: currentUser?.name || 'Kasir Toko',
      cashierRole: currentUser?.role || 'Kasir',
      customerId: selectedCustomerId,
      customerName: selectedCustomer ? selectedCustomer.name : 'Pelanggan Umum',
      items: saleItems,
      subtotal,
      discount,
      total,
      paymentMethod,
      amountPaid,
      change,
    };

    // Save sale & update stock & auto journal in storageService
    storageService.addSale(newSale);

    // Refresh local products state
    const updatedProducts = storageService.getProducts();
    setProducts(updatedProducts);

    // Trigger parent refresh if provided
    if (onRefreshData) onRefreshData();

    // Show success toast & receipt modal
    onShowToast('success', `Transaksi ${invoiceNumber} berhasil disimpan!`, 'Pembayaran Berhasil');
    setCompletedSale(newSale);
    setIsReceiptOpen(true);

    // Reset cart
    clearCart();
  };

  return (
    <div className="pos-layout">
      {/* LEFT: Product Catalog */}
      <div>
        {/* Search & Categories Bar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div style={{ flex: '1 1 260px', position: 'relative' }}>
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
              style={{ paddingLeft: '38px', borderRadius: '8px' }}
              placeholder="Cari nama barang atau kode barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`btn btn-sm ${
                  selectedCategory === cat ? 'btn-primary' : 'btn-secondary'
                }`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="pos-products-grid">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.stock <= 0;
            return (
              <div
                key={p.id}
                className={`pos-product-card ${isOutOfStock ? 'out-of-stock' : ''}`}
                onClick={() => !isOutOfStock && addToCart(p)}
              >
                <div>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {p.code}
                    </span>
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
                  </div>
                  <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '4px' }}>
                    {p.name}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {p.category} &bull; Sisa: <strong>{p.stock} {p.unit}</strong>
                  </p>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginTop: '8px',
                    paddingTop: '8px',
                    borderTop: '1px dashed var(--border)',
                  }}
                >
                  <div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.95rem' }}>
                    {formatRupiah(p.sellPrice)}
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    style={{ padding: '4px 8px' }}
                    disabled={isOutOfStock}
                    title="Tambah ke keranjang"
                  >
                    <IconPlus size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div
            style={{
              padding: '40px',
              textAlign: 'center',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid var(--border)',
              marginTop: '16px',
              color: 'var(--text-muted)',
            }}
          >
            Tidak ada produk yang cocok dengan pencarian "{search}".
          </div>
        )}
      </div>

      {/* RIGHT: Cart & Checkout Panel */}
      <div className="pos-cart-panel">
        <div className="pos-cart-header">
          <div>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--dark)' }}>
              Keranjang Transaksi
            </h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {cart.reduce((sum, item) => sum + item.qty, 0)} item dipilih
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--danger)',
                cursor: 'pointer',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              Kosongkan
            </button>
          )}
        </div>

        {/* Customer Select */}
        <div style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)' }}>
          <Select
            label="Pilih Pelanggan"
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.name} (${c.phone})`,
            }))}
          />
        </div>

        {/* Cart Item List */}
        <div className="pos-cart-items">
          {cart.length === 0 ? (
            <div
              style={{
                textAlign: 'center',
                padding: '40px 16px',
                color: 'var(--text-muted)',
                fontSize: '0.85rem',
              }}
            >
              🛒 Keranjang belanja masih kosong.<br />
              Klik pada produk untuk menambah ke daftar.
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.product.id} className="pos-cart-item">
                <div style={{ flex: 1, minWidth: 0, paddingRight: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {item.product.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {formatRupiah(item.product.sellPrice)} / {item.product.unit}
                  </div>
                </div>

                {/* Qty Controls */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px' }}
                    onClick={() => updateQuantity(item.product.id, item.qty - 1)}
                  >
                    -
                  </button>
                  <span style={{ fontWeight: 700, fontSize: '0.85rem', minWidth: '24px', textAlign: 'center' }}>
                    {item.qty}
                  </span>
                  <button
                    className="btn btn-secondary btn-sm"
                    style={{ padding: '2px 8px' }}
                    onClick={() => updateQuantity(item.product.id, item.qty + 1)}
                  >
                    +
                  </button>
                </div>

                <div style={{ width: '85px', textAlign: 'right', fontWeight: 700, fontSize: '0.85rem' }}>
                  {formatRupiah(item.subtotal)}
                </div>

                <button
                  onClick={() => removeFromCart(item.product.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                    padding: '4px',
                    marginLeft: '4px',
                  }}
                  title="Hapus"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Payment & Summary Footer */}
        <div className="pos-cart-footer">
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Subtotal:</span>
            <span style={{ fontWeight: 600 }}>{formatRupiah(subtotal)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Diskon (Rp):</span>
            <input
              type="number"
              min="0"
              style={{
                width: '110px',
                textAlign: 'right',
                padding: '4px 8px',
                fontSize: '0.82rem',
                border: '1px solid var(--border)',
                borderRadius: '4px',
              }}
              value={discount || ''}
              onChange={(e) => setDiscount(Math.max(0, Number(e.target.value)))}
              placeholder="0"
            />
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '12px',
              paddingTop: '6px',
              borderTop: '1px dashed var(--border)',
              fontSize: '1.1rem',
              fontWeight: 800,
              color: 'var(--dark)',
            }}
          >
            <span>Total Bayar:</span>
            <span style={{ color: 'var(--primary)' }}>{formatRupiah(total)}</span>
          </div>

          {/* Payment Method */}
          <div style={{ marginBottom: '10px' }}>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
              Metode Pembayaran
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
              {(['Tunai', 'Transfer', 'QRIS'] as PaymentMethod[]).map((method) => (
                <button
                  key={method}
                  className={`btn btn-sm ${
                    paymentMethod === method ? 'btn-primary' : 'btn-outline'
                  }`}
                  onClick={() => {
                    setPaymentMethod(method);
                    if (method !== 'Tunai') {
                      setAmountPaid(total);
                    }
                  }}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input & Quick Buttons */}
          {paymentMethod === 'Tunai' && (
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                Uang Diterima (Rp)
              </div>
              <input
                type="number"
                min="0"
                className="form-input"
                style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '6px' }}
                value={amountPaid || ''}
                onChange={(e) => setAmountPaid(Number(e.target.value))}
                placeholder="Masukkan nominal uang..."
              />

              <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 6px' }}
                  onClick={() => setQuickPaid(total)}
                >
                  Uang Pas
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 6px' }}
                  onClick={() => setQuickPaid(50000)}
                >
                  50.000
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 6px' }}
                  onClick={() => setQuickPaid(100000)}
                >
                  100.000
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.72rem', padding: '3px 6px' }}
                  onClick={() => setQuickPaid(200000)}
                >
                  200.000
                </button>
              </div>
            </div>
          )}

          {/* Kembalian */}
          {paymentMethod === 'Tunai' && (
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '6px',
                backgroundColor: amountPaid >= total ? 'var(--success-light)' : '#F1F5F9',
                color: amountPaid >= total ? 'var(--success)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '0.88rem',
                marginBottom: '12px',
              }}
            >
              <span>Kembalian:</span>
              <span>{formatRupiah(change)}</span>
            </div>
          )}

          <Button
            variant="success"
            size="lg"
            style={{ width: '100%' }}
            icon={<IconDollar size={18} />}
            disabled={cart.length === 0 || (paymentMethod === 'Tunai' && amountPaid < total)}
            onClick={handleCheckout}
          >
            Bayar Sekarang ({formatRupiah(total)})
          </Button>
        </div>
      </div>

      {/* Struk / Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        sale={completedSale}
        settings={storageService.getSettings()}
      />
    </div>
  );
};
