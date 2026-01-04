import { useState, useEffect } from 'react';
import { signIn } from '../lib/supabase';
import getDomainConfig from '../config/domainConfig';
import '../styles/login.css';

/**
 * Login Component
 * Kullanıcı girişi için basit bir form
 */
function Login({ onLoginSuccess, onSwitchToSignUp }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Domain config'i al
    const domainConfig = getDomainConfig();
    setConfig(domainConfig);
    
    // Page title'ı güncelle
    document.title = domainConfig.title;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error } = await signIn(email, password);
      
      if (error) {
        setError(error.message);
      } else if (data?.user) {
        onLoginSuccess(data.user);
      }
    } catch (err) {
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <div className="login-header">
          <div 
            className="logo"
            style={config?.logoGradient ? {
              background: config.logoGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : {}}
          >
            {config?.logo || '🍒'}
          </div>
          <h1 
            style={config?.titleGradient ? {
              background: config.titleGradient,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            } : {}}
          >
            {config?.appName || 'TaskCherry'}
          </h1>
          <p className="login-subtitle">{config?.loginSubtitle || 'Görevlerinizi tatlı bir şekilde yönetin'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">E-posta</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ornek@email.com"
              required
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Şifre</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              autoComplete="current-password"
            />
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
            style={config?.buttonGradient ? {
              background: config.buttonGradient,
            } : {}}
            onMouseEnter={(e) => {
              if (config?.buttonHoverGradient) {
                e.currentTarget.style.background = config.buttonHoverGradient;
              }
            }}
            onMouseLeave={(e) => {
              if (config?.buttonGradient) {
                e.currentTarget.style.background = config.buttonGradient;
              }
            }}
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="login-footer">
          <p className="info-text">
            Hesabınız yok mu?{' '}
            <button
              onClick={onSwitchToSignUp}
              style={{
                background: 'none',
                border: 'none',
                color: '#3b82f6',
                cursor: 'pointer',
                textDecoration: 'underline',
                fontSize: 'inherit',
                padding: 0,
              }}
            >
              Kayıt Ol
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;

