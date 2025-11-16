import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import { useLanguage } from '../contexts/LanguageContext'
import { updateMyPageStatistics, addWrongAnswer } from '../lib/storage'
import './Reading.css'

interface Question {
  id: number
  text: string
  options: string[]
  correct: number
  explanation: string
  explanationKo?: string
}

interface Answer {
  questionId: number
  selected: number
  isCorrect: boolean
}

export default function Reading() {
  const { t, language } = useLanguage()
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [timeLeft, setTimeLeft] = useState(120) // 2 minutes per question
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [answers, setAnswers] = useState<Answer[]>([])
  const [showFeedback, setShowFeedback] = useState(false)
  const [examType, setExamType] = useState<'toeic' | 'toefl' | 'sat'>('toeic')

  const readingPassages = {
    toeic: {
      title: "TOEIC Reading Comprehension",
      passage: "Climate change is one of the most pressing issues facing humanity today. As global temperatures continue to rise due to increased greenhouse gas emissions, the world is experiencing unprecedented environmental changes. Scientists have been documenting these changes for decades, warning that immediate action is necessary to mitigate the worst effects. The primary contributors to climate change include the burning of fossil fuels, deforestation, and industrial processes that release carbon dioxide and other greenhouse gases into the atmosphere. International efforts such as the Paris Agreement have been established to coordinate global responses, but progress has been inconsistent across nations.",
      questions: [
        {
          id: 1,
          text: "What is the main cause of rising global temperatures mentioned in the passage?",
          options: [
            "Industrial processes",
            "Increased greenhouse gas emissions",
            "Deforestation",
            "International agreements"
          ],
          correct: 1,
          explanation: "The passage states that global temperatures are rising 'due to increased greenhouse gas emissions'. While other factors like deforestation and industrial processes are mentioned, the emissions are cited as the direct cause of temperature rise.",
          explanationKo: "지문에서는 지구 평균 기온 상승의 직접적인 원인이 ‘온실가스 배출 증가’라고 설명합니다. 산림 벌채나 산업 활동도 원인으로 언급되지만, 이로 인해 온실가스가 증가하고, 그 결과 기온이 상승한다는 점을 강조하고 있습니다."
        },
        {
          id: 2,
          text: "According to the passage, what has been the outcome of international efforts to address climate change?",
          options: [
            "Complete success",
            "Consistent progress",
            "Inconsistent progress",
            "No progress at all"
          ],
          correct: 2,
          explanation: "The passage mentions that 'progress has been inconsistent across nations', indicating that while there have been efforts through agreements like the Paris Agreement, the results have varied.",
          explanationKo: "지문에서는 파리협정과 같은 국제적 노력이 있었지만, 국가마다 이행 수준이 달라 ‘진전이 일관되지 않았다’고 설명합니다. 즉, 어떤 국가는 적극적으로 대응하지만, 다른 국가는 그렇지 않아 전반적인 성과가 고르지 않다는 의미입니다."
        }
      ]
    },
    toefl: {
      title: "TOEFL Reading Comprehension",
      passage: "The phenomenon of bioluminescence, the ability of living organisms to produce and emit light, has captivated scientists and nature enthusiasts for centuries. This remarkable biological process occurs through a chemical reaction involving luciferin, a light-emitting compound, and luciferase, an enzyme that catalyzes the reaction. Marine environments are particularly rich in bioluminescent species, from microscopic plankton to deep-sea fishes. In these dark aquatic environments, bioluminescence serves various functions including communication, predation avoidance, and attracting prey. Recent research has revealed potential applications in medical imaging and biotechnology, making this natural phenomenon not only fascinating but also scientifically valuable.",
      questions: [
        {
          id: 1,
          text: "What two components are essential for the bioluminescence process?",
          options: [
            "Light and darkness",
            "Luciferin and luciferase",
            "Marine and terrestrial environments",
            "Communication and predation"
          ],
          correct: 1,
          explanation: "The passage explicitly states that bioluminescence occurs 'through a chemical reaction involving luciferin, a light-emitting compound, and luciferase, an enzyme that catalyzes the reaction'.",
          explanationKo: "지문에서는 생물 발광이 ‘빛을 내는 물질인 루시페린(luciferin)’과 그 반응을 촉진하는 효소 ‘루시퍼레이스(luciferase)’의 화학 반응으로 일어난다고 설명합니다. 따라서 이 두 가지가 생물 발광에 필수적인 요소입니다."
        },
        {
          id: 2,
          text: "According to the passage, which environment is most abundant in bioluminescent species?",
          options: [
            "Terrestrial forests",
            "Desert ecosystems",
            "Marine environments",
            "Arctic regions"
          ],
          correct: 2,
          explanation: "The passage clearly states that 'Marine environments are particularly rich in bioluminescent species'.",
          explanationKo: "지문에서는 ‘해양 환경이 특히 많은 생물 발광 종을 가지고 있다’고 명확히 언급합니다. 따라서 생물 발광 생물이 가장 풍부한 환경은 바다라는 것을 알 수 있습니다."
        }
      ]
    },
    sat: {
      title: "SAT Reading Comprehension",
      passage: "The Industrial Revolution of the late 18th and early 19th centuries fundamentally transformed human society in ways that continue to influence the modern world. This period marked a shift from agrarian economies to industrialized manufacturing, facilitated by technological innovations such as the steam engine, mechanized textile production, and improved transportation systems. Urban populations exploded as people migrated from rural areas to cities in search of employment in factories. While these changes brought unprecedented economic growth and material wealth, they also created new social challenges including urban overcrowding, poor working conditions, and environmental degradation. The Industrial Revolution thus represents both humanity's technological triumph and a reminder of the complex consequences of rapid societal transformation.",
      questions: [
        {
          id: 1,
          text: "The passage suggests that the Industrial Revolution involved a shift from:",
          options: [
            "Urban to rural living",
            "Industrial to agrarian economies",
            "Agrarian to industrialized manufacturing",
            "Manufacturing to service economies"
          ],
          correct: 2,
          explanation: "The passage explicitly states that the Industrial Revolution 'marked a shift from agrarian economies to industrialized manufacturing'.",
          explanationKo: "지문에서는 산업 혁명이 ‘농업 중심 경제에서 공업화된 제조업 경제로의 전환’을 의미한다고 설명합니다. 즉, 농사를 짓던 사회에서 공장에서 물건을 대량 생산하는 산업 사회로 바뀌었다는 뜻입니다."
        },
        {
          id: 2,
          text: "What does the author imply about the consequences of the Industrial Revolution?",
          options: [
            "They were entirely positive",
            "They were entirely negative",
            "They were complex and multifaceted",
            "They had no lasting impact"
          ],
          correct: 2,
          explanation: "The passage states that the Industrial Revolution 'represents both humanity's technological triumph and a reminder of the complex consequences', indicating multifaceted outcomes.",
          explanationKo: "지문에서는 산업 혁명이 인류의 기술적 성취이면서도 동시에 복잡한 결과를 가져온 사건이라고 말합니다. 즉, 경제 성장과 기술 발전이라는 긍정적인 측면과 함께, 열악한 노동 환경, 도시 혼잡, 환경 오염 같은 부정적인 영향도 함께 나타났다는 의미입니다."
        }
      ]
    }
  }

  const currentPassage = readingPassages[examType]
  const questions: Question[] = currentPassage.questions
  const currentQ = questions[currentQuestion]
  const explanationText =
    language === 'ko' && currentQ.explanationKo ? currentQ.explanationKo : currentQ.explanation

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else {
      handleTimeout()
    }
    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timeLeft])

  const handleTimeout = () => {
    if (selectedAnswer === null) {
      handleAnswer(-1) // No answer selected
    }
  }

  const handleAnswer = (optionIndex: number) => {
    const isCorrect = optionIndex === currentQ.correct
    const newAnswer = { questionId: currentQ.id, selected: optionIndex, isCorrect }
    setAnswers([...answers, newAnswer])
    setShowFeedback(true)
    setTimeLeft(0)

    // 오답인 경우 오답 노트에 저장
    if (!isCorrect && optionIndex !== -1) {
      const explanationForNote =
        language === 'ko' && currentQ.explanationKo ? currentQ.explanationKo : currentQ.explanation
      addWrongAnswer({
        question: currentQ.text,
        type: '객관식',
        myAnswer: currentQ.options[optionIndex] || '(답변 없음)',
        correctAnswer: currentQ.options[currentQ.correct],
        explanation: explanationForNote,
        date: new Date().toISOString().split('T')[0],
        grammar: [],
        vocabulary: []
      });
    }
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
      setTimeLeft(120)
      setSelectedAnswer(null)
      setShowFeedback(false)
    } else {
      // All questions completed
      showResults()
    }
  }

  const showResults = () => {
    // 점수 계산 및 통계 업데이트
    const correctCount = answers.filter(a => a.isCorrect).length;
    const totalQuestions = questions.length;
    const score = Math.round((correctCount / totalQuestions) * 100);

    // 마이페이지 통계 업데이트
    updateMyPageStatistics('reading', score);

    // 결과 알림
    alert(`${t.allQuestionsCompleted}\n${t.correctAnswers}: ${correctCount}/${totalQuestions} (${score}점)`)
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="reading-page">
      <div className="page-header">
        <h1>{t.readingPageTitle}</h1>
        <p>{t.readingPageDesc}</p>
      </div>
      
      <div className="encouragement-banner">
        {t.encouragementReading}
      </div>

      <div className="exam-selector">
        <button
          className={`exam-btn ${examType === 'toeic' ? 'active' : ''}`}
          onClick={() => {
            setExamType('toeic')
            setCurrentQuestion(0)
            setAnswers([])
            setTimeLeft(120)
          }}
        >
          TOEIC
        </button>
        <button
          className={`exam-btn ${examType === 'toefl' ? 'active' : ''}`}
          onClick={() => {
            setExamType('toefl')
            setCurrentQuestion(0)
            setAnswers([])
            setTimeLeft(120)
          }}
        >
          TOEFL
        </button>
        <button
          className={`exam-btn ${examType === 'sat' ? 'active' : ''}`}
          onClick={() => {
            setExamType('sat')
            setCurrentQuestion(0)
            setAnswers([])
            setTimeLeft(120)
          }}
        >
          수능
        </button>
      </div>

      <div className="reading-container">
        <div className="passage-section">
          <h2>{currentPassage.title}</h2>
          <p className="passage-text">{currentPassage.passage}</p>
        </div>

        <div className="question-section">
          <div className="question-header">
            <span className="question-number">
              {t.questionNumber} {currentQuestion + 1} / {questions.length}
            </span>
            <div className="timer-display">
              <Clock size={20} />
              <span>{formatTime(timeLeft)}</span>
            </div>
          </div>

          <div className="question-card">
            <p className="question-text">{currentQ.text}</p>
            
            <div className="options">
              {currentQ.options.map((option, index) => (
                <button
                  key={index}
                  className={`option-button ${
                    showFeedback && index === selectedAnswer
                      ? answers[answers.length - 1]?.isCorrect
                        ? 'correct'
                        : 'incorrect'
                      : ''
                  } ${
                    showFeedback && index === currentQ.correct ? 'correct-answer' : ''
                  }`}
                  onClick={() => {
                    if (!showFeedback) {
                      setSelectedAnswer(index)
                      handleAnswer(index)
                    }
                  }}
                  disabled={showFeedback}
                >
                  <span className="option-label">{String.fromCharCode(65 + index)}.</span>
                  <span className="option-text">{option}</span>
                  {showFeedback && index === selectedAnswer && answers[answers.length - 1]?.isCorrect && (
                    <CheckCircle className="answer-icon" />
                  )}
                  {showFeedback && index === selectedAnswer && !answers[answers.length - 1]?.isCorrect && (
                    <XCircle className="answer-icon" />
                  )}
                </button>
              ))}
            </div>

            {showFeedback && (
              <div className="explanation-card">
                <div className={`feedback-header ${answers[answers.length - 1]?.isCorrect ? 'correct' : 'incorrect'}`}>
                  {answers[answers.length - 1]?.isCorrect ? (
                    <>
                      <CheckCircle size={24} />
                      <h4>{t.correctAnswer}</h4>
                    </>
                  ) : (
                    <>
                      <XCircle size={24} />
                      <h4>{t.wrongAnswer}</h4>
                    </>
                  )}
                </div>
                <div className="explanation-content">
                  <h5>{t.explanationText}</h5>
                  <p>{explanationText}</p>
                  {!answers[answers.length - 1]?.isCorrect && (
                    <div className="correct-answer-hint">
                      <strong>정답:</strong> {String.fromCharCode(65 + currentQ.correct)}. {currentQ.options[currentQ.correct]}
                    </div>
                  )}
                </div>
                <button className="next-button" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? t.nextQuestion : t.viewResults}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
