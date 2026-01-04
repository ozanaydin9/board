import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import Card from './Card';
import ConfirmModal from './ConfirmModal';
import '../styles/column.css';

/**
 * Column Component
 * Kartların bulunduğu kolon bileşeni
 */
function Column({ column, cards, onAddCard, onUpdateCard, onDeleteCard, onUpdateColumn, onDeleteColumn, onMoveCardToPin, hasPinnedColumns, maxStars = 5, autoEdit = false, onEditComplete }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(autoEdit);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardPrice, setNewCardPrice] = useState('');
  const [newCardPriority, setNewCardPriority] = useState(0);
  const [newCardNote, setNewCardNote] = useState('');
  const [hoverNewPriority, setHoverNewPriority] = useState(0);
  const [editColumnTitle, setEditColumnTitle] = useState(column.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchInput, setShowSearchInput] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    }
  });

  // Kolon drag & drop (sadece başlık için)
  const {
    attributes: titleAttributes,
    listeners: titleListeners,
    setNodeRef: setTitleRef,
    transform: titleTransform,
    transition: titleTransition,
    isDragging: isTitleDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: {
      type: 'column-header',
      column,
    },
  });

  const columnStyle = titleTransform ? {
    transform: CSS.Transform.toString(titleTransform),
    transition: titleTransition,
    opacity: isTitleDragging ? 0.5 : 1,
  } : {};

  // Arama toggle fonksiyonu
  const handleToggleSearch = () => {
    if (showSearchInput) {
      // Kapanırken search'ü temizle
      setSearchQuery('');
    }
    setShowSearchInput(!showSearchInput);
  };

  // Kartları filtrele (arama) - sadece input açıksa filtrele
  const filteredCards = cards.filter(card => {
    if (!showSearchInput || !searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      card.title?.toLowerCase().includes(query) ||
      card.description?.toLowerCase().includes(query) ||
      card.note?.toLowerCase().includes(query) ||
      card.price?.toString().includes(query)
    );
  });

  // Tarih parse helper fonksiyonu
  const parseDate = (dateStr) => {
    if (!dateStr) return null;
    
    // Türkçe format: DD.MM.YYYY veya DD/MM/YYYY
    const patterns = [
      /(\d{1,2})[./](\d{1,2})[./](\d{4})/,  // 12.01.2026 veya 12/01/2026
      /(\d{4})[.-](\d{1,2})[.-](\d{1,2})/,  // 2026-01-12 (ISO)
    ];
    
    for (const pattern of patterns) {
      const match = dateStr.match(pattern);
      if (match) {
        let day, month, year;
        if (match[1].length === 4) {
          // ISO format: YYYY-MM-DD
          [, year, month, day] = match;
        } else {
          // TR format: DD.MM.YYYY
          [, day, month, year] = match;
        }
        
        const date = new Date(year, month - 1, day);
        if (!isNaN(date.getTime())) {
          return date;
        }
      }
    }
    
    // Standart Date parse dene
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  };

  // Kartları sırala
  const sortedCards = [...filteredCards].sort((a, b) => {
    const sortBy = column.sort_by || 'order';
    
    switch (sortBy) {
      case 'priority_high':
        return (b.priority || 0) - (a.priority || 0);
      case 'priority_low':
        return (a.priority || 0) - (b.priority || 0);
      case 'price_high':
        return (b.price || 0) - (a.price || 0);
      case 'price_low':
        return (a.price || 0) - (b.price || 0);
      case 'date_asc':
        // Note alanını tarih olarak parse et
        const dateA = parseDate(a.note);
        const dateB = parseDate(b.note);
        
        // Boş notlar en sona
        if (!dateA && !dateB) return 0;
        if (!dateA) return 1;
        if (!dateB) return -1;
        
        return dateA - dateB; // Eskiden yeniye
      case 'date_desc':
        const dateA2 = parseDate(a.note);
        const dateB2 = parseDate(b.note);
        
        // Boş notlar en sona
        if (!dateA2 && !dateB2) return 0;
        if (!dateA2) return 1;
        if (!dateB2) return -1;
        
        return dateB2 - dateA2; // Yeniden eskiye
      case 'title':
        return (a.title || '').localeCompare(b.title || '');
      case 'order':
      default:
        return (a.order || 0) - (b.order || 0);
    }
  });

  const cardIds = sortedCards.map(card => card.id);

  // Kolon içindeki kartların toplam fiyatını hesapla
  const totalPrice = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);

  const handleAddCard = async () => {
    if (!newCardTitle.trim()) return;

    const maxOrder = cards.length > 0 
      ? Math.max(...cards.map(c => c.order || 0)) 
      : 0;

    await onAddCard({
      title: newCardTitle,
      description: newCardDescription,
      price: parseFloat(newCardPrice) || 0,
      priority: newCardPriority || null,
      note: newCardNote.trim() || null,
      column_id: column.id,
      order: maxOrder + 1,
    });

    // Formu temizle
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPrice('');
    setNewCardPriority(0);
    setNewCardNote('');
    setIsAddingCard(false);
  };

  const handleCancelAdd = () => {
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPrice('');
    setNewCardPriority(0);
    setNewCardNote('');
    setIsAddingCard(false);
  };

  const handleSaveTitle = async () => {
    if (!editColumnTitle.trim()) {
      setEditColumnTitle(column.title);
      setIsEditingTitle(false);
      if (onEditComplete) onEditComplete();
      return;
    }
    await onUpdateColumn(column.id, { title: editColumnTitle });
    setIsEditingTitle(false);
    if (onEditComplete) onEditComplete();
  };

  const handleCancelEditTitle = () => {
    setEditColumnTitle(column.title);
    setIsEditingTitle(false);
    if (onEditComplete) onEditComplete();
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (cards.length > 0) {
      // Modal'ı kapat ve hata modalı göster
      setShowDeleteModal(false);
      return;
    }
    await onDeleteColumn(column.id);
    setShowDeleteModal(false);
  };

  const handleTogglePin = async () => {
    await onUpdateColumn(column.id, { pinned: !column.pinned });
  };

  const handleSortChange = async (sortBy) => {
    await onUpdateColumn(column.id, { sort_by: sortBy });
    setShowSortMenu(false);
  };

  return (
    <div className="column" style={columnStyle}>
      <div className="column-header">
        {isEditingTitle ? (
          <div className="column-title-edit">
            <input
              type="text"
              value={editColumnTitle}
              onChange={(e) => setEditColumnTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSaveTitle()}
              className="column-title-input"
              autoFocus
            />
            <div className="column-title-actions">
              <button onClick={handleSaveTitle} className="column-title-save">✓</button>
              <button onClick={handleCancelEditTitle} className="column-title-cancel">✕</button>
            </div>
          </div>
        ) : (
          <div className="column-title-wrapper">
            <h3 
              ref={setTitleRef}
              {...titleAttributes}
              {...titleListeners}
              className="column-title column-drag-handle"
            >
              {column.pinned && <span className="pin-icon" title="Sabitlenmiş">📌</span>}
              {column.title}
            </h3>
            <div className="column-header-right">
              <div className="column-actions">
                {/* Arama Butonu */}
                <button
                  onClick={handleToggleSearch}
                  className={`column-action-btn column-search-btn ${showSearchInput ? 'active' : ''}`}
                  title="Ara"
                >
                  🔍
                </button>

                {/* Sıralama Menüsü */}
                <div className="sort-menu-wrapper">
                  <button
                    onClick={() => setShowSortMenu(!showSortMenu)}
                    className="column-action-btn"
                    title="Sıralama"
                  >
                    ⇅
                  </button>
                  
                  {showSortMenu && (
                    <>
                      <div className="sort-dropdown">
                        <button onClick={() => handleSortChange('order')} className={`sort-item ${column.sort_by === 'order' ? 'active' : ''}`}>
                          ⇅ Manuel
                        </button>
                        <button onClick={() => handleSortChange('priority_high')} className={`sort-item ${column.sort_by === 'priority_high' ? 'active' : ''}`}>
                          ⭐ Öncelik ↓
                        </button>
                        <button onClick={() => handleSortChange('priority_low')} className={`sort-item ${column.sort_by === 'priority_low' ? 'active' : ''}`}>
                          ⭐ Öncelik ↑
                        </button>
                        <button onClick={() => handleSortChange('price_high')} className={`sort-item ${column.sort_by === 'price_high' ? 'active' : ''}`}>
                          💰 Fiyat ↓
                        </button>
                        <button onClick={() => handleSortChange('price_low')} className={`sort-item ${column.sort_by === 'price_low' ? 'active' : ''}`}>
                          💰 Fiyat ↑
                        </button>
                        <button onClick={() => handleSortChange('date_desc')} className={`sort-item ${column.sort_by === 'date_desc' ? 'active' : ''}`}>
                          📅 Tarih ↓
                        </button>
                        <button onClick={() => handleSortChange('date_asc')} className={`sort-item ${column.sort_by === 'date_asc' ? 'active' : ''}`}>
                          📅 Tarih ↑
                        </button>
                        <button onClick={() => handleSortChange('title')} className={`sort-item ${column.sort_by === 'title' ? 'active' : ''}`}>
                          🔤 A-Z
                        </button>
                      </div>
                      <div className="sort-menu-overlay" onClick={() => setShowSortMenu(false)} />
                    </>
                  )}
                </div>

                <button
                  onClick={handleTogglePin}
                  className={`column-action-btn column-pin-btn ${column.pinned ? 'pinned' : ''}`}
                  title={column.pinned ? "Sabitlemeyi kaldır" : "Sağa sabitle"}
                >
                  {column.pinned ? '📍' : '📌'}
                </button>
                <button
                  onClick={() => setIsEditingTitle(true)}
                  className="column-action-btn"
                  title="Kolon adını düzenle"
                >
                  ✎
                </button>
                <button
                  onClick={handleDeleteClick}
                  className="column-action-btn column-delete-btn"
                  title="Kolonu sil"
                >
                  ✕
                </button>
              </div>
              <span className="column-card-count">{filteredCards.length}</span>
            </div>
          </div>
        )}
        
        <ConfirmModal
          isOpen={showDeleteModal}
          title="Kolonu Sil"
          message={
            cards.length > 0
              ? `"${column.title}" kolonu içinde ${cards.length} kart var. Önce kartları silmelisiniz.`
              : `"${column.title}" kolonunu silmek istediğinizden emin misiniz?`
          }
          onConfirm={cards.length > 0 ? () => setShowDeleteModal(false) : handleDeleteConfirm}
          onCancel={() => setShowDeleteModal(false)}
          confirmText={cards.length > 0 ? 'Tamam' : 'Sil'}
          cancelText={cards.length > 0 ? null : 'İptal'}
          isDanger={cards.length === 0}
        />
      </div>

      {/* Arama Input - Toggle ile açılır/kapanır */}
      {showSearchInput && (
        <div className="column-search">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="🔍 Ara..."
            className="column-search-input"
            autoFocus
          />
        </div>
      )}

      {totalPrice > 0 && (
        <div className="column-total">
          <span className="total-label">Toplam:</span>
          <span className="total-value">₺{totalPrice.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}

      <div 
        ref={setNodeRef}
        className="column-content"
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {sortedCards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
              onMoveToPin={onMoveCardToPin}
              hasPinnedColumns={hasPinnedColumns && !column.pinned}
              maxStars={maxStars}
            />
          ))}
        </SortableContext>
      </div>

      <div className="column-footer">
        {isAddingCard ? (
          <div className="add-card-form">
            <input
              type="text"
              value={newCardTitle}
              onChange={(e) => setNewCardTitle(e.target.value)}
              placeholder="Kart başlığı"
              className="add-card-input"
              autoFocus
            />
            <textarea
              value={newCardDescription}
              onChange={(e) => setNewCardDescription(e.target.value)}
              placeholder="Açıklama (opsiyonel)"
              className="add-card-textarea"
              rows="2"
            />
            <input
              type="number"
              value={newCardPrice}
              onChange={(e) => setNewCardPrice(e.target.value)}
              placeholder="Fiyat (₺)"
              className="add-card-input"
              step="0.01"
              min="0"
            />
            <input
              type="text"
              value={newCardNote}
              onChange={(e) => setNewCardNote(e.target.value)}
              placeholder="Not / Tarih (opsiyonel)"
              className="add-card-input"
              maxLength={40}
            />
            
            {/* Öncelik Seçici */}
            <div className="add-card-priority">
              <label className="add-card-priority-label">Öncelik:</label>
              <div className="priority-stars-selector">
                {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
                  <button
                    key={star}
                    type="button"
                    className={`star-btn ${star <= (hoverNewPriority || newCardPriority) ? 'filled' : ''}`}
                    onClick={() => setNewCardPriority(newCardPriority === star ? 0 : star)}
                    onMouseEnter={() => setHoverNewPriority(star)}
                    onMouseLeave={() => setHoverNewPriority(0)}
                  >
                    ★
                  </button>
                ))}
                {newCardPriority > 0 && (
                  <button
                    type="button"
                    className="clear-priority-btn"
                    onClick={() => setNewCardPriority(0)}
                    title="Önceliği kaldır"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            <div className="add-card-actions">
              <button onClick={handleAddCard} className="add-card-submit">
                Ekle
              </button>
              <button onClick={handleCancelAdd} className="add-card-cancel">
                İptal
              </button>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => setIsAddingCard(true)}
            className="add-card-button"
          >
            + Kart Ekle
          </button>
        )}
      </div>
    </div>
  );
}

export default Column;

