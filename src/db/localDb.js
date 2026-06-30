const KEYS = {
  MENU: 'kasir_kopi_menu',
  TABLES: 'kasir_kopi_tables',
  TRANSACTIONS: 'kasir_kopi_transactions'
};

const DEFAULT_MENU = [
  // MINUMAN - COFFEE
  { id: 'c1', name: 'Kopi Hitam', price: 13000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c2', name: 'Kopi Susu', price: 15000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c3', name: 'Kopi Susu Gula Aren', price: 17000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c4', name: 'Cappuccino', price: 15000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c5', name: 'Moccachino', price: 18000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c6', name: 'Kopi Telur', price: 18000, category: 'Minuman', subcategory: 'Coffee', image: '🥚' },
  
  // MINUMAN - TEA
  { id: 't1', name: 'Teh Kayu Aro', price: 6000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  { id: 't2', name: 'Teh Hijau', price: 10000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  {id: 't3', name: 'Teh Susu', price: 10000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  {id: 't4', name: 'Thai Tea', price: 8000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  {id: 't5', name: 'Thai Tea Latte', price: 12000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  {id: 't6', name: 'Teh Tarik', price: 10000, category: 'Minuman', subcategory: 'Tea', image: '🍵' },
  {id: 't7', name: 'Teh Telur', price: 13000, category: 'Minuman', subcategory: 'Tea', image: '🥚' },
  {id: 't8', name: 'Lemon Tea', price: 8000, category: 'Minuman', subcategory: 'Tea', image: '🍋' },
  
  // MINUMAN - Lainnya
  { id: 'd1', name: 'Chocolate', price: 12000, category: 'Minuman', subcategory: 'Lainnya', image: '🍫' },
  { id: 'd2', name: 'Matcha Latte', price: 15000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },
  { id: 'd3', name: 'Blue Ocean', price: 12000, category: 'Minuman', subcategory: 'Lainnya', image: '🍫' },
  { id: 'd4', name: 'Mango Squash', price: 10000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },
  { id: 'd5', name: 'Taro Latte', price: 19000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },
  { id: 'd6', name: 'Mango Latte', price: 19000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },
  { id: 'd7', name: 'Strawberry Latte', price: 19000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },
  { id: 'd8', name: 'Red Velvet Latte', price: 19000, category: 'Minuman', subcategory: 'Lainnya', image: '💧' },

  // MINUMAN - Frappe
  { id: 'l1', name: 'Chocolate Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🍫' },
  { id: 'l2', name: 'Cappucino Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🔴' },
  { id: 'l3', name: 'Mocha Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🍫' },
  { id: 'l4', name: 'Avocado Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🥑' },
  { id: 'l5', name: 'Vanilla Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '☕' },
  { id: 'l6', name: 'Mango Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🥭' },
  { id: 'l7', name: 'Strawberry Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🍓' },
  { id: 'l8', name: 'Matcha Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '🍵' },
  { id: 'l9', name: 'Taro Frappe', price: 13000, category: 'Minuman', subcategory: 'Lainnya', image: '💜' },
  
  // MAKANAN
  { id: 'f1', name: 'Ifumie Goreng', price: 15000, category: 'Makanan', subcategory: null, image: '🍝' },
  { id: 'f2', name: 'Kwetiau Goreng', price: 15000, category: 'Makanan', subcategory: null, image: '🍝' },
  { id: 'f3', name: 'Bihun Goreng', price: 15000, category: 'Makanan', subcategory: null, image: '🍝' },
  { id: 'f4', name: 'Roti Bakar', price: 7000, category: 'Makanan', subcategory: null, image: '🥪' },
  { id: 'f5', name: 'Kentang Goreng', price: 10000, category: 'Makanan', subcategory: null, image: '🍟' },
  { id: 'f6', name: 'Nugget', price: 12000, category: 'Makanan', subcategory: null, image: '🍟' },
  { id: 'f7', name: 'Indomie Goreng', price: 12000, category: 'Makanan', subcategory: null, image: '🍜' },
  { id: 'f8', name: 'Indomie Rebus', price: 12000, category: 'Makanan', subcategory: null, image: '🍜' },
  { id: 'f9', name: 'Sandwich', price: 15000, category: 'Makanan', subcategory: null, image: '🥪' },
  
  // LAIN-LAIN
  { id: 'l1', name: 'Air Mineral Kecil', price: 3000, category: 'Lain-lain', subcategory: null, image: '🫘' },
  { id: 'l2', name: 'Air Mineral Besar', price: 4000, category: 'Lain-lain', subcategory: null, image: '🥤' },
  { id: 'l3', name: 'Bingka', price: 2000, category: 'Lain-lain', subcategory: null, image: '🏷️' }
];

const DEFAULT_TABLES = [
  { id: 't1', number: 'Meja 01', status: 'available', activeOrderId: null },
  { id: 't2', number: 'Meja 02', status: 'available', activeOrderId: null },
  { id: 't3', number: 'Meja 03', status: 'available', activeOrderId: null },
  { id: 't4', number: 'Meja 04', status: 'available', activeOrderId: null },
  { id: 't5', number: 'Meja 05', status: 'available', activeOrderId: null },
  { id: 't6', number: 'Meja 06', status: 'available', activeOrderId: null },
  { id: 't7', number: 'Meja 07', status: 'available', activeOrderId: null },
  { id: 't8', number: 'Meja 08', status: 'available', activeOrderId: null },
  { id: 't9', number: 'Meja Petak Kiri', status: 'available', activeOrderId: null },
  { id: 't10', number: 'Meja Petak Kanan', status: 'available', activeOrderId: null },
  { id: 't11', number: 'Payung Kiri', status: 'available', activeOrderId: null },
  { id: 't12', number: 'Payung Kanan', status: 'available', activeOrderId: null },
];

export const localDb = {
  // --- MENU OPERATIONS ---
  getMenu() {
    const data = localStorage.getItem(KEYS.MENU);
    if (!data) {
      this.saveMenu(DEFAULT_MENU);
      return DEFAULT_MENU;
    }
    return JSON.parse(data);
  },

  saveMenu(menu) {
    localStorage.setItem(KEYS.MENU, JSON.stringify(menu));
  },

  // --- TABLES OPERATIONS ---
  getTables() {
    const data = localStorage.getItem(KEYS.TABLES);
    if (!data) {
      this.saveTables(DEFAULT_TABLES);
      return DEFAULT_TABLES;
    }
    return JSON.parse(data);
  },

  saveTables(tables) {
    localStorage.setItem(KEYS.TABLES, JSON.stringify(tables));
  },

  // --- TRANSACTIONS OPERATIONS ---
  getTransactions() {
    const data = localStorage.getItem(KEYS.TRANSACTIONS);
    if (!data) {
      localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
      return [];
    }
    return JSON.parse(data);
  },

  saveTransaction(transaction) {
    const list = this.getTransactions();
    const newTransaction = {
      ...transaction,
      id: 'TX-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toISOString()
    };
    list.unshift(newTransaction);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(list));
    return newTransaction;
  },

  // --- GENERAL BACKUP OPERATIONS ---
  exportBackup() {
    const backupData = {
      menu: this.getMenu(),
      tables: this.getTables(),
      transactions: this.getTransactions(),
      version: '1.1.0',
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(backupData, null, 2);
  },

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.menu && data.tables && data.transactions) {
        this.saveMenu(data.menu);
        this.saveTables(data.tables);
        localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data.transactions));
        return { success: true };
      }
      return { success: false, error: 'Format berkas tidak valid' };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  resetDatabase() {
    this.saveMenu(DEFAULT_MENU);
    this.saveTables(DEFAULT_TABLES);
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
  }
};
