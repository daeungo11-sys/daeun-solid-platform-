import { useState, useEffect, useRef } from 'react'
import { Mic, Square, RotateCcw, Clock } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import './Speaking.css'

interface Feedback {
  pronunciation: string
  grammar: string
  overall: string
}

export default function Speaking() {
  const { t } = useLanguage()
  const [timeLeft, setTimeLeft] = useState(180) // 3 minutes in seconds
  const [isRecording, setIsRecording] = useState(false)
  const [recordingComplete, setRecordingComplete] = useState(false)
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null)
  const [feedback, setFeedback] = useState<Feedback | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const todayQuestion = "Describe a memorable experience from your childhood and explain why it was significant to you."

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (isRecording && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isRecording) {
      stopRecording()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isRecording, timeLeft])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        chunksRef.current.push(e.data)
      }

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        setAudioBlob(blob)
        setAudioUrl(URL.createObjectURL(blob))
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
      alert('마이크 접근 권한이 필요합니다.')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
      setRecordingComplete(true)
    }
  }

  const handleSubmit = async () => {
    if (!audioBlob) return
    
    // Generate dynamic feedback based on recording duration and question
    const recordingDuration = 180 - timeLeft
    const isShort = recordingDuration < 60
    const isLong = recordingDuration > 150
    
    // Simulate AI feedback based on different scenarios
    let pronunciation = ""
    let grammar = ""
    let overall = ""
    
    if (isShort) {
      pronunciation = "녹음 시간이 짧습니다. 더 자세한 설명을 위해 시간을 충분히 활용하세요. 발음의 명확성을 높이기 위해 각 단어를 천천히 발음해보세요."
      grammar = "답변을 더 확장하면 문법 실력을 더 잘 보여줄 수 있습니다. 복문과 다양한 시제를 활용해보세요."
      overall = "답변의 길이가 짧습니다. 구체적인 예시와 감정을 추가하면 더 풍부한 답변이 됩니다. 다음에는 더 자세히 설명해보세요."
    } else if (isLong) {
      pronunciation = "충분한 시간을 활용하셨습니다. 전체적으로 명확한 발음을 유지했습니다. 'significant'와 'experience'의 강세 패턴을 더 자연스럽게 개선하세요."
      grammar = "문법적으로 정확합니다. 'It was significant to me' 표현이 적절합니다. 다양한 문장 구조를 잘 사용하셨습니다."
      overall = "훌륭한 답변입니다! 구체적인 사례와 감정을 잘 연결해서 설명했습니다. 시간 활용이 효율적이었고, 내용이 풍부합니다."
    } else {
      pronunciation = "적절한 길이의 답변입니다. 발음이 전반적으로 명확합니다. 일부 단어의 강세를 더 자연스럽게 하면 더 좋겠습니다."
      grammar = "문법적으로 대부분 정확합니다. 'It was significant to me' 같은 표현이 적절합니다. 더 다양한 문장 구조를 시도해보세요."
      overall = "좋은 답변입니다. 구체적인 사례와 감정을 연결해서 설명했습니다. 시간 활용이 적절했습니다."
    }
    
    setFeedback({
      pronunciation,
      grammar,
      overall
    })
  }

  const resetRecording = () => {
    setTimeLeft(180)
    setIsRecording(false)
    setRecordingComplete(false)
    setAudioBlob(null)
    setFeedback(null)
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="speaking-page">
      <div className="page-header">
        <h1>{t.speakingPageTitle}</h1>
        <p>{t.speakingPageDesc}</p>
      </div>
      
      <div className="encouragement-banner">
        {t.encouragementSpeaking}
      </div>

      <div className="speaking-container">
        <div className="question-card">
          <div className="question-header">
            <h2>{t.todayQuestion}</h2>
            <span className="date">{new Date().toLocaleDateString('ko-KR')}</span>
          </div>
          <p className="question-text">{todayQuestion}</p>
        </div>

        <div className="timer-container">
          <Clock size={24} />
          <span className="timer">{formatTime(timeLeft)}</span>
          {timeLeft < 30 && <span className="time-warning">시간이 부족합니다!</span>}
        </div>

        <div className="recording-section">
          {!recordingComplete ? (
            <div className="recording-area">
              <button
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <Square size={28} />
                    <span>{t.stopRecording}</span>
                  </>
                ) : (
                  <>
                    <Mic size={28} />
                    <span>{t.startRecording}</span>
                  </>
                )}
              </button>
              {isRecording && (
                <div className="recording-indicator">
                  <span className="pulse"></span>
                  <span>{t.recording}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="recording-complete">
              <div className="audio-player">
                {audioUrl && (
                  <audio controls src={audioUrl} className="audio-controls" />
                )}
              </div>
              <div className="action-buttons">
                <button className="btn-primary" onClick={handleSubmit}>
                  {t.getFeedback}
                </button>
                <button className="btn-secondary" onClick={resetRecording}>
                  <RotateCcw size={18} />
                  {t.recordAgain}
                </button>
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <div className="feedback-section">
            <h3>AI 튜터 피드백</h3>
            <div className="feedback-card pronunciation">
              <h4>{t.pronunciation}</h4>
              <p>{feedback.pronunciation}</p>
            </div>
            <div className="feedback-card grammar">
              <h4>{t.grammar}</h4>
              <p>{feedback.grammar}</p>
            </div>
            <div className="feedback-card overall">
              <h4>{t.overallEvaluation}</h4>
              <p>{feedback.overall}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
