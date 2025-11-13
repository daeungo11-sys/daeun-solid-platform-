import { useState, useEffect } from 'react';
import {
  getVocabulary,
  addVocabulary,
  markVocabularyReviewed,
  getVocabularyForReview,
  deleteVocabulary,
  getUserLevel,
  getTestResults,
  saveTestResult,
  deleteTestResult,
  getLevelName,
  type VocabularyItem,
  type CEFRLevel,
} from '../lib/storage';
import { getRandomWordsByLevel, type RecommendedWord } from '../lib/recommendedWords';
import { useLanguage } from '../contexts/LanguageContext';
import './Vocabulary.css';

type TestWord = {
  word: string;
  meaning: string;
  example?: string;
  id?: string;
};

export default function Vocabulary() {
  const { t } = useLanguage();
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [reviewList, setReviewList] = useState<VocabularyItem[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'review'>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newWord, setNewWord] = useState({ word: '', meaning: '', example: '' });

  // 테스트 모드
  type TestType = 'my_words' | 'recommended' | null;
  const [testType, setTestType] = useState<TestType>(null);
  const [testMode, setTestMode] = useState(false);
  const [testWords, setTestWords] = useState<TestWord[]>([]);
  const [currentTestIndex, setCurrentTestIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [testScore, setTestScore] = useState({ correct: 0, total: 0 });

  const [userLevel, setUserLevel] = useState<CEFRLevel>('Not Set');

  useEffect(() => {
    loadVocabulary();
  }, []);

  const loadVocabulary = () => {
    setVocabulary(getVocabulary());
    setReviewList(getVocabularyForReview());
    const level = getUserLevel();
    setUserLevel(level?.level || 'Not Set');
  };

  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word.trim() || !newWord.meaning.trim()) return;

    addVocabulary({
      word: newWord.word,
      meaning: newWord.meaning,
      example: newWord.example,
      source: 'manual',
    });

    setNewWord({ word: '', meaning: '', example: '' });
    setShowAddForm(false);
    loadVocabulary();
  };

  const handleReview = (id: string) => {
    markVocabularyReviewed(id);
    loadVocabulary();
  };

  const handleDelete = (id: string) => {
    if (confirm('이 단어를 삭제하시겠습니까?')) {
      deleteVocabulary(id);
      loadVocabulary();
    }
  };

  const startMyWordsTest = () => {
    const wordsToTest = reviewList.length > 0 ? reviewList : vocabulary.filter((v) => !v.mastered);
    if (wordsToTest.length === 0) {
      alert('테스트할 단어가 없어요! 단어를 먼저 추가해주세요.');
      return;
    }

    const shuffled = [...wordsToTest].sort(() => Math.random() - 0.5);
    setTestType('my_words');
    setTestWords(shuffled);
    setCurrentTestIndex(0);
    setTestScore({ correct: 0, total: shuffled.length });
    setTestMode(true);
    setUserAnswer('');
    setAnswerSubmitted(false);
    setIsAnswerCorrect(false);
  };

  const startRecommendedTest = () => {
    if (userLevel === 'Not Set') {
      alert('먼저 레벨 테스트를 완료해주세요!');
      return;
    }

    const recommendedWords = getRandomWordsByLevel(userLevel, 10);
    if (recommendedWords.length === 0) {
      alert('권장 단어가 없어요!');
      return;
    }

    setTestType('recommended');
    setTestWords(recommendedWords);
    setCurrentTestIndex(0);
    setTestScore({ correct: 0, total: recommendedWords.length });
    setTestMode(true);
    setUserAnswer('');
    setAnswerSubmitted(false);
    setIsAnswerCorrect(false);
  };

  const checkAnswerSimilarity = (userInput: string, correctMeaning: string): boolean => {
    const normalize = (str: string) => str.toLowerCase().trim().replace(/\s+/g, ' ');
    const normalizedInput = normalize(userInput);
    const normalizedCorrect = normalize(correctMeaning);

    if (normalizedInput === normalizedCorrect) return true;

    const keywords = normalizedCorrect.split(/[,\/\(\)]/g).map((k) => k.trim()).filter((k) => k.length > 0);
    return keywords.some((keyword) => {
      const keywordWords = keyword.split(' ').filter((w) => w.length > 1);
      return keywordWords.some((w) => normalizedInput.includes(w) && w.length >= 2);
    });
  };

  const handleSubmitAnswer = () => {
    if (!userAnswer.trim()) return;

    const currentWord = testWords[currentTestIndex];
    const isCorrect = checkAnswerSimilarity(userAnswer, currentWord.meaning);

    setIsAnswerCorrect(isCorrect);
    setAnswerSubmitted(true);
  };

  const handleNextQuestion = () => {
    const currentWord = testWords[currentTestIndex];

    if (isAnswerCorrect) {
      setTestScore((prev) => ({ ...prev, correct: prev.correct + 1 }));
      if (testType === 'my_words' && currentWord.id) {
        markVocabularyReviewed(currentWord.id);
      }
    }

    if (currentTestIndex < testWords.length - 1) {
      setCurrentTestIndex(currentTestIndex + 1);
      setUserAnswer('');
      setAnswerSubmitted(false);
      setIsAnswerCorrect(false);
    } else {
      const finalScore = isAnswerCorrect ? testScore.correct + 1 : testScore.correct;
      saveTestResult({
        type: testType || 'my_words',
        level: testType === 'recommended' ? userLevel : undefined,
        score: finalScore,
        total: testScore.total,
        words: [],
      });

      alert(`테스트 완료!\n\n정답: ${finalScore}/${testScore.total}\n정답률: ${Math.round((finalScore / testScore.total) * 100)}%`);
      setTestMode(false);
      setTestType(null);
      loadVocabulary();
    }
  };

  if (testMode && testWords.length > 0) {
    const currentWord = testWords[currentTestIndex];
    const progress = ((currentTestIndex + 1) / testWords.length) * 100;

    return (
      <div className="vocabulary-page">
        <div className="test-container">
          <div className="test-header">
            <h2>단어 테스트</h2>
            <button onClick={() => setTestMode(false)} className="btn-secondary">
              종료
            </button>
          </div>

          <div className="test-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }}></div>
            </div>
            <div className="progress-info">
              <span>{currentTestIndex + 1} / {testWords.length}</span>
              <span>정답: {testScore.correct}</span>
            </div>
          </div>

          <div className="test-card">
            <div className="word-display">
              <h1>{currentWord.word}</h1>
              {currentWord.example && <p className="example">예문: "{currentWord.example}"</p>}
            </div>

            {!answerSubmitted ? (
              <div className="answer-input">
                <label>이 단어의 뜻을 입력하세요</label>
                <input
                  type="text"
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && userAnswer.trim()) {
                      handleSubmitAnswer();
                    }
                  }}
                  placeholder="예: 행복한"
                  autoFocus
                />
                <button onClick={handleSubmitAnswer} disabled={!userAnswer.trim()} className="btn-primary">
                  제출하기
                </button>
              </div>
            ) : (
              <div className="answer-result">
                <div className={`result-box ${isAnswerCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="result-icon">{isAnswerCorrect ? '🎉' : '😅'}</div>
                  <div className="result-text">
                    {isAnswerCorrect ? '정답입니다!' : '아쉬워요!'}
                  </div>
                  <div className="user-answer">입력한 답: {userAnswer}</div>
                  {!isAnswerCorrect && (
                    <div className="correct-answer">정답: {currentWord.meaning}</div>
                  )}
                </div>
                <button onClick={handleNextQuestion} className="btn-primary">
                  {currentTestIndex < testWords.length - 1 ? '다음 단어 →' : '테스트 완료'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const stats = {
    total: vocabulary.length,
    mastered: vocabulary.filter((v) => v.mastered).length,
    needReview: reviewList.length,
  };

  return (
    <div className="vocabulary-page">
      <div className="vocabulary-container">
        <div className="vocabulary-header">
          <div>
            <h1>📚 {t.vocabularyPageTitle}</h1>
            <p>{t.vocabularyPageDesc}</p>
          </div>
          <div className="header-actions">
            <button onClick={startRecommendedTest} className="btn-primary">
              레벨별 단어 테스트
            </button>
            <button onClick={startMyWordsTest} className="btn-primary">
              내 단어 테스트
            </button>
            <button onClick={() => setShowAddForm(!showAddForm)} className="btn-secondary">
              + {t.addWord}
            </button>
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">총 단어</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">암기 완료</div>
            <div className="stat-value">{stats.mastered}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">복습 필요</div>
            <div className="stat-value">{stats.needReview}</div>
          </div>
        </div>

        {showAddForm && (
          <form onSubmit={handleAddWord} className="add-word-form">
            <h3>새 단어 추가</h3>
            <div className="form-row">
              <div className="form-group">
                <label>{t.word} (필수)</label>
                <input
                  type="text"
                  value={newWord.word}
                  onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                  placeholder="예: ubiquitous"
                  required
                />
              </div>
              <div className="form-group">
                <label>{t.meaning} (필수)</label>
                <input
                  type="text"
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="예: 어디에나 있는"
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label>{t.example} (선택)</label>
              <input
                type="text"
                value={newWord.example}
                onChange={(e) => setNewWord({ ...newWord, example: e.target.value })}
                placeholder="예: Smartphones are ubiquitous."
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">추가</button>
              <button type="button" onClick={() => setShowAddForm(false)} className="btn-secondary">
                취소
              </button>
            </div>
          </form>
        )}

        <div className="tabs">
          <button
            onClick={() => setActiveTab('all')}
            className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          >
            전체 단어 ({vocabulary.length})
          </button>
          <button
            onClick={() => setActiveTab('review')}
            className={`tab ${activeTab === 'review' ? 'active' : ''}`}
          >
            복습할 단어 ({reviewList.length})
          </button>
        </div>

        <div className="words-list">
          {(activeTab === 'all' ? vocabulary : reviewList).map((item) => (
            <div key={item.id} className={`word-card ${item.mastered ? 'mastered' : ''}`}>
              <div className="word-content">
                <div className="word-header">
                  <h3>{item.word}</h3>
                  {item.mastered && <span className="mastered-badge">✓ 암기 완료</span>}
                </div>
                <p className="meaning">{item.meaning}</p>
                {item.example && <p className="example">"{item.example}"</p>}
              </div>
              <div className="word-actions">
                {!item.mastered && (
                  <button onClick={() => handleReview(item.id)} className="btn-success">
                    ✓ 복습 완료
                  </button>
                )}
                <button onClick={() => handleDelete(item.id)} className="btn-danger">
                  🗑️ 삭제
                </button>
              </div>
            </div>
          ))}
          {(activeTab === 'all' ? vocabulary : reviewList).length === 0 && (
            <div className="empty-state">
              <p>등록된 단어가 없습니다.</p>
              <button onClick={() => setShowAddForm(true)} className="btn-primary">
                첫 번째 단어 추가하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


