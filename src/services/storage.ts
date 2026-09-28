import {
  Product,
  Sale,
  Purchase,
  ReturnSale,
  ReturnPurchase,
  Supplier,
  Customer,
  StockOpname,
  StockMutation,
  JournalEntry,
  Account,
  StoreSettings,
  User,
} from '../types';

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v1',
  SALES: 'pos_sales_v1',
  PURCHASES: 'pos_purchases_v1',
  RETURNS_SALES: 'pos_returns_sales_v1',
  RETURNS_PURCHASES: 'pos_returns_purchases_v1',
  SUPPLIERS: 'pos_suppliers_v1',
  CUSTOMERS: 'pos_customers_v1',
  OPNAMES: 'pos_opnames_v1',
  MUTATIONS: 'pos_mutations_v1',
  JOURNALS: 'pos_journals_v1',
  ACCOUNTS: 'pos_accounts_v1',
  SETTINGS: 'pos_settings_v1',
  USERS: 'pos_users_v1',
  CURRENT_USER: 'pos_current_user_v1',
};

// Calculate product status based on stock and minimum stock
export const calculateProductStatus = (stock: number, minStock: number): 'Aman' | 'Menipis' | 'Habis' => {
  if (stock <= 0) return 'Habis';
  if (stock <= minStock) return 'Menipis';
  return 'Aman';
};

// Initial Seed Data
const DEFAULT_USERS: User[] = [
  { id: 'usr-1', name: 'Budi Santoso (Owner)', username: 'owner', password: '123456', role: 'Owner', status: 'Aktif' },
  { id: 'usr-2', name: 'Agus Pratama (Kepala Toko)', username: 'kepala', password: '123456', role: 'Kepala Toko', status: 'Aktif' },
  { id: 'usr-3', name: 'Siti Rahma (Keuangan)', username: 'keuangan', password: '123456', role: 'Bagian Keuangan', status: 'Aktif' },
  { id: 'usr-4', name: 'Rina Wijaya (Accounting)', username: 'accounting', password: '123456', role: 'Accounting', status: 'Aktif' },
  { id: 'usr-5', name: 'Dedi Kurniawan (Gudang)', username: 'gudang', password: '123456', role: 'Kepala Gudang', status: 'Aktif' },
  { id: 'usr-6', name: 'Dewi Lestari (Kasir)', username: 'kasir', password: '123456', role: 'Kasir', status: 'Aktif' },
  { id: 'usr-7', name: 'Fajar Nugraha (Sales)', username: 'sales', password: '123456', role: 'Sales', status: 'Aktif' },
];

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'p1', code: 'PRD-001', name: 'Indomie Goreng', category: 'Makanan', buyPrice: 2800, sellPrice: 3500, stock: 100, minStock: 20, status: 'Aman', unit: 'Bungkus' },
  { id: 'p2', code: 'PRD-002', name: 'Aqua 600ml', category: 'Minuman', buyPrice: 3000, sellPrice: 4000, stock: 80, minStock: 20, status: 'Aman', unit: 'Botol' },
  { id: 'p3', code: 'PRD-003', name: 'Teh Botol', category: 'Minuman', buyPrice: 3800, sellPrice: 5000, stock: 60, minStock: 15, status: 'Aman', unit: 'Kotak' },
  { id: 'p4', code: 'PRD-004', name: 'Kopi Kapal Api', category: 'Minuman', buyPrice: 1900, sellPrice: 2500, stock: 90, minStock: 20, status: 'Aman', unit: 'Sachet' },
  { id: 'p5', code: 'PRD-005', name: 'Gula 1kg', category: 'Sembako', buyPrice: 15000, sellPrice: 18000, stock: 40, minStock: 10, status: 'Aman', unit: 'Kg' },
  { id: 'p6', code: 'PRD-006', name: 'Minyak Goreng 1L', category: 'Sembako', buyPrice: 17000, sellPrice: 20000, stock: 50, minStock: 15, status: 'Aman', unit: 'Pouch' },
  { id: 'p7', code: 'PRD-007', name: 'Beras 5kg', category: 'Sembako', buyPrice: 65000, sellPrice: 75000, stock: 30, minStock: 10, status: 'Aman', unit: 'Karung' },
  { id: 'p8', code: 'PRD-008', name: 'Sabun Mandi', category: 'Kebutuhan Rumah', buyPrice: 4200, sellPrice: 5500, stock: 70, minStock: 15, status: 'Aman', unit: 'Pcs' },
  { id: 'p9', code: 'PRD-009', name: 'Telur Ayam 1kg', category: 'Sembako', buyPrice: 24000, sellPrice: 28000, stock: 8, minStock: 15, status: 'Menipis', unit: 'Kg' },
  { id: 'p10', code: 'PRD-010', name: 'Tepung Terigu 1kg', category: 'Sembako', buyPrice: 9500, sellPrice: 12000, stock: 0, minStock: 10, status: 'Habis', unit: 'Kg' },
];

