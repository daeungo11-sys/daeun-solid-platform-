// Groq API 유틸리티

const API_BASE_URL = 'https://api.groq.com/openai/v1';
const MODEL = 'llama-3.1-70b-versatile'; // 또는 'mixtral-8x7b-32768'

function getApiKey(): string {
  // Vite에서는 VITE_ 접두사가 필요합니다
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY가 설정되지 않았습니다. 환경 변수를 확인해주세요.');
  }
  
  return apiKey;
}

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

// AI Coach 응답 생성
export async function generateAICoachResponse(
  userInput: string,
  conversationHistory: GroqMessage[],
  userLevel: string = 'B1',
  language: string = 'ko'
): Promise<string> {
  const apiKey = getApiKey();
  
  // 언어별 답변 지시
  const languageInstructions: { [key: string]: string } = {
    ko: '한국어로 답변해주세요.',
    en: 'Please answer in English.',
    ja: '日本語で回答してください。',
    zh: '请用中文回答。'
  };
  
  const languageInstruction = languageInstructions[language] || languageInstructions['ko'];

  const systemMessage: GroqMessage = {
    role: 'system',
    content: `당신은 친절하고 전문적인 영어 학습 코치입니다.

역할:
- 영어 학습자의 질문에 명확하고 이해하기 쉽게 답변
- 문법, 어휘, 표현, 학습 방법 등 모든 영어 관련 질문에 대응
- 학습자의 레벨(${userLevel})을 고려하여 적절한 난이도로 설명
- 긍정적이고 격려하는 톤 유지

답변 스타일:
- 예시를 많이 들어서 설명
- 복잡한 개념은 단계별로 설명
- 실생활에서 바로 사용할 수 있는 실용적인 정보 제공
- 필요시 영어 예문을 포함하되 설명은 사용자 언어로

주의사항:
- 학습자의 실력을 무시하지 않기
- 너무 어려운 용어는 쉽게 풀어서 설명
- 항상 학습 동기를 부여하는 방향으로 답변

**중요: ${languageInstruction}**`
  };

  const messages: GroqMessage[] = [
    systemMessage,
    ...conversationHistory,
    { role: 'user', content: userInput }
  ];

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Groq API Error: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error:', error);
    throw error;
  }
}

// 회화 시뮬레이션 응답 생성
export async function generateConversationResponse(
  scenario: string,
  conversationHistory: GroqMessage[],
  userMessage: string
): Promise<string> {
  const apiKey = getApiKey();

  const scenarioPrompts: { [key: string]: string } = {
    '카페': '당신은 카페 직원입니다. 고객에게 친절하게 주문을 받고, 메뉴를 추천하며, 대화를 자연스럽게 이어가세요.',
    '레스토랑': '당신은 레스토랑 웨이터입니다. 손님을 맞이하고, 메뉴를 안내하며, 주문을 받고, 서비스를 제공하세요.',
    '쇼핑몰': '당신은 쇼핑몰 직원입니다. 고객이 원하는 상품을 찾아주고, 사이즈와 색상을 안내하며, 구매를 도와주세요.',
    '병원': '당신은 병원 의료진입니다. 환자의 증상을 듣고, 진찰하며, 치료 방법을 안내하세요.',
    '공항': '당신은 공항 직원입니다. 체크인을 도와주고, 수하물을 처리하며, 탑승 안내를 해주세요.',
    '호텔': '당신은 호텔 프론트 데스크 직원입니다. 체크인을 도와주고, 시설을 안내하며, 서비스를 제공하세요.',
    '면접': '당신은 면접관입니다. 지원자에게 질문하고, 답변을 듣고, 자연스럽게 대화를 이어가세요.',
    '회의': '당신은 회의 참석자입니다. 의견을 제시하고, 토론에 참여하며, 자연스럽게 대화하세요.',
  };

  const systemPrompt = scenarioPrompts[scenario] || scenarioPrompts['카페'];

  const messages: GroqMessage[] = [
    {
      role: 'system',
      content: `${systemPrompt} 응답은 간결하고 자연스럽게 2-3문장 이내로 해주세요. 영어로만 답변하세요.`
    },
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: messages,
        temperature: 0.7,
        max_tokens: 150,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`회화 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error (Conversation):', error);
    throw error;
  }
}

// 사용자 답변 평가 및 대안 제시
export async function evaluateResponse(
  userResponse: string,
  context: string
): Promise<{ evaluation: string; alternative: string }> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `당신은 친절한 영어 선생님입니다. 사용자의 영어 답변을 평가하고 구체적인 피드백을 제공해주세요.

평가 기준:
1. 문법 오류가 있는지 확인
2. 어휘 선택이 자연스러운지
3. 문맥에 적절한지
4. 더 나은 표현 방법 제시

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "evaluation": "구체적인 피드백 (한국어로, 문법/어휘/표현에 대한 평가. 좋은 점과 개선할 점을 모두 언급)",
  "alternative": "더 자연스럽고 원어민스러운 표현 (영어로)"
}

예시:
- 문법이 정확하면: "문법이 정확해요! 다만 좀 더 자연스럽게 표현하려면..."
- 오류가 있으면: "Good try! 하지만 '시제' 부분에서 과거형을 사용해야 해요..."
- 자연스러우면: "완벽해요! 원어민처럼 자연스러운 표현이에요!"

해석이 아닌, 학습자에게 도움이 되는 피드백을 주세요.`
          },
          {
            role: 'user',
            content: `문맥: ${context}\n\n사용자 답변: ${userResponse}\n\n이 답변에 대한 구체적인 피드백과 더 나은 표현을 알려주세요.`
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`평가 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error (Evaluation):', error);
    throw error;
  }
}

