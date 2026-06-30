import React, { useState, useEffect } from 'react';
import RoleHeader from './components/RoleHeader';
import MenuGrid from './components/MenuGrid';
import CartPanel from './components/CartPanel';
import TableLayout from './components/TableLayout';
import AdminPanel from './components/AdminPanel';
import LoginScreen from './components/LoginScreen';
import { localDb } from './db/localDb';

export default function App() {
  // Sesi Login State
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [activeTab, setActiveTab] = useState('kasir'); // 'kasir' | 'meja' | 'laporan'
  
  // Database States
  const [menuItems, setMenuItems] = useState([]);
  const [tables, setTables] = useState([]);
  const [transactions, setTransactions] = useState([]);
  
  // Cart & Order States
  const [cart, setCart] = useState([]);
  const [orderType, setOrderType] = useState('dine-in'); // 'dine-in' | 'takeaway'
  const [selectedTable, setSelectedTable] = useState(null);
  const [isMobileCartOpen, setIsMobileCartOpen] = useState(false);

  // Load awal data dari LocalStorage & cek Sesi Login
  useEffect(() => {
    setMenuItems(localDb.getMenu());
    setTables(localDb.getTables());
    setTransactions(localDb.getTransactions());

    // Periksa apakah ada sesi login yang tersimpan
    const savedSession = localStorage.getItem('kasir_kopi_session');
    if (savedSession) {
      setLoggedInUser(JSON.parse(savedSession));
    }
  }, []);

  // --- LOGIN & LOGOUT OPERATIONS ---
  const handleLogin = (role, name) => {
    const userSession = { role, name };
    setLoggedInUser(userSession);
    localStorage.setItem('kasir_kopi_session', JSON.stringify(userSession));
    setActiveTab('kasir');
  };

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin keluar (logout)?')) {
      setLoggedInUser(null);
      localStorage.removeItem('kasir_kopi_session');
      clearCart();
      setSelectedTable(null);
      setActiveTab('kasir');
    }
  };

  // --- CART OPERATIONS ---
  const addToCart = (item) => {
    setCart(prevCart => {
      const exists = prevCart.find(c => c.menuId === item.id);
      if (exists) {
        return prevCart.map(c => 
          c.menuId === item.id 
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }
      return [...prevCart, { menuId: item.id, quantity: 1, notes: '' }];
    });
  };

  const updateCartQty = (menuId, amount) => {
    setCart(prevCart => {
      return prevCart.map(c => {
        if (c.menuId === menuId) {
          const newQty = c.quantity + amount;
          return newQty <= 0 ? null : { ...c, quantity: newQty };
        }
        return c;
      }).filter(Boolean);
    });
  };

  const updateCartNote = (menuId, notes) => {
    setCart(prevCart => {
      return prevCart.map(c => 
        c.menuId === menuId 
          ? { ...c, notes }
          : c
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // --- TRANSACTION OPERATIONS ---
  const checkoutTransaction = (tx) => {
    const savedTx = localDb.saveTransaction(tx);
    
    // Jika tipe dine-in dan ada meja, kosongkan status meja tersebut
    if (tx.orderType === 'dine-in' && tx.tableId) {
      const updatedTables = tables.map(t => 
        t.id === tx.tableId 
          ? { ...t, status: 'available', activeOrder: null }
          : t
      );
      setTables(updatedTables);
      localDb.saveTables(updatedTables);
    }

    // Refresh transactions
    setTransactions(localDb.getTransactions());
    clearCart();
    setSelectedTable(null);
    return savedTx;
  };

  // --- DINE IN MEJA OPERATIONS ---
  const saveCartToTable = () => {
    if (!selectedTable || cart.length === 0) return;

    // Hitung total untuk disimpan di meja
    const subtotal = cart.reduce((acc, cartItem) => {
      const item = menuItems.find(m => m.id === cartItem.menuId);
      return acc + (item ? item.price * cartItem.quantity : 0);
    }, 0);
    const total = subtotal;

    const items = cart.map(cartItem => {
      const item = menuItems.find(m => m.id === cartItem.menuId);
      return {
        id: cartItem.menuId,
        name: item?.name || 'Unknown Item',
        price: item?.price || 0,
        quantity: cartItem.quantity,
        notes: cartItem.notes
      };
    });

    const activeOrder = {
      items,
      subtotal,
      total,
      savedAt: new Date().toISOString()
    };

    const updatedTables = tables.map(t => 
      t.id === selectedTable.id 
        ? { ...t, status: 'occupied', activeOrder }
        : t
    );

    setTables(updatedTables);
    localDb.saveTables(updatedTables);

    // Reset keranjang
    clearCart();
    setSelectedTable(null);
  };

  const loadTableOrderToCart = (table) => {
    if (!table.activeOrder) return;

    // Masukkan kembali data pesanan meja ke keranjang
    const loadedCart = table.activeOrder.items.map(item => ({
      menuId: item.id,
      quantity: item.quantity,
      notes: item.notes
    }));

    setCart(loadedCart);

    // Tandai meja sebagai "sementara kosong" karena sedang diedit di keranjang aktif kasir
    const updatedTables = tables.map(t => 
      t.id === table.id 
        ? { ...t, status: 'available', activeOrder: null }
        : t
    );
    setTables(updatedTables);
    localDb.saveTables(updatedTables);
  };

  const cancelTableOrder = (tableId) => {
    const updatedTables = tables.map(t => 
      t.id === tableId 
        ? { ...t, status: 'available', activeOrder: null }
        : t
    );
    setTables(updatedTables);
    localDb.saveTables(updatedTables);
    
    // Jika meja yang dibatalkan adalah meja aktif kasir saat ini, reset kasir
    if (selectedTable && selectedTable.id === tableId) {
      clearCart();
      setSelectedTable(null);
    }
  };

  const handleResetDb = () => {
    localDb.resetDatabase();
    setMenuItems(localDb.getMenu());
    setTables(localDb.getTables());
    setTransactions(localDb.getTransactions());
    clearCart();
    setSelectedTable(null);
    setOrderType('dine-in');
    setActiveTab('kasir');
  };

  // --- RENDER LOGIN JIKA BELUM LOGIN ---
  if (!loggedInUser) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  return (
    <div className="app-container">
      {/* Header Aplikasi & Toggle Role */}
      <RoleHeader 
        loggedInUser={loggedInUser}
        onLogout={handleLogout}
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
      />

      {/* Main Workspace */}
      <main className="main-content">
        {/* TAMPILAN 1: KASIR (ORDERING TAB) */}
        {activeTab === 'kasir' && (
          <>
            <MenuGrid 
              menuItems={menuItems} 
              addToCart={addToCart} 
            />
            <CartPanel 
              cart={cart}
              updateCartQty={updateCartQty}
              updateCartNote={updateCartNote}
              clearCart={clearCart}
              menuItems={menuItems}
              orderType={orderType}
              setOrderType={setOrderType}
              selectedTable={selectedTable}
              setSelectedTable={setSelectedTable}
              checkoutTransaction={checkoutTransaction}
              saveCartToTable={saveCartToTable}
              isMobileCartOpen={isMobileCartOpen}
              onCloseMobileCart={() => setIsMobileCartOpen(false)}
              tables={tables}
              loadTableOrderToCart={loadTableOrderToCart}
            />
          </>
        )}

        {/* TAMPILAN 2: TATA LETAK MEJA (TABLES TAB) */}
        {activeTab === 'meja' && (
          <TableLayout 
            tables={tables}
            setSelectedTable={setSelectedTable}
            setActiveTab={setActiveTab}
            setOrderType={setOrderType}
            loadTableOrderToCart={loadTableOrderToCart}
            cancelTableOrder={cancelTableOrder}
          />
        )}

        {/* TAMPILAN 3: ADMIN/OWNER DASHBOARD (ADMIN TAB - HANYA ADMIN) */}
        {activeTab === 'laporan' && loggedInUser.role === 'admin' && (
          <AdminPanel 
            menuItems={menuItems}
            setMenuItems={setMenuItems}
            tables={tables}
            setTables={setTables}
            transactions={transactions}
            setTransactions={setTransactions}
            onResetDb={handleResetDb}
          />
        )}
      </main>

      {/* Floating Cart Bar (Mobile Only) */}
      {activeTab === 'kasir' && cart.length > 0 && (
        <div className="floating-cart-bar" onClick={() => setIsMobileCartOpen(true)}>
          <div className="floating-cart-info">
            <span className="floating-cart-icon">🛒</span>
            <span className="floating-cart-qty">
              {cart.reduce((sum, item) => sum + item.quantity, 0)} Item
            </span>
            <span className="floating-cart-divider">|</span>
            <span className="floating-cart-total">
              {new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0
              }).format(
                Math.round(
                  cart.reduce((acc, cartItem) => {
                    const item = menuItems.find(m => m.id === cartItem.menuId);
                    return acc + (item ? item.price * cartItem.quantity : 0);
                  }, 0)
                )
              )}
            </span>
          </div>
          <button className="floating-cart-btn" type="button">
            Lihat Struk
          </button>
        </div>
      )}
    </div>
  );
}