const DEFAULT_SUPPLIERS: Supplier[] = [
  { id: 'sup-1', code: 'SUP-001', name: 'PT Indofood Sukses Makmur', phone: '021-57958822', address: 'Jl. Jend. Sudirman Kav. 76-78, Jakarta', status: 'Aktif' },
  { id: 'sup-2', code: 'SUP-002', name: 'Danone Aqua Indonesia', phone: '021-8972100', address: 'Kawasan Industri MM2100, Cikarang', status: 'Aktif' },
  { id: 'sup-3', code: 'SUP-003', name: 'PT Wings Surya', phone: '031-8921100', address: 'Jl. Embong Malang No. 61, Surabaya', status: 'Aktif' },
  { id: 'sup-4', code: 'SUP-004', name: 'CV Beras Nusantara', phone: '0274-551234', address: 'Jl. Magelang KM 9, Sleman, Yogyakarta', status: 'Aktif' },
];

const DEFAULT_CUSTOMERS: Customer[] = [
  { id: 'cust-0', code: 'CUST-000', name: 'Pelanggan Umum', phone: '-', address: 'Langsung di Toko', totalTransactions: 85, totalSpent: 28500000 },
  { id: 'cust-1', code: 'CUST-001', name: 'Warung Bu Sri', phone: '081234567890', address: 'Jl. Melati No. 12, Jakarta Barat', totalTransactions: 24, totalSpent: 12450000 },
  { id: 'cust-2', code: 'CUST-002', name: 'Toko Berkah Jaya', phone: '081987654321', address: 'Jl. Mawar No. 45, Jakarta Selatan', totalTransactions: 15, totalSpent: 6200000 },
  { id: 'cust-3', code: 'CUST-003', name: 'Pak Hendra Pribadi', phone: '085211223344', address: 'Perum Griya Asri B-3, Tangerang', totalTransactions: 4, totalSpent: 1600000 },
];

const DEFAULT_SETTINGS: StoreSettings = {
  storeName: 'Sistem POS & Akuntansi Toko',
  address: 'Jl. Boulevard Raya Blok A4 No. 18, Jakarta Barat',
  phone: '(021) 554-8901 / 0812-9988-7766',
  receiptFooter: 'Terima kasih atas kunjungan Anda! Barang yang sudah dibeli tidak dapat ditukar kecuali ada perjanjian.',
};

