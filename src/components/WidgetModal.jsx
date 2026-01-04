import { useState, useEffect } from 'react';
import IconPicker from './IconPicker';
import '../styles/modal.css';

const WIDGET_TYPES = [
  { value: 'total_cards', label: 'Toplam Kart Sayısı', icon: '📊', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'total_price', label: 'Toplam Değer', icon: '💰', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'high_priority', label: 'Yüksek Öncelikli', icon: '⭐', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'column_count', label: 'Kolon Sayısı', icon: '📋', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'column_cards', label: 'Kolonun Kart Sayısı', icon: '📝', needsColumn: true, needsCustomText: false, needsTarget: false },
  { value: 'column_total', label: 'Kolonun Toplam Fiyatı', icon: '💵', needsColumn: true, needsCustomText: false, needsTarget: false },
  { value: 'pinned_total', label: 'Pinli Kolonlar Toplamı', icon: '📌', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'average_price', label: 'Ortalama Fiyat', icon: '📈', needsColumn: false, needsCustomText: false, needsTarget: false },
  { value: 'custom_text', label: 'Özel Metin/Sayı', icon: '✏️', needsColumn: false, needsCustomText: true, needsTarget: false },
  { value: 'target_remaining', label: 'Hedef - Kolon Farkı', icon: '🎯', needsColumn: true, needsCustomText: false, needsTarget: true },
  { value: 'target_percentage', label: 'Hedef Yüzdesi', icon: '📊', needsColumn: true, needsCustomText: false, needsTarget: true },
];

const COLOR_THEMES = [
  { value: 'blue', label: 'Mavi', class: 'widget-blue', baseColor: '#3b82f6' },
  { value: 'green', label: 'Yeşil', class: 'widget-green', baseColor: '#22c55e' },
  { value: 'orange', label: 'Turuncu', class: 'widget-orange', baseColor: '#f97316' },
  { value: 'purple', label: 'Mor', class: 'widget-purple', baseColor: '#8b5cf6' },
  { value: 'red', label: 'Kırmızı', class: 'widget-red', baseColor: '#ef4444' },
  { value: 'yellow', label: 'Sarı', class: 'widget-yellow', baseColor: '#eab308' },
  { value: 'pink', label: 'Pembe', class: 'widget-pink', baseColor: '#ec4899' },
  { value: 'cyan', label: 'Cyan', class: 'widget-cyan', baseColor: '#06b6d4' },
  { value: 'indigo', label: 'İndigo', class: 'widget-indigo', baseColor: '#6366f1' },
  { value: 'teal', label: 'Teal', class: 'widget-teal', baseColor: '#14b8a6' },
  { value: 'lime', label: 'Lime', class: 'widget-lime', baseColor: '#84cc16' },
  { value: 'rose', label: 'Gül', class: 'widget-rose', baseColor: '#f43f5e' },
  { value: 'custom', label: 'Özel Renk', class: 'widget-custom', baseColor: '#3b82f6' },
];

/**
 * WidgetModal Component
 * Widget ekleme/düzenleme modalı
 */
