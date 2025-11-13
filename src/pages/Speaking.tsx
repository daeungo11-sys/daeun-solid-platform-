import { useState, useEffect, useRef } from 'react'
import { Mic, Square, RotateCcw, Clock } from 'lucide-react'
import './Speaking.css'

interface Feedback {
  pronunciation: string
  grammar: string
  overall: string
}

export default function Speaking() {
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
    
    // Simulate AI feedback
    setFeedback({
      pronunciation: "전체적으로 명확한 발음을 유지했습니다. 'significant'와 'experience'의 강세 패턴을 더 자연스럽게 개선하세요.",
      grammar: "문법적으로 정확합니다. 'It was significant to me' 표현이 적절합니다. 더 다양한 문장 구조를 사용하면 좋겠습니다.",
      overall: "좋은 답변입니다. 구체적인 사례와 감정을 잘 연결해서 설명했습니다. 시간 활용이 효율적이었습니다."
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
        <h1>말하기 연습</h1>
        <p>매일 새로운 질문에 답변해 영어 말하기 실력을 향상시켜보세요</p>
      </div>
      
      <div className="encouragement-banner">
        💬 매일 영어로 말하는 연습을 하면 자신감이 쑥쑥 자라납니다!
      </div>

      <div className="speaking-container">
        <div className="question-card">
          <div className="question-header">
            <h2>오늘의 질문</h2>
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
                    <span>녹음 중지</span>
                  </>
                ) : (
                  <>
                    <Mic size={28} />
                    <span>녹음 시작</span>
                  </>
                )}
              </button>
              {isRecording && (
                <div className="recording-indicator">
                  <span className="pulse"></span>
                  <span>녹음 중...</span>
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
                  피드백 받기
                </button>
                <button className="btn-secondary" onClick={resetRecording}>
                  <RotateCcw size={18} />
                  다시 녹음
                </button>
              </div>
            </div>
          )}
        </div>

        {feedback && (
          <div className="feedback-section">
            <h3>AI 튜터 피드백</h3>
            <div className="feedback-card pronunciation">
              <h4>발음</h4>
              <p>{feedback.pronunciation}</p>
            </div>
            <div className="feedback-card grammar">
              <h4>문법</h4>
              <p>{feedback.grammar}</p>
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
