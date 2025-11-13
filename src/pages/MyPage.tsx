import { useState, useEffect } from 'react'
import { TrendingUp, BookOpen, AlertCircle, Bookmark, Target, FileText } from 'lucide-react'
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

      <div className="features">
        <div className="feature-card speaking">
          <div className="icon-container speaking">
            <Target size={40} />
          </div>
          <h2>말하기 통계</h2>
          <p>완료: {statistics.speaking.completed} / {statistics.speaking.total} | 평균 점수: {statistics.speaking.averageScore}점</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.speaking.completed}개 완료</span>
            <span className="tag"><TrendingUp size={14} /> 평균 {statistics.speaking.averageScore}점</span>
          </div>
        </div>

        <div className="feature-card writing">
          <div className="icon-container writing">
            <BookOpen size={40} />
          </div>
          <h2>쓰기 통계</h2>
          <p>완료: {statistics.writing.completed} / {statistics.writing.total} | 평균 점수: {statistics.writing.averageScore}점</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.writing.completed}개 완료</span>
            <span className="tag"><TrendingUp size={14} /> 평균 {statistics.writing.averageScore}점</span>
          </div>
        </div>

        <div className="feature-card reading">
          <div className="icon-container reading">
            <TrendingUp size={40} />
          </div>
          <h2>읽기 통계</h2>
          <p>완료: {statistics.reading.completed} / {statistics.reading.total} | 평균 점수: {statistics.reading.averageScore}점</p>
          <div className="feature-tags">
            <span className="tag"><Target size={14} /> {statistics.reading.completed}개 완료</span>
            <span className="tag"><TrendingUp size={14} /> 평균 {statistics.reading.averageScore}점</span>
          </div>
        </div>

        <div className="feature-card weakness">
          <div className="icon-container weakness">
            <AlertCircle size={40} />
          </div>
          <h2>약점 자동 진단</h2>
          <p>{weaknesses.length > 0 ? `${weaknesses.length}개의 약점이 발견되었습니다.` : '현재 약점이 없습니다. 계속 노력하세요!'}</p>
          <div className="feature-tags">
            {weaknesses.length > 0 ? (
              <>
                <span className="tag"><AlertCircle size={14} /> {weaknesses.length}개 발견</span>
                <span className="tag"><Target size={14} /> 자동 분석</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> 우수한 성적</span>
            )}
          </div>
        </div>

        <div className="feature-card grammar">
          <div className="icon-container grammar">
            <BookOpen size={40} />
          </div>
          <h2>틀린/모르는 문법</h2>
          <p>{grammarAnalysis.length > 0 ? `${grammarAnalysis.length}개의 문법 항목이 분석되었습니다.` : '분석할 문법 오류가 없습니다.'}</p>
          <div className="feature-tags">
            {grammarAnalysis.length > 0 ? (
              <>
                <span className="tag"><BookOpen size={14} /> {grammarAnalysis.length}개 항목</span>
                <span className="tag"><Target size={14} /> 상세 분석</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> 완벽합니다</span>
            )}
          </div>
        </div>

        <div className="feature-card vocabulary">
          <div className="icon-container vocabulary">
            <Bookmark size={40} />
          </div>
          <h2>틀린/모르는 어휘</h2>
          <p>{vocabularyAnalysis.length > 0 ? `${vocabularyAnalysis.length}개의 어휘가 분석되었습니다.` : '분석할 어휘가 없습니다.'}</p>
          <div className="feature-tags">
            {vocabularyAnalysis.length > 0 ? (
              <>
                <span className="tag"><Bookmark size={14} /> {vocabularyAnalysis.length}개 어휘</span>
                <span className="tag"><Target size={14} /> 난이도 분석</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> 완벽합니다</span>
            )}
          </div>
        </div>

        <div className="feature-card wrong-answers">
          <div className="icon-container wrong-answers">
            <FileText size={40} />
          </div>
          <h2>오답노트</h2>
          <p>{wrongAnswers.length > 0 ? `${wrongAnswers.length}개의 오답이 기록되어 있습니다.` : '오답노트가 비어있습니다.'}</p>
          <div className="feature-tags">
            {wrongAnswers.length > 0 ? (
              <>
                <span className="tag"><FileText size={14} /> {wrongAnswers.length}개 기록</span>
                <span className="tag"><Target size={14} /> 복습 필요</span>
              </>
            ) : (
              <span className="tag"><TrendingUp size={14} /> 오답 없음</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

