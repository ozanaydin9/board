import { useState, useEffect } from 'react';
import '../styles/modal.css';

/**
 * CreateReportModal Component
 * Yeni rapor/snapshot oluşturma modalı
 */
function CreateReportModal({ isOpen, boards, onSave, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBoardId, setSelectedBoardId] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Modal açıldığında otomatik tarih ekle
      const today = new Date().toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
      setTitle(`Rapor ${today}`);
      setDescription('');
      // İlk board'u seç
      if (boards && boards.length > 0) {
        setSelectedBoardId(boards[0].id);
      }
    }
  }, [isOpen, boards]);

  const handleSave = async () => {
    if (!title.trim()) {
      alert('Lütfen rapor başlığı girin');
      return;
    }

    if (!selectedBoardId) {
      alert('Lütfen bir board seçin');
      return;
    }

    setSaving(true);
    await onSave({ 
      title: title.trim(), 
      description: description.trim(),
      boardId: selectedBoardId
    });
    setSaving(false);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📊 Yeni Rapor Oluştur</h3>
        </div>
        
        <div className="modal-body">
          <p className="modal-description">
            Seçili board'un anlık görüntüsünü kaydedin. 
            Tüm kolonlar, kartlar ve widget'lar kaydedilecek.
          </p>

          <div className="form-group">
            <label className="form-label">Board Seçin</label>
            <select
              value={selectedBoardId}
              onChange={(e) => setSelectedBoardId(e.target.value)}
              className="form-input"
            >
              {boards && boards.map(board => (
                <option key={board.id} value={board.id}>
                  {board.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Rapor Başlığı</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Örn: Ocak Raporu, Q1 2026"
              className="form-input"
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Açıklama (Opsiyonel)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Bu rapora dair notlar..."
              className="form-textarea"
              rows="3"
              maxLength={500}
            />
          </div>
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
            {saving ? 'Kaydediliyor...' : '💾 Kaydet'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default CreateReportModal;

