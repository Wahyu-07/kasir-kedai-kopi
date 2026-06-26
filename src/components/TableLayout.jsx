import React, { useState } from 'react';
import { Coffee, Trash2, Edit3, X, ArrowRight } from 'lucide-react';

export default function TableLayout({ 
  tables, 
  setSelectedTable, 
  setActiveTab, 
  setOrderType, 
  loadTableOrderToCart, 
  cancelTableOrder 
}) {
  const [activeTableDetail, setActiveTableDetail] = useState(null);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleTableClick = (table) => {
    if (table.status === 'occupied') {
      // Jika terisi, tampilkan modal detail opsi tindakan
      setActiveTableDetail(table);
    } else {
      // Jika kosong, pilih meja ini, set dine-in, dan langsung buka tab Kasir
      setSelectedTable(table);
      setOrderType('dine-in');
      setActiveTab('kasir');
    }
  };

  const handleEditOrder = () => {
    if (!activeTableDetail) return;
    loadTableOrderToCart(activeTableDetail);
    setSelectedTable(activeTableDetail);
    setOrderType('dine-in');
    setActiveTab('kasir');
    setActiveTableDetail(null);
  };

  const handleCancelOrder = () => {
    if (!activeTableDetail) return;
    if (window.confirm(`Apakah Anda yakin ingin membatalkan pesanan untuk ${activeTableDetail.number}? Semua item yang belum dibayar akan dihapus.`)) {
      cancelTableOrder(activeTableDetail.id);
      setActiveTableDetail(null);
    }
  };

  return (
    <div className="tables-view">
      <div className="tables-header">
        <h2>Tata Letak Meja Kopi</h2>
        <p>Kelola pesanan Dine-In (Makan di tempat). Klik meja kosong untuk membuat pesanan baru, atau meja terisi untuk mengedit/membayar.</p>
      </div>

      <div className="tables-grid">
        {tables.map(table => {
          const hasOrder = table.status === 'occupied' && table.activeOrder;
          const orderTotal = hasOrder ? table.activeOrder.total : 0;
          const itemCount = hasOrder ? table.activeOrder.items.reduce((sum, i) => sum + i.quantity, 0) : 0;

          return (
            <div 
              key={table.id}
              className={`table-card ${table.status}`}
              onClick={() => handleTableClick(table)}
            >
              <div className="table-number">{table.number}</div>
              <span className="table-status-pill">
                {table.status === 'occupied' ? 'Terisi' : 'Kosong'}
              </span>

              {hasOrder && (
                <div className="table-order-desc">
                  <div>{itemCount} Item Terdaftar</div>
                  <div style={{ fontWeight: 'bold', color: 'var(--accent-coffee)', marginTop: '4px' }}>
                    {formatRupiah(orderTotal)}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL DETAI TATA LETAK MEJA TERISI */}
      {activeTableDetail && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px' }}>
            <div className="modal-header">
              <h3>Detail {activeTableDetail.number}</h3>
              <button className="close-modal-btn" onClick={() => setActiveTableDetail(null)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {activeTableDetail.activeOrder && (
                <div>
                  <h4 style={{ marginBottom: '10px', fontSize: '14px', color: 'var(--text-secondary)' }}>Item Pesanan Aktif:</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '20px' }}>
                    {activeTableDetail.activeOrder.items.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px' }}>
                        <span>{item.quantity}x {item.name} {item.notes ? `(${item.notes})` : ''}</span>
                        <span>{formatRupiah(item.price * item.quantity)}</span>
                      </div>
                    ))}
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 'bold', borderTop: '1px solid var(--border-color)', paddingTop: '10px', marginTop: '10px' }}>
                      <span>Total Tagihan (+Pajak 10%)</span>
                      <span style={{ color: 'var(--accent-coffee)' }}>
                        {formatRupiah(activeTableDetail.activeOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={handleEditOrder}>
                  <Edit3 size={16} /> Buka & Bayar di Kasir
                </button>
                <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleCancelOrder}>
                  <Trash2 size={16} /> Batalkan Pesanan Meja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
