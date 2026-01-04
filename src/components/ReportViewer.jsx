import { useState } from 'react';
import DashboardWidget from './DashboardWidget';
import Column from './Column';
import Card from './Card';
import '../styles/report-viewer.css';

/**
 * ReportViewer Component
 * Kaydedilmiş bir raporun (snapshot) görüntüleyicisi
 */
function ReportViewer({ report, onClose }) {
  const [activeView, setActiveView] = useState('overview'); // 'overview' | 'board'
  const [expandedColumns, setExpandedColumns] = useState([]); // Açık kolonların ID'leri

  if (!report) return null;

  const snapshot = report.snapshot_data;
  const metadata = snapshot.metadata || {};

  const toggleColumn = (columnId) => {
    setExpandedColumns(prev => 
      prev.includes(columnId) 
        ? prev.filter(id => id !== columnId)
        : [...prev, columnId]
    );
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

  const formatPrice = (price) => {
    return `₺${price.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="report-viewer-overlay">
      <div className="report-viewer-container">
        {/* Header */}
        <div className="report-viewer-header">
          <div className="report-viewer-title-section">
            <h2 className="report-viewer-title">📊 {report.title}</h2>
            {report.description && (
              <p className="report-viewer-description">{report.description}</p>
            )}
            <span className="report-viewer-date">
              📅 {formatDate(report.created_at)}
            </span>
          </div>
          <button onClick={onClose} className="report-viewer-close">✕</button>
        </div>

        {/* View Tabs */}
        <div className="report-viewer-tabs">
          <button
            onClick={() => setActiveView('overview')}
            className={`report-tab ${activeView === 'overview' ? 'active' : ''}`}
          >
            📈 Özet
          </button>
          <button
            onClick={() => setActiveView('board')}
            className={`report-tab ${activeView === 'board' ? 'active' : ''}`}
          >
            📋 Board Görünümü
          </button>
        </div>

        {/* Content */}
        <div className="report-viewer-content">
          {activeView === 'overview' ? (
            <div className="report-overview">
              {/* Widgets */}
              {snapshot.widgets && snapshot.widgets.length > 0 && (
                <div className="report-widgets-section">
                  <h3 className="report-section-title">Dashboard Widget'ları</h3>
                  <div className="report-widgets-grid">
                    {snapshot.widgets.map(widget => (
                      <DashboardWidget
                        key={widget.id}
                        widget={widget}
                        cards={snapshot.cards || []}
                        columns={snapshot.columns || []}
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
                    <div className="stat-icon">📋</div>
                    <div className="stat-info">
                      <span className="stat-label">Toplam Kolon</span>
                      <span className="stat-value">{snapshot.columns?.length || 0}</span>
                    </div>
                  </div>
                  <div className="report-stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-info">
                      <span className="stat-label">Toplam Kart</span>
                      <span className="stat-value">{snapshot.cards?.length || 0}</span>
                    </div>
                  </div>
                  <div className="report-stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-info">
                      <span className="stat-label">Toplam Değer</span>
                      <span className="stat-value">
                        {formatPrice(metadata.totalPrice || 0)}
                      </span>
                    </div>
                  </div>
                  <div className="report-stat-card">
                    <div className="stat-icon">⭐</div>
                    <div className="stat-info">
                      <span className="stat-label">Yüksek Öncelikli</span>
                      <span className="stat-value">
                        {snapshot.cards?.filter(c => c.priority >= 4).length || 0}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Columns Summary with Accordion */}
              <div className="report-columns-section">
                <h3 className="report-section-title">Kolonlar</h3>
                <div className="report-columns-list">
                  {snapshot.columns?.map(column => {
                    const columnCards = snapshot.cards?.filter(c => c.column_id === column.id) || [];
                    const columnTotal = columnCards.reduce((sum, card) => sum + (parseFloat(card.price) || 0), 0);
                    const isExpanded = expandedColumns.includes(column.id);
                    
                    return (
                      <div key={column.id} className={`report-column-summary ${isExpanded ? 'expanded' : ''}`}>
                        {!isExpanded ? (
                          // Kapalı durum - Özet kartı
                          <div 
                            className="column-summary-header"
                            onClick={() => toggleColumn(column.id)}
                          >
                            <div className="column-summary-title-wrapper">
                              <span className="column-expand-icon">▶</span>
                              <span className="column-summary-title">
                                {column.pinned && '📌 '}
                                {column.title}
                              </span>
                            </div>
                            <div className="column-summary-meta">
                              <span className="column-summary-count">{columnCards.length} kart</span>
                              {columnTotal > 0 && (
                                <span className="column-summary-total-badge">
                                  {formatPrice(columnTotal)}
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          // Açık durum - Gerçek kolon
                          <div className="expanded-column-wrapper">
                            <button 
                              className="collapse-column-btn"
                              onClick={() => toggleColumn(column.id)}
                              title="Kapat"
                            >
                              ✕ Kapat
                            </button>
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
                              maxStars={snapshot.userSettings?.star_count || 5}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="report-board-view">
              <div className="report-board-columns">
                {snapshot.columns?.map(column => {
                  const columnCards = snapshot.cards?.filter(c => c.column_id === column.id) || [];
                  return (
                    <div key={column.id} className="report-column-wrapper">
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
                        maxStars={snapshot.userSettings?.star_count || 5}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReportViewer;

