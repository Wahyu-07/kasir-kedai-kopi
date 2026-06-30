import React, { useState } from 'react';
import { User, Shield } from 'lucide-react';

export default function LoginScreen({ onLogin }) {
  const [selectedRole, setSelectedRole] = useState('kasir'); // 'kasir' | 'admin'
  const [pin, setPin] = useState('');
  const [shake, setShake] = useState(false);
  const [errorMsg, setErrorMsg] = useState('Silakan masukkan PIN Anda');

  const handleKeyPress = (num) => {
    if (shake) return;
    setErrorMsg('Silakan masukkan PIN Anda');
    
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Jika sudah 4 angka, langsung validasi
      if (newPin.length === 4) {
        validatePin(newPin);
      }
    }
  };

  const handleBackspace = () => {
    if (pin.length > 0) {
      setPin(pin.slice(0, -1));
    }
  };

  const handleClear = () => {
    setPin('');
  };

  const validatePin = (inputPin) => {
    // Validasi PIN berdasarkan role yang dipilih
    if (selectedRole === 'admin' && inputPin === '9999') {
      onLogin('admin', 'Owner / Admin');
    } else if (selectedRole === 'kasir' && inputPin === '1111') {
      onLogin('kasir', 'Staf Kasir');
    } else {
      // Trigger shake animation & error
      setShake(true);
      setErrorMsg('PIN Salah! Silakan coba lagi');
      setTimeout(() => {
        setShake(false);
        setPin('');
      }, 400); // 400ms sesuai durasi animasi shake di CSS
    }
  };

  return (
    <div className="login-container">
      <div className={`login-card ${shake ? 'shake-element' : ''}`}>
        
        {/* Sisi Kiri: Branding Coffee Shop */}
        <div className="login-left">
          <div className="login-logo">☕</div>
          <h2 className="login-tagline">Kedai Kopi Q'Yat</h2>
          <p className="login-desc">
            Sistem Kasir Offline-First Kedai Kopi Q'Yat. Real-Time, Cepat, dan Handal.
          </p>
        </div>

        {/* Sisi Kanan: PIN Pad Login */}
        <div className="login-right">
          <h3 className="login-title">Pilih Profil & Masuk</h3>
          
          {/* Baris Pilihan Profil */}
          <div className="user-select-row">
            <button 
              className={`user-btn ${selectedRole === 'kasir' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('kasir');
                setPin('');
                setErrorMsg('Silakan masukkan PIN Anda');
              }}
            >
              <div className="user-btn-icon">🧑‍🍳</div>
              <span className="user-btn-name">Kasir</span>
            </button>
            
            <button 
              className={`user-btn ${selectedRole === 'admin' ? 'active' : ''}`}
              onClick={() => {
                setSelectedRole('admin');
                setPin('');
                setErrorMsg('Silakan masukkan PIN Anda');
              }}
            >
              <div className="user-btn-icon">👑</div>
              <span className="user-btn-name">Admin / Owner</span>
            </button>
          </div>

          {/* Indikator PIN Display */}
          <div className="pin-display-container">
            <div className="pin-dots">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className={`pin-dot ${i < pin.length ? 'filled' : ''}`} 
                />
              ))}
            </div>
            <div className={`pin-display-text ${errorMsg.includes('Salah') ? 'text-danger' : ''}`} style={{ fontWeight: errorMsg.includes('Salah') ? 'bold' : 'normal' }}>
              {errorMsg}
            </div>
          </div>

          {/* Virtual PIN Keypad */}
          <div className="pin-keypad">
            <button className="pin-key" onClick={() => handleKeyPress('1')}>1</button>
            <button className="pin-key" onClick={() => handleKeyPress('2')}>2</button>
            <button className="pin-key" onClick={() => handleKeyPress('3')}>3</button>
            
            <button className="pin-key" onClick={() => handleKeyPress('4')}>4</button>
            <button className="pin-key" onClick={() => handleKeyPress('5')}>5</button>
            <button className="pin-key" onClick={() => handleKeyPress('6')}>6</button>
            
            <button className="pin-key" onClick={() => handleKeyPress('7')}>7</button>
            <button className="pin-key" onClick={() => handleKeyPress('8')}>8</button>
            <button className="pin-key" onClick={() => handleKeyPress('9')}>9</button>
            
            <button className="pin-key special" onClick={handleClear}>BATAL</button>
            <button className="pin-key" onClick={() => handleKeyPress('0')}>0</button>
            <button className="pin-key special" onClick={handleBackspace}>HAPUS</button>
          </div>

          <div style={{ marginTop: '20px', fontSize: '11px', color: 'var(--text-muted)' }}>
            Kasir PIN: <span style={{ fontWeight: 'bold' }}>1111</span> | Admin PIN: <span style={{ fontWeight: 'bold' }}>9999</span>
          </div>
        </div>

      </div>
    </div>
  );
}