const DEFAULT_ACCOUNTS: Account[] = [
  { code: '1-1000', name: 'Kas Tunai Toko', category: 'Aset', normalBalance: 'Debit', balance: 14250000 },
  { code: '1-1100', name: 'Bank BCA Operasional', category: 'Aset', normalBalance: 'Debit', balance: 35000000 },
  { code: '1-1200', name: 'Piutang Usaha', category: 'Aset', normalBalance: 'Debit', balance: 8200000 },
  { code: '1-1300', name: 'Persediaan Barang Dagang', category: 'Aset', normalBalance: 'Debit', balance: 32500000 },
  { code: '2-1000', name: 'Hutang Usaha / Supplier', category: 'Kewajiban', normalBalance: 'Kredit', balance: 5400000 },
  { code: '3-1000', name: 'Modal Usaha Pemilik', category: 'Modal', normalBalance: 'Kredit', balance: 84550000 },
  { code: '4-1000', name: 'Pendapatan Penjualan Toko', category: 'Pendapatan', normalBalance: 'Kredit', balance: 48750000 },
  { code: '4-2000', name: 'Pendapatan Lain-lain', category: 'Pendapatan', normalBalance: 'Kredit', balance: 1200000 },
  { code: '5-1000', name: 'Harga Pokok Penjualan (HPP)', category: 'Beban', normalBalance: 'Debit', balance: 34500000 },
  { code: '6-1000', name: 'Beban Gaji Karyawan', category: 'Beban', normalBalance: 'Debit', balance: 11000000 },
  { code: '6-1100', name: 'Beban Listrik, Air & Internet', category: 'Beban', normalBalance: 'Debit', balance: 1850000 },
  { code: '6-1200', name: 'Beban Operasional Toko', category: 'Beban', normalBalance: 'Debit', balance: 1550000 },
];

const DEFAULT_SALES: Sale[] = [
  {
    id: 'sale-1',
    invoiceNumber: 'TRX-001',
    date: '2026-09-24 10:15:00',
    cashierName: 'Dewi Lestari',
    cashierRole: 'Kasir',
    customerName: 'Warung Bu Sri',
    customerId: 'cust-1',
    items: [
      { productId: 'p1', code: 'PRD-001', name: 'Indomie Goreng', buyPrice: 2800, sellPrice: 3500, qty: 20, subtotal: 70000 },
      { productId: 'p6', code: 'PRD-006', name: 'Minyak Goreng 1L', buyPrice: 17000, sellPrice: 20000, qty: 5, subtotal: 100000 },
      { productId: 'p5', code: 'PRD-005', name: 'Gula 1kg', buyPrice: 15000, sellPrice: 18000, qty: 4, subtotal: 72000 },
    ],
    subtotal: 242000,
    discount: 2000,
    total: 240000,
    paymentMethod: 'Tunai',
    amountPaid: 250000,
    change: 10000,
    notes: 'Pelanggan langganan',
  },
  {
    id: 'sale-2',
    invoiceNumber: 'TRX-002',
    date: '2026-09-24 14:30:22',
    cashierName: 'Dewi Lestari',
    cashierRole: 'Kasir',
    customerName: 'Pelanggan Umum',
    customerId: 'cust-0',
    items: [
      { productId: 'p7', code: 'PRD-007', name: 'Beras 5kg', buyPrice: 65000, sellPrice: 75000, qty: 2, subtotal: 150000 },
      { productId: 'p2', code: 'PRD-002', name: 'Aqua 600ml', buyPrice: 3000, sellPrice: 4000, qty: 6, subtotal: 24000 },
    ],
    subtotal: 174000,
    discount: 0,
    total: 174000,
    paymentMethod: 'QRIS',
    amountPaid: 174000,
    change: 0,
  },
  {
    id: 'sale-3',
    invoiceNumber: 'TRX-003',
    date: '2026-09-25 09:40:15',
    cashierName: 'Dewi Lestari',
    cashierRole: 'Kasir',
    customerName: 'Toko Berkah Jaya',
    customerId: 'cust-2',
    items: [
      { productId: 'p3', code: 'PRD-003', name: 'Teh Botol', buyPrice: 3800, sellPrice: 5000, qty: 12, subtotal: 60000 },
      { productId: 'p4', code: 'PRD-004', name: 'Kopi Kapal Api', buyPrice: 1900, sellPrice: 2500, qty: 20, subtotal: 50000 },
      { productId: 'p8', code: 'PRD-008', name: 'Sabun Mandi', buyPrice: 4200, sellPrice: 5500, qty: 10, subtotal: 55000 },
    ],
    subtotal: 165000,
    discount: 5000,
    total: 160000,
    paymentMethod: 'Transfer',
    amountPaid: 160000,
    change: 0,
  },
];

