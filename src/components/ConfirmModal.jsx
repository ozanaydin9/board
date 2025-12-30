import { createPortal } from 'react-dom';
import '../styles/modal.css';

/**
 * Confirmation Modal Component
 * Silme ve önemli işlemler için onay modalı
 */
function ConfirmModal({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Evet', cancelText = 'İptal', isDanger = false }) {
  if (!isOpen) return null;

  const modalContent = (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button className="modal-close" onClick={onCancel}>✕</button>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">{message}</p>
        </div>
        
        <div className="modal-footer">
          {cancelText && (
            <button className="modal-button modal-cancel" onClick={onCancel}>
              {cancelText}
            </button>
          )}
          <button 
            className={`modal-button modal-confirm ${isDanger ? 'modal-danger' : ''}`}
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

export default ConfirmModal;

