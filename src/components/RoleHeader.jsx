import React from 'react';
import { ShoppingBag, Grid, BarChart3, LogOut } from 'lucide-react';

export default function RoleHeader({ loggedInUser, onLogout, activeTab, setActiveTab }) {
  const roleName = loggedInUser?.role === 'admin' ? 'Owner / Admin' : 'Staf Kasir';
  const roleEmoji = loggedInUser?.role === 'admin' ? '👑' : '🧑‍🍳';

  return (
    <header className="app-header">
      {/* Kiri: Logo & Nama Kedai */}
      <div className="brand-section">
        <span className="brand-logo">☕</span>
        <div>
          <h1 className="brand-name" style={{ fontSize: '18px' }}>Kedai Kopi Q'Yat</h1>
        </div>
      </div>

      {/* Tengah/Kanan: Navigasi Tab Terotorisasi & Profil */}
      <div className="header-actions">
        
        {/* Navigasi Tab */}
        <nav className="tab-nav">
          <button 
            className={`tab-btn ${activeTab === 'kasir' ? 'active' : ''}`}
            onClick={() => setActiveTab('kasir')}
          >
            <ShoppingBag size={16} />
            Kasir
          </button>
          <button 
            className={`tab-btn ${activeTab === 'meja' ? 'active' : ''}`}
            onClick={() => setActiveTab('meja')}
          >
            <Grid size={16} />
            Nota Meja
          </button>
          
          {loggedInUser?.role === 'admin' && (
            <button 
              className={`tab-btn ${activeTab === 'laporan' ? 'active' : ''}`}
              onClick={() => setActiveTab('laporan')}
            >
              <BarChart3 size={16} />
              Admin
            </button>
          )}
        </nav>

        {/* Profil Pengguna Aktif & Logout */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '14px', fontWeight: '800', color: 'var(--text-primary)' }}>
              {roleEmoji} {loggedInUser?.name}
            </span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {roleName}
            </span>
          </div>

          <button 
            className="logout-btn"
            onClick={onLogout}
            title="Keluar dari Aplikasi"
          >
            <LogOut size={15} />
            Keluar
          </button>
        </div>

      </div>
    </header>
  );
}