const DEFAULT_PURCHASES: Purchase[] = [
  {
    id: 'po-1',
    invoiceNumber: 'PO-001',
    date: '2026-09-20 08:30:00',
    supplierId: 'sup-1',
    supplierName: 'PT Indofood Sukses Makmur',
    items: [
      { productId: 'p1', code: 'PRD-001', name: 'Indomie Goreng', buyPrice: 2800, qty: 100, subtotal: 280000 },
      { productId: 'p6', code: 'PRD-006', name: 'Minyak Goreng 1L', buyPrice: 17000, qty: 40, subtotal: 680000 },
    ],
    total: 960000,
    paymentStatus: 'Lunas',
    notes: 'Pengiriman via truk logistik',
  },
  {
    id: 'po-2',
    invoiceNumber: 'PO-002',
    date: '2026-09-22 11:00:00',
    supplierId: 'sup-4',
    supplierName: 'CV Beras Nusantara',
    items: [
      { productId: 'p7', code: 'PRD-007', name: 'Beras 5kg', buyPrice: 65000, qty: 30, subtotal: 1950000 },
      { productId: 'p5', code: 'PRD-005', name: 'Gula 1kg', buyPrice: 15000, qty: 50, subtotal: 750000 },
    ],
    total: 2700000,
    paymentStatus: 'Tempo',
    dueDate: '2026-10-15',
    notes: 'Jatuh tempo 3 minggu',
  },
];

const DEFAULT_JOURNALS: JournalEntry[] = [
  {
    id: 'jrn-1',
    journalNumber: 'JRN-001',
    date: '2026-09-24',
    reference: 'TRX-001',
    description: 'Penerimaan Penjualan Tunai TRX-001',
    lines: [
      { accountCode: '1-1000', accountName: 'Kas Tunai Toko', debit: 240000, credit: 0 },
      { accountCode: '4-1000', accountName: 'Pendapatan Penjualan Toko', debit: 0, credit: 240000 },
      { accountCode: '5-1000', accountName: 'Harga Pokok Penjualan (HPP)', debit: 201000, credit: 0 },
      { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: 0, credit: 201000 },
    ],
  },
  {
    id: 'jrn-2',
    journalNumber: 'JRN-002',
    date: '2026-09-24',
    reference: 'TRX-002',
    description: 'Penerimaan Penjualan QRIS TRX-002',
    lines: [
      { accountCode: '1-1100', accountName: 'Bank BCA Operasional', debit: 174000, credit: 0 },
      { accountCode: '4-1000', accountName: 'Pendapatan Penjualan Toko', debit: 0, credit: 174000 },
      { accountCode: '5-1000', accountName: 'Harga Pokok Penjualan (HPP)', debit: 148000, credit: 0 },
      { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: 0, credit: 148000 },
    ],
  },
  {
    id: 'jrn-3',
    journalNumber: 'JRN-003',
    date: '2026-09-20',
    reference: 'PO-001',
    description: 'Pembelian Barang Dagang PO-001',
    lines: [
      { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: 960000, credit: 0 },
      { accountCode: '1-1000', accountName: 'Kas Tunai Toko', debit: 0, credit: 960000 },
    ],
  },
];

const DEFAULT_MUTATIONS: StockMutation[] = [
  { id: 'mut-1', date: '2026-09-20 08:35:00', productId: 'p1', productName: 'Indomie Goreng', type: 'IN', qty: 100, initialStock: 20, finalStock: 120, reference: 'PO-001', notes: 'Penerimaan Pembelian Supplier' },
  { id: 'mut-2', date: '2026-09-24 10:15:00', productId: 'p1', productName: 'Indomie Goreng', type: 'OUT', qty: 20, initialStock: 120, finalStock: 100, reference: 'TRX-001', notes: 'Penjualan Kasir' },
  { id: 'mut-3', date: '2026-09-24 14:30:22', productId: 'p7', productName: 'Beras 5kg', type: 'OUT', qty: 2, initialStock: 32, finalStock: 30, reference: 'TRX-002', notes: 'Penjualan Kasir' },
];

