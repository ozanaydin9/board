import { useState, useEffect } from 'react';
import '../styles/modal.css';

const WIDGET_TYPES = [
  { value: 'total_cards', label: 'Toplam Kart Sayısı', icon: '📊', needsColumn: false },
  { value: 'total_price', label: 'Toplam Değer', icon: '💰', needsColumn: false },
  { value: 'high_priority', label: 'Yüksek Öncelikli', icon: '⭐', needsColumn: false },
  { value: 'column_count', label: 'Kolon Sayısı', icon: '📋', needsColumn: false },
  { value: 'column_cards', label: 'Kolonun Kart Sayısı', icon: '📝', needsColumn: true },
  { value: 'column_total', label: 'Kolonun Toplam Fiyatı', icon: '💵', needsColumn: true },
  { value: 'pinned_total', label: 'Pinli Kolonlar Toplamı', icon: '📌', needsColumn: false },
  { value: 'average_price', label: 'Ortalama Fiyat', icon: '📈', needsColumn: false },
];

const COLOR_THEMES = [
  { value: 'blue', label: 'Mavi', class: 'widget-blue' },
  { value: 'green', label: 'Yeşil', class: 'widget-green' },
  { value: 'orange', label: 'Turuncu', class: 'widget-orange' },
  { value: 'purple', label: 'Mor', class: 'widget-purple' },
  { value: 'red', label: 'Kırmızı', class: 'widget-red' },
  { value: 'yellow', label: 'Sarı', class: 'widget-yellow' },
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
  const [columnId, setColumnId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (widget) {
      // Düzenleme modu
      setWidgetType(widget.widget_type);
      setTitle(widget.title);
      setIcon(widget.icon);
      setColor(widget.settings?.color || 'blue');
      setColumnId(widget.settings?.column_id || '');
    } else {
      // Yeni widget
      const selectedType = WIDGET_TYPES.find(t => t.value === widgetType);
      setTitle(selectedType?.label || '');
      setIcon(selectedType?.icon || '📊');
    }
  }, [widget, widgetType]);

  const handleTypeChange = (type) => {
    setWidgetType(type);
    const selectedType = WIDGET_TYPES.find(t => t.value === type);
    if (!widget) {
      setTitle(selectedType?.label || '');
      setIcon(selectedType?.icon || '📊');
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

    setSaving(true);
    
    const widgetData = {
      widget_type: widgetType,
      title: title.trim(),
      icon,
      settings: {
        color,
        ...(columnId && { column_id: columnId })
      }
    };

    await onSave(widgetData);
    setSaving(false);
  };

  if (!isOpen) return null;

  const selectedType = WIDGET_TYPES.find(t => t.value === widgetType);

  return (
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
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              placeholder="Emoji seçin"
              className="form-input"
              maxLength={2}
            />
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
                >
                  <span className="color-check">{color === theme.value ? '✓' : ''}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Kolon Seçimi (gerekirse) */}
          {selectedType?.needsColumn && (
            <div className="form-group">
              <label className="form-label">Kolon Seçin</label>
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
  );
}

export default WidgetModal;

