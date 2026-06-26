const KEYS = {
  MENU: 'kasir_kopi_menu',
  TABLES: 'kasir_kopi_tables',
  TRANSACTIONS: 'kasir_kopi_transactions'
};

const DEFAULT_MENU = [
  // MINUMAN - COFFEE
  { id: 'c1', name: 'Espresso', price: 15000, category: 'Minuman', subcategory: 'Coffee', image: '☕' },
  { id: 'c2', name: 'Cafe Latte', price: 25000, category: 'Minuman', subcategory: 'Latte', image: '🥛☕' },
  { id: 'c3', name: 'Cappuccino', price: 25000, category: 'Minuman', subcategory: 'Coffee', image: '☁️☕' },
  { id: 'c4', name: 'Caramel Macchiato', price: 28000, category: 'Minuman', subcategory: 'Coffee', image: '🍯☕' },
  { id: 'c5', name: 'Americano', price: 20000, category: 'Minuman', subcategory: 'Coffee', image: '☕❄️' },
  
  // MINUMAN - LATTE (NON-COFFEE)
  { id: 'nc1', name: 'Matcha Latte', price: 26000, category: 'Minuman', subcategory: 'Latte', image: '🍵' },
  { id: 'nc2', name: 'Taro Latte', price: 24000, category: 'Minuman', subcategory: 'Latte', image: '🍠' },
  
  // MINUMAN - TEA
  { id: 't1', name: 'Iced Lemon Tea', price: 18000, category: 'Minuman', subcategory: 'Tea', image: '🍋' },
  { id: 't2', name: 'Lychee Tea', price: 22000, category: 'Minuman', subcategory: 'Tea', image: '🍹' },
  
  // MINUMAN - DLL
  { id: 'd1', name: 'Signature Chocolate', price: 24000, category: 'Minuman', subcategory: 'Dll', image: '🍫' },
  { id: 'd2', name: 'Mineral Water', price: 6000, category: 'Minuman', subcategory: 'Dll', image: '💧' },
  
  // MAKANAN
  { id: 'f1', name: 'Butter Croissant', price: 20000, category: 'Makanan', subcategory: null, image: '🥐' },
  { id: 'f2', name: 'Cinnamon Roll', price: 22000, category: 'Makanan', subcategory: null, image: '🌀' },
  { id: 'f3', name: 'French Fries', price: 18000, category: 'Makanan', subcategory: null, image: '🍟' },
  { id: 'f4', name: 'Club Sandwich', price: 28000, category: 'Makanan', subcategory: null, image: '🥪' },
  
  // LAIN-LAIN
  { id: 'l1', name: 'Coffee Beans House Blend 250g', price: 85000, category: 'Lain-lain', subcategory: null, image: '🫘' },
  { id: 'l2', name: 'Sanak Tumbler Premium', price: 120000, category: 'Lain-lain', subcategory: null, image: '🥤' },
  { id: 'l3', name: 'Sanak Sticker Pack', price: 10000, category: 'Lain-lain', subcategory: null, image: '🏷️' }
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
