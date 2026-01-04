import { useState } from 'react';

/**
 * DashboardWidget Component
 * Dinamik widget renderer
 */
function DashboardWidget({ widget, cards, columns, onEdit, onDelete, isDragging }) {
  const [showMenu, setShowMenu] = useState(false);

  // Widget değerini hesapla
  const calculateValue = () => {
    switch (widget.widget_type) {
      case 'total_cards':
        return cards.length;
      
      case 'total_price':
        const total = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        return `₺${(total / 1000).toFixed(1)}K`;
      
      case 'high_priority':
        return cards.filter(card => card.priority >= 4).length;
      
      case 'column_count':
        return columns.length;
      
      case 'column_cards':
        if (!widget.settings?.column_id) return 0;
        return cards.filter(card => card.column_id === widget.settings.column_id).length;
      
      case 'column_total':
        if (!widget.settings?.column_id) return '₺0';
        const columnTotal = cards
          .filter(card => card.column_id === widget.settings.column_id)
          .reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        return `₺${(columnTotal / 1000).toFixed(1)}K`;
      
      case 'pinned_total':
        const pinnedColumns = columns.filter(col => col.pinned);
        const pinnedTotal = cards
          .filter(card => pinnedColumns.some(col => col.id === card.column_id))
          .reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        return `₺${(pinnedTotal / 1000).toFixed(1)}K`;
      
      case 'average_price':
        if (cards.length === 0) return '₺0';
        const avg = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0) / cards.length;
        return `₺${(avg / 1000).toFixed(1)}K`;
      
      case 'custom_text':
        return widget.settings?.customText || '-';
      
      case 'target_remaining':
        const targetValue = widget.settings?.targetValue || 0;
        if (!widget.settings?.column_id) {
          return `₺${targetValue.toLocaleString('tr-TR')}`;
        }
        
        const columnSum = cards
          .filter(card => card.column_id === widget.settings.column_id)
          .reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        
        const remaining = targetValue - columnSum;
        return `₺${remaining.toLocaleString('tr-TR')}`;
      
      default:
        return 0;
    }
  };

  // Progress bar yüzdesini hesapla
  const calculateProgress = () => {
    switch (widget.widget_type) {
      case 'high_priority':
        if (cards.length === 0) return 0;
        return (cards.filter(card => card.priority >= 4).length / cards.length * 100);
      
      case 'column_cards':
        if (cards.length === 0 || !widget.settings?.column_id) return 0;
        const columnCards = cards.filter(card => card.column_id === widget.settings.column_id).length;
        return (columnCards / cards.length * 100);
      
      case 'column_total':
        if (!widget.settings?.column_id) return 0;
        const total = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        if (total === 0) return 0;
        const columnTotal = cards
          .filter(card => card.column_id === widget.settings.column_id)
          .reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        return (columnTotal / total * 100);
      
      case 'target_remaining':
        const targetVal = widget.settings?.targetValue || 0;
        if (targetVal === 0 || !widget.settings?.column_id) return 0;
        
        const colSum = cards
          .filter(card => card.column_id === widget.settings.column_id)
          .reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
        
        const rem = targetVal - colSum;
        
        // Kalan yüzdesi (ne kadar kaldı) - Progress bar kalan oranı gösterir
        return Math.max((rem / targetVal * 100), 0);
      
      default:
        return 0;
    }
  };

  const value = calculateValue();
  const progress = calculateProgress();
  const color = widget.settings?.color || 'blue';
  const colorClass = `widget-${color}`;
  
  // Custom renk için dinamik stiller oluştur
  const customColor = widget.settings?.customColor;
  const customStyle = color === 'custom' && customColor ? {
    background: `linear-gradient(135deg, ${customColor}1F, ${customColor}14)`,
    borderColor: `${customColor}4D`,
  } : {};
  
  const customIconStyle = color === 'custom' && customColor ? {
    background: `${customColor}33`,
  } : {};
  
  const customProgressStyle = color === 'custom' && customColor ? {
    background: `linear-gradient(90deg, ${customColor}, ${customColor}dd)`,
  } : {};
  
  const customValueStyle = color === 'custom' && customColor ? {
    color: customColor,
  } : {};

  return (
    <div 
      className={`widget widget-gradient ${colorClass} ${isDragging ? 'dragging' : ''}`}
      style={customStyle}
    >
      {/* Widget Menu */}
      <div className="widget-menu-wrapper">
        <button
          className="widget-menu-btn"
          onClick={() => setShowMenu(!showMenu)}
          title="Widget Ayarları"
        >
          ⋮
        </button>
        
        {showMenu && (
          <>
            <div className="widget-menu-dropdown">
              <button
                onClick={() => {
                  setShowMenu(false);
                  onEdit(widget);
                }}
                className="widget-menu-item"
              >
                <span>✏️</span> Düzenle
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  onDelete(widget.id);
                }}
                className="widget-menu-item delete-item"
              >
                <span>🗑️</span> Sil
              </button>
            </div>
            <div 
              className="widget-menu-overlay" 
              onClick={() => setShowMenu(false)}
            />
          </>
        )}
      </div>

      {/* Widget Content */}
      <div className="gradient-header">
        <div className="gradient-icon-box" style={customIconStyle}>
          <span>{widget.icon}</span>
        </div>
        <div className="gradient-info">
          <div className="gradient-value" style={customValueStyle}>{value}</div>
          <div className="gradient-label">{widget.title}</div>
        </div>
      </div>
      
      <div className="gradient-progress">
        <div 
          className="progress-bar" 
          style={{ width: `${progress}%`, ...customProgressStyle }}
        ></div>
      </div>
    </div>
  );
}

export default DashboardWidget;

