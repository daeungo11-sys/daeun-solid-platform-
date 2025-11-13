import { useState } from 'react';
import { addSentenceHistory, updateProgress, generatePersonalFeedback } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
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
      // 시뮬레이션: 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 간단한 문법 체크 시뮬레이션
      const corrected = sentence
        .replace(/i\s+/g, 'I ')
        .replace(/i'm/g, "I'm")
        .replace(/i've/g, "I've")
        .replace(/i'll/g, "I'll");
      
      const mockResult: CorrectionResult = {
        original: sentence,
        corrected: corrected !== sentence ? corrected : sentence,
        reason: corrected !== sentence 
          ? '대문자 사용이 필요합니다. "I"는 항상 대문자로 써야 합니다.'
          : '문법적으로 올바른 문장입니다.',
        errorType: corrected !== sentence ? '대소문자 오류' : '오류 없음',
      };
      
      setResult(mockResult);

      addSentenceHistory({
        id: Date.now().toString(),
        original: mockResult.original,
        corrected: mockResult.corrected,
        reason: mockResult.reason,
        errorType: mockResult.errorType,
        timestamp: new Date().toISOString(),
      });

      updateProgress(0);

    } catch (err) {
      setError(err instanceof Error ? err.message : t.grammarCheckFailed);
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





