import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useState } from 'react';
import Card from './Card';
import ConfirmModal from './ConfirmModal';
import '../styles/column.css';

/**
 * Column Component
 * Kartların bulunduğu kolon bileşeni
 */
function Column({ column, cards, onAddCard, onUpdateCard, onDeleteCard, onUpdateColumn, onDeleteColumn, autoEdit = false, onEditComplete }) {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(autoEdit);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [newCardDescription, setNewCardDescription] = useState('');
  const [newCardPrice, setNewCardPrice] = useState('');
  const [editColumnTitle, setEditColumnTitle] = useState(column.title);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const { setNodeRef } = useDroppable({
    id: column.id,
    data: {
      type: 'column',
      column,
    }
  });

  const cardIds = cards.map(card => card.id);

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
      column_id: column.id,
      order: maxOrder + 1,
    });

    // Formu temizle
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPrice('');
    setIsAddingCard(false);
  };

  const handleCancelAdd = () => {
    setNewCardTitle('');
    setNewCardDescription('');
    setNewCardPrice('');
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

  return (
    <div className="column">
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
            <h3 className="column-title">{column.title}</h3>
            <div className="column-header-right">
              <div className="column-actions">
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
              <span className="column-card-count">{cards.length}</span>
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
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>

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

