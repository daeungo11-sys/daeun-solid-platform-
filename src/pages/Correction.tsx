import { useState } from 'react';
import { addSentenceHistory, updateProgress, generatePersonalFeedback } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { correctGrammar } from '../lib/groq';
import './Correction.css';

interface CorrectionResult {
  original: string;
  corrected: string;
  reason: string;
  errorType: string;
}

export default function Correction() {
  const { t } = useLanguage();
  const [sentence, setSentence] = useState('');
  const [result, setResult] = useState<CorrectionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [feedback, setFeedback] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sentence.trim()) {
      setError(t.pleaseEnterSentence);
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Groq API를 사용하여 문법 교정
      const result = await correctGrammar(sentence);
      
      setResult({
        original: result.original,
        corrected: result.corrected,
        reason: result.reason,
        errorType: result.errorType,
      });

      addSentenceHistory({
        id: Date.now().toString(),
        original: result.original,
        corrected: result.corrected,
        reason: result.reason,
        errorType: result.errorType,
        timestamp: new Date().toISOString(),
      });

      updateProgress(0);

    } catch (err) {
      let errorMessage = t.grammarCheckFailed;
      if (err instanceof Error) {
        if (err.message.includes('API 키')) {
          errorMessage = '⚠️ Groq API 키가 설정되지 않았습니다. Vercel 환경 변수에 VITE_GROQ_API_KEY를 추가해주세요.';
        } else {
          errorMessage = err.message;
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleShowFeedback = () => {
    const personalFeedback = generatePersonalFeedback();
    setFeedback(personalFeedback);
  };

  return (
    <div className="correction-page">
      <div className="correction-container">
        <h1>📝 {t.correctionPageTitle}</h1>
        <p className="page-desc">{t.correctionPageDesc}</p>
        
        <form onSubmit={handleSubmit} className="correction-form">
          <div className="form-group">
            <label htmlFor="sentence">{t.correctionPageDesc}</label>
            <textarea
              id="sentence"
              value={sentence}
              onChange={(e) => setSentence(e.target.value)}
              placeholder={t.enterSentence}
              disabled={loading}
              rows={4}
            />
          </div>

          {error && (
            <div className="error-message">{error}</div>
          )}

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? t.checking : t.checkGrammar}
          </button>
        </form>

        {result && (
          <div className="result-section">
            <div className="result-item">
              <span className="result-label">❌ {t.original}</span>
              <p>{result.original}</p>
            </div>
            <div className="result-item">
              <span className="result-label">✅ {t.corrected}</span>
              <p className="corrected-text">{result.corrected}</p>
            </div>
            <div className="result-item">
              <span className="result-label">💬 {t.explanation}</span>
              <p>{result.reason}</p>
            </div>
            <div className="result-item">
              <span className="result-label">{t.errorType}:</span>
              <span className="error-type-badge">{result.errorType}</span>
            </div>
            <div className="success-message">{t.savedToHistory}</div>
          </div>
        )}

        <div className="feedback-section">
          <div className="feedback-header">
            <h3>📊 {t.personalFeedback}</h3>
            <button onClick={handleShowFeedback} className="btn-secondary">
              {t.showFeedback}
            </button>
          </div>
          {feedback && (
            <div className="feedback-content">
              <pre>{feedback}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}





