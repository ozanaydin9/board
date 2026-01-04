import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getReport } from '../lib/supabase';
import ReportViewer from '../components/ReportViewer';
import '../styles/reports-page.css';

/**
 * ReportDetailPage Component
 * Tek bir raporun detay sayfası
 */
function ReportDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadReport();
  }, [id]);

  const loadReport = async () => {
    setLoading(true);
    const { data, error } = await getReport(id);
    
    if (error) {
      setError('Rapor yüklenirken hata oluştu.');
      setLoading(false);
      return;
    }

    if (!data) {
      setError('Rapor bulunamadı.');
      setLoading(false);
      return;
    }

    setReport(data);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="report-detail-page">
        <div className="report-detail-loading">
          <div className="loading-spinner"></div>
          <p>Rapor yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-detail-page">
        <div className="report-detail-error">
          <p>❌ {error}</p>
          <button 
            onClick={() => navigate('/reports')}
            className="back-to-reports-btn"
          >
            ← Raporlara Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="report-detail-page">
      <ReportViewer 
        report={report}
        onClose={() => navigate('/reports')}
      />
    </div>
  );
}

export default ReportDetailPage;

