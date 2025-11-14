import { useState, useEffect } from 'react'
import { Calendar as CalendarIcon, TrendingUp, BookOpen, AlertCircle, Bookmark, Target, FileText, X, Flag, Edit2, Trash2, Settings, Languages, Moon, Sun, LogOut } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { useTheme } from '../contexts/ThemeContext'
import { useAuth } from '../contexts/AuthContext'
import { 
  getDiaryEntries, 
  addDiaryEntry, 
  updateDiaryEntry, 
  deleteDiaryEntry, 
  getWrongAnswers, 
  getMyPageStatistics, 
  type DiaryEntry,
  type WrongAnswer,
  type MyPageStatistics
} from '../lib/storage'
import './LearningRecord.css'

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

export default function LearningRecord() {
  const { t } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { language, setLanguage } = useLanguage()
  const { logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'calendar' | 'statistics'>('calendar')
  
  // Calendar 관련 상태
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [showModal, setShowModal] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null)
  const [formData, setFormData] = useState({
    type: 'speaking' as 'speaking' | 'writing' | 'reading',
    difficulty: '하',
    notes: ''
  })

  // MyPage 관련 상태
  const [wrongAnswers, setWrongAnswers] = useState<WrongAnswer[]>([])
  const [statistics, setStatistics] = useState<MyPageStatistics>({
    speaking: { total: 0, completed: 0, averageScore: 0 },
    writing: { total: 0, completed: 0, averageScore: 0 },
    reading: { total: 0, completed: 0, averageScore: 0 }
  })
  const [showWeaknessDetail, setShowWeaknessDetail] = useState(false)
  const [grammarAnalysis, setGrammarAnalysis] = useState<(GrammarAnalysis & { examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> })[]>([])
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState<(VocabularyAnalysis & { examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> })[]>([])
  const [areaWeaknesses, setAreaWeaknesses] = useState<Array<{ area: string; count: number; score: number; examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> }>>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const loadedStatistics = getMyPageStatistics()
      const loadedWrongAnswers = getWrongAnswers()
      setStatistics(loadedStatistics)
      setWrongAnswers(loadedWrongAnswers)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const loadData = () => {
    const loadedEntries = getDiaryEntries()
    setEntries(loadedEntries)
    
    const loadedWrongAnswers = getWrongAnswers()
    const loadedStatistics = getMyPageStatistics()
    setWrongAnswers(loadedWrongAnswers)
    setStatistics(loadedStatistics)
  }

  // Calendar 로직
  const currentDate = new Date()
  const currentMonth = currentDate.toLocaleString('en-US', { month: 'long' })
  const currentYear = currentDate.getFullYear()

  const calendarGrid = (() => {
    const firstDay = new Date(currentYear, currentDate.getMonth(), 1).getDay()
    const daysInMonth = new Date(currentYear, currentDate.getMonth() + 1, 0).getDate()
    const weeks: (number | null)[][] = []
    let currentWeek: (number | null)[] = []
    
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }
    
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }
    
    return weeks
  })()

  const getEntryForDate = (day: number | null) => {
    if (day === null) return null
    const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return entries.find(e => e.date === dateStr) || null
  }

  const handleDateClick = (day: number | null) => {
    if (day === null) return
    const dateStr = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const existingEntry = entries.find(e => e.date === dateStr)
    
    if (existingEntry) {
      setSelectedEntry(existingEntry)
      setFormData({
        type: existingEntry.type,
        difficulty: existingEntry.difficulty,
        notes: existingEntry.notes || ''
      })
    } else {
      setSelectedEntry(null)
      setFormData({
        type: 'speaking',
        difficulty: '하',
        notes: ''
      })
    }
    
    setSelectedDate(dateStr)
    setShowModal(true)
  }

  const handleSaveEntry = () => {
    if (!selectedDate) return

    const entryData: DiaryEntry = {
      id: selectedEntry?.id || Date.now().toString(),
      date: selectedDate,
      type: formData.type,
      difficulty: formData.difficulty,
      notes: formData.notes
    }

    if (selectedEntry) {
      updateDiaryEntry(selectedEntry.id, entryData)
    } else {
      addDiaryEntry(entryData)
    }

    setShowModal(false)
    loadData()
  }

  const handleDeleteEntry = () => {
    if (!selectedEntry) return
    deleteDiaryEntry(selectedEntry.id)
    setShowModal(false)
    loadData()
  }

  // MyPage 로직
  useEffect(() => {
    analyzeData()
  }, [wrongAnswers, statistics])

  const analyzeData = () => {
    const grammarMap = new Map<string, { count: number; examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> }>()
    const vocabMap = new Map<string, { count: number; examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> }>()
    const areaMap = new Map<string, { count: number; score: number; examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> }>()
    let totalErrors = 0

    wrongAnswers.forEach(answer => {
      totalErrors++
      
      // 영역별 분석
      if (answer.type) {
        const area = answer.type
        const existing = areaMap.get(area) || { count: 0, score: 0, examples: [] }
        existing.count++
        existing.examples.push({
          question: answer.question,
          myAnswer: answer.myAnswer,
          correctAnswer: answer.correctAnswer
        })
        areaMap.set(area, existing)
      }
      
      // 문법 분석
      if (answer.grammar && Array.isArray(answer.grammar)) {
        answer.grammar.forEach(grammar => {
          const existing = grammarMap.get(grammar) || { count: 0, examples: [] }
          existing.count++
          existing.examples.push({
            question: answer.question,
            myAnswer: answer.myAnswer,
            correctAnswer: answer.correctAnswer
          })
          grammarMap.set(grammar, existing)
        })
      }
      
      // 어휘 분석
      if (answer.vocabulary && Array.isArray(answer.vocabulary)) {
        answer.vocabulary.forEach(vocab => {
          const existing = vocabMap.get(vocab) || { count: 0, examples: [] }
          existing.count++
          existing.examples.push({
            question: answer.question,
            myAnswer: answer.myAnswer,
            correctAnswer: answer.correctAnswer
          })
          vocabMap.set(vocab, existing)
        })
      }
    })

    const grammarAnalysis: (GrammarAnalysis & { examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> })[] = Array.from(grammarMap.entries())
      .map(([grammar, data]) => ({
        grammar,
        count: data.count,
        percentage: totalErrors > 0 ? Math.round((data.count / totalErrors) * 100) : 0,
        examples: data.examples.slice(0, 3) // 최대 3개 예시만
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    const vocabularyAnalysis: (VocabularyAnalysis & { examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> })[] = Array.from(vocabMap.entries())
      .map(([word, data]) => ({
        word,
        count: data.count,
        difficulty: (data.count > 3 ? 'hard' : data.count > 1 ? 'medium' : 'easy') as 'easy' | 'medium' | 'hard',
        examples: data.examples.slice(0, 3) // 최대 3개 예시만
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 영역별 약점 분석
    const areaWeaknesses: Array<{ area: string; count: number; score: number; examples: Array<{ question: string; myAnswer: string; correctAnswer: string }> }> = Array.from(areaMap.entries())
      .map(([area, data]) => ({
        area,
        count: data.count,
        score: statistics[area as 'speaking' | 'writing' | 'reading']?.averageScore || 0,
        examples: data.examples.slice(0, 2) // 최대 2개 예시만
      }))
      .filter(a => a.score < 80 && a.count > 0)
      .sort((a, b) => a.score - b.score)

    setGrammarAnalysis(grammarAnalysis)
    setVocabularyAnalysis(vocabularyAnalysis)

    const newWeaknesses: string[] = []
    if (statistics.speaking.averageScore < 70 && statistics.speaking.completed > 0) {
      newWeaknesses.push(`${t.speaking || '말하기'}: ${statistics.speaking.averageScore.toFixed(1)}${t.pointUnit || '점'} (${t.belowAverage || '평균 미만'})`)
    }
    if (statistics.writing.averageScore < 70 && statistics.writing.completed > 0) {
      newWeaknesses.push(`${t.writing || '쓰기'}: ${statistics.writing.averageScore.toFixed(1)}${t.pointUnit || '점'} (${t.belowAverage || '평균 미만'})`)
    }
    if (statistics.reading.averageScore < 70 && statistics.reading.completed > 0) {
      newWeaknesses.push(`${t.reading || '읽기'}: ${statistics.reading.averageScore.toFixed(1)}${t.pointUnit || '점'} (${t.belowAverage || '평균 미만'})`)
    }
    grammarAnalysis.forEach(g => {
      if (g.percentage > 20) {
        newWeaknesses.push(`${g.grammar} (${g.count}${t.errorCount || '회'}, ${g.percentage}%)`)
      }
    })
    setWeaknesses(newWeaknesses)
    
    // 영역별 약점 데이터 저장 (모달에서 사용)
    setAreaWeaknesses(areaWeaknesses)
  }

  const handleWeaknessClick = () => {
    setShowWeaknessDetail(!showWeaknessDetail)
  }

  return (
    <div className="learning-record-page">
      <div className="tab-selector">
        <button
          className={`tab-button ${activeTab === 'calendar' ? 'active' : ''}`}
          onClick={() => setActiveTab('calendar')}
        >
          <CalendarIcon size={20} />
          <span>{t.learningRecord}</span>
        </button>
        <button
          className={`tab-button ${activeTab === 'statistics' ? 'active' : ''}`}
          onClick={() => setActiveTab('statistics')}
        >
          <TrendingUp size={20} />
          <span>{t.mypage}</span>
        </button>
      </div>

      {activeTab === 'calendar' && (
        <div className="calendar-section">
          <div className="calendar-header">
            <h2>{currentMonth} {currentYear}</h2>
          </div>
          <div className="calendar-grid">
            {['일', '월', '화', '수', '목', '금', '토'].map(day => (
              <div key={day} className="calendar-day-header">{day}</div>
            ))}
            {calendarGrid.map((week, weekIndex) =>
              week.map((day, dayIndex) => {
                const entry = getEntryForDate(day)
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`calendar-day ${entry ? 'has-entry' : ''} ${day === null ? 'empty' : ''}`}
                    onClick={() => handleDateClick(day)}
                  >
                    {day}
                    {entry && (
                      <div className="entry-indicator">
                        {entry.type === 'speaking' && '🎤'}
                        {entry.type === 'writing' && '✍️'}
                        {entry.type === 'reading' && '📖'}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}

      {activeTab === 'statistics' && (
        <div className="statistics-section">
          {/* MyPage 내용을 여기에 복사 */}
          <div className="mypage-content">
            {/* 통계 섹션 */}
            <div className="stats-section">
              <div className="feature-card">
                <h3>{t.speakingStats}</h3>
                <div className="stat-details">
                  <span>{t.completed}: {statistics.speaking.completed}</span>
                  <span>{t.averageScore}: {statistics.speaking.averageScore.toFixed(1)}</span>
                </div>
              </div>
              <div className="feature-card">
                <h3>{t.writingStats}</h3>
                <div className="stat-details">
                  <span>{t.completed}: {statistics.writing.completed}</span>
                  <span>{t.averageScore}: {statistics.writing.averageScore.toFixed(1)}</span>
                </div>
              </div>
              <div className="feature-card">
                <h3>{t.readingStats}</h3>
                <div className="stat-details">
                  <span>{t.completed}: {statistics.reading.completed}</span>
                  <span>{t.averageScore}: {statistics.reading.averageScore.toFixed(1)}</span>
                </div>
              </div>
            </div>

            {/* 약점 진단 */}
            <div className="feature-card weakness-card" onClick={handleWeaknessClick}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3>{t.weaknessDiagnosis}</h3>
                <span style={{ color: 'var(--primary)', fontSize: '0.875rem', fontWeight: 600 }}>
                  {t.clickToViewDetail || '클릭하여 상세 보기'}
                </span>
              </div>
              {weaknesses.length > 0 ? (
                <p>{t.weaknessFound}: {weaknesses.slice(0, 3).join(', ')}</p>
              ) : (
                <p>{t.noWeakness}</p>
              )}
            </div>

            {/* 오답 노트 */}
            <div className="feature-card">
              <h3>{t.wrongAnswerNote}</h3>
              {wrongAnswers.length > 0 ? (
                <div className="wrong-answers-list">
                  {wrongAnswers.slice(0, 5).map((answer, idx) => (
                    <div key={idx} className="wrong-answer-item">
                      <p><strong>{answer.question}</strong></p>
                      <p>{t.yourAnswer}: {answer.myAnswer}</p>
                      <p>{t.correctAnswer}: {answer.correctAnswer}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p>{t.noWrongAnswers}</p>
              )}
            </div>

            {/* 설정 섹션 */}
            <div className="feature-card settings-card">
              <div className="settings-header">
                <Settings size={24} />
                <h3>{t.settings || '설정'}</h3>
              </div>
              
              <div className="settings-group">
                <label className="settings-label">
                  <Languages size={20} />
                  <span>{t.language || '언어'}</span>
                </label>
                <select 
                  value={language} 
                  onChange={(e) => setLanguage(e.target.value as any)}
                  className="settings-select"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                </select>
              </div>

              <div className="settings-group">
                <label className="settings-label">
                  {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
                  <span>{t.theme || '테마'}</span>
                </label>
                <button 
                  onClick={toggleTheme}
                  className="settings-button"
                >
                  {theme === 'dark' ? t.lightMode || '라이트 모드' : t.darkMode || '다크 모드'}
                </button>
              </div>

              <div className="settings-group">
                <button 
                  onClick={logout}
                  className="settings-button logout-btn"
                >
                  <LogOut size={20} />
                  <span>{t.logout || '로그아웃'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 모달 */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{selectedEntry ? t.editRecord : t.addRecord}</h3>
            <div className="form-group">
              <label>{t.date}</label>
              <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>{t.area}</label>
              <div className="checkbox-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'speaking'}
                    onChange={() => setFormData({ ...formData, type: 'speaking' })}
                  />
                  {t.speaking}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'writing'}
                    onChange={() => setFormData({ ...formData, type: 'writing' })}
                  />
                  {t.writing}
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={formData.type === 'reading'}
                    onChange={() => setFormData({ ...formData, type: 'reading' })}
                  />
                  {t.reading}
                </label>
              </div>
            </div>
            <div className="form-group">
              <label>{t.difficulty}</label>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
              >
                <option value="하">하</option>
                <option value="중">중</option>
                <option value="상">상</option>
              </select>
            </div>
            <div className="form-group">
              <label>{t.memo}</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder={t.memoPlaceholder}
              />
            </div>
            <div className="modal-actions">
              <div className="modal-actions-left">
                {selectedEntry && (
                  <button onClick={handleDeleteEntry} className="btn-danger">
                    <Trash2 size={16} />
                    {t.delete}
                  </button>
                )}
                <button onClick={handleSaveEntry} className="btn-primary">
                  {t.save}
                </button>
              </div>
              <button onClick={() => setShowModal(false)} className="btn-secondary">
                {t.cancel}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 약점 상세 모달 */}
      {showWeaknessDetail && (
        <div className="modal-overlay" onClick={() => setShowWeaknessDetail(false)}>
          <div className="modal-content weakness-detail-content" onClick={(e) => e.stopPropagation()}>
            <h3>{t.weaknessDiagnosisDetail || '약점 진단 상세'}</h3>
            <div className="weakness-detail-content">
              {grammarAnalysis.length > 0 && (
                <div className="weakness-section">
                  <h4>{t.grammarWeakness || '문법 약점'}</h4>
                  {grammarAnalysis.map((item, idx) => (
                    <div key={idx} className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">{item.grammar}</span>
                        <span className="weakness-score">{item.count}{t.errorCount || '회 오류'} ({item.percentage}%)</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${item.percentage}%`, background: 'var(--danger, #ef4444)' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.frequentMistakes || '이 문법 항목에서 자주 실수하고 있습니다.'}</p>
                      {item.examples.length > 0 && (
                        <div className="weakness-examples">
                          <p className="examples-title">{t.exampleMistakes || '실수 예시'}:</p>
                          {item.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="example-item">
                              <p className="example-question"><strong>{t.question || '문제'}:</strong> {ex.question}</p>
                              <p className="example-answer"><strong>{t.yourAnswer || '내 답변'}:</strong> <span className="wrong-text">{ex.myAnswer}</span></p>
                              <p className="example-answer"><strong>{t.correctAnswerLabel || '정답'}:</strong> <span className="correct-text">{ex.correctAnswer}</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {vocabularyAnalysis.length > 0 && (
                <div className="weakness-section">
                  <h4>{t.vocabularyWeakness || '어휘 약점'}</h4>
                  {vocabularyAnalysis.map((item, idx) => (
                    <div key={idx} className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">{item.word}</span>
                        <span className="weakness-score">{item.count}{t.errorCount || '회 오류'}</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${Math.min(item.count * 10, 100)}%`, background: item.difficulty === 'hard' ? 'var(--danger, #ef4444)' : item.difficulty === 'medium' ? '#f59e0b' : '#10b981' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.difficultyAnalysis || '난이도'}: {item.difficulty === 'hard' ? t.hard || '어려움' : item.difficulty === 'medium' ? t.medium || '보통' : t.easy || '쉬움'}</p>
                      {item.examples.length > 0 && (
                        <div className="weakness-examples">
                          <p className="examples-title">{t.exampleMistakes || '실수 예시'}:</p>
                          {item.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="example-item">
                              <p className="example-question"><strong>{t.question || '문제'}:</strong> {ex.question}</p>
                              <p className="example-answer"><strong>{t.yourAnswer || '내 답변'}:</strong> <span className="wrong-text">{ex.myAnswer}</span></p>
                              <p className="example-answer"><strong>{t.correctAnswerLabel || '정답'}:</strong> <span className="correct-text">{ex.correctAnswer}</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {areaWeaknesses.length > 0 && (
                <div className="weakness-section">
                  <h4>{t.areaWeakness || '영역별 약점'}</h4>
                  {areaWeaknesses.map((area, idx) => (
                    <div key={idx} className="weakness-item">
                      <div className="weakness-header">
                        <span className="weakness-name">
                          {area.area === 'speaking' ? t.speaking || '말하기' :
                           area.area === 'writing' ? t.writing || '쓰기' :
                           area.area === 'reading' ? t.reading || '읽기' :
                           area.area === 'levelTest' ? t.levelTest || '레벨 테스트' : area.area}
                        </span>
                        <span className="weakness-score">{area.score.toFixed(1)}{t.pointUnit || '점'} ({area.count}{t.errorCount || '회 오류'})</span>
                      </div>
                      <div className="weakness-progress">
                        <div className="progress-bar">
                          <div className="progress-fill" style={{ width: `${area.score}%`, background: area.score < 50 ? 'var(--danger, #ef4444)' : area.score < 70 ? '#f59e0b' : '#10b981' }}></div>
                        </div>
                      </div>
                      <p className="weakness-desc">{t.belowAverage || '평균 점수가 80점 미만입니다. 더 많은 연습이 필요합니다.'}</p>
                      {area.examples.length > 0 && (
                        <div className="weakness-examples">
                          <p className="examples-title">{t.exampleMistakes || '실수 예시'}:</p>
                          {area.examples.map((ex, exIdx) => (
                            <div key={exIdx} className="example-item">
                              <p className="example-question"><strong>{t.question || '문제'}:</strong> {ex.question}</p>
                              <p className="example-answer"><strong>{t.yourAnswer || '내 답변'}:</strong> <span className="wrong-text">{ex.myAnswer}</span></p>
                              <p className="example-answer"><strong>{t.correctAnswerLabel || '정답'}:</strong> <span className="correct-text">{ex.correctAnswer}</span></p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {grammarAnalysis.length === 0 && vocabularyAnalysis.length === 0 && areaWeaknesses.length === 0 && (
                <div className="no-weakness-message">
                  <p>{t.noWeaknessFound || '현재 발견된 약점이 없습니다. 계속 노력하세요!'}</p>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button onClick={() => setShowWeaknessDetail(false)} className="btn-primary">
                {t.close || '닫기'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

