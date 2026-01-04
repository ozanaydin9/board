import { useState } from 'react';
import ConfirmModal from './ConfirmModal';
import Toast from './Toast';
import '../styles/board-tabs.css';

/**
 * BoardTabs Component
 * Boardlar arası geçiş yapılmasını sağlar (Excel sheet gibi)
 */
function BoardTabs({ 
  boards, 
  activeBoard, 
  onBoardChange, 
  onBoardCreate, 
  onBoardRename, 
  onBoardDelete 
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');
  const [boardToDelete, setBoardToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    
    await onBoardCreate(newBoardName.trim());
    setNewBoardName('');
    setIsCreating(false);
  };

  const handleRename = async (boardId) => {
    if (!editBoardName.trim()) return;
    
    await onBoardRename(boardId, editBoardName.trim());
    setEditingBoardId(null);
    setEditBoardName('');
  };

  const startRename = (board, e) => {
    e.stopPropagation();
    setEditingBoardId(board.id);
    setEditBoardName(board.name);
  };

  const startDelete = (board, e) => {
    e.stopPropagation();
    if (boards.length <= 1) {
      setToast({ message: 'En az bir board olmalıdır.', type: 'error' });
      return;
    }
    setBoardToDelete(board);
  };

  const confirmDelete = async () => {
    if (!boardToDelete) return;
    await onBoardDelete(boardToDelete.id);
    setBoardToDelete(null);
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="board-tabs-container">
        <div className="board-tabs-scroll">
          {boards.map(board => (
            <div
              key={board.id}
              className={`board-tab ${activeBoard?.id === board.id ? 'active' : ''}`}
              onClick={() => !editingBoardId && onBoardChange(board)}
            >
              {editingBoardId === board.id ? (
                <input
                  type="text"
                  value={editBoardName}
                  onChange={(e) => setEditBoardName(e.target.value)}
                  onBlur={() => handleRename(board.id)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleRename(board.id);
                    if (e.key === 'Escape') {
                      setEditingBoardId(null);
                      setEditBoardName('');
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  autoFocus
                  className="board-tab-input"
                />
              ) : (
                <>
                  <span className="board-tab-name">{board.name}</span>
                  
                  {/* Hover Actions (Widget gibi) */}
                  <div className="board-tab-actions">
                    <button
                      className="board-tab-action-btn"
                      onClick={(e) => startRename(board, e)}
                      title="Yeniden Adlandır"
                    >
                      ✏️
                    </button>
                    <button
                      className="board-tab-action-btn delete-btn"
                      onClick={(e) => startDelete(board, e)}
                      title="Sil"
                    >
                      ✕
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Yeni Board Ekle */}
          {isCreating ? (
            <div className="board-tab creating">
              <input
                type="text"
                value={newBoardName}
                onChange={(e) => setNewBoardName(e.target.value)}
                onBlur={handleCreateBoard}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateBoard();
                  if (e.key === 'Escape') {
                    setIsCreating(false);
                    setNewBoardName('');
                  }
                }}
                placeholder="Board adı..."
                autoFocus
                className="board-tab-input"
              />
            </div>
          ) : (
            <button 
              className="board-tab-add"
              onClick={() => setIsCreating(true)}
              title="Yeni Board Ekle"
            >
              <span className="add-icon">+</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirm Modal for Delete */}
      <ConfirmModal
        isOpen={!!boardToDelete}
        title="Board Sil"
        message={`"${boardToDelete?.name}" board'unu silmek istediğinize emin misiniz? Tüm kolonlar, kartlar ve widget'lar silinecektir.`}
        onConfirm={confirmDelete}
        onCancel={() => setBoardToDelete(null)}
        confirmText="Sil"
        cancelText="İptal"
        isDanger={true}
      />
    </>
  );
}

export default BoardTabs;

