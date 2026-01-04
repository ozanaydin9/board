import { useState } from 'react';

const ICON_OPTIONS = [
  { category: 'Genel', icons: ['📊', '📋', '📝', '📌', '🎯', '✅', '⭐', '🔔', '💡', '🔥'] },
  { category: 'Para', icons: ['💰', '💵', '💳', '💸', '💴', '💶', '💷', '🪙', '📈', '📉'] },
  { category: 'Kişi', icons: ['👤', '👥', '👨', '👩', '🧑', '👶', '🤝', '💼', '👔', '🎓'] },
  { category: 'Zaman', icons: ['⏰', '⏱️', '⏲️', '🕐', '📅', '📆', '🗓️', '⌚', '🔜', '⏳'] },
  { category: 'İşlem', icons: ['✏️', '✂️', '📎', '🔗', '🔒', '🔓', '🔑', '🔍', '🔎', '⚙️'] },
  { category: 'Durum', icons: ['✔️', '❌', '⚠️', '❗', '❓', '💯', '🎉', '🚀', '⚡', '🌟'] },
  { category: 'Dosya', icons: ['📁', '📂', '🗂️', '📄', '📃', '📑', '🗃️', '📦', '📮', '📪'] },
  { category: 'İletişim', icons: ['📧', '📨', '📩', '💬', '💭', '📞', '📱', '☎️', '📲', '📢'] },
  { category: 'Eğlence', icons: ['🎮', '🎯', '🎲', '🎨', '🎭', '🎪', '🎬', '🎤', '🎧', '🎵'] },
  { category: 'Yiyecek', icons: ['🍒', '🍎', '🍊', '🍋', '🍌', '🍉', '🍇', '🍓', '🫐', '🍑'] },
];

/**
 * IconPicker Component
 * Widget ikonu seçmek için emoji picker
 */
function IconPicker({ currentIcon, onSelect, onClose }) {
  const [selectedCategory, setSelectedCategory] = useState('Genel');

  const currentCategory = ICON_OPTIONS.find(cat => cat.category === selectedCategory);

  return (
    <div className="icon-picker-overlay" onClick={onClose}>
      <div className="icon-picker-modal" onClick={(e) => e.stopPropagation()}>
        <div className="icon-picker-header">
          <h4 className="icon-picker-title">İkon Seçin</h4>
          <button onClick={onClose} className="icon-picker-close">✕</button>
        </div>
        
        <div className="icon-picker-categories">
          {ICON_OPTIONS.map(cat => (
            <button
              key={cat.category}
              onClick={() => setSelectedCategory(cat.category)}
              className={`category-btn ${selectedCategory === cat.category ? 'active' : ''}`}
            >
              {cat.category}
            </button>
          ))}
        </div>

        <div className="icon-picker-grid">
          {currentCategory?.icons.map(icon => (
            <button
              key={icon}
              onClick={() => {
                onSelect(icon);
                onClose();
              }}
              className={`icon-option ${currentIcon === icon ? 'selected' : ''}`}
              title={icon}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default IconPicker;