// Speaking 피드백 생성
export async function generateSpeakingFeedback(
  question: string,
  recordingDuration: number,
  transcript?: string
): Promise<{ pronunciation: string; grammar: string; overall: string }> {
  const apiKey = getApiKey();

  const prompt = `다음은 영어 말하기 연습입니다.

질문: ${question}
녹음 시간: ${recordingDuration}초
${transcript ? `전사된 텍스트: ${transcript}` : '음성 녹음만 제공됨'}

다음 세 가지 항목에 대해 한국어로 피드백을 제공해주세요:
1. 발음 (pronunciation): 발음의 명확성, 강세, 억양에 대한 피드백
2. 문법 (grammar): 문법 사용의 정확성과 개선점
3. 전체 평가 (overall): 종합적인 평가와 개선 제안

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "pronunciation": "발음 피드백",
  "grammar": "문법 피드백",
  "overall": "전체 평가"
}`;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 영어 말하기 평가자입니다. 학습자에게 도움이 되는 구체적이고 건설적인 피드백을 제공하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`피드백 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error (Speaking Feedback):', error);
    throw error;
  }
}

// Writing 피드백 생성
export async function generateWritingFeedback(
  topic: string,
  text: string,
  wordCount: number
): Promise<{ grammar: string; vocabulary: string; structure: string; overall: string }> {
  const apiKey = getApiKey();

  const prompt = `다음은 영어 쓰기 연습입니다.

주제: ${topic}
작성된 텍스트: ${text}
단어 수: ${wordCount}

다음 네 가지 항목에 대해 한국어로 피드백을 제공해주세요:
1. 문법 (grammar): 문법 사용의 정확성과 개선점
2. 어휘 (vocabulary): 어휘 선택의 적절성과 개선 제안
3. 구조 (structure): 에세이 구조와 논리적 흐름 평가
4. 전체 평가 (overall): 종합적인 평가와 개선 제안

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "grammar": "문법 피드백",
  "vocabulary": "어휘 피드백",
  "structure": "구조 피드백",
  "overall": "전체 평가"
}`;

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: '당신은 전문적인 영어 쓰기 평가자입니다. 학습자에게 도움이 되는 구체적이고 건설적인 피드백을 제공하세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.5,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`피드백 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error (Writing Feedback):', error);
    throw error;
  }
}

// 문법 교정
export async function correctGrammar(sentence: string): Promise<{
  original: string;
  corrected: string;
  reason: string;
  errorType: string;
}> {
  const apiKey = getApiKey();

  try {
    const response = await fetch(`${API_BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: `당신은 전문적인 영어 문법 교정자입니다. 사용자가 입력한 문장을 검토하고, 오류가 있으면 수정하고, 없으면 그대로 반환하세요.

응답은 반드시 다음 JSON 형식으로 해주세요:
{
  "original": "원본 문장",
  "corrected": "수정된 문장 (오류가 없으면 원본과 동일)",
  "reason": "수정 이유 또는 정확한 이유 (한국어로)",
  "errorType": "오류 유형 (예: '대소문자 오류', '시제 오류', '전치사 오류', '오류 없음' 등)"
}`
          },
          {
            role: 'user',
            content: `다음 문장을 검토하고 교정해주세요: ${sentence}`
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`문법 교정 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Groq API Error (Grammar Correction):', error);
    throw error;
  }
}

