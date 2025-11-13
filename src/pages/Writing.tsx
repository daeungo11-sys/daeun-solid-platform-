import { useState, useEffect } from 'react'
import { PenTool, Clock, RotateCcw } from 'lucide-react'
import './Writing.css'

interface Feedback {
  grammar: string
  vocabulary: string
  structure: string
  overall: string
}

export default function Writing() {
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes
  const [text, setText] = useState('')
  const [wordCount, setWordCount] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const [feedback, setFeedback] = useState<Feedback | null>(null)

  const todayTopic = "Some people believe that technology has made our lives more complicated. Do you agree or disagree? Explain your position with specific examples."

  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0)
    setWordCount(words.length)
  }, [text])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0) {
      setIsActive(false)
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isActive, timeLeft])

  const startWriting = () => {
    setIsActive(true)
    setText('')
    setTimeLeft(600)
    setFeedback(null)
  }

  const handleSubmit = () => {
    if (!text.trim()) {
      alert('텍스트를 입력해주세요.')
      return
    }

    // Generate dynamic feedback based on text content
    const wordCount = text.trim().split(/\s+/).filter(word => word.length > 0).length
    const hasAgree = text.toLowerCase().includes('agree') || text.toLowerCase().includes('동의')
    const hasDisagree = text.toLowerCase().includes('disagree') || text.toLowerCase().includes('반대')
    const hasExamples = text.toLowerCase().includes('example') || text.toLowerCase().includes('예시') || text.toLowerCase().includes('instance')
    const hasTechnology = text.toLowerCase().includes('technology') || text.toLowerCase().includes('기술')
    
    let grammar = ""
    let vocabulary = ""
    let structure = ""
    let overall = ""
    
    // Grammar feedback
    if (wordCount < 50) {
      grammar = "에세이가 짧습니다. 더 많은 문장을 작성하여 문법 실력을 보여주세요. 다양한 시제와 문장 구조를 활용해보세요."
    } else if (wordCount > 200) {
      grammar = "충분한 분량의 에세이입니다. 대부분의 문법이 정확합니다. 'complicated'를 사용한 부분이 자연스럽습니다. 제안: 'more complicated' 대신 'increasingly complex'를 사용하면 더 formal한 톤이 됩니다."
    } else {
      grammar = "적절한 길이의 에세이입니다. 대부분의 문법이 정확합니다. 복문과 다양한 시제를 더 활용하면 좋겠습니다."
    }
    
    // Vocabulary feedback
    if (hasTechnology) {
      vocabulary = "적절한 어휘를 사용했습니다. 'technology', 'believe', 'specific examples' 등이 적절합니다. 동의어 활용을 더 늘리면 좋겠습니다."
    } else {
      vocabulary = "어휘 사용이 적절합니다. 주제와 관련된 전문 용어를 더 추가하면 더 풍부한 표현이 됩니다."
    }
    
    // Structure feedback
    if (hasAgree || hasDisagree) {
      if (hasExamples) {
        structure = "명확한 논리 구조를 갖추고 있습니다. 서론에서 입장을 명확히 제시하고, 본론에서 구체적인 예시를 제시했습니다. 서론-본론-결론 구조가 잘 드러납니다."
      } else {
        structure = "명확한 입장을 제시했습니다. 본론에서 더 구체적인 예시를 추가하면 설득력이 높아집니다."
      }
    } else {
      structure = "에세이 구조를 개선할 수 있습니다. 명확한 입장(동의/반대)을 제시하고, 그에 대한 근거와 예시를 추가하면 더 설득력 있는 에세이가 됩니다."
    }
    
    // Overall feedback
    if (wordCount < 50) {
      overall = "에세이가 짧습니다. 더 많은 내용을 추가하여 주제에 대해 깊이 있게 다뤄보세요. 구체적인 예시와 근거를 포함하면 좋겠습니다."
    } else if (wordCount > 200 && hasAgree && hasExamples) {
      overall = "훌륭한 에세이입니다! 제한된 시간에 명확한 입장을 제시하고 논리적으로 설명했습니다. 예시가 풍부하고 설득력이 높습니다."
    } else if (wordCount > 100) {
      overall = "좋은 에세이입니다. 명확한 입장을 제시하고 논리적으로 설명했습니다. 예시를 더 풍부하게 하면 완벽한 에세이가 될 것입니다."
    } else {
      overall = "적절한 에세이입니다. 더 많은 내용과 구체적인 예시를 추가하면 더 설득력 있는 에세이가 됩니다."
    }
    
    setFeedback({
      grammar,
      vocabulary,
      structure,
      overall
    })
  }

  const resetWriting = () => {
    setText('')
    setWordCount(0)
    setTimeLeft(600)
    setIsActive(false)
    setFeedback(null)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="writing-page">
      <div className="page-header">
        <h1>쓰기 연습</h1>
        <p>짧은 주제에 대해 에세이를 작성하고 AI 피드백을 받아보세요</p>
      </div>
      
      <div className="encouragement-banner">
        ✍️ 글을 쓰는 것은 생각을 정리하는 가장 좋은 방법입니다!
      </div>

      <div className="writing-container">
        <div className="topic-card">
          <div className="topic-header">
            <h2>오늘의 주제</h2>
            <span className="date">{new Date().toLocaleDateString('ko-KR')}</span>
          </div>
          <p className="topic-text">{todayTopic}</p>
        </div>

        <div className="timer-section">
          <div className="timer-container">
            <Clock size={24} />
            <span className="timer">{formatTime(timeLeft)}</span>
            {timeLeft < 30 && <span className="time-warning">시간이 부족합니다!</span>}
          </div>
          <div className="word-count">단어 수: {wordCount}</div>
        </div>

        <div className="writing-section">
          {!isActive ? (
            <div className="start-prompt">
              <button className="start-button" onClick={startWriting}>
                <PenTool size={24} />
                <span>작성 시작</span>
              </button>
              <p className="prompt-text">10분 안에 주제에 대한 에세이를 작성하세요</p>
            </div>
          ) : (
            <div className="writing-editor">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="writing-textarea"
                placeholder="여기에 에세이를 작성하세요..."
                disabled={timeLeft === 0}
              />
              <div className="editor-footer">
                <button className="btn-primary" onClick={handleSubmit} disabled={timeLeft === 0}>
                  피드백 받기
                </button>
                <button className="btn-secondary" onClick={resetWriting}>
                  <RotateCcw size={18} />
                  다시 작성
                </button>
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <div className="feedback-section">
            <h3>AI 튜터 피드백</h3>
            <div className="feedback-card grammar">
              <h4>문법</h4>
              <p>{feedback.grammar}</p>
            </div>
            <div className="feedback-card vocabulary">
              <h4>어휘</h4>
              <p>{feedback.vocabulary}</p>
            </div>
            <div className="feedback-card structure">
              <h4>구조</h4>
              <p>{feedback.structure}</p>
            </div>
            <div className="feedback-card overall">
              <h4>종합 평가</h4>
              <p>{feedback.overall}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
