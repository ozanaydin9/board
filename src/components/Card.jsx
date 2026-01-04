import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import '../styles/card.css';

/**
 * Card Component
 * Drag & drop özellikli kart bileşeni
 */
function Card({ card, onUpdate, onDelete, onMoveToPin, hasPinnedColumns, maxStars = 5 }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editPrice, setEditPrice] = useState(card.price || 0);
  const [editPriority, setEditPriority] = useState(card.priority || 0);
  const [editNote, setEditNote] = useState(card.note || '');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [hoverPriority, setHoverPriority] = useState(0);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id: card.id,
    data: {
      type: 'card',
      card,
    }
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;

    await onUpdate(card.id, {
      title: editTitle,
      description: editDescription,
      price: parseFloat(editPrice) || 0,
      priority: editPriority || null,
      note: editNote.trim() || null,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setEditPrice(card.price || 0);
    setEditPriority(card.priority || 0);
    setEditNote(card.note || '');
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete(card.id);
    setShowDeleteModal(false);
  };

  const handleMoveToPin = (e) => {
    e.stopPropagation();
    if (onMoveToPin) {
      onMoveToPin(card.id);
    }
  };

  if (isEditing) {
    return (
      <div ref={setNodeRef} style={style} className="card card-editing">
        <div className="card-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Kart başlığı"
            className="card-edit-input"
            autoFocus
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            placeholder="Açıklama"
            className="card-edit-textarea"
            rows="3"
          />
          <input
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
            placeholder="Fiyat (₺)"
            className="card-edit-input"
            step="0.01"
            min="0"
          />
          
          {/* Öncelik Seçici */}
          <div className="priority-selector">
            <label className="priority-selector-label">Öncelik:</label>
            <div className="priority-stars-selector">
              {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
                <button
                  key={star}
                  type="button"
                  className={`star-btn ${star <= (hoverPriority || editPriority) ? 'filled' : ''}`}
                  onClick={() => setEditPriority(editPriority === star ? 0 : star)}
                  onMouseEnter={() => setHoverPriority(star)}
                  onMouseLeave={() => setHoverPriority(0)}
                >
                  ★
                </button>
              ))}
              {editPriority > 0 && (
                <button
                  type="button"
                  className="clear-priority-btn"
                  onClick={() => setEditPriority(0)}
                  title="Önceliği kaldır"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Not/Tarih Alanı */}
          <div className="note-input-group">
            <label className="note-input-label">📝 Kısa Not / Tarih</label>
            <input
              type="text"
              value={editNote}
              onChange={(e) => setEditNote(e.target.value)}
              placeholder="Örn: 15 Ocak, Müşteri: Ali, v2.0"
              className="note-input"
              maxLength={40}
            />
          </div>

          <div className="card-edit-actions">
            <button onClick={handleSave} className="card-save-btn">
              Kaydet
            </button>
            <button onClick={handleCancel} className="card-cancel-btn">
              İptal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="card"
      {...attributes}
      {...listeners}
    >
      <div className="card-header">
        <h4 className="card-title">{card.title}</h4>
        <div className="card-actions">
          {hasPinnedColumns && (
            <button
              onClick={handleMoveToPin}
              className="card-action-btn card-complete-icon"
              title="Pinli kolona taşı"
            >
              ✓
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsEditing(true);
            }}
            className="card-action-btn card-edit-icon"
            title="Düzenle"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClick();
            }}
            className="card-action-btn card-delete-icon"
            title="Sil"
          >
            ✕
          </button>
        </div>
      </div>
      
      <ConfirmModal
        isOpen={showDeleteModal}
        title="Kartı Sil"
        message={`"${card.title}" kartını silmek istediğinizden emin misiniz?`}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setShowDeleteModal(false)}
        confirmText="Sil"
        cancelText="İptal"
        isDanger={true}
      />
      
      {/* Description ve Note yan yana */}
      {(card.description || card.note) && (
        <div className="card-description-row">
          {card.description && (
            <p className="card-description">{card.description}</p>
          )}
          {card.note && (
            <div className="card-note-badge">
              {card.note}
            </div>
          )}
        </div>
      )}

      {/* Alt kısım: Sol tarafta yıldızlar, sağ tarafta fiyat */}
      {(card.priority > 0 || card.price > 0) && (
        <div className="card-footer-info">
          {/* Sol: Öncelik Yıldızları */}
          <div className="card-priority">
            {card.priority > 0 && (
              <div className="priority-stars-display">
                {Array.from({ length: maxStars }, (_, i) => i + 1).map((star) => (
                  <span
                    key={star}
                    className={`star ${star <= card.priority ? 'filled' : ''}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            )}
          </div>
          
          {/* Sağ: Fiyat */}
          {card.price > 0 && (
            <div className="card-price">
              ₺{card.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Card;

