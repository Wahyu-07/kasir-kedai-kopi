import React, { useState } from 'react';
import { 
  TrendingUp, 
  Coffee, 
  Grid, 
  Database, 
  Trash2, 
  Plus, 
  Download, 
  Upload, 
  FileText, 
  RefreshCw,
  Printer
} from 'lucide-react';
import { localDb } from '../db/localDb';

export default function AdminPanel({ 
  menuItems, 
  setMenuItems, 
  tables, 
  setTables, 
  transactions, 
  setTransactions, 
  onResetDb 
}) {
  const [adminTab, setAdminTab] = useState('laporan');
  
  // States untuk form Menu
  const [menuFormName, setMenuFormName] = useState('');
  const [menuFormPrice, setMenuFormPrice] = useState('');
  const [menuFormCategory, setMenuFormCategory] = useState('Minuman');
  const [menuFormSubcategory, setMenuFormSubcategory] = useState('Coffee');
  const [imageSourceType, setImageSourceType] = useState('emoji'); // 'emoji' | 'upload'
  const [menuFormEmoji, setMenuFormEmoji] = useState('☕');
  const [menuFormImage, setMenuFormImage] = useState(''); // Base64 string
  const [editingMenuId, setEditingMenuId] = useState(null);

  // States untuk form Meja
  const [tableFormNumber, setTableFormNumber] = useState('');

  // Hitung statistik dashboard
  const todayRevenue = transactions.reduce((sum, tx) => sum + tx.total, 0);
  const totalTxCount = transactions.length;
  const bestSeller = React.useMemo(() => {
    if (transactions.length === 0) return 'Belum ada data';
    const counts = {};
    transactions.forEach(tx => {
      tx.items.forEach(item => {
        counts[item.name] = (counts[item.name] || 0) + item.quantity;
      });
    });
    let maxQty = 0;
    let maxName = 'Belum ada data';
    Object.entries(counts).forEach(([name, qty]) => {
      if (qty > maxQty) {
        maxQty = qty;
        maxName = name;
      }
    });
    return `${maxName} (${maxQty} cup)`;
  }, [transactions]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  // --- COMPRESS IMAGE TO BASE64 (Opsi 1) ---
  const handleImageFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 150;
        const MAX_HEIGHT = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Kompresi ke JPEG dengan kualitas 70%
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setMenuFormImage(compressedBase64);
      };
    };
    reader.readAsDataURL(file);
  };

  // --- CRUD MENU ACTIONS ---
  const handleSaveMenu = (e) => {
    e.preventDefault();
    if (!menuFormName || !menuFormPrice) return;

    const finalImage = imageSourceType === 'emoji' ? menuFormEmoji : (menuFormImage || '☕');
    const finalSubcategory = menuFormCategory === 'Minuman' ? menuFormSubcategory : null;

    let updatedMenu = [...menuItems];
    if (editingMenuId) {
      updatedMenu = updatedMenu.map(item => 
        item.id === editingMenuId 
          ? { 
              ...item, 
              name: menuFormName, 
              price: parseFloat(menuFormPrice), 
              category: menuFormCategory,
              subcategory: finalSubcategory,
              image: finalImage
            }
          : item
      );
      setEditingMenuId(null);
    } else {
      const newItem = {
        id: 'c-' + Date.now(),
        name: menuFormName,
        price: parseFloat(menuFormPrice),
        category: menuFormCategory,
        subcategory: finalSubcategory,
        image: finalImage
      };
      updatedMenu.push(newItem);
    }

    setMenuItems(updatedMenu);
    localDb.saveMenu(updatedMenu);
    
    // Reset Form
    setMenuFormName('');
    setMenuFormPrice('');
    setMenuFormCategory('Minuman');
    setMenuFormSubcategory('Coffee');
    setImageSourceType('emoji');
    setMenuFormEmoji('☕');
    setMenuFormImage('');
  };

  const handleEditMenuInit = (item) => {
    setEditingMenuId(item.id);
    setMenuFormName(item.name);
    setMenuFormPrice(item.price.toString());
    setMenuFormCategory(item.category);
    setMenuFormSubcategory(item.subcategory || 'Coffee');

    const isUploadedImage = item.image && item.image.startsWith('data:image');
    if (isUploadedImage) {
      setImageSourceType('upload');
      setMenuFormImage(item.image);
    } else {
      setImageSourceType('emoji');
      setMenuFormEmoji(item.image || '☕');
      setMenuFormImage('');
    }
  };

  const handleDeleteMenu = (id) => {
    if (window.confirm('Hapus menu ini dari daftar kasir?')) {
      const updatedMenu = menuItems.filter(item => item.id !== id);
      setMenuItems(updatedMenu);
      localDb.saveMenu(updatedMenu);
    }
  };

  // --- CRUD MEJA ACTIONS ---
  const handleAddTable = (e) => {
    e.preventDefault();
    if (!tableFormNumber) return;

    // Check duplicate
    const exists = tables.some(t => t.number.toLowerCase() === tableFormNumber.toLowerCase());
    if (exists) {
      alert('Nama/Nomor meja sudah terdaftar!');
      return;
    }

    const newTable = {
      id: 't-' + Date.now(),
      number: tableFormNumber.startsWith('Meja') ? tableFormNumber : `Meja ${tableFormNumber}`,
      status: 'available',
      activeOrderId: null
    };

    const updatedTables = [...tables, newTable].sort((a, b) => a.number.localeCompare(b.number));
    setTables(updatedTables);
    localDb.saveTables(updatedTables);
    setTableFormNumber('');
  };

  const handleDeleteTable = (id) => {
    const table = tables.find(t => t.id === id);
    if (table.status === 'occupied') {
      alert('Meja sedang terisi pesanan! Selesaikan pesanan dahulu sebelum menghapus.');
      return;
    }
    if (window.confirm(`Hapus ${table.number} dari denah?`)) {
      const updatedTables = tables.filter(t => t.id !== id);
      setTables(updatedTables);
      localDb.saveTables(updatedTables);
    }
  };

  // --- DATABASE EXPORT / IMPORT ---
  const handleExportData = () => {
    const backupJson = localDb.exportBackup();
    const dataStr = "data:text/plain;charset=utf-8," + encodeURIComponent(backupJson);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Kopi_Sanak_Backup_${new Date().toISOString().slice(0, 10)}.txt`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e) => {
    const fileReader = new FileReader();
    const file = e.target.files[0];
    if (!file) return;

    fileReader.onload = (event) => {
      const result = localDb.importBackup(event.target.result);
      if (result.success) {
        alert('Data berhasil di-import! Halaman akan dimuat ulang.');
        window.location.reload();
      } else {
        alert('Gagal mengimpor data: ' + result.error);
      }
    };
    fileReader.readAsText(file);
  };

  const handleResetApp = () => {
    if (window.confirm('PERINGATAN: Semua data penjualan, menu kustom, dan meja akan dihapus permanen! Apakah Anda ingin mereset aplikasi?')) {
      onResetDb();
      alert('Database berhasil direset.');
    }
  };

  return (
    <div className="admin-view">
      {/* Dashboard Stats */}
      <div className="admin-dashboard-cards">
        <div className="admin-card">
          <div className="admin-card-icon">
            <TrendingUp size={28} />
          </div>
          <div className="admin-card-content">
            <span className="admin-card-label">Total Omzet Hari Ini</span>
            <span className="admin-card-value">{formatRupiah(todayRevenue)}</span>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-icon">
            <FileText size={28} />
          </div>
          <div className="admin-card-content">
            <span className="admin-card-label">Jumlah Transaksi</span>
            <span className="admin-card-value">{totalTxCount} Nota</span>
          </div>
        </div>
        <div className="admin-card">
          <div className="admin-card-icon">
            <Coffee size={28} />
          </div>
          <div className="admin-card-content">
            <span className="admin-card-label">Menu Terlaris</span>
            <span className="admin-card-value" style={{ fontSize: '18px' }}>{bestSeller}</span>
          </div>
        </div>
      </div>

      {/* Admin Panel Internal Tabs */}
      <div className="search-filter-section" style={{ padding: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', marginBottom: '24px' }}>
        <div className="categories-container">
          <button 
            className={`category-chip ${adminTab === 'laporan' ? 'active' : ''}`}
            onClick={() => setAdminTab('laporan')}
          >
            <FileText size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Laporan Penjualan
          </button>
          <button 
            className={`category-chip ${adminTab === 'menu' ? 'active' : ''}`}
            onClick={() => setAdminTab('menu')}
          >
            <Coffee size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Kelola Menu Kopi
          </button>
          <button 
            className={`category-chip ${adminTab === 'meja' ? 'active' : ''}`}
            onClick={() => setAdminTab('meja')}
          >
            <Grid size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Kelola Nomor Meja
          </button>
          <button 
            className={`category-chip ${adminTab === 'sistem' ? 'active' : ''}`}
            onClick={() => setAdminTab('sistem')}
          >
            <Database size={16} style={{ marginRight: '6px', verticalAlign: 'middle' }} />
            Pengaturan Database
          </button>
        </div>
      </div>

      {/* --- TAB CONTENT: LAPORAN PENJUALAN --- */}
      {adminTab === 'laporan' && (
        <div className="admin-section-box full-width">
          <div className="admin-section-header">
            <h3>Riwayat Transaksi Harian</h3>
            <span className="text-muted" style={{ fontSize: '13px' }}>Semua transaksi disimpan secara lokal di tablet ini</span>
          </div>

          {transactions.length === 0 ? (
            <div className="empty-cart-state" style={{ padding: '40px 0' }}>
              <span className="empty-cart-icon">📊</span>
              <p>Belum ada transaksi hari ini.<br />Mulai lakukan transaksi di Kasir.</p>
            </div>
          ) : (
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nota ID</th>
                    <th>Waktu</th>
                    <th>Tipe</th>
                    <th>Item Pesanan</th>
                    <th>Total</th>
                    <th>Tunai / Kembali</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td style={{ fontWeight: 'bold', color: 'var(--accent-coffee)' }}>{tx.id}</td>
                      <td>{new Date(tx.timestamp).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</td>
                      <td>{tx.orderType.toUpperCase()} {tx.tableNumber !== 'Takeaway' ? `(${tx.tableNumber})` : ''}</td>
                      <td>
                        {tx.items.map((it, idx) => (
                          <div key={idx} style={{ fontSize: '13px' }}>
                            {it.quantity}x {it.name} {it.notes ? `[${it.notes}]` : ''}
                          </div>
                        ))}
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatRupiah(tx.total)}</td>
                      <td style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        Tunai: {formatRupiah(tx.cash)}<br />Kembali: {formatRupiah(tx.change)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* --- TAB CONTENT: KELOLA MENU --- */}
      {adminTab === 'menu' && (
        <div className="admin-sections-grid">
          {/* Form Tambah/Edit Menu */}
          <div className="admin-section-box">
            <h3 className="admin-section-header">
              {editingMenuId ? 'Edit Menu Kopi/Makanan' : 'Tambah Menu Baru'}
            </h3>
            <form className="admin-form" onSubmit={handleSaveMenu}>
              <div className="form-group">
                <label>Nama Produk</label>
                <input 
                  type="text" 
                  placeholder="Misal: Cappuccino Iced, Avocado Coffee" 
                  value={menuFormName}
                  onChange={(e) => setMenuFormName(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Harga (Rupiah)</label>
                  <input 
                    type="number" 
                    placeholder="25000" 
                    value={menuFormPrice}
                    onChange={(e) => setMenuFormPrice(e.target.value)}
                    step="1000"
                    min="0"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label>Kategori Utama</label>
                  <select 
                    value={menuFormCategory}
                    onChange={(e) => {
                      setMenuFormCategory(e.target.value);
                      if (e.target.value !== 'Minuman') {
                        setMenuFormSubcategory('Coffee'); // Reset subkategori
                      }
                    }}
                  >
                    <option value="Minuman">Minuman</option>
                    <option value="Makanan">Makanan</option>
                    <option value="Lain-lain">Lain-lain</option>
                  </select>
                </div>
              </div>

              {/* Subkategori Khusus Minuman */}
              {menuFormCategory === 'Minuman' && (
                <div className="form-group">
                  <label>Subkategori Minuman</label>
                  <select 
                    value={menuFormSubcategory}
                    onChange={(e) => setMenuFormSubcategory(e.target.value)}
                  >
                    <option value="Coffee">Coffee</option>
                    <option value="Latte">Latte</option>
                    <option value="Tea">Tea</option>
                    <option value="Dll">Dll</option>
                  </select>
                </div>
              )}

              {/* Pilihan Sumber Gambar (Emoji atau File PNG/JPG) */}
              <div className="form-group">
                <label>Sumber Visual Menu</label>
                <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
                  <button
                    type="button"
                    className={`btn ${imageSourceType === 'emoji' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 12px', fontSize: '13px', flex: 1 }}
                    onClick={() => setImageSourceType('emoji')}
                  >
                    Gunakan Emoji
                  </button>
                  <button
                    type="button"
                    className={`btn ${imageSourceType === 'upload' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '8px 12px', fontSize: '13px', flex: 1 }}
                    onClick={() => setImageSourceType('upload')}
                  >
                    Unggah Gambar
                  </button>
                </div>

                {imageSourceType === 'emoji' ? (
                  <div>
                    <select 
                      value={menuFormEmoji}
                      onChange={(e) => setMenuFormEmoji(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <option value="☕">☕ Kopi / Hot Drink</option>
                      <option value="🥛☕">🥛☕ Latte / White Coffee</option>
                      <option value="☁️☕">☁️☕ Cappuccino / Foam</option>
                      <option value="🍯☕">🍯☕ Sweet Macchiato / Caramel</option>
                      <option value="🍵">🍵 Matcha / Green Tea</option>
                      <option value="🍫">🍫 Chocolate / Cokelat</option>
                      <option value="🍋">🍋 Iced Lemon Tea / Buah</option>
                      <option value="🥤">🥤 Cold Drink Bottle / Soda</option>
                      <option value="🥐">🥐 Croissant / Pastry</option>
                      <option value="🌀">🌀 Cinnamon Roll / Roti</option>
                      <option value="🍟">🍟 French Fries / Kentang</option>
                      <option value="🥪">🥪 Sandwich / Roti Panggang</option>
                      <option value="🍰">🍰 Cake / Dessert</option>
                      <option value="🫘">🫘 Biji Kopi / Beans</option>
                    </select>
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ flex: 1 }}>
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageFileChange}
                        style={{ padding: '8px', width: '100%' }}
                      />
                    </div>
                    {menuFormImage && (
                      <div style={{ width: '48px', height: '48px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border-color)', flexShrink: 0 }}>
                        <img 
                          src={menuFormImage} 
                          alt="Preview" 
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
                  <Plus size={16} /> {editingMenuId ? 'Simpan Perubahan' : 'Tambahkan Menu'}
                </button>
                {editingMenuId && (
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => {
                      setEditingMenuId(null);
                      setMenuFormName('');
                      setMenuFormPrice('');
                      setMenuFormCategory('Minuman');
                      setMenuFormSubcategory('Coffee');
                      setImageSourceType('emoji');
                      setMenuFormEmoji('☕');
                      setMenuFormImage('');
                    }}
                  >
                    Batal
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Daftar Item Menu */}
          <div className="admin-section-box">
            <h3>Daftar Menu Kasir</h3>
            <div className="admin-table-container" style={{ maxHeight: '420px', overflowY: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Ikon</th>
                    <th>Nama Menu</th>
                    <th>Harga</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {menuItems.map(item => (
                    <tr key={item.id}>
                      <td>
                        {item.image && item.image.startsWith('data:image') ? (
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                            />
                          </div>
                        ) : (
                          <span style={{ fontSize: '24px' }}>{item.image}</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontWeight: 'bold' }}>{item.name}</span>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                          {item.category} {item.subcategory ? `> ${item.subcategory}` : ''}
                        </div>
                      </td>
                      <td style={{ fontWeight: 'bold' }}>{formatRupiah(item.price)}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '6px 8px', borderRadius: '6px' }}
                            onClick={() => handleEditMenuInit(item)}
                          >
                            Edit
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '6px 8px', borderRadius: '6px' }}
                            onClick={() => handleDeleteMenu(item.id)}
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: KELOLA MEJA --- */}
      {adminTab === 'meja' && (
        <div className="admin-sections-grid" style={{ gridTemplateColumns: '1fr 1.5fr' }}>
          {/* Form Tambah Meja */}
          <div className="admin-section-box">
            <h3>Tambah Meja</h3>
            <form className="admin-form" onSubmit={handleAddTable}>
              <div className="form-group">
                <label>Nomor Meja</label>
                <input 
                  type="text" 
                  placeholder="Misal: 09, VIP 01" 
                  value={tableFormNumber}
                  onChange={(e) => setTableFormNumber(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
                <Plus size={16} /> Daftarkan Meja
              </button>
            </form>
          </div>

          {/* Daftar Meja */}
          <div className="admin-section-box">
            <h3>Layout Meja Terdaftar</h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Nomor Meja</th>
                    <th>Status Saat Ini</th>
                    <th style={{ textAlign: 'right' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {tables.map(table => (
                    <tr key={table.id}>
                      <td style={{ fontWeight: 'bold' }}>{table.number}</td>
                      <td>
                        <span className={`table-status-pill ${table.status}`} style={{ fontSize: '10px' }}>
                          {table.status === 'occupied' ? 'Terisi' : 'Kosong'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '6px 8px', borderRadius: '6px' }}
                          onClick={() => handleDeleteTable(table.id)}
                        >
                          <Trash2 size={12} /> Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* --- TAB CONTENT: SISTEM & BACKUP --- */}
      {adminTab === 'sistem' && (
        <div className="admin-sections-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
          <div className="admin-section-box backup-section-box">
            <h3>Ekspor & Impor Data</h3>
            <p className="backup-description">
              Gunakan fitur ini untuk mencadangkan (backup) seluruh data menu kustom, tata letak meja, dan riwayat transaksi kasir ke bentuk berkas JSON. Berkas ini dapat dipulihkan kapan saja jika browser tablet Anda terhapus cache-nya.
            </p>
            <div className="backup-buttons-row">
              <button className="btn btn-primary" style={{ flex: 1 }} onClick={handleExportData}>
                <Download size={16} /> Ekspor Data JSON
              </button>
            </div>
            
            <div className="receipt-divider" style={{ margin: '10px 0' }}></div>

            <label className="btn btn-secondary" style={{ width: '100%', cursor: 'pointer' }}>
              <Upload size={16} /> Unggah & Pulihkan Data
              <input 
                type="file" 
                accept=".txt,.json" 
                onChange={handleImportData} 
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <div className="admin-section-box" style={{ borderColor: 'var(--color-danger)' }}>
            <h3 style={{ color: 'var(--color-danger)' }}>Zona Bahaya (Danger Zone)</h3>
            <p className="backup-description">
              Tindakan di bawah ini bersifat merusak data. Pastikan Anda mengerti apa yang Anda lakukan sebelum menekan tombol.
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '10px' }}>
              <button className="btn btn-danger" style={{ width: '100%' }} onClick={handleResetApp}>
                <RefreshCw size={16} /> Reset Semua Database
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
