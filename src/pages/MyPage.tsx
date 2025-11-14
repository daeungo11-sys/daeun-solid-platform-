import { useState, useEffect } from 'react'
import { TrendingUp, BookOpen, AlertCircle, Bookmark, Target, FileText, X } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { getWrongAnswers, getMyPageStatistics, type WrongAnswer, type MyPageStatistics } from '../lib/storage'
import './MyPage.css'

interface GrammarAnalysis {
  grammar: string
  count: number
  percentage: number
}

interface VocabularyAnalysis {
  word: string
  count: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function MyPage() {
  const { t } = useLanguage()
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [statistics, setStatistics] = useState<MyPageStatistics>({
    speaking: { total: 0, completed: 0, averageScore: 0 },
    writing: { total: 0, completed: 0, averageScore: 0 },
    reading: { total: 0, completed: 0, averageScore: 0 }
  })
  const [showWeaknessDetail, setShowWeaknessDetail] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState<GrammarAnalysis[]>([])
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState<VocabularyAnalysis[]>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])

  useEffect(() => {
    // 사용자별 데이터 로드 (초기화는 한 번만 실행)
    const loadedWrongAnswers = getWrongAnswers()
    const loadedStatistics = getMyPageStatistics()
    
    setWrongAnswers(loadedWrongAnswers)
    setStatistics(loadedStatistics)
  }, [])

  // 통계와 오답 노트가 업데이트될 때마다 다시 로드
  useEffect(() => {
    const interval = setInterval(() => {
      const loadedStatistics = getMyPageStatistics()
      const loadedWrongAnswers = getWrongAnswers()
      setStatistics(loadedStatistics)
      setWrongAnswers(loadedWrongAnswers)
    }, 2000) // 2초마다 통계 및 오답 노트 업데이트 확인

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    // 문법 분석
    const grammarMap: Record<string, number> = {}
    wrongAnswers.forEach((answer) => {
      answer.grammar?.forEach((g) => {
        grammarMap[g] = (grammarMap[g] || 0) + 1
      })
    })

    const total = wrongAnswers.length
    const grammarList: GrammarAnalysis[] = Object.entries(grammarMap)
      .map(([grammar, count]) => ({
        grammar,
        count,
        percentage: (count / total) * 100
      }))
      .sort((a, b) => b.count - a.count)

    setGrammarAnalysis(grammarList)

    // 어휘 분석
    const vocabMap: Record<string, number> = {}
    wrongAnswers.forEach((answer) => {
      answer.vocabulary?.forEach((v) => {
        vocabMap[v] = (vocabMap[v] || 0) + 1
      })
    })

    const vocabList: VocabularyAnalysis[] = Object.entries(vocabMap)
      .map(([word, count]) => ({
        word,
        count,
        difficulty: (count >= 3 ? 'hard' : count >= 2 ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard'
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    setVocabularyAnalysis(vocabList)

    // 약점 진단
    const weaknessList: string[] = []
    if (statistics.speaking.averageScore < 80 && statistics.speaking.completed > 0) weaknessList.push('말하기')
    if (statistics.writing.averageScore < 80 && statistics.writing.completed > 0) weaknessList.push('쓰기')
    if (statistics.reading.averageScore < 80 && statistics.reading.completed > 0) weaknessList.push('읽기')
    
    grammarList.forEach((g) => {
      if (g.percentage > 30) {
        weaknessList.push(`${g.grammar} 문법`)
      }
    })

    setWeaknesses(weaknessList)
  }, [wrongAnswers, statistics])

  const handleWeaknessClick = () => {
    if (weaknesses.length > 0) {
      setShowWeaknessDetail(true)
    }
  }

  return (
    <div className="mypage">
      <div className="mypage-header">
        <h1>{t.mypagePageTitle}</h1>
        <p>{t.mypagePageDesc}</p>
      </div>

      <div className="features">
        <div className="feature-card speaking">
          <div className="icon-container speaking">
            <Target size={40} />
            </div>
          <h2>{t.speakingStats}</h2>
          <p>{t.completed}: {statistics.speaking.completed} / {statistics.speaking.total} | {t.averageScore}: {statistics.speaking.averageScore}</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.speaking.completed} {t.completed}</span>
            <span className="tag"><TrendingUp size={14} /> {t.averageScore} {statistics.speaking.averageScore}</span>
              </div>
            </div>

        <div className="feature-card writing">
          <div className="icon-container writing">
            <BookOpen size={40} />
          </div>
          <h2>{t.writingStats}</h2>
          <p>{t.completed}: {statistics.writing.completed} / {statistics.writing.total} | {t.averageScore}: {statistics.writing.averageScore}</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.writing.completed} {t.completed}</span>
            <span className="tag"><TrendingUp size={14} /> {t.averageScore} {statistics.writing.averageScore}</span>
              </div>
            </div>

        <div className="feature-card reading">
          <div className="icon-container reading">
            <TrendingUp size={40} />
          </div>
          <h2>{t.readingStats}</h2>
          <p>{t.completed}: {statistics.reading.completed} / {statistics.reading.total} | {t.averageScore}: {statistics.reading.averageScore}</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.reading.completed} {t.completed}</span>
            <span className="tag"><TrendingUp size={14} /> {t.averageScore} {statistics.reading.averageScore}</span>
          </div>
        </div>

        <div className="feature-card weakness" onClick={handleWeaknessClick} style={{ cursor: weaknesses.length > 0 ? 'pointer' : 'default' }}>
          <div className="icon-container weakness">
            <AlertCircle size={40} />
      </div>
          <h2>{t.weaknessDiagnosis}</h2>
          <p>{weaknesses.length > 0 ? `${weaknesses.length}${t.weaknessFound}` : t.noWeakness}</p>
          <div className="feature-tags">
            {weaknesses.length > 0 ? (
              <>
                <span className="tag"><AlertCircle size={14} /> {weaknesses.length}{t.weaknessFoundLabel}</span>
                <span className="tag"><Target size={14} /> {t.autoAnalysis}</span>
                <span className="tag" style={{ marginTop: '0.5rem', display: 'block', fontSize: '0.85rem', opacity: 0.8 }}>{t.clickToViewDetail}</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> {t.excellentScore}</span>
            )}
          </div>
        </div>

        <div className="feature-card grammar">
          <div className="icon-container grammar">
            <BookOpen size={40} />
          </div>
          <h2>{t.grammarAnalysis}</h2>
          <p>{grammarAnalysis.length > 0 ? `${grammarAnalysis.length}${t.grammarItemsAnalyzed}` : t.noGrammarErrors}</p>
          <div className="feature-tags">
            {grammarAnalysis.length > 0 ? (
              <>
                <span className="tag"><BookOpen size={14} /> {grammarAnalysis.length}{t.grammarItems}</span>
                <span className="tag"><Target size={14} /> {t.detailedAnalysis}</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> {t.perfect}</span>
            )}
          </div>
        </div>

        <div className="feature-card vocabulary">
          <div className="icon-container vocabulary">
            <Bookmark size={40} />
          </div>
          <h2>{t.vocabularyAnalysis}</h2>
          <p>{vocabularyAnalysis.length > 0 ? `${vocabularyAnalysis.length}${t.vocabularyAnalyzed}` : t.noVocabulary}</p>
          <div className="feature-tags">
            {vocabularyAnalysis.length > 0 ? (
              <>
                <span className="tag"><Bookmark size={14} /> {vocabularyAnalysis.length}{t.vocabularyItems}</span>
                <span className="tag"><Target size={14} /> {t.difficultyAnalysis}</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> {t.perfect}</span>
            )}
          </div>
        </div>

        <div className="feature-card wrong-answers">
          <div className="icon-container wrong-answers">
            <FileText size={40} />
                </div>
          <h2>{t.wrongAnswerNote}</h2>
          <p>{wrongAnswers.length > 0 ? `${wrongAnswers.length}${t.wrongAnswersRecorded}` : t.noWrongAnswers}</p>
          <div className="feature-tags">
            {wrongAnswers.length > 0 ? (
              <>
                <span className="tag"><FileText size={14} /> {wrongAnswers.length}{t.answersRecorded}</span>
                <span className="tag"><Target size={14} /> {t.reviewNeeded}</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> {t.noWrongAnswersLabel}</span>
            )}
          </div>
        </div>
      </div>

      {showWeaknessDetail && (
        <div className="modal-overlay" onClick={() => setShowWeaknessDetail(false)}>
          <div className="modal-content weakness-detail" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t.weaknessDiagnosis} {t.detailedAnalysis}</h2>
              <button onClick={() => setShowWeaknessDetail(false)} className="close-button">
                <X size={24} />
              </button>
            </div>
            
            <div className="weakness-detail-content">
              <div className="weakness-section">
                <h3>📊 {t.areaWeakness}</h3>
                <div className="weakness-list">
                  {statistics.speaking.averageScore < 80 && statistics.speaking.completed > 0 && (
                    <div className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">{t.speaking}</span>
                        <span className="weakness-score">{statistics.speaking.averageScore}{t.pointUnit}</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${statistics.speaking.averageScore}%`, backgroundColor: '#ef4444' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.belowAverage}</p>
                    </div>
                  )}
                  {statistics.writing.averageScore < 80 && statistics.writing.completed > 0 && (
                    <div className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">{t.writing}</span>
                        <span className="weakness-score">{statistics.writing.averageScore}{t.pointUnit}</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${statistics.writing.averageScore}%`, backgroundColor: '#ef4444' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.belowAverage}</p>
                    </div>
                  )}
                  {statistics.reading.averageScore < 80 && statistics.reading.completed > 0 && (
                    <div className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">{t.reading}</span>
                        <span className="weakness-score">{statistics.reading.averageScore}{t.pointUnit}</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${statistics.reading.averageScore}%`, backgroundColor: '#ef4444' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.belowAverage}</p>
                    </div>
                  )}
                </div>
                </div>

              {grammarAnalysis.length > 0 && (
                <div className="weakness-section">
                  <h3>📚 {t.grammarWeakness}</h3>
                  <div className="weakness-list">
                    {grammarAnalysis.filter(g => g.percentage > 30).map((g, idx) => (
                      <div key={idx} className="weakness-item">
                        <div className="weakness-header">
                          <span className="weakness-name">{g.grammar}</span>
                          <span className="weakness-score">{g.count}{t.errorCount} ({g.percentage.toFixed(1)}%)</span>
                  </div>
                        <div className="weakness-progress">
                          <div className="progress-bar">
                            <div className="progress-fill" style={{ width: `${g.percentage}%`, backgroundColor: '#f59e0b' }}></div>
                  </div>
                </div>
                        <p className="weakness-desc">{t.frequentMistakes}</p>
                </div>
                    ))}
                  </div>
                  </div>
                )}

              {weaknesses.length === 0 && (
                <div className="no-weakness-message">
                  <TrendingUp size={48} />
                  <p>{t.excellentScore}</p>
                  <p>{t.noWeaknessFound}</p>
                  </div>
                )}
              </div>
          </div>
        </div>
      )}
    </div>
  )
}

