import { useState, useEffect } from 'react'
import { Clock, CheckCircle, XCircle } from 'lucide-react'
import './Reading.css'

interface Question {
  id: number
  text: string
  options: string[]
  correct: number
  explanation: string
}

interface Answer {
  questionId: number
  selected: number
  isCorrect: boolean
}

export default function Reading() {
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
          explanation: "The passage states that global temperatures are rising 'due to increased greenhouse gas emissions'. While other factors like deforestation and industrial processes are mentioned, the emissions are cited as the direct cause of temperature rise."
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
          explanation: "The passage mentions that 'progress has been inconsistent across nations', indicating that while there have been efforts through agreements like the Paris Agreement, the results have varied."
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
          explanation: "The passage explicitly states that bioluminescence occurs 'through a chemical reaction involving luciferin, a light-emitting compound, and luciferase, an enzyme that catalyzes the reaction'."
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
          explanation: "The passage clearly states that 'Marine environments are particularly rich in bioluminescent species'."
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
          explanation: "The passage explicitly states that the Industrial Revolution 'marked a shift from agrarian economies to industrialized manufacturing'."
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
          explanation: "The passage states that the Industrial Revolution 'represents both humanity's technological triumph and a reminder of the complex consequences', indicating multifaceted outcomes."
        }
      ]
    }
  }

  const currentPassage = readingPassages[examType]
  const questions: Question[] = currentPassage.questions
  const currentQ = questions[currentQuestion]

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
    setAnswers([...answers, { questionId: currentQ.id, selected: optionIndex, isCorrect }])
    setShowFeedback(true)
    setTimeLeft(0)
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
    // This would typically show a results summary
    alert('모든 문제를 완료했습니다!')
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="reading-page">
      <div className="page-header">
        <h1>읽기 연습</h1>
        <p>토익, 토플, 수능 지문으로 독해 실력을 향상시켜보세요</p>
      </div>
      
      <div className="encouragement-banner">
        📚 꾸준히 읽으면 어휘력과 이해력이 자연스럽게 향상됩니다!
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
              문제 {currentQuestion + 1} / {questions.length}
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
                <h4>해설</h4>
                <p>{currentQ.explanation}</p>
                <button className="next-button" onClick={handleNext}>
                  {currentQuestion < questions.length - 1 ? '다음 문제' : '결과 보기'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