// Helper to safely read from localStorage
function readStorage<T>(key: string, defaultValue: T): T {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return defaultValue;
    const item = localStorage.getItem(key);
    if (!item) return defaultValue;
    const parsed = JSON.parse(item);
    return parsed !== null && parsed !== undefined ? parsed as T : defaultValue;
  } catch (error) {
    console.error(`Error reading localStorage key "${key}":`, error);
    return defaultValue;
  }
}

// Helper to safely write to localStorage
function writeStorage<T>(key: string, value: T): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing localStorage key "${key}":`, error);
  }
}

// Check and initialize default data if not present
export function initializeStorage(): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return;

  if (!localStorage.getItem(STORAGE_KEYS.PRODUCTS)) {
    writeStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    writeStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SUPPLIERS)) {
    writeStorage(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.CUSTOMERS)) {
    writeStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
    writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.SALES)) {
    writeStorage(STORAGE_KEYS.SALES, DEFAULT_SALES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.PURCHASES)) {
    writeStorage(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
  }
  if (!localStorage.getItem(STORAGE_KEYS.ACCOUNTS)) {
    writeStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.JOURNALS)) {
    writeStorage(STORAGE_KEYS.JOURNALS, DEFAULT_JOURNALS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.MUTATIONS)) {
    writeStorage(STORAGE_KEYS.MUTATIONS, DEFAULT_MUTATIONS);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RETURNS_SALES)) {
    writeStorage(STORAGE_KEYS.RETURNS_SALES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.RETURNS_PURCHASES)) {
    writeStorage(STORAGE_KEYS.RETURNS_PURCHASES, []);
  }
  if (!localStorage.getItem(STORAGE_KEYS.OPNAMES)) {
    writeStorage(STORAGE_KEYS.OPNAMES, []);
  }
  // Default login to Owner if not set
  if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
    writeStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
  }
  } catch (e) {
    console.error('Failed to initialize local storage:', e);
  }
}

// Reset data to defaults
export function resetToDefaultData(): void {
  writeStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  writeStorage(STORAGE_KEYS.USERS, DEFAULT_USERS);
  writeStorage(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  writeStorage(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  writeStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  writeStorage(STORAGE_KEYS.SALES, DEFAULT_SALES);
  writeStorage(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
  writeStorage(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  writeStorage(STORAGE_KEYS.JOURNALS, DEFAULT_JOURNALS);
  writeStorage(STORAGE_KEYS.MUTATIONS, DEFAULT_MUTATIONS);
  writeStorage(STORAGE_KEYS.RETURNS_SALES, []);
  writeStorage(STORAGE_KEYS.RETURNS_PURCHASES, []);
  writeStorage(STORAGE_KEYS.OPNAMES, []);
  writeStorage(STORAGE_KEYS.CURRENT_USER, DEFAULT_USERS[0]);
}

// Storage API methods
export const storageService = {
  // Current user & authentication
  getCurrentUser(): User | null {
    return readStorage<User | null>(STORAGE_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user: User | null): void {
    writeStorage(STORAGE_KEYS.CURRENT_USER, user);
  },
  getUsers(): User[] {
    return readStorage<User[]>(STORAGE_KEYS.USERS, DEFAULT_USERS);
  },
  saveUsers(users: User[]): void {
    writeStorage(STORAGE_KEYS.USERS, users);
  },

  // Products
  getProducts(): Product[] {
    return readStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  },
  saveProducts(products: Product[]): void {
    // Recalculate status for each product
    const updated = products.map((p) => ({
      ...p,
      status: calculateProductStatus(p.stock, p.minStock),
    }));
    writeStorage(STORAGE_KEYS.PRODUCTS, updated);
  },
  updateProductStock(productId: string, delta: number, refNumber: string, reason: string): void {
    const products = this.getProducts();
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    const initialStock = product.stock;
    const finalStock = Math.max(0, initialStock + delta);
    product.stock = finalStock;
    product.status = calculateProductStatus(finalStock, product.minStock);
    this.saveProducts(products);

    // Record stock mutation
    const mutation: StockMutation = {
      id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
      date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      productId: product.id,
      productName: product.name,
      type: delta > 0 ? (reason.includes('Retur') ? 'RETURN_IN' : 'IN') : (reason.includes('Retur') ? 'RETURN_OUT' : 'OUT'),
      qty: Math.abs(delta),
      initialStock,
      finalStock,
      reference: refNumber,
      notes: reason,
    };
    this.addMutation(mutation);
  },

  // Sales
  getSales(): Sale[] {
    return readStorage<Sale[]>(STORAGE_KEYS.SALES, DEFAULT_SALES);
  },
  saveSales(sales: Sale[]): void {
    writeStorage(STORAGE_KEYS.SALES, sales);
  },
  getNextInvoiceNumber(): string {
    const sales = this.getSales();
    const count = sales.length + 1;
    return `TRX-${String(count).padStart(3, '0')}`;
  },
  addSale(sale: Sale): void {
    const sales = this.getSales();
    sales.unshift(sale);
    this.saveSales(sales);

    // Decrease stock for each item sold
    let totalHPP = 0;
    sale.items.forEach((item) => {
      this.updateProductStock(item.productId, -item.qty, sale.invoiceNumber, `Penjualan Kasir (${sale.invoiceNumber})`);
      totalHPP += (item.buyPrice || 0) * item.qty;
    });

    // Update customer stats if customer selected
    if (sale.customerId && sale.customerId !== 'cust-0') {
      const customers = this.getCustomers();
      const customer = customers.find((c) => c.id === sale.customerId);
      if (customer) {
        customer.totalTransactions += 1;
        customer.totalSpent += sale.total;
        this.saveCustomers(customers);
      }
    }

    // Auto generate accounting journal
    const targetAccountCode = sale.paymentMethod === 'Tunai' ? '1-1000' : '1-1100'; // Kas Tunai or Bank BCA
    const targetAccountName = sale.paymentMethod === 'Tunai' ? 'Kas Tunai Toko' : 'Bank BCA Operasional';
    
    const lines = [
      { accountCode: targetAccountCode, accountName: targetAccountName, debit: sale.total, credit: 0 },
      { accountCode: '4-1000', accountName: 'Pendapatan Penjualan Toko', debit: 0, credit: sale.total },
    ];

    if (totalHPP > 0) {
      lines.push(
        { accountCode: '5-1000', accountName: 'Harga Pokok Penjualan (HPP)', debit: totalHPP, credit: 0 },
        { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: 0, credit: totalHPP }
      );
    }

    const journal: JournalEntry = {
      id: 'jrn-' + Date.now(),
      journalNumber: `JRN-${String(this.getJournals().length + 1).padStart(3, '0')}`,
      date: sale.date.split(' ')[0],
      reference: sale.invoiceNumber,
      description: `Penjualan ${sale.paymentMethod} ${sale.invoiceNumber}`,
      lines,
    };
    this.addJournal(journal);
  },

  // Purchases
  getPurchases(): Purchase[] {
    return readStorage<Purchase[]>(STORAGE_KEYS.PURCHASES, DEFAULT_PURCHASES);
  },
  savePurchases(purchases: Purchase[]): void {
    writeStorage(STORAGE_KEYS.PURCHASES, purchases);
  },
  getNextPurchaseNumber(): string {
    const purchases = this.getPurchases();
    const count = purchases.length + 1;
    return `PO-${String(count).padStart(3, '0')}`;
  },
  addPurchase(purchase: Purchase): void {
    const purchases = this.getPurchases();
    purchases.unshift(purchase);
    this.savePurchases(purchases);

    // Increase stock for each purchased item
    purchase.items.forEach((item) => {
      this.updateProductStock(item.productId, item.qty, purchase.invoiceNumber, `Pembelian dari ${purchase.supplierName}`);
    });

    // Auto generate accounting journal
    const paymentAccountCode = purchase.paymentStatus === 'Lunas' ? '1-1000' : '2-1000';
    const paymentAccountName = purchase.paymentStatus === 'Lunas' ? 'Kas Tunai Toko' : 'Hutang Usaha / Supplier';

    const journal: JournalEntry = {
      id: 'jrn-' + Date.now(),
      journalNumber: `JRN-${String(this.getJournals().length + 1).padStart(3, '0')}`,
      date: purchase.date.split(' ')[0] || new Date().toISOString().split('T')[0],
      reference: purchase.invoiceNumber,
      description: `Pembelian Barang (${purchase.paymentStatus}) ${purchase.invoiceNumber}`,
      lines: [
        { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: purchase.total, credit: 0 },
        { accountCode: paymentAccountCode, accountName: paymentAccountName, debit: 0, credit: purchase.total },
      ],
    };
    this.addJournal(journal);
  },

  // Returns Sales
  getReturnSales(): ReturnSale[] {
    return readStorage<ReturnSale[]>(STORAGE_KEYS.RETURNS_SALES, []);
  },
  getNextReturnSaleNumber(): string {
    const list = this.getReturnSales();
    return `RET-J-${String(list.length + 1).padStart(3, '0')}`;
  },
  addReturnSale(returnSale: ReturnSale): void {
    const list = this.getReturnSales();
    list.unshift(returnSale);
    writeStorage(STORAGE_KEYS.RETURNS_SALES, list);

    // Return items to stock (stock increases)
    returnSale.items.forEach((item) => {
      this.updateProductStock(item.productId, item.qty, returnSale.returnNumber, `Retur Penjualan (${returnSale.saleInvoice}): ${returnSale.reason}`);
    });

    // Accounting journal for return
    const journal: JournalEntry = {
      id: 'jrn-' + Date.now(),
      journalNumber: `JRN-${String(this.getJournals().length + 1).padStart(3, '0')}`,
      date: returnSale.date,
      reference: returnSale.returnNumber,
      description: `Retur Penjualan dari ${returnSale.customerName} (${returnSale.saleInvoice})`,
      lines: [
        { accountCode: '4-1000', accountName: 'Pendapatan Penjualan Toko (Retur)', debit: returnSale.totalRefund, credit: 0 },
        { accountCode: '1-1000', accountName: 'Kas Tunai Toko', debit: 0, credit: returnSale.totalRefund },
      ],
    };
    this.addJournal(journal);
  },

  // Returns Purchases
  getReturnPurchases(): ReturnPurchase[] {
    return readStorage<ReturnPurchase[]>(STORAGE_KEYS.RETURNS_PURCHASES, []);
  },
  getNextReturnPurchaseNumber(): string {
    const list = this.getReturnPurchases();
    return `RET-B-${String(list.length + 1).padStart(3, '0')}`;
  },
  addReturnPurchase(returnPurchase: ReturnPurchase): void {
    const list = this.getReturnPurchases();
    list.unshift(returnPurchase);
    writeStorage(STORAGE_KEYS.RETURNS_PURCHASES, list);

    // Return items to supplier (stock decreases)
    returnPurchase.items.forEach((item) => {
      this.updateProductStock(item.productId, -item.qty, returnPurchase.returnNumber, `Retur Pembelian (${returnPurchase.purchaseInvoice}): ${returnPurchase.reason}`);
    });

    // Accounting journal for return
    const journal: JournalEntry = {
      id: 'jrn-' + Date.now(),
      journalNumber: `JRN-${String(this.getJournals().length + 1).padStart(3, '0')}`,
      date: returnPurchase.date,
      reference: returnPurchase.returnNumber,
      description: `Retur Pembelian ke ${returnPurchase.supplierName} (${returnPurchase.purchaseInvoice})`,
      lines: [
        { accountCode: '1-1000', accountName: 'Kas Tunai Toko (Pengembalian Dana)', debit: returnPurchase.totalRefund, credit: 0 },
        { accountCode: '1-1300', accountName: 'Persediaan Barang Dagang', debit: 0, credit: returnPurchase.totalRefund },
      ],
    };
    this.addJournal(journal);
  },

  // Stock Opname
  getOpnames(): StockOpname[] {
    return readStorage<StockOpname[]>(STORAGE_KEYS.OPNAMES, []);
  },
  getNextOpnameNumber(): string {
    const list = this.getOpnames();
    return `SO-${String(list.length + 1).padStart(3, '0')}`;
  },
  addOpname(opname: StockOpname): void {
    const list = this.getOpnames();
    list.unshift(opname);
    writeStorage(STORAGE_KEYS.OPNAMES, list);

    // Update actual stock for each item
    const products = this.getProducts();
    opname.items.forEach((item) => {
      const p = products.find((prod) => prod.id === item.productId);
      if (p) {
        const initialStock = p.stock;
        p.stock = item.physicalStock;
        p.status = calculateProductStatus(p.stock, p.minStock);

        if (item.difference !== 0) {
          const mutation: StockMutation = {
            id: 'mut-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
            date: opname.date,
            productId: p.id,
            productName: p.name,
            type: 'ADJUSTMENT',
            qty: Math.abs(item.difference),
            initialStock,
            finalStock: item.physicalStock,
            reference: opname.opnameNumber,
            notes: `Stok Opname Penyesuaian (${item.difference > 0 ? '+' : ''}${item.difference}) ${item.notes || ''}`,
          };
          this.addMutation(mutation);
        }
      }
    });
    this.saveProducts(products);
  },

  // Stock Mutations
  getMutations(): StockMutation[] {
    return readStorage<StockMutation[]>(STORAGE_KEYS.MUTATIONS, DEFAULT_MUTATIONS);
  },
  addMutation(mutation: StockMutation): void {
    const list = this.getMutations();
    list.unshift(mutation);
    writeStorage(STORAGE_KEYS.MUTATIONS, list);
  },

  // Suppliers
  getSuppliers(): Supplier[] {
    return readStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, DEFAULT_SUPPLIERS);
  },
  saveSuppliers(suppliers: Supplier[]): void {
    writeStorage(STORAGE_KEYS.SUPPLIERS, suppliers);
  },

  // Customers
  getCustomers(): Customer[] {
    return readStorage<Customer[]>(STORAGE_KEYS.CUSTOMERS, DEFAULT_CUSTOMERS);
  },
  saveCustomers(customers: Customer[]): void {
    writeStorage(STORAGE_KEYS.CUSTOMERS, customers);
  },

  // Accounting & Journals
  getAccounts(): Account[] {
    return readStorage<Account[]>(STORAGE_KEYS.ACCOUNTS, DEFAULT_ACCOUNTS);
  },
  saveAccounts(accounts: Account[]): void {
    writeStorage(STORAGE_KEYS.ACCOUNTS, accounts);
  },
  getJournals(): JournalEntry[] {
    return readStorage<JournalEntry[]>(STORAGE_KEYS.JOURNALS, DEFAULT_JOURNALS);
  },
  saveJournals(journals: JournalEntry[]): void {
    writeStorage(STORAGE_KEYS.JOURNALS, journals);
  },
  addJournal(journal: JournalEntry): void {
    const list = this.getJournals();
    list.unshift(journal);
    writeStorage(STORAGE_KEYS.JOURNALS, list);
  },

  // Store Settings
  getSettings(): StoreSettings {
    return readStorage<StoreSettings>(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  },
  saveSettings(settings: StoreSettings): void {
    writeStorage(STORAGE_KEYS.SETTINGS, settings);
  },
};

// Auto initialize immediately
initializeStorage();
