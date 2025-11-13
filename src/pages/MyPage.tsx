import { useState, useEffect } from 'react'
import { BarChart3, TrendingUp, BookOpen, AlertCircle, Bookmark, Target } from 'lucide-react'
import './MyPage.css'

interface WrongAnswer {
  id: number
  question: string
  type: string
  myAnswer: string
  correctAnswer: string
  explanation: string
  date: string
  grammar?: string[]
  vocabulary?: string[]
}

interface Statistics {
  speaking: {
    total: number
    completed: number
    averageScore: number
  }
  writing: {
    total: number
    completed: number
    averageScore: number
  }
  reading: {
    total: number
    completed: number
    averageScore: number
  }
}

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

// Mock 데이터
const mockWrongAnswers: WrongAnswer[] = [
  {
    id: 1,
    question: '다음 중 빈칸에 들어갈 가장 적절한 단어는?',
    type: '객관식',
    myAnswer: 'what',
    correctAnswer: 'which',
    explanation: 'which는 한정적 관계대명사로, 앞에 나온 명사를 한정할 때 사용합니다.',
    date: '2024-01-15',
    grammar: ['관계대명사'],
    vocabulary: ['which']
  },
  {
    id: 2,
    question: '"I have been studying English for three years."에서 사용된 시제는?',
    type: '객관식',
    myAnswer: '과거완료',
    correctAnswer: '현재완료',
    explanation: '현재완료는 have/has + p.p 형태로, 과거부터 현재까지 계속된 동작을 나타냅니다.',
    date: '2024-01-15',
    grammar: ['현재완료'],
    vocabulary: []
  }
]

const mockStatistics: Statistics = {
  speaking: {
    total: 30,
    completed: 25,
    averageScore: 85
  },
  writing: {
    total: 30,
    completed: 20,
    averageScore: 78
  },
  reading: {
    total: 30,
    completed: 28,
    averageScore: 92
  }
}

