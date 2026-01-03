import '../styles/modal.css';

/**
 * SelectColumnModal Component
 * Kullanıcının kartı taşıyacağı pinli kolonu seçmesini sağlar
 */
function SelectColumnModal({ isOpen, columns, onSelect, onCancel }) {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Hedef Kolonu Seçin</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-message">Kartı hangi pinli kolona taşımak istiyorsunuz?</p>
          <div className="column-select-list">
            {columns.map((column) => (
              <button
                key={column.id}
                onClick={() => onSelect(column.id)}
                className="column-select-item"
              >
                <span className="column-select-icon">📌</span>
                <span className="column-select-name">{column.title}</span>
              </button>
            ))}
          </div>
        </div>
        
        <div className="modal-footer">
          <button onClick={onCancel} className="modal-button modal-button-secondary">
            İptal
          </button>
        </div>
      </div>
    </div>
  );
}

export default SelectColumnModal;

