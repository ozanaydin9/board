import { useState, useEffect } from 'react';
import { getReports, deleteReport } from '../lib/supabase';
import '../styles/modal.css';

/**
 * ReportsListModal Component
 * Kaydedilmiş raporları listeler ve görüntüleme/silme işlemleri
 */
function ReportsListModal({ isOpen, onClose, onViewReport }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    if (isOpen) {
      loadReports();
    }
  }, [isOpen]);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await getReports();
    if (!error && data) {
      setReports(data);
    }
    setLoading(false);
  };

  const handleDelete = async (reportId) => {
    const { error } = await deleteReport(reportId);
    if (!error) {
      setReports(reports.filter(r => r.id !== reportId));
      setDeleteConfirm(null);
    } else {
      alert('Rapor silinirken hata oluştu.');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content reports-list-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">📊 Kaydedilmiş Raporlar</h3>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="reports-loading">Yükleniyor...</div>
          ) : reports.length === 0 ? (
            <div className="reports-empty">
              <p>📭 Henüz kaydedilmiş rapor yok.</p>
              <p className="reports-empty-hint">
                Mevcut board durumunuzu kaydetmek için "Rapor Oluştur" butonunu kullanın.
              </p>
            </div>
          ) : (
            <div className="reports-list">
              {reports.map(report => (
                <div key={report.id} className="report-item">
                  <div className="report-header">
                    <h4 className="report-title">{report.title}</h4>
                    <div className="report-actions">
                      <button
                        onClick={() => onViewReport(report)}
                        className="report-view-btn"
                        title="Görüntüle"
                      >
                        👁️
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(report.id)}
                        className="report-delete-btn"
                        title="Sil"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  {report.description && (
                    <p className="report-description">{report.description}</p>
                  )}
                  
                  <div className="report-meta">
                    <span className="report-date">📅 {formatDate(report.created_at)}</span>
                    <div className="report-stats">
                      <span className="report-stat-item">
                        <span className="stat-icon">📋</span>
                        <span className="stat-text">{report.snapshot_data?.columns?.length || 0} Kolon</span>
                      </span>
                      <span className="report-stat-item">
                        <span className="stat-icon">📝</span>
                        <span className="stat-text">{report.snapshot_data?.cards?.length || 0} Kart</span>
                      </span>
                      <span className="report-stat-item">
                        <span className="stat-icon">📊</span>
                        <span className="stat-text">{report.snapshot_data?.widgets?.length || 0} Widget</span>
                      </span>
                    </div>
                  </div>

                  {deleteConfirm === report.id && (
                    <div className="report-delete-confirm">
                      <p>Bu raporu silmek istediğinize emin misiniz?</p>
                      <div className="report-delete-actions">
                        <button
                          onClick={() => handleDelete(report.id)}
                          className="confirm-delete-btn"
                        >
                          Evet, Sil
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="cancel-delete-btn"
                        >
                          İptal
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose} 
            className="modal-button modal-button-secondary"
          >
            Kapat
          </button>
        </div>
      </div>
    </div>
  );
}

export default ReportsListModal;

