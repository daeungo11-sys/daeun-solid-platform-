import { useState, FormEvent } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const [nickname, setNickname] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (!nickname.trim()) {
      setError(t.loginErrorEmpty || '닉네임을 입력해주세요.');
      return;
    }

    if (nickname.trim().length < 2) {
      setError(t.loginErrorShort || '닉네임은 2자 이상 입력해주세요.');
      return;
    }

    if (nickname.trim().length > 20) {
      setError(t.loginErrorLong || '닉네임은 20자 이하로 입력해주세요.');
      return;
    }

    login(nickname.trim());
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-header">
          <div className="login-icon">
            <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              {/* 얼굴 */}
              <circle cx="100" cy="100" r="80" fill="#FFE5B4" stroke="#FFD700" strokeWidth="3"/>
              
              {/* 왼쪽 눈 */}
              <circle cx="75" cy="85" r="8" fill="#333"/>
              <circle cx="77" cy="83" r="3" fill="#fff"/>
              
              {/* 오른쪽 눈 */}
              <circle cx="125" cy="85" r="8" fill="#333"/>
              <circle cx="127" cy="83" r="3" fill="#fff"/>
              
              {/* 미소 */}
              <path d="M 70 120 Q 100 150 130 120" stroke="#333" strokeWidth="4" fill="none" strokeLinecap="round"/>
              
              {/* 볼 홍조 */}
              <circle cx="60" cy="100" r="12" fill="#FFB6C1" opacity="0.6"/>
              <circle cx="140" cy="100" r="12" fill="#FFB6C1" opacity="0.6"/>
              
              {/* 모자 (선택적) */}
              <ellipse cx="100" cy="40" rx="50" ry="20" fill="#6366f1"/>
              <ellipse cx="100" cy="35" rx="45" ry="15" fill="#4f46e5"/>
              
              {/* 별 장식 */}
              <path d="M 100 25 L 102 30 L 107 30 L 103 33 L 105 38 L 100 35 L 95 38 L 97 33 L 93 30 L 98 30 Z" fill="#FFD700"/>
            </svg>
          </div>
          <h1>{t.loginTitle || '환영합니다!'}</h1>
          <p>{t.loginSubtitle || '닉네임을 입력하여 시작하세요'}</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="nickname">{t.loginNickname}</label>
            <input
              id="nickname"
              type="text"
              value={nickname}
              onChange={(e) => {
                setNickname(e.target.value);
                setError('');
              }}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSubmit(e as any);
                }
              }}
              placeholder={t.loginPlaceholder}
              maxLength={20}
              autoFocus
              className={error ? 'error' : ''}
            />
            {error && <div className="error-message">{error}</div>}
          </div>

          <button type="submit" className="login-button">
            <LogIn size={20} />
            <span>{t.loginButton || '시작하기'}</span>
          </button>
        </form>

        <div className="login-footer">
          <p>{t.loginInfo || '닉네임은 학습 기록을 식별하는 데 사용됩니다.'}</p>
        </div>
      </div>
    </div>
  );
}

