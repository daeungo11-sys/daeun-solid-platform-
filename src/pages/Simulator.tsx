import { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, VolumeX } from 'lucide-react';
import { updateProgress, addConversationHistory } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { generateConversationResponse, evaluateResponse, type GroqMessage } from '../lib/groq';
import './Simulator.css';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  evaluation?: {
    evaluation: string;
    alternative: string;
  };
}

export default function Simulator() {
  const { t } = useLanguage();
  
  const scenarios = [
    { value: '카페', label: t.scenarioCafe, description: t.scenarioCafeDesc },
    { value: '레스토랑', label: t.scenarioRestaurant, description: t.scenarioRestaurantDesc },
    { value: '쇼핑몰', label: t.scenarioShopping, description: t.scenarioShoppingDesc },
    { value: '병원', label: t.scenarioHospital, description: t.scenarioHospitalDesc },
    { value: '공항', label: t.scenarioAirport, description: t.scenarioAirportDesc },
    { value: '호텔', label: t.scenarioHotel, description: t.scenarioHotelDesc },
    { value: '면접', label: t.scenarioInterview, description: t.scenarioInterviewDesc },
    { value: '회의', label: t.scenarioMeeting, description: t.scenarioMeetingDesc },
  ];

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
      // Groq API를 사용하여 회화 응답 생성
      const conversationHistory: GroqMessage[] = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content
      }));

      const aiResponse = await generateConversationResponse(
        selectedScenario,
        conversationHistory,
        transcript
      );

      // 사용자 답변 평가
      let evaluation = null;
      try {
        const context = messages[messages.length - 1]?.content || '';
        evaluation = await evaluateResponse(transcript, context);
      } catch (evalError) {
        console.error('Evaluation error:', evalError);
        // 평가 실패 시 기본 평가 제공
        evaluation = {
          evaluation: 'Good use of basic vocabulary. Try to use more natural expressions.',
          alternative: transcript.toLowerCase().includes('hello') ? 'Hi there!' : 'Nice to meet you!',
        };
      }

      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          evaluation,
        };
        return [...updated, { role: 'assistant', content: aiResponse }];
      });

      // Speak AI response
      if (speechEnabled) {
        handleAIResponse(aiResponse);
      }

      updateProgress(0);
    } catch (err) {
      console.error('Conversation error:', err);
      // 에러 발생 시 기본 응답 제공
      const fallbackResponse = getScenarioGreeting(selectedScenario);
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: 'I apologize, but I encountered an error. Could you please repeat that?' }
      ]);
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
                  <p>{t.startVoiceConversation}</p>
                  <p className="hint">{t.micButtonHint}</p>
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
                title={isListening ? t.recordingStop : t.recordingStart}
              >
                {isListening ? <Square size={24} /> : <Mic size={24} />}
                <span>{isListening ? t.recordingInProgress : t.speak}</span>
              </button>
              <button
                onClick={() => setSpeechEnabled(!speechEnabled)}
                className={`speech-toggle ${speechEnabled ? 'enabled' : 'disabled'}`}
                title={speechEnabled ? t.speechPlayOff : t.speechPlayOn}
              >
                {speechEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              {isSpeaking && (
                <div className="speaking-indicator">
                  <span className="pulse"></span>
                  <span>{t.aiSpeaking}</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}




