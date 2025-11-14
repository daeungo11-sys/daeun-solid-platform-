import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, Clock, ArrowRight, ArrowLeft } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { saveUserLevel, addWrongAnswer, type CEFRLevel } from '../lib/storage'
import './LevelTest.css'

interface Question {
  id: number
  type: 'multiple' | 'essay' | 'reading' | 'translation'
  question: string
  options?: string[]
  correctAnswer: string | string[]
  passage?: string
  points: number
}

const mockQuestions: Question[] = [
  {
    id: 1,
    type: 'multiple',
    question: '다음 문장의 빈칸에 들어갈 가장 적절한 단어는?\n\n"I don\'t know ___ book you want."',
    options: ['which', 'what', 'where', 'when'],
    correctAnswer: 'which',
    points: 1
  },
  {
    id: 2,
    type: 'multiple',
    question: '"I have been studying English for three years."에서 사용된 시제는?',
    options: ['현재완료', '과거완료', '현재진행', '과거'],
    correctAnswer: '현재완료',
    points: 1
  },
  {
    id: 3,
    type: 'multiple',
    question: '다음 중 가정법 과거를 나타내는 문장은?',
    options: [
      'If I were you, I would go.',
      'If I go, I will see him.',
      'If I went, I saw him.',
      'If I had gone, I would have seen him.'
    ],
    correctAnswer: 'If I were you, I would go.',
    points: 2
  },
  {
    id: 4,
    type: 'essay',
    question: '다음 주제에 대해 50-100단어로 영어로 작성하세요: "What are the benefits of learning a foreign language?"',
    correctAnswer: '',
    points: 5
  },
  {
    id: 5,
    type: 'essay',
    question: '"Describe your favorite hobby."에 대해 3-5문장으로 답하세요.',
    correctAnswer: '',
    points: 5
  },
  {
    id: 6,
    type: 'reading',
    passage: 'Climate change is one of the most pressing issues of our time. Scientists have been warning about the consequences of global warming for decades. Rising sea levels, extreme weather events, and loss of biodiversity are just some of the impacts we are already experiencing. It is crucial that we take immediate action to reduce carbon emissions and transition to renewable energy sources.',
    question: '이 지문의 주제는 무엇인가요?',
    options: ['환경보호', '기후변화', '에너지', '과학발전'],
    correctAnswer: '기후변화',
    points: 2
  },
  {
    id: 7,
    type: 'reading',
    passage: 'The internet has revolutionized the way we communicate, work, and learn. However, it also brings challenges such as privacy concerns and information overload. We must learn to use this powerful tool responsibly while protecting our personal information.',
    question: '지문에 따르면 인터넷의 단점은 무엇인가요?',
    options: ['커뮤니케이션', '정보 과부하', '일하는 방식', '학습 방법'],
    correctAnswer: '정보 과부하',
    points: 2
  },
  {
    id: 8,
    type: 'translation',
    question: '다음 문장을 영어로 번역하세요: "나는 내일 친구를 만나기로 약속했다."',
    correctAnswer: "I promised to meet my friend tomorrow.",
    points: 3
  },
  {
    id: 9,
    type: 'translation',
    question: '다음 문장을 한국어로 번역하세요: "She has been working on this project for two months."',
    correctAnswer: '그녀는 이 프로젝트를 2개월 동안 진행하고 있다.',
    points: 3
  },
  {
    id: 10,
    type: 'multiple',
    question: '다음 중 수동태 문장은?',
    options: [
      'The teacher explains the lesson.',
      'The lesson is explained by the teacher.',
      'The teacher is explaining the lesson.',
      'The teacher explained the lesson.'
    ],
    correctAnswer: 'The lesson is explained by the teacher.',
    points: 2
  },
  {
    id: 11,
    type: 'reading',
    passage: 'Artificial intelligence is transforming industries across the globe. From healthcare to finance, AI applications are making processes more efficient and accurate. However, ethical considerations must be addressed to ensure AI benefits all of humanity.',
    question: 'AI의 긍정적인 효과는 무엇인가요?',
    options: ['윤리적 고려사항', '효율성과 정확성 향상', '산업 변화', '인류 혜택'],
    correctAnswer: '효율성과 정확성 향상',
    points: 2
  },
  {
    id: 12,
    type: 'essay',
    question: '"What is your opinion on online learning?"에 대해 의견을 50-100단어로 영어로 작성하세요.',
    correctAnswer: '',
    points: 5
  },
  {
    id: 13,
    type: 'translation',
    question: '다음 문장을 영어로 번역하세요: "만약 비가 오면, 우리는 집에 있을 것이다."',
    correctAnswer: "If it rains, we will stay at home.",
    points: 3
  },
  {
    id: 14,
    type: 'multiple',
    question: '다음 중 관계대명사가 올바르게 사용된 문장은?',
    options: [
      'This is the book who I bought.',
      'This is the book which I bought.',
      'This is the book where I bought.',
      'This is the book what I bought.'
    ],
    correctAnswer: 'This is the book which I bought.',
    points: 2
  }
]