function WidgetModal({ isOpen, widget = null, columns = [], onSave, onCancel }) {
  const [widgetType, setWidgetType] = useState('total_cards');
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('📊');
  const [color, setColor] = useState('blue');
  const [customColor, setCustomColor] = useState('#3b82f6');
  const [columnId, setColumnId] = useState('');
  const [customText, setCustomText] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [percentageMode, setPercentageMode] = useState('completed'); // 'completed' veya 'remaining'
  const [saving, setSaving] = useState(false);
  const [showIconPicker, setShowIconPicker] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (widget) {
        // Düzenleme modu
        setWidgetType(widget.widget_type);
        setTitle(widget.title);
        setIcon(widget.icon);
        setColor(widget.settings?.color || 'blue');
        setCustomColor(widget.settings?.customColor || '#3b82f6');
        setColumnId(widget.settings?.column_id || '');
        setCustomText(widget.settings?.customText || '');
        setTargetValue(widget.settings?.targetValue || '');
        setPercentageMode(widget.settings?.percentageMode || 'completed');
      } else {
        // Yeni widget - varsayılan değerlerle başla
        const defaultType = WIDGET_TYPES[0];
        setWidgetType(defaultType.value);
        setTitle(defaultType.label);
        setIcon(defaultType.icon);
        setColor('blue');
        setCustomColor('#3b82f6');
        setColumnId('');
        setCustomText('');
        setTargetValue('');
        setPercentageMode('completed');
      }
    }
  }, [isOpen, widget]);

  // Widget tipi değiştiğinde başlık ve ikonu güncelle (yeni widget için)
  useEffect(() => {
    if (!widget && isOpen) {
      const selectedType = WIDGET_TYPES.find(t => t.value === widgetType);
      if (selectedType) {
        setTitle(selectedType.label);
        setIcon(selectedType.icon);
      }
    }
  }, [widgetType, widget, isOpen]);

  const handleTypeChange = (type) => {
    setWidgetType(type);
    const selectedType = WIDGET_TYPES.find(t => t.value === type);
    if (!widget) {
      setTitle(selectedType?.label || '');
      setIcon(selectedType?.icon || '📊');
      // Tip değişince diğer alanları temizle
      setColumnId('');
      setCustomText('');
      setTargetValue('');
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lütfen widget başlığı girin');
      return;
    }

    const selectedType = WIDGET_TYPES.find(t => t.value === widgetType);
    
    if (selectedType?.needsColumn && !columnId) {
      alert('Lütfen bir kolon seçin');
      return;
    }

    if (selectedType?.needsTarget && !targetValue) {
      alert('Lütfen hedef değer girin');
      return;
    }

    setSaving(true);
    
    // Target value'yu güvenli şekilde parse et
    let parsedTargetValue = 0;
    if (targetValue) {
      const targetStr = String(targetValue);
      parsedTargetValue = parseFloat(targetStr.replace(/,/g, '')) || 0;
    }

    const widgetData = {
      widget_type: widgetType,
      title: title.trim(),
      icon,
      settings: {
        color,
        ...(color === 'custom' && { customColor }),
        ...(columnId && { column_id: columnId }),
        ...(customText && { customText }),
        ...(parsedTargetValue > 0 && { targetValue: parsedTargetValue }),
        ...(widgetType === 'target_percentage' && { percentageMode })
      }
    };

    await onSave(widgetData);
    setSaving(false);
  };

  if (!isOpen) return null;

  const selectedType = WIDGET_TYPES.find(t => t.value === widgetType);

  return (
    <>
      <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content widget-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">
            {widget ? '✏️ Widget Düzenle' : '➕ Yeni Widget Ekle'}
          </h3>
        </div>
        
        <div className="modal-body">
          {/* Widget Tipi */}
          <div className="form-group">
            <label className="form-label">Widget Tipi</label>
            <select
              value={widgetType}
              onChange={(e) => handleTypeChange(e.target.value)}
              className="form-select"
              disabled={!!widget}
            >
              {WIDGET_TYPES.map(type => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Başlık */}
          <div className="form-group">
            <label className="form-label">Başlık</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Widget başlığı"
              className="form-input"
              maxLength={30}
            />
          </div>

          {/* İkon */}
          <div className="form-group">
            <label className="form-label">İkon</label>
            <div className="icon-selector">
              <button
                type="button"
                onClick={() => setShowIconPicker(true)}
                className="icon-preview-btn"
              >
                <span className="preview-icon">{icon}</span>
                <span className="preview-text">İkon Seç</span>
              </button>
            </div>
          </div>

          {/* Renk Teması */}
          <div className="form-group">
            <label className="form-label">Renk Teması</label>
            <div className="color-grid">
              {COLOR_THEMES.map(theme => (
                <button
                  key={theme.value}
                  onClick={() => setColor(theme.value)}
                  className={`color-option ${color === theme.value ? 'active' : ''} ${theme.class}`}
                  title={theme.label}
                  style={theme.value === 'custom' ? {
                    background: `linear-gradient(135deg, ${customColor}33, ${customColor}22)`
                  } : {}}
                >
                  <span className="color-check">{color === theme.value ? '✓' : ''}</span>
                </button>
              ))}
            </div>
            
            {/* Custom Renk Seçici */}
            {color === 'custom' && (
              <div className="custom-color-picker">
                <label className="custom-color-label">Özel Renk Seçin:</label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="color-input"
                />
                <span className="color-preview" style={{
                  background: `linear-gradient(135deg, ${customColor}, ${customColor}dd)`
                }}>
                  Önizleme
                </span>
              </div>
            )}
          </div>

          {/* Özel Metin (custom_text için) */}
          {selectedType?.needsCustomText && (
            <div className="form-group">
              <label className="form-label">Değer (Metin veya Sayı)</label>
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Örn: 500GB, %75, 1500 adet"
                className="form-input"
                maxLength={20}
              />
              <p className="form-hint">Widget'ta gösterilecek değeri girin</p>
            </div>
          )}

          {/* Hedef Değer (gerekirse) */}
          {selectedType?.needsTarget && (
            <div className="form-group">
              <label className="form-label">Hedef Değer</label>
              <input
                type="text"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                placeholder="Örn: 1333333 veya 1,333,333"
                className="form-input"
              />
              <p className="form-hint">Hedef kotanızı veya bütçenizi girin</p>
            </div>
          )}

          {/* Yüzde Modu (target_percentage için) */}
          {widgetType === 'target_percentage' && (
            <div className="form-group">
              <label className="form-label">Gösterim Modu</label>
              <div className="percentage-mode-options">
                <button
                  type="button"
                  onClick={() => setPercentageMode('completed')}
                  className={`mode-option ${percentageMode === 'completed' ? 'active' : ''}`}
                >
                  <span className="mode-icon">✅</span>
                  <span className="mode-label">Tamamlanan</span>
                  <span className="mode-desc">Harcanan yüzde</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPercentageMode('remaining')}
                  className={`mode-option ${percentageMode === 'remaining' ? 'active' : ''}`}
                >
                  <span className="mode-icon">⏳</span>
                  <span className="mode-label">Kalan</span>
                  <span className="mode-desc">Kalan yüzde</span>
                </button>
              </div>
            </div>
          )}

          {/* Kolon Seçimi (gerekirse) */}
          {selectedType?.needsColumn && (
            <div className="form-group">
              <label className="form-label">
                {selectedType?.needsTarget ? 'Çıkarılacak Kolon' : 'Kolon Seçin'}
              </label>
              <select
                value={columnId}
                onChange={(e) => setColumnId(e.target.value)}
                className="form-select"
              >
                <option value="">-- Kolon seçin --</option>
                {columns.map(col => (
                  <option key={col.id} value={col.id}>
                    {col.title}
                  </option>
                ))}
              </select>
              {selectedType?.needsTarget && (
                <p className="form-hint">Bu kolonun toplam fiyatı hedef değerden çıkarılacak</p>
              )}
            </div>
          )}
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
            {saving ? 'Kaydediliyor...' : widget ? 'Güncelle' : 'Ekle'}
          </button>
        </div>
      </div>
    </div>

      {/* İkon Picker */}
      {showIconPicker && (
        <IconPicker
          currentIcon={icon}
          onSelect={setIcon}
          onClose={() => setShowIconPicker(false)}
        />
      )}
    </>
  );
}

export default WidgetModal;

