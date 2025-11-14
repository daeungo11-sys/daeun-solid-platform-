import { useState, FormEvent } from 'react';
import { LogIn, User } from 'lucide-react';
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
            <User size={64} />
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

