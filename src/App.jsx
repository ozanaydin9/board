import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { getCurrentUser } from './lib/supabase';
import { initDomainConfig } from './config/domainConfig';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Board from './components/Board';
import ReportsPage from './pages/ReportsPage';
import ReportDetailPage from './pages/ReportDetailPage';
import './App.css';

/**
 * Ana Uygulama Komponenti
 * Authentication ve routing'i yönetir
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  // Sayfa yüklendiğinde domain config ve kullanıcıyı kontrol et
  useEffect(() => {
    initDomainConfig(); // Domain-based branding
    checkUser();
  }, []);

  const checkUser = async () => {
    const currentUser = await getCurrentUser();
    setUser(currentUser);
    setLoading(false);
  };

  const handleLoginSuccess = (loggedInUser) => {
    setUser(loggedInUser);
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleSignUpSuccess = () => {
    setShowSignUp(false);
  };

  if (loading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="app">
      {user ? (
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Board user={user} onLogout={handleLogout} />} />
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:id" element={<ReportDetailPage />} />
          </Routes>
        </BrowserRouter>
      ) : showSignUp ? (
        <SignUp 
          onSignUpSuccess={handleSignUpSuccess}
          onBackToLogin={() => setShowSignUp(false)}
        />
      ) : (
        <Login 
          onLoginSuccess={handleLoginSuccess}
          onSwitchToSignUp={() => setShowSignUp(true)}
        />
      )}
    </div>
  );
}

export default App;