export default function MyPage() {
  const [wrongAnswers] = useState<WrongAnswer[]>(mockWrongAnswers)
  const [statistics] = useState<Statistics>(mockStatistics)
  const [grammarAnalysis, setGrammarAnalysis] = useState<GrammarAnalysis[]>([])
  const [vocabularyAnalysis, setVocabularyAnalysis] = useState<VocabularyAnalysis[]>([])
  const [weaknesses, setWeaknesses] = useState<string[]>([])

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
    if (statistics.speaking.averageScore < 80) weaknessList.push('말하기')
    if (statistics.writing.averageScore < 80) weaknessList.push('쓰기')
    if (statistics.reading.averageScore < 80) weaknessList.push('읽기')
    
    grammarList.forEach((g) => {
      if (g.percentage > 30) {
        weaknessList.push(`${g.grammar} 문법`)
      }
    })

    setWeaknesses(weaknessList)
  }, [wrongAnswers, statistics])

  return (
    <div className="mypage">
      <div className="mypage-header">
        <h1>마이페이지</h1>
        <p>학습 통계와 분석 결과를 확인하세요</p>
      </div>

      <div className="stats-section">
        <h2>
          <BarChart3 size={24} />
          학습 통계
        </h2>
        <div className="stats-grid">
          <div className="stat-card speaking">
            <div className="stat-icon">
              <Target size={32} />
            </div>
            <div className="stat-content">
              <h3>말하기</h3>
              <div className="stat-numbers">
                <span className="stat-value">{statistics.speaking.completed}</span>
                <span className="stat-label">/ {statistics.speaking.total}</span>
              </div>
              <div className="stat-score">
                평균 점수: <strong>{statistics.speaking.averageScore}점</strong>
              </div>
              <div className="progress-bar-stat">
                <div
                  className="progress-fill-stat speaking-fill"
                  style={{
                    width: `${(statistics.speaking.completed / statistics.speaking.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="stat-card writing">
            <div className="stat-icon">
              <BookOpen size={32} />
            </div>
            <div className="stat-content">
              <h3>쓰기</h3>
              <div className="stat-numbers">
                <span className="stat-value">{statistics.writing.completed}</span>
                <span className="stat-label">/ {statistics.writing.total}</span>
              </div>
              <div className="stat-score">
                평균 점수: <strong>{statistics.writing.averageScore}점</strong>
              </div>
              <div className="progress-bar-stat">
                <div
                  className="progress-fill-stat writing-fill"
                  style={{
                    width: `${(statistics.writing.completed / statistics.writing.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>

          <div className="stat-card reading">
            <div className="stat-icon">
              <TrendingUp size={32} />
            </div>
            <div className="stat-content">
              <h3>읽기</h3>
              <div className="stat-numbers">
                <span className="stat-value">{statistics.reading.completed}</span>
                <span className="stat-label">/ {statistics.reading.total}</span>
              </div>
              <div className="stat-score">
                평균 점수: <strong>{statistics.reading.averageScore}점</strong>
              </div>
              <div className="progress-bar-stat">
                <div
                  className="progress-fill-stat reading-fill"
                  style={{
                    width: `${(statistics.reading.completed / statistics.reading.total) * 100}%`
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="analysis-section">
        <div className="weakness-analysis">
          <h2>
            <AlertCircle size={24} />
            약점 자동 진단
          </h2>
          <div className="weakness-list">
            {weaknesses.length > 0 ? (
              weaknesses.map((weakness, idx) => (
                <span key={idx} className="weakness-tag">
                  {weakness}
                </span>
              ))
            ) : (
              <p>현재 약점이 없습니다. 계속 노력하세요!</p>
            )}
          </div>
        </div>

        <div className="grammar-analysis">
          <h2>
            <BookOpen size={24} />
            틀린/모르는 문법
          </h2>
          <div className="grammar-list">
            {grammarAnalysis.length > 0 ? (
              grammarAnalysis.map((item, idx) => (
                <div key={idx} className="grammar-item">
                  <div className="grammar-header">
                    <span className="grammar-name">{item.grammar}</span>
                    <span className="grammar-count">{item.count}회</span>
                  </div>
                  <div className="grammar-bar">
                    <div
                      className="grammar-bar-fill"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  <div className="grammar-percentage">{item.percentage.toFixed(1)}%</div>
                </div>
              ))
            ) : (
              <p>분석할 문법 오류가 없습니다.</p>
            )}
          </div>
        </div>

        <div className="vocabulary-analysis">
          <h2>
            <Bookmark size={24} />
            틀린/모르는 어휘 및 자주 쓰이는 단어
          </h2>
          <div className="vocabulary-list">
            {vocabularyAnalysis.length > 0 ? (
              vocabularyAnalysis.map((item, idx) => (
                <div
                  key={idx}
                  className={`vocabulary-item ${item.difficulty}`}
                >
                  <span className="vocab-word">{item.word}</span>
                  <span className="vocab-count">{item.count}회</span>
                  <span className={`vocab-difficulty ${item.difficulty}`}>
                    {item.difficulty === 'hard' ? '어려움' : item.difficulty === 'medium' ? '보통' : '쉬움'}
                  </span>
                </div>
              ))
            ) : (
              <p>분석할 어휘가 없습니다.</p>
            )}
          </div>
        </div>
      </div>

      <div className="wrong-answers-section">
        <h2>
          <BookOpen size={24} />
          오답노트
        </h2>
        <div className="wrong-answers-list">
          {wrongAnswers.length > 0 ? (
            wrongAnswers.map((answer) => (
              <div key={answer.id} className="wrong-answer-card">
                <div className="wrong-answer-header">
                  <span className="answer-type">{answer.type}</span>
                  <span className="answer-date">{answer.date}</span>
                </div>
                <div className="wrong-answer-question">
                  <strong>문제:</strong> {answer.question}
                </div>
                <div className="wrong-answer-comparison">
                  <div className="wrong-answer-item">
                    <span className="label wrong">내 답변</span>
                    <span>{answer.myAnswer}</span>
                  </div>
                  <div className="wrong-answer-item">
                    <span className="label correct">정답</span>
                    <span>{answer.correctAnswer}</span>
                  </div>
                </div>
                <div className="wrong-answer-explanation">
                  <strong>해설:</strong> {answer.explanation}
                </div>
                {answer.grammar && answer.grammar.length > 0 && (
                  <div className="wrong-answer-tags">
                    <strong>관련 문법:</strong>
                    {answer.grammar.map((g, idx) => (
                      <span key={idx} className="tag">{g}</span>
                    ))}
                  </div>
                )}
                {answer.vocabulary && answer.vocabulary.length > 0 && (
                  <div className="wrong-answer-tags">
                    <strong>관련 어휘:</strong>
                    {answer.vocabulary.map((v, idx) => (
                      <span key={idx} className="tag">{v}</span>
                    ))}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>오답노트가 비어있습니다.</p>
          )}
        </div>
      </div>
    </div>
  )
}

