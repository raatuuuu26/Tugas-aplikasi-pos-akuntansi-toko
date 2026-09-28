export type Role =
  | 'Owner'
  | 'Kepala Toko'
  | 'Bagian Keuangan'
  | 'Accounting'
  | 'Kepala Gudang'
  | 'Kasir'
  | 'Sales';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  role: Role;
  status: 'Aktif' | 'Nonaktif';
}

export type ProductStatus = 'Aman' | 'Menipis' | 'Habis';

export interface Product {
  id: string;
  code: string;
  name: string;
  category: string;
  buyPrice: number;
  sellPrice: number;
  stock: number;
  minStock: number;
  status: ProductStatus;
  unit: string;
}

export interface CartItem {
  product: Product;
  qty: number;
  subtotal: number;
}

export interface SaleItem {
  productId: string;
  code: string;
  name: string;
  sellPrice: number;
  buyPrice: number;
  qty: number;
  subtotal: number;
}

export type PaymentMethod = 'Tunai' | 'Transfer' | 'QRIS';

export interface Sale {
  id: string;
  invoiceNumber: string; // e.g. TRX-001
  date: string; // YYYY-MM-DD HH:mm:ss
  cashierName: string;
  cashierRole: Role;
  customerId?: string;
  customerName?: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
  amountPaid: number;
  change: number;
  notes?: string;
}

export interface PurchaseItem {
  productId: string;
  code: string;
  name: string;
  buyPrice: number;
  qty: number;
  subtotal: number;
}

export type PurchasePaymentStatus = 'Lunas' | 'Tempo';

export interface Purchase {
  id: string;
  invoiceNumber: string; // e.g. PO-001
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseItem[];
  total: number;
  paymentStatus: PurchasePaymentStatus;
  dueDate?: string;
  notes?: string;
}

export interface ReturnItem {
  productId: string;
  code: string;
  name: string;
  qty: number;
  price: number;
  subtotal: number;
}

export interface ReturnSale {
  id: string;
  returnNumber: string; // e.g. RET-J-001
  saleId: string;
  saleInvoice: string;
  date: string;
  customerName: string;
  items: ReturnItem[];
  totalRefund: number;
  reason: string;
}

export interface ReturnPurchase {
  id: string;
  returnNumber: string; // e.g. RET-B-001
  purchaseId: string;
  purchaseInvoice: string;
  date: string;
  supplierName: string;
  items: ReturnItem[];
  totalRefund: number;
  reason: string;
}

export interface Supplier {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  status: 'Aktif' | 'Nonaktif';
}

export interface Customer {
  id: string;
  code: string;
  name: string;
  phone: string;
  address: string;
  totalTransactions: number;
  totalSpent: number;
}

export interface StockOpnameItem {
  productId: string;
  code: string;
  name: string;
  systemStock: number;
  physicalStock: number;
  difference: number; // physical - system
  notes?: string;
}

export interface StockOpname {
  id: string;
  opnameNumber: string; // e.g. SO-001
  date: string;
  operatorName: string;
  items: StockOpnameItem[];
  totalDiscrepancy: number;
  notes?: string;
}

export type MutationType = 'IN' | 'OUT' | 'ADJUSTMENT' | 'RETURN_IN' | 'RETURN_OUT';

export interface StockMutation {
  id: string;
  date: string;
  productId: string;
  productName: string;
  type: MutationType;
  qty: number;
  initialStock: number;
  finalStock: number;
  reference: string; // TRX-001, PO-001, SO-001, etc.
  notes: string;
}

export interface JournalLine {
  accountCode: string;
  accountName: string;
  debit: number;
  credit: number;
}

export interface JournalEntry {
  id: string;
  journalNumber: string; // e.g. JRN-001
  date: string;
  reference: string;
  description: string;
  lines: JournalLine[];
}

export interface Account {
  code: string;
  name: string;
  category: 'Aset' | 'Kewajiban' | 'Modal' | 'Pendapatan' | 'Beban';
  normalBalance: 'Debit' | 'Kredit';
  balance: number;
}

export interface StoreSettings {
  storeName: string;
  address: string;
  phone: string;
  receiptFooter: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'warning' | 'danger' | 'info';
  title?: string;
  message: string;
}

export type PageId =
  | 'dashboard'
  | 'pos'
  | 'sales-history'
  | 'purchases'
  | 'return-sales'
  | 'return-purchases'
  | 'products'
  | 'inventory'
  | 'stock-opname'
  | 'suppliers'
  | 'customers'
  | 'accounting'
  | 'journals'
  | 'reports'
  | 'users'
  | 'settings';
