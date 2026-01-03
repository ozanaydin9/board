import { useState } from 'react';
import '../styles/modal.css';

/**
 * SettingsModal Component
 * Kullanıcı ayarları modalı
 */
function SettingsModal({ isOpen, currentStarCount, onSave, onCancel }) {
  const [starCount, setStarCount] = useState(currentStarCount || 5);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave({ star_count: starCount });
    setSaving(false);
  };

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">⚙️ Ayarlar</h3>
        </div>
        
        <div className="modal-body">
          <div className="settings-section">
            <label className="settings-label">Öncelik Yıldız Sayısı</label>
            <p className="settings-description">
              Kartlarda kaç yıldızlı öncelik sistemi kullanmak istersiniz?
            </p>
            
            <div className="star-count-options">
              <button
                className={`star-count-option ${starCount === 3 ? 'active' : ''}`}
                onClick={() => setStarCount(3)}
              >
                <div className="option-stars">
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                </div>
                <span className="option-label">3 Yıldız</span>
                <span className="option-desc">Basit sistem</span>
              </button>
              
              <button
                className={`star-count-option ${starCount === 5 ? 'active' : ''}`}
                onClick={() => setStarCount(5)}
              >
                <div className="option-stars">
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                  <span className="star filled">★</span>
                </div>
                <span className="option-label">5 Yıldız</span>
                <span className="option-desc">Detaylı sistem</span>
              </button>
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onCancel} 
            className="modal-button modal-button-secondary"
            disabled={saving}
          >
            İptal
          </button>
          <button 
            onClick={handleSave} 
            className="modal-button modal-confirm"
            disabled={saving}
          >
            {saving ? 'Kaydediliyor...' : 'Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SettingsModal;

