import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';

export default function MenuGrid({ menuItems, addToCart }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMainCategory, setSelectedMainCategory] = useState('Minuman');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');

  const mainCategories = ['Minuman', 'Makanan', 'Lain-lain'];
  const beverageSubcategories = ['All', 'Coffee', 'Tea', 'Lainnya'];

  // Melakukan filtering bertingkat berdasarkan kategori utama, subkategori, dan pencarian
  const filteredItems = useMemo(() => {
    return menuItems.filter(item => {
      // 1. Cek Kategori Utama
      const matchesMainCategory = item.category === selectedMainCategory;
      if (!matchesMainCategory) return false;

      // 2. Cek Subkategori jika Kategori Utama adalah Minuman
      let matchesSubCategory = true;
      if (selectedMainCategory === 'Minuman' && selectedSubCategory !== 'All') {
        matchesSubCategory = item.subcategory === selectedSubCategory;
      }

      // 3. Cek Pencarian Nama
      const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSubCategory && matchesSearch;
    });
  }, [menuItems, selectedMainCategory, selectedSubCategory, searchQuery]);

  const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0
    }).format(number);
  };

  const handleMainCategoryChange = (cat) => {
    setSelectedMainCategory(cat);
    setSelectedSubCategory('All'); // Reset subkategori saat kategori utama diganti
  };

  return (
    <div className="left-panel">
      {/* Search & Filter Kategori */}
      <div className="search-filter-section">

        {/* Input Pencarian */}
        <div className="search-bar">
          <Search size={20} className="text-muted" />
          <input
            type="text"
            placeholder={`Cari di kategori ${selectedMainCategory.toLowerCase()}...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Kategori Utama */}
        <div className="categories-container">
          {mainCategories.map(category => (
            <button
              key={category}
              className={`category-chip ${selectedMainCategory === category ? 'active' : ''}`}
              onClick={() => handleMainCategoryChange(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Subkategori Khusus Minuman */}
      {selectedMainCategory === 'Minuman' && (
        <div className="subcategory-container">
          {beverageSubcategories.map(subCat => (
            <button
              key={subCat}
              className={`subcategory-chip ${selectedSubCategory === subCat ? 'active' : ''}`}
              onClick={() => setSelectedSubCategory(subCat)}
            >
              {subCat === 'All' ? 'Semua Minuman' : subCat}
            </button>
          ))}
        </div>
      )}

      {/* Grid Katalog Produk */}
      <div className="items-grid-container">
        {filteredItems.length === 0 ? (
          <div className="empty-cart-state" style={{ padding: '40px 0' }}>
            <span className="empty-cart-icon">☕</span>
            <p>Menu tidak ditemukan di kategori {selectedMainCategory}.</p>
          </div>
        ) : (
          <div className="items-grid">
            {filteredItems.map(item => (
              <div
                key={item.id}
                className="menu-card"
                onClick={() => addToCart(item)}
              >
                {item.subcategory && (
                  <span className="menu-card-category">{item.subcategory}</span>
                )}
                <div className="menu-card-image" style={item.image && item.image.startsWith('data:image') ? { overflow: 'hidden', padding: 0 } : {}}>
                  {item.image && item.image.startsWith('data:image') ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    item.image
                  )}
                </div>
                <h4 className="menu-card-name">{item.name}</h4>
                <span className="menu-card-price">{formatRupiah(item.price)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
