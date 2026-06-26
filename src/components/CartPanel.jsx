import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Minus, Trash2, Printer, X, CreditCard } from 'lucide-react';

export default function CartPanel({ 
  cart, 
  updateCartQty, 
  updateCartNote, 
  clearCart, 
  menuItems, 
  orderType, 
  setOrderType, 
  selectedTable, 
  setSelectedTable, 
  checkoutTransaction,
  saveCartToTable
}) {
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [cashAmount, setCashAmount] = useState('');
  const [receiptTx, setReceiptTx] = useState(null); // Menyimpan tx untuk struk setelah sukses bayar
  
  // Hitung subtotal
  const subtotal = cart.reduce((acc, cartItem) => {
    const item = menuItems.find(m => m.id === cartItem.menuId);
    return acc + (item ? item.price * cartItem.quantity : 0);
  }, 0);

  // Pajak PB1 (10% makanan & minuman)
  const tax = Math.round(subtotal * 0.1);
  const total = subtotal + tax;

  // Nilai kembalian
  const parsedCash = parseFloat(cashAmount) || 0;
  const change = parsedCash - total;

  // Cepat isi uang cash
  const handleQuickCash = (amount) => {
    if (amount === 'pas') {
      setCashAmount(total.toString());
    } else {
      setCashAmount(amount.toString());
    }
  };

  // Reset form pembayaran
  const openPaymentModal = () => {
    setCashAmount('');
    setIsPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
  };

  const handlePaymentConfirm = () => {
    if (change < 0) return;

    // Susun objek transaksi
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

    const tx = {
      orderType,
      tableNumber: orderType === 'dine-in' ? selectedTable?.number : 'Takeaway',
      tableId: orderType === 'dine-in' ? selectedTable?.id : null,
      items,
      subtotal,
      tax,
      total,
      cash: parsedCash,
      change
    };

    const savedTx = checkoutTransaction(tx);
    setReceiptTx(savedTx);
    setIsPaymentModalOpen(false);
  };

  const handleReceiptClose = () => {
    setReceiptTx(null);
    clearCart();
    setSelectedTable(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  return (
    <div className="right-panel">
      {/* Header Keranjang */}
      <div className="cart-header">
        <h3 className="cart-title">
          <ShoppingBag size={20} className="text-secondary" />
          Pesanan Aktif
        </h3>
        {cart.length > 0 && (
          <button className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '13px' }} onClick={clearCart}>
            <Trash2 size={14} /> Bersihkan
          </button>
        )}
      </div>

      {/* Toggle Dine-in vs Takeaway */}
      <div className="order-type-tabs">
        <button 
          className={`order-type-btn ${orderType === 'dine-in' ? 'active' : ''}`}
          onClick={() => setOrderType('dine-in')}
        >
          Dine-In (Di Tempat)
        </button>
        <button 
          className={`order-type-btn ${orderType === 'takeaway' ? 'active' : ''}`}
          onClick={() => {
            setOrderType('takeaway');
            setSelectedTable(null);
          }}
        >
          Takeaway
        </button>
      </div>

      {/* Info Meja (Jika Dine-In) */}
      {orderType === 'dine-in' && (
        <div className="table-selection-row">
          <span>Meja Layanan</span>
          {selectedTable ? (
            <span className="table-badge">{selectedTable.number}</span>
          ) : (
            <span className="table-badge none">Pilih Meja di Tab Meja</span>
          )}
        </div>
      )}

      {/* Daftar Item Belanja */}
      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart-state">
            <span className="empty-cart-icon">🛒</span>
            <p>Keranjang kosong.<br />Pilih menu di samping kiri.</p>
          </div>
        ) : (
          cart.map(cartItem => {
            const item = menuItems.find(m => m.id === cartItem.menuId);
            if (!item) return null;
            return (
              <div key={cartItem.menuId} className="cart-item">
                <div className="cart-item-main">
                  <div className="cart-item-info">
                    <span className="cart-item-name">{item.name}</span>
                    <div className="cart-item-price">{formatRupiah(item.price)}</div>
                  </div>
                  <div className="cart-item-controls">
                    <button className="quantity-btn" onClick={() => updateCartQty(cartItem.menuId, -1)}>
                      <Minus size={14} />
                    </button>
                    <span className="cart-item-qty">{cartItem.quantity}</span>
                    <button className="quantity-btn" onClick={() => updateCartQty(cartItem.menuId, 1)}>
                      <Plus size={14} />
                    </button>
                  </div>
                </div>
                
                {/* Catatan / Custom Modifier */}
                <div className="cart-item-note-row">
                  <input 
                    type="text" 
                    placeholder="Tambah catatan (Ice, Less Sugar, Extra Shot...)" 
                    value={cartItem.notes || ''}
                    onChange={(e) => updateCartNote(cartItem.menuId, e.target.value)}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Ringkasan & Tombol Bayar */}
      {cart.length > 0 && (
        <div className="cart-summary">
          <div className="summary-row">
            <span>Subtotal</span>
            <span>{formatRupiah(subtotal)}</span>
          </div>
          <div className="summary-row">
            <span>Pajak (PB1 10%)</span>
            <span>{formatRupiah(tax)}</span>
          </div>
          <div className="summary-row total">
            <span>Total Tagihan</span>
            <span>{formatRupiah(total)}</span>
          </div>
          {orderType === 'dine-in' && selectedTable ? (
            <div style={{ display: 'flex', gap: '10px' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                style={{ flex: 1, borderColor: 'var(--color-warning)', color: 'var(--color-warning)' }}
                onClick={() => saveCartToTable()}
              >
                Simpan ke Meja
              </button>
              <button 
                type="button"
                className="btn btn-primary" 
                style={{ flex: 1 }}
                onClick={openPaymentModal}
              >
                <CreditCard size={16} /> Bayar
              </button>
            </div>
          ) : (
            <button 
              className="btn btn-primary checkout-btn" 
              onClick={openPaymentModal}
              disabled={orderType === 'dine-in' && !selectedTable}
            >
              <CreditCard size={18} />
              {orderType === 'dine-in' && !selectedTable 
                ? 'Pilih Nomor Meja Dahulu' 
                : 'Bayar Sekarang'
              }
            </button>
          )}
        </div>
      )}

      {/* MODAL PEMBAYARAN */}
      {isPaymentModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Pembayaran Kasir</h3>
              <button className="close-modal-btn" onClick={closePaymentModal}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="summary-row" style={{ fontSize: '16px', fontWeight: 'bold' }}>
                <span>Total Belanja:</span>
                <span className="text-primary">{formatRupiah(total)}</span>
              </div>

              {/* Input Uang Tunai */}
              <div className="payment-amount-row">
                <label>Uang Tunai Diterima</label>
                <div className="payment-input-container">
                  <span>Rp</span>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={cashAmount}
                    onChange={(e) => setCashAmount(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>

              {/* Tombol Uang Cepat */}
              <div className="payment-quick-cash">
                <button className="quick-cash-btn" onClick={() => handleQuickCash('pas')}>Uang Pas</button>
                <button className="quick-cash-btn" onClick={() => handleQuickCash(20000)}>20.000</button>
                <button className="quick-cash-btn" onClick={() => handleQuickCash(50000)}>50.000</button>
                <button className="quick-cash-btn" onClick={() => handleQuickCash(100000)}>100.000</button>
              </div>

              {/* Display Kembalian */}
              <div className={`change-display ${change >= 0 ? 'success' : 'danger'}`}>
                <span className="change-label">Kembalian:</span>
                <span className={`change-value ${change >= 0 ? 'success' : 'danger'}`}>
                  {change >= 0 ? formatRupiah(change) : `Kurang ${formatRupiah(Math.abs(change))}`}
                </span>
              </div>

              <button 
                className="btn btn-primary" 
                style={{ width: '100%', marginTop: '10px' }}
                disabled={change < 0}
                onClick={handlePaymentConfirm}
              >
                Konfirmasi Pembayaran
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL SIMULASI STRUK BELANJA */}
      {receiptTx && (
        <div className="modal-overlay receipt-modal-wrapper">
          <div className="modal-content" style={{ maxWidth: '380px', backgroundColor: '#e5e5e5', padding: '16px' }}>
            <div className="receipt-container">
              <div className="receipt-header">
                <span className="receipt-shop-name">Kopi Sanak</span>
                <div className="receipt-shop-sub">Jl. Raya Kopi Sejahtera, No. 88</div>
                <div className="receipt-meta">
                  <div>No: {receiptTx.id}</div>
                  <div>Tgl: {new Date(receiptTx.timestamp).toLocaleString('id-ID')}</div>
                  <div>Tipe: {receiptTx.orderType.toUpperCase()} {receiptTx.orderType === 'dine-in' ? `(${receiptTx.tableNumber})` : ''}</div>
                  <div>Kasir: Staff Kopi Sanak</div>
                </div>
              </div>

              {/* Daftar Item */}
              <div className="receipt-items-list">
                {receiptTx.items.map((item, idx) => (
                  <div key={idx} className="receipt-item">
                    <div className="receipt-item-main">
                      <span>{item.quantity}x {item.name}</span>
                      <span>{formatRupiah(item.price * item.quantity)}</span>
                    </div>
                    {item.notes && <div className="receipt-item-note">*{item.notes}</div>}
                  </div>
                ))}
              </div>

              <div className="receipt-totals">
                <div className="receipt-total-row">
                  <span>Subtotal</span>
                  <span>{formatRupiah(receiptTx.subtotal)}</span>
                </div>
                <div className="receipt-total-row">
                  <span>Pajak (PB1 10%)</span>
                  <span>{formatRupiah(receiptTx.tax)}</span>
                </div>
                <div className="receipt-total-row grand-total">
                  <span>TOTAL</span>
                  <span>{formatRupiah(receiptTx.total)}</span>
                </div>
                <div className="receipt-divider"></div>
                <div className="receipt-total-row">
                  <span>Uang Tunai</span>
                  <span>{formatRupiah(receiptTx.cash)}</span>
                </div>
                <div className="receipt-total-row">
                  <span>Kembalian</span>
                  <span>{formatRupiah(receiptTx.change)}</span>
                </div>
              </div>

              <div className="receipt-footer">
                <div>TERIMA KASIH</div>
                <div>Lapo Sanak, Ditunggu Datang Kembali!</div>
              </div>
            </div>

            {/* Tombol aksi struk */}
            <div className="close-receipt-btn-wrapper" style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button className="btn btn-secondary" style={{ flex: 1 }} onClick={handlePrint}>
                <Printer size={16} /> Cetak Struk
              </button>
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleReceiptClose}>
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
