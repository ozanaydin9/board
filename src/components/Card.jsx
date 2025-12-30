import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import '../styles/card.css';

/**
 * Card Component
 * Drag & drop özellikli kart bileşeni
 */
function Card({ card, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(card.title);
  const [editDescription, setEditDescription] = useState(card.description || '');
  const [editPrice, setEditPrice] = useState(card.price || 0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

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
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditTitle(card.title);
    setEditDescription(card.description || '');
    setEditPrice(card.price || 0);
    setIsEditing(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    await onDelete(card.id);
    setShowDeleteModal(false);
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
      
      {card.description && (
        <p className="card-description">{card.description}</p>
      )}
      
      {card.price > 0 && (
        <div className="card-price">
          <span className="price-label">Fiyat:</span>
          <span className="price-value">₺{card.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>
      )}
    </div>
  );
}

export default Card;

