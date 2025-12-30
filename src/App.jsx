import { useState, useEffect } from 'react';
import { getCurrentUser } from './lib/supabase';
import Login from './components/Login';
import SignUp from './components/SignUp';
import Board from './components/Board';
import './App.css';

/**
 * Ana Uygulama Komponenti
 * Authentication ve routing'i yönetir
 */
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSignUp, setShowSignUp] = useState(false);

  // Sayfa yüklendiğinde mevcut kullanıcıyı kontrol et
  useEffect(() => {
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
        <Board user={user} onLogout={handleLogout} />
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
