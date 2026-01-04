import { useState, useEffect } from 'react';
import { getReports, deleteReport, getReport, createReport, getColumns, getCards, getUserWidgets, getUserSettings, getBoards } from '../lib/supabase';
import CreateReportModal from '../components/CreateReportModal';
import DashboardWidget from '../components/DashboardWidget';
import Column from '../components/Column';
import Toast from '../components/Toast';
import '../styles/reports-page.css';

/**
 * ReportsPage Component
 * Raporların listelendiği ve görüntülendiği ana sayfa
 */
function ReportsPage() {
  const [reports, setReports] = useState([]);
  const [boards, setBoards] = useState([]);
  const [selectedBoardFilter, setSelectedBoardFilter] = useState('all');
  const [selectedReport, setSelectedReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadBoards();
    loadReports();
  }, []);

  const loadBoards = async () => {
    const { data, error } = await getBoards();
    if (!error && data) {
      setBoards(data);
    }
  };

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
      setToast({ message: 'Rapor başarıyla silindi', type: 'success' });
    } else {
      setToast({ message: 'Rapor silinirken hata oluştu', type: 'error' });
    }
  };

  const handleCreateReport = async (reportData) => {
    try {
      // Seçili board'un verilerini çek
      const boardId = reportData.boardId;
      
      const [columnsRes, cardsRes, widgetsRes, settingsRes] = await Promise.all([
        getColumns(boardId),
        getCards(boardId),
        getUserWidgets(boardId),
        getUserSettings()
      ]);

      if (columnsRes.error || cardsRes.error || widgetsRes.error) {
        setToast({ message: 'Board verileri alınırken hata oluştu', type: 'error' });
        return;
      }

      const columns = columnsRes.data || [];
      const cards = cardsRes.data || [];
      const widgets = widgetsRes.data || [];
      const userSettings = settingsRes.data || {};

      // Snapshot oluştur
      const totalPrice = cards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
      
      const snapshotData = {
        columns: columns,
        cards: cards,
        widgets: widgets,
        userSettings: userSettings,
        metadata: {
          totalCards: cards.length,
          totalPrice: totalPrice,
          columnCount: columns.length,
          captureDate: new Date().toISOString()
        }
      };

      const { data, error } = await createReport(reportData.title, reportData.description, snapshotData, boardId);
      
      if (error) {
        setToast({ message: 'Rapor oluşturulurken hata oluştu', type: 'error' });
        console.error(error);
      } else if (data) {
        setShowCreateModal(false);
        setToast({ message: 'Rapor başarıyla kaydedildi!', type: 'success' });
        loadReports(); // Listeyi yenile
      }
    } catch (err) {
      console.error('Rapor oluşturma hatası:', err);
      setToast({ message: 'Rapor oluşturulurken bir hata oluştu', type: 'error' });
    }
  };

  const handleSelectReport = async (reportId) => {
    const { data, error } = await getReport(reportId);
    if (!error && data) {
      setSelectedReport(data);
    }
  };

  const handleBackToList = () => {
    setSelectedReport(null);
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

  // Raporları filtrele
  const filteredReports = reports.filter(report => {
    // Board filtresi
    if (selectedBoardFilter !== 'all' && report.board_id !== selectedBoardFilter) {
      return false;
    }
    
    // Arama filtresi
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    return (
      report.title?.toLowerCase().includes(query) ||
      report.description?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="reports-page">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {!selectedReport ? (
        // Rapor Listesi Görünümü
        <>
          {/* Header */}
          <div className="reports-page-header">
            <div className="reports-header-left">
              <a 
                href="/"
                className="back-to-board-btn"
                title="Board'a Dön"
              >
                ← Board'a Dön
              </a>
              <h1 className="reports-page-title">📊 Raporlar</h1>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="create-report-btn"
            >
              💾 Yeni Rapor Oluştur
            </button>
          </div>

          {/* Search Bar */}
          <div className="reports-search-bar">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="🔍 Rapor ara... (başlık, açıklama)"
              className="reports-search-input"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="clear-search-btn"
              >
                ✕
              </button>
            )}
          </div>

          {/* Board Filter */}
          {boards.length > 0 && (
            <div className="board-filter-bar">
              <label className="board-filter-label">Board Filtresi:</label>
              <div className="board-filter-buttons">
                <button
                  className={`board-filter-btn ${selectedBoardFilter === 'all' ? 'active' : ''}`}
                  onClick={() => setSelectedBoardFilter('all')}
                >
                  📋 Tüm Boardlar
                </button>
                {boards.map(board => (
                  <button
                    key={board.id}
                    className={`board-filter-btn ${selectedBoardFilter === board.id ? 'active' : ''}`}
                    onClick={() => setSelectedBoardFilter(board.id)}
                  >
                    {board.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reports Grid */}
          <div className="reports-content">
            {loading ? (
              <div className="reports-loading">Yükleniyor...</div>
            ) : filteredReports.length === 0 ? (
              <div className="reports-empty">
                {searchQuery ? (
                  <>
                    <p>🔍 Arama sonucu bulunamadı.</p>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="clear-search-empty-btn"
                    >
                      Aramayı Temizle
                    </button>
                  </>
                ) : (
                  <>
                    <p>📭 Henüz kaydedilmiş rapor yok.</p>
                    <p className="reports-empty-hint">
                      Mevcut board durumunuzu kaydetmek için "Yeni Rapor Oluştur" butonunu kullanın.
                    </p>
                  </>
                )}
              </div>
            ) : (
              <div className="reports-grid">
                {filteredReports.map(report => (
                  <div 
                    key={report.id} 
                    className="report-card"
                    onClick={() => handleSelectReport(report.id)}
                  >
                    {/* Delete Button */}
                    {deleteConfirm === report.id ? (
                      <div className="report-delete-confirm-inline">
                        <p>Silmek istediğinize emin misiniz?</p>
                        <div className="report-delete-actions-inline">
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(report.id); }}
                            className="confirm-delete-btn-inline"
                          >
                            Evet
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); setDeleteConfirm(null); }}
                            className="cancel-delete-btn-inline"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <button
                          onClick={(e) => { e.stopPropagation(); setDeleteConfirm(report.id); }}
                          className="report-card-delete"
                          title="Sil"
                        >
                          🗑️
                        </button>

                        <div className="report-card-header">
                          <h3 className="report-card-title">{report.title}</h3>
                          {report.board_id && (
                            <span className="report-board-badge">
                              {boards.find(b => b.id === report.board_id)?.name || 'Board'}
                            </span>
                          )}
                        </div>

                        {report.description && (
                          <p className="report-card-description">{report.description}</p>
                        )}

                        <div className="report-card-meta">
                          <span className="report-card-date">
                            📅 {formatDate(report.created_at)}
                          </span>
                        </div>

                        <div className="report-card-stats">
                          <span className="report-card-stat">
                            <span className="stat-icon">📋</span>
                            <span className="stat-text">{report.snapshot_data?.columns?.length || 0} Kolon</span>
                          </span>
                          <span className="report-card-stat">
                            <span className="stat-icon">📝</span>
                            <span className="stat-text">{report.snapshot_data?.cards?.length || 0} Kart</span>
                          </span>
                          <span className="report-card-stat">
                            <span className="stat-icon">📊</span>
                            <span className="stat-text">{report.snapshot_data?.widgets?.length || 0} Widget</span>
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      ) : (
        // Rapor Detay Görünümü
        <div className="report-detail-view">
          {/* Header */}
          <div className="report-detail-header">
            <button 
              onClick={handleBackToList}
              className="back-to-reports-btn-header"
            >
              ← Raporlara Dön
            </button>
            <div className="report-detail-title-section">
              <h1 className="report-detail-title">📊 {selectedReport.title}</h1>
              {selectedReport.description && (
                <p className="report-detail-description">{selectedReport.description}</p>
              )}
              <span className="report-detail-date">
                📅 {formatDate(selectedReport.created_at)}
              </span>
            </div>
          </div>

          {/* Widgets */}
          {selectedReport.snapshot_data?.widgets && selectedReport.snapshot_data.widgets.length > 0 && (
            <div className="report-widgets-section">
              <h3 className="report-section-title">Dashboard Widget'ları</h3>
              <div className="report-widgets-grid">
                {selectedReport.snapshot_data.widgets.map(widget => (
                  <DashboardWidget
                    key={widget.id}
                    widget={widget}
                    cards={selectedReport.snapshot_data.cards || []}
                    columns={selectedReport.snapshot_data.columns || []}
                    onEdit={() => {}}
                    onDelete={() => {}}
                    isDragging={false}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Statistics */}
          <div className="report-stats-section">
            <h3 className="report-section-title">İstatistikler</h3>
            <div className="report-stats-grid">
              <div className="report-stat-card">
                <div className="stat-icon-box">📋</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Toplam Kolon</span>
                  <span className="stat-value-box">{selectedReport.snapshot_data?.columns?.length || 0}</span>
                </div>
              </div>
              <div className="report-stat-card">
                <div className="stat-icon-box">📝</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Toplam Kart</span>
                  <span className="stat-value-box">{selectedReport.snapshot_data?.cards?.length || 0}</span>
                </div>
              </div>
              <div className="report-stat-card">
                <div className="stat-icon-box">💰</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Toplam Değer</span>
                  <span className="stat-value-box">
                    ₺{(selectedReport.snapshot_data?.metadata?.totalPrice || 0).toLocaleString('tr-TR')}
                  </span>
                </div>
              </div>
              <div className="report-stat-card">
                <div className="stat-icon-box">⭐</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Yüksek Öncelikli</span>
                  <span className="stat-value-box">
                    {selectedReport.snapshot_data?.cards?.filter(c => c.priority >= 4).length || 0}
                  </span>
                </div>
              </div>
              <div className="report-stat-card">
                <div className="stat-icon-box">📊</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Widget Sayısı</span>
                  <span className="stat-value-box">{selectedReport.snapshot_data?.widgets?.length || 0}</span>
                </div>
              </div>
              <div className="report-stat-card">
                <div className="stat-icon-box">📌</div>
                <div className="stat-info-box">
                  <span className="stat-label-box">Pinli Kolonlar</span>
                  <span className="stat-value-box">
                    {selectedReport.snapshot_data?.columns?.filter(c => c.pinned).length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Board View - Kolonlar */}
          <div className="report-board-section">
            <h3 className="report-section-title">Board Görünümü</h3>
            <div className="report-board-columns-wrapper">
              {selectedReport.snapshot_data?.columns?.map(column => {
                const columnCards = selectedReport.snapshot_data.cards?.filter(c => c.column_id === column.id) || [];
                return (
                  <div key={column.id} className="report-column-item">
                    <Column
                      column={column}
                      cards={columnCards}
                      onAddCard={() => {}}
                      onUpdateCard={() => {}}
                      onDeleteCard={() => {}}
                      onUpdateColumn={() => {}}
                      onDeleteColumn={() => {}}
                      onMoveCardToPin={() => {}}
                      hasPinnedColumns={false}
                      maxStars={selectedReport.snapshot_data.userSettings?.star_count || 5}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Create Report Modal */}
      <CreateReportModal
        isOpen={showCreateModal}
        boards={boards}
        onSave={handleCreateReport}
        onCancel={() => setShowCreateModal(false)}
      />
    </div>
  );
}

export default ReportsPage;

