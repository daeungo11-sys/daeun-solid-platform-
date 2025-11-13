import { useState, useRef, useEffect } from 'react';
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
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationStarted, setConversationStarted] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startConversation = () => {
    setMessages([]);
    setConversationStarted(true);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || loading) return;

    const newUserMessage: Message = {
      role: 'user',
      content: userInput,
    };

    setMessages((prev) => [...prev, newUserMessage]);
    setUserInput('');
    setLoading(true);

    try {
      // 시뮬레이션: 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 시나리오별 응답 생성
      const scenarioResponses: Record<string, string[]> = {
        '카페': ['Hi! What can I get you today?', 'Would you like anything else?', 'That will be $5.50.'],
        '레스토랑': ['Good evening! Do you have a reservation?', 'What would you like to order?', 'How was everything?'],
        '쇼핑몰': ['Can I help you find something?', 'What size are you looking for?', 'Would you like to try it on?'],
        '병원': ['What seems to be the problem?', 'How long have you had these symptoms?', 'I\'ll prescribe some medication.'],
        '공항': ['May I see your passport?', 'How many bags are you checking?', 'Your gate is A12.'],
        '호텔': ['Welcome! Do you have a reservation?', 'How many nights will you be staying?', 'Breakfast is served from 7 to 10.'],
        '면접': ['Tell me about yourself.', 'Why are you interested in this position?', 'Do you have any questions for us?'],
        '회의': ['Let\'s start the meeting.', 'What are your thoughts on this?', 'Any other questions?'],
      };

      const responses = scenarioResponses[selectedScenario] || ['How can I help you?'];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      // 간단한 평가 시뮬레이션
      const evaluation = {
        evaluation: 'Good use of basic vocabulary. Try to use more natural expressions.',
        alternative: userInput.includes('hello') ? 'Hi there!' : 'Nice to meet you!',
      };

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          evaluation,
        };
        return [...updated, { role: 'assistant', content: randomResponse }];
      });

      updateProgress(0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveAndEndConversation = () => {
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
    setUserInput('');
  };

  const resetConversation = () => {
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
    setUserInput('');
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
                  <p>대화를 시작해보세요!</p>
                  <p className="hint">아래 입력창에 영어로 말을 걸어보세요.</p>
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

            <form onSubmit={handleSendMessage} className="input-form">
              <input
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={t.typeMessage}
                disabled={loading}
                className="message-input"
              />
              <button type="submit" disabled={loading || !userInput.trim()} className="btn-primary send-btn">
                {loading ? t.sending : t.send}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}