export default function LevelTest() {
  const { t } = useLanguage()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<number, string>>({})
  const [timeSpent, setTimeSpent] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [results, setResults] = useState<any>(null)
  const [startTime] = useState(Date.now())

  useEffect(() => {
    if (!isFinished) {
      const timer = setInterval(() => {
        setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
      }, 1000)
      return () => clearInterval(timer)
    }
  }, [isFinished, startTime])

  const handleAnswerChange = (value: string) => {
    setAnswers({ ...answers, [mockQuestions[currentQuestion].id]: value })
  }

  const handleNext = () => {
    if (currentQuestion < mockQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    } else {
      handleFinish()
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleFinish = () => {
    // 채점 로직
    let totalScore = 0
    let maxScore = 0
    const questionResults: any[] = []

    mockQuestions.forEach((q) => {
      maxScore += q.points
      const userAnswer = answers[q.id] || ''
      let isCorrect = false
      let score = 0

      if (q.type === 'multiple' || q.type === 'reading') {
        isCorrect = userAnswer === q.correctAnswer
        score = isCorrect ? q.points : 0
      } else {
        // 서술형, 번역은 부분 점수 가능 (간단한 키워드 체크)
        const correctLower = String(q.correctAnswer).toLowerCase()
        const userLower = userAnswer.toLowerCase()
        if (userLower.length > 0) {
          score = q.points * 0.5 // 부분 점수
          if (userLower.includes(correctLower) || correctLower.includes(userLower)) {
            score = q.points
            isCorrect = true
          }
        }
      }

      totalScore += score
      questionResults.push({
        question: q,
        userAnswer,
        isCorrect,
        score
      })
    })

    // 레벨 계산
    const percentage = (totalScore / maxScore) * 100
    let level = 'Beginner'
    if (percentage >= 90) level = 'Advanced'
    else if (percentage >= 70) level = 'Intermediate-High'
    else if (percentage >= 50) level = 'Intermediate'
    else if (percentage >= 30) level = 'Beginner-High'
    else level = 'Beginner'

    // 강/약점 분석
    const strengths: string[] = []
    const weaknesses: string[] = []
    const typeStats: Record<string, { correct: number; total: number }> = {
      multiple: { correct: 0, total: 0 },
      essay: { correct: 0, total: 0 },
      reading: { correct: 0, total: 0 },
      translation: { correct: 0, total: 0 }
    }

    questionResults.forEach((r) => {
      const type = r.question.type
      typeStats[type].total++
      if (r.isCorrect) {
        typeStats[type].correct++
      }
    })

    Object.entries(typeStats).forEach(([type, stats]) => {
      const percentage = (stats.correct / stats.total) * 100
      if (percentage >= 70) {
        strengths.push(type)
      } else {
        weaknesses.push(type)
      }
    })

    setResults({
      totalScore,
      maxScore,
      percentage,
      level,
      strengths,
      weaknesses,
      questionResults,
      timeSpent
    })
    setIsFinished(true)

    // 레벨 저장
    const cefrLevel: CEFRLevel = 
      level === 'Advanced' ? 'C1' :
      level === 'Intermediate-High' ? 'B2' :
      level === 'Intermediate' ? 'B1' :
      level === 'Beginner-High' ? 'A2' : 'A1';
    
    saveUserLevel({
      level: cefrLevel,
      testDate: new Date().toISOString(),
      score: percentage,
      weaknesses,
      strengths
    });

    // 오답 저장
    questionResults.forEach((r) => {
      if (!r.isCorrect) {
        const q = r.question;
        let myAnswer = '';
        if (typeof r.userAnswer === 'string') {
          myAnswer = r.userAnswer;
        } else if (Array.isArray(r.userAnswer)) {
          myAnswer = r.userAnswer.join(', ');
        }

        let correctAnswer = '';
        if (typeof q.correctAnswer === 'string') {
          correctAnswer = q.correctAnswer;
        } else if (Array.isArray(q.correctAnswer)) {
          correctAnswer = q.correctAnswer.join(', ');
        } else if (q.options && typeof q.correctAnswer === 'number') {
          correctAnswer = q.options[q.correctAnswer] || '';
        }

        addWrongAnswer({
          question: q.question || q.passage || '레벨 테스트 문제',
          type: q.type || '객관식',
          myAnswer: myAnswer || '(답변 없음)',
          correctAnswer: correctAnswer || '',
          explanation: `레벨 테스트 ${q.type} 문제`,
          date: new Date().toISOString().split('T')[0],
          grammar: [],
          vocabulary: []
        });
      }
    });
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}${t.minutes} ${secs}${t.seconds}`
  }

  if (isFinished && results) {
    return (
      <div className="level-test-page">
        <div className="test-result">
          <h1>{t.levelTestPageTitle} {t.result}</h1>
          <div className="result-summary">
            <div className="score-card">
              <h2>{t.score}</h2>
              <div className="score-circle">
                <span className="score">{results.totalScore}</span>
                <span className="max-score">/ {results.maxScore}</span>
              </div>
              <div className="percentage">{results.percentage.toFixed(1)}%</div>
            </div>
            <div className="level-card">
              <h2>{t.yourLevel}</h2>
              <div className="level-badge">{results.level}</div>
              <p>{t.timeSpent}: {formatTime(results.timeSpent)}</p>
            </div>
          </div>

          <div className="analysis-section">
            <div className="strengths">
              <h3>{t.strengths}</h3>
              <div className="tag-list">
                {results.strengths.map((s: string, idx: number) => (
                  <span key={idx} className="tag strength">
                    {s === 'multiple' ? t.multipleChoice : s === 'essay' ? t.essay : s === 'reading' ? t.readingComprehension : t.translation}
                  </span>
                ))}
                {results.strengths.length === 0 && <span className="tag">{t.analyzing}</span>}
              </div>
            </div>
            <div className="weaknesses">
              <h3>{t.weaknesses}</h3>
              <div className="tag-list">
                {results.weaknesses.map((w: string, idx: number) => (
                  <span key={idx} className="tag weakness">
                    {w === 'multiple' ? t.multipleChoice : w === 'essay' ? t.essay : w === 'reading' ? t.readingComprehension : t.translation}
                  </span>
                ))}
                {results.weaknesses.length === 0 && <span className="tag">{t.analyzing}</span>}
              </div>
            </div>
          </div>

          <div className="question-review">
            <h3>{t.question}{t.questionReview}</h3>
            <div className="review-list">
              {results.questionResults.map((r: any, idx: number) => (
                <div key={idx} className="review-item">
                  <div className="review-header">
                    <span className="question-number">{t.question} {idx + 1}</span>
                    {r.isCorrect ? (
                      <CheckCircle className="icon correct" size={20} />
                    ) : (
                      <XCircle className="icon incorrect" size={20} />
                    )}
                  </div>
                  <div className="review-content">
                    <p className="question-text">{r.question.question}</p>
                    <div className="answer-comparison">
                      <div className="user-answer">
                        <strong>{t.myAnswer}</strong> {r.userAnswer || t.noAnswer}
                      </div>
                      {!r.isCorrect && r.question.type !== 'essay' && (
                        <div className="correct-answer">
                          <strong>{t.correctAnswers}:</strong> {r.question.correctAnswer}
                        </div>
                      )}
                    </div>
                    <div className="score-info">{t.score}: {r.score} / {r.question.points}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button className="retry-button" onClick={() => window.location.reload()}>
            {t.retryTest}
          </button>
        </div>
      </div>
    )
  }

  const currentQ = mockQuestions[currentQuestion]
  const currentAnswer = answers[currentQ.id] || ''

  return (
    <div className="level-test-page">
      <div className="test-header">
        <h1>{t.levelTestPageTitle}</h1>
        <div className="test-info">
          <span className="question-counter">
            {t.question} {currentQuestion + 1} {t.of} {mockQuestions.length}
          </span>
          <span className="timer">
            <Clock size={16} />
            {formatTime(timeSpent)}
          </span>
        </div>
      </div>

      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{ width: `${((currentQuestion + 1) / mockQuestions.length) * 100}%` }}
        />
      </div>

      <div className="question-container">
        <div className="question-type">
          {currentQ.type === 'multiple' && t.multipleChoice}
          {currentQ.type === 'essay' && t.essay}
          {currentQ.type === 'reading' && t.readingComprehension}
          {currentQ.type === 'translation' && t.translation}
        </div>

        {currentQ.passage && (
          <div className="passage">
            <h3>{t.passage}</h3>
            <p>{currentQ.passage}</p>
          </div>
        )}

        <div className="question">
          <h2>{currentQ.question}</h2>
          <div className="points">{t.points}: {currentQ.points}{t.pointUnit}</div>
        </div>

        <div className="answer-section">
          {currentQ.type === 'multiple' || currentQ.type === 'reading' ? (
            <div className="options">
              {currentQ.options?.map((option, idx) => (
                <label key={idx} className="option-label">
                  <input
                    type="radio"
                    name={`question-${currentQ.id}`}
                    value={option}
                    checked={currentAnswer === option}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              className="text-answer"
              value={currentAnswer}
              onChange={(e) => handleAnswerChange(e.target.value)}
              placeholder={t.enterAnswer}
              rows={8}
            />
          )}
        </div>

        <div className="navigation-buttons">
          <button
            className="nav-button prev"
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
          >
            <ArrowLeft size={20} />
            {t.previous}
          </button>
          <button
            className="nav-button next"
            onClick={handleNext}
          >
            {currentQuestion === mockQuestions.length - 1 ? t.submitAnswer : t.next}
            {currentQuestion < mockQuestions.length - 1 && <ArrowRight size={20} />}
          </button>
        </div>
      </div>
    </div>
  )
}


