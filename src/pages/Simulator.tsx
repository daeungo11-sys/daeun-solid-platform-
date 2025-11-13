import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { updateProgress, addConversationHistory } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import './Simulator.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  evaluation?: {
    evaluation: string;
    alternative: string;
  };
}

const scenarios = [
  { value: '카페', label: '☕ 카페', description: '주문, 메뉴 추천, 결제' },
  { value: '레스토랑', label: '🍽️ 레스토랑', description: '예약, 주문, 계산' },
  { value: '쇼핑몰', label: '🛍️ 쇼핑몰', description: '상품 문의, 시착, 환불' },
  { value: '병원', label: '🏥 병원', description: '예약, 증상 설명, 처방' },
  { value: '공항', label: '✈️ 공항', description: '체크인, 수하물, 탑승구' },
  { value: '호텔', label: '🏨 호텔', description: '체크인, 룸서비스, 문의' },
  { value: '면접', label: '💼 면접', description: '자기소개, 질문 답변' },
  { value: '회의', label: '📊 회의', description: '발표, 토론, 의견 제시' },
];

export default function Simulator() {
  const { t } = useLanguage();
  const [selectedScenario, setSelectedScenario] = useState('카페');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthesisRef = useRef<SpeechSynthesis | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initialize Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        handleUserSpeech(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'no-speech') {
          alert('음성이 감지되지 않았습니다. 다시 시도해주세요.');
        }
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn('Speech Recognition not supported');
    }

    // Initialize Speech Synthesis
    synthesisRef.current = window.speechSynthesis;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (synthesisRef.current) {
        synthesisRef.current.cancel();
      }
    };
  }, []);

  const startConversation = () => {
    setMessages([]);
    setConversationStarted(true);
    // Start with AI greeting
    setTimeout(() => {
      const greeting = getScenarioGreeting(selectedScenario);
      setMessages([{ role: 'assistant', content: greeting }]);
      handleAIResponse(greeting);
    }, 500);
  };

  const getScenarioGreeting = (scenario: string): string => {
    const greetings: Record<string, string> = {
      '카페': 'Hi! Welcome to our café. What can I get you today?',
      '레스토랑': 'Good evening! Welcome to our restaurant. Do you have a reservation?',
      '쇼핑몰': 'Hello! Can I help you find something today?',
      '병원': 'Hello, how can I help you today? What seems to be the problem?',
      '공항': 'Good day! May I see your passport, please?',
      '호텔': 'Welcome! Do you have a reservation with us?',
      '면접': 'Hello, thank you for coming. Please tell me about yourself.',
      '회의': 'Good morning everyone. Let\'s start the meeting.',
    };
    return greetings[scenario] || 'Hello! How can I help you?';
  };

  const startListening = () => {
    if (!recognitionRef.current) {
      alert('음성 인식이 지원되지 않는 브라우저입니다.');
      return;
    }

    if (isListening) {
      stopListening();
      return;
    }

    try {
      recognitionRef.current.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recognition:', error);
      setIsListening(false);
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleUserSpeech = async (transcript: string) => {
    if (!transcript.trim() || loading) return;

    const newUserMessage: Message = {
      role: 'user',
      content: transcript,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setLoading(true);

    try {
      // 시뮬레이션: 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 시나리오별 응답 생성
      const scenarioResponses: Record<string, string[]> = {
        '카페': ['What size would you like?', 'Would you like anything else?', 'That will be $5.50.', 'Here is your order.'],
        '레스토랑': ['What would you like to order?', 'How was everything?', 'Would you like dessert?', 'Here is your bill.'],
        '쇼핑몰': ['What size are you looking for?', 'Would you like to try it on?', 'That looks great on you!', 'How would you like to pay?'],
        '병원': ['How long have you had these symptoms?', 'I\'ll prescribe some medication.', 'Take this twice a day.', 'Do you have any allergies?'],
        '공항': ['How many bags are you checking?', 'Your gate is A12.', 'Boarding will begin in 30 minutes.', 'Have a safe flight!'],
        '호텔': ['How many nights will you be staying?', 'Breakfast is served from 7 to 10.', 'Your room is on the 5th floor.', 'Is there anything else I can help you with?'],
        '면접': ['Why are you interested in this position?', 'Do you have any questions for us?', 'Tell me about your experience.', 'What are your strengths?'],
        '회의': ['What are your thoughts on this?', 'Any other questions?', 'Let\'s discuss the next steps.', 'Does everyone agree?'],
      };

      const responses = scenarioResponses[selectedScenario] || ['How can I help you?'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // 간단한 평가 시뮬레이션
      const evaluation = {
        evaluation: 'Good use of basic vocabulary. Try to use more natural expressions.',
        alternative: transcript.toLowerCase().includes('hello') ? 'Hi there!' : 'Nice to meet you!',
      };

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          evaluation,
        };
        return [...updated, { role: 'assistant', content: randomResponse }];
      });

      // Speak AI response
      if (speechEnabled) {
        handleAIResponse(randomResponse);
      }

      updateProgress(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAIResponse = (text: string) => {
    if (!synthesisRef.current || !speechEnabled) return;

    // Cancel any ongoing speech
    synthesisRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'en-US';
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onstart = () => {
      setIsSpeaking(true);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
    };

    utterance.onerror = (error) => {
      console.error('Speech synthesis error:', error);
      setIsSpeaking(false);
    };

    synthesisRef.current.speak(utterance);
  };

  const saveAndEndConversation = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);
    
    if (messages.length > 0) {
      addConversationHistory({
        id: Date.now().toString(),
        scenario: selectedScenario,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          evaluation: m.evaluation,
        })),
        timestamp: new Date().toISOString(),
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
    setMessages([]);
    setConversationStarted(false);
  };

  const resetConversation = () => {
    stopListening();
    if (synthesisRef.current) {
      synthesisRef.current.cancel();
    }
    setIsSpeaking(false);
    
    if (messages.length > 0) {
      addConversationHistory({
        id: Date.now().toString(),
        scenario: selectedScenario,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          evaluation: m.evaluation,
        })),
        timestamp: new Date().toISOString(),
      });
    }
    setMessages([]);
    setConversationStarted(false);
  };

  return (
    <div className="simulator-page">
      <div className="simulator-container">
        <h1>💬 {t.simulatorPageTitle}</h1>
        <p className="page-desc">{t.simulatorPageDesc}</p>

        {!conversationStarted ? (
          <div className="scenario-selection">
            <h2>{t.selectScenario}</h2>
            <div className="scenarios-grid">
              {scenarios.map((scenario) => (
                <button
                  key={scenario.value}
                  onClick={() => setSelectedScenario(scenario.value)}
                  className={`scenario-card ${selectedScenario === scenario.value ? 'active' : ''}`}
                >
                  <div className="scenario-label">{scenario.label}</div>
                  <div className="scenario-desc">{scenario.description}</div>
                </button>
              ))}
            </div>
            <button onClick={startConversation} className="btn-primary start-btn">
              {t.startConversation}
            </button>
          </div>
        ) : (
          <div className="conversation-area">
            <div className="conversation-header">
              <div className="scenario-info">
                <span>{scenarios.find(s => s.value === selectedScenario)?.label}</span>
              </div>
              <div className="conversation-controls">
                <button onClick={saveAndEndConversation} className="btn-success">
                  {t.endConversation}
                </button>
                <button onClick={resetConversation} className="btn-secondary">
                  {t.reset}
                </button>
              </div>
            </div>

            {saveSuccess && (
              <div className="success-message">{t.conversationSaved}</div>
            )}

            <div className="messages-container" ref={messagesEndRef}>
              {messages.length === 0 && (
                <div className="welcome-message">
                  <p>음성 대화를 시작해보세요!</p>
                  <p className="hint">마이크 버튼을 눌러 영어로 말해보세요.</p>
                </div>
              )}
              {messages.map((message, index) => (
                <div key={index}>
                  <div className={`message ${message.role}`}>
                    <div className="message-content">
                      {message.content}
                    </div>
                  </div>
                  {message.evaluation && (
                    <div className="evaluation">
                      <div className="evaluation-item">
                        <strong>{t.feedback}</strong> {message.evaluation.evaluation}
                      </div>
                      <div className="evaluation-item">
                        <strong>{t.alternativeExpression}</strong> {message.evaluation.alternative}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                <div className="message assistant">
                  <div className="message-content loading">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>

            <div className="voice-controls">
              <button
                onClick={startListening}
                disabled={loading || isSpeaking}
                className={`mic-button ${isListening ? 'listening' : ''}`}
                title={isListening ? '녹음 중지' : '녹음 시작'}
              >
                {isListening ? <Square size={24} /> : <Mic size={24} />}
                <span>{isListening ? '녹음 중...' : '말하기'}</span>
              </button>
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`speech-toggle ${speechEnabled ? 'enabled' : 'disabled'}`}
                title={speechEnabled ? '음성 재생 끄기' : '음성 재생 켜기'}
              >
                {speechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              {isSpeaking && (
                <div className="speaking-indicator">
                  <span className="pulse"></span>
                  <span>AI가 말하는 중...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




