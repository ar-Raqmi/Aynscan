import React, { useState, useEffect } from 'react';
import './Login.css';

interface LoginProps {
  onLogin: () => void;
}

const PASSWORD_HASH = 'password';

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 600);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD_HASH) {
      setIsExiting(true);
      setTimeout(() => {
        onLogin();
      }, 1100);
    } else {
      setError(true);
      setTimeout(() => setError(false), 600);
      setPassword('');
    }
  };

  return (
    <div className={`login-container ${isExiting ? 'exiting' : ''}`}>
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
      </svg>

      <div className="gooey-bg">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="blob blob-3"></div>
      </div>

      <div className="supernova-overlay"></div>

      <div className="login-content">
        <div className="brand-container">
          <h1 className="brand-title">AYNSCAN</h1>
          <span className="brand-subtitle">by ar-Raqmi</span>
        </div>
        
        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '30px' }}>
          
          <div className={`input-pill-container ${error ? 'error-shake' : ''}`}>
            <span className="material-symbols-outlined pill-icon">lock</span>
            <input 
              type="password" 
              className="pill-input"
              placeholder="PASSWORD"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
            />
          </div>

          <button type="submit" className="action-btn">
            UNLOCK
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;