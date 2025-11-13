import { useState, useRef, useEffect } from 'react';
import { getUserLevel, getLevelName, addAICoachHistory } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import './AICoach.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AICoach() {
  const { t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: t.aiCoachGreeting,
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userLevel, setUserLevel] = useState<string>('');

  useEffect(() => {
    const level = getUserLevel();
    setUserLevel(getLevelName(level.level));
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // 시뮬레이션: 실제로는 API 호출
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // 간단한 응답 생성 시뮬레이션 (언어별로 다르게 처리 필요하지만 현재는 기본 응답 사용)
      const responses: Record<string, string> = {
        '표현': '영어 표현은 상황과 맥락에 따라 다르게 사용됩니다. 구체적인 표현을 알려주시면 더 자세히 설명해드릴 수 있어요!',
        '차이점': '비슷한 단어들의 차이점을 이해하는 것은 중요해요. 어떤 단어들을 비교하고 싶으신가요?',
        '문법': '문법은 규칙을 이해하고 연습하는 것이 중요해요. 어떤 문법에 대해 궁금하신가요?',
        '말하기': '영어 말하기 실력을 향상시키려면 매일 조금씩이라도 영어로 말하는 연습을 하세요. 회화 시뮬레이터를 활용해보세요!',
        'default': '좋은 질문이에요! 영어 학습에 도움이 되는 답변을 드리기 위해 더 구체적으로 질문해주시면 좋겠어요. 예를 들어, 특정 문법이나 표현에 대해 물어보시면 더 정확한 답변을 드릴 수 있습니다.',
      };

      let response = responses['default'];
      const lowerInput = input.toLowerCase();
      if (lowerInput.includes('표현') || lowerInput.includes('expression')) {
        response = responses['표현'];
      } else if (lowerInput.includes('차이') || lowerInput.includes('difference')) {
        response = responses['차이점'];
      } else if (lowerInput.includes('문법') || lowerInput.includes('grammar')) {
        response = responses['문법'];
      } else if (lowerInput.includes('말하기') || lowerInput.includes('speaking')) {
        response = responses['말하기'];
      }

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      addAICoachHistory({
        question: input,
        answer: response,
      });
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: t.aiCoachError,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 빠른 질문은 언어별로 다르게 제공할 수 있지만, 현재는 기본 질문 사용
  const quickQuestions = [
    '영어 말하기 실력을 빠르게 향상시키는 방법은?',
    "'have to'와 'must'의 차이점은?",
    '관사 (a/an/the) 사용법을 쉽게 알려주세요',
    '효과적인 단어 암기 방법은?',
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="ai-coach-page">
      <div className="ai-coach-container">
        <div className="coach-header">
          <div>
            <h1>🤖 {t.aiCoachPageTitle}</h1>
            <p>{t.aiCoachPageDesc}</p>
          </div>
          {userLevel && (
            <div className="level-badge">
              <p className="level-label">{t.currentLevel}</p>
              <p className="level-value">{userLevel}</p>
            </div>
          )}
        </div>

        <div className="chat-container">
          <div className="messages-area">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.role}`}>
                <div className="message-bubble">
                  <p className="message-text">{msg.content}</p>
                </div>
              </div>
            ))}

            {loading && (
              <div className="message assistant">
                <div className="message-bubble loading">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {messages.length === 1 && (
            <div className="quick-questions">
              <p className="quick-questions-label">{t.quickQuestions}</p>
              <div className="quick-questions-grid">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(q)}
                    className="quick-question-btn"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.questionPlaceholder}
              disabled={loading}
              className="message-input"
            />
            <button type="submit" disabled={loading || !input.trim()} className="send-button">
              {loading ? t.checking : t.send}
            </button>
          </form>
        </div>

        <div className="guide-section">
          <h3>{t.aiCoachGuideTitle}</h3>
          <ul>
            <li>{t.aiCoachGuideGrammar}</li>
            <li>{t.aiCoachGuideVocabulary}</li>
            <li>{t.aiCoachGuideExpression}</li>
            <li>{t.aiCoachGuideAdvice}</li>
            <li>{t.aiCoachGuideFeedback}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}




