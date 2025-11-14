// Groq API 유틸리티

const API_BASE_URL = 'https://api.groq.com/openai/v1';
const MODEL = 'llama-3.1-8b-instant'; // llama-3.1-70b-versatile이 지원 중단되어 llama-3.1-8b-instant로 변경

function getApiKey(): string {
  // Vite에서는 VITE_ 접두사가 필요합니다
  const apiKey = import.meta.env.VITE_GROQ_API_KEY;
  
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your-groq-api-key-here') {
    console.error('Groq API Key Error:', {
      hasKey: !!apiKey,
      keyLength: apiKey?.length || 0,
      keyPrefix: apiKey?.substring(0, 10) || 'none'
    });
    throw new Error('Groq API 키가 설정되지 않았습니다. Vercel 환경 변수에 VITE_GROQ_API_KEY를 추가해주세요.');
  }
  
  return apiKey.trim();
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

**역할:**
- 영어 학습자의 질문에 명확하고 이해하기 쉽게 답변
- 문법, 어휘, 표현, 학습 방법 등 모든 영어 관련 질문에 대응
- 학습자의 레벨(${userLevel})을 고려하여 적절한 난이도로 설명
- 긍정적이고 격려하는 톤 유지

**답변 스타일:**
- 예시를 많이 들어서 설명
- 복잡한 개념은 단계별로 설명
- 실생활에서 바로 사용할 수 있는 실용적인 정보 제공
- 필요시 영어 예문을 포함하되 설명은 사용자 언어로

**중요 규칙:**
1. 사용자의 질문에만 답변하세요.
2. 질문과 답변을 명확히 구분하세요.
3. 불필요한 피드백이나 평가를 추가하지 마세요.
4. 질문에 대한 직접적이고 정확한 답변만 제공하세요.

**주의사항:**
- 학습자의 실력을 무시하지 않기
- 너무 어려운 용어는 쉽게 풀어서 설명
- 항상 학습 동기를 부여하는 방향으로 답변

**언어: ${languageInstruction}**`
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
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || '알 수 없는 오류' };
      }
      console.error('Groq API Error Response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`Groq API 오류 (${response.status}): ${errorData.error?.message || errorData.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response:', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error (AI Coach):', error);
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Groq API 호출 중 오류가 발생했습니다.');
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
      content: `${systemPrompt}

**중요 규칙:**
1. 시나리오 역할에 맞는 대화만 진행하세요.
2. 사용자 메시지에 대한 응답만 제공하세요.
3. 피드백이나 평가를 제공하지 마세요.
4. 응답은 간결하고 자연스럽게 2-3문장 이내로 해주세요.
5. 영어로만 답변하세요.

**절대 하지 말 것:**
- 피드백이나 평가 제공
- 질문과 답변 혼합
- 한국어 사용`
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
      const errorText = await response.text();
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || '알 수 없는 오류' };
      }
      console.error('Groq API Error Response (Conversation):', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(`회화 생성 실패 (${response.status}): ${errorData.error?.message || errorData.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response (Conversation):', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Groq API Error (Conversation):', error);
    if (error instanceof Error && error.message.includes('API 키')) {
      throw error;
    }
    throw new Error('회화 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// 사용자 답변 평가 및 대안 제시
export async function evaluateResponse(
  userResponse: string,
  context: string
): Promise<{ evaluation: string; alternative: string }> {
  const apiKey = getApiKey();

  const systemPrompt = `당신은 친절한 영어 선생님입니다.

**중요 규칙:**
1. 문맥에 대한 답변을 제공하지 마세요. 오직 사용자 답변에 대한 평가만 제공하세요.
2. 질문과 피드백을 절대 섞지 마세요.
3. 응답은 반드시 JSON 형식으로만 제공하세요.

평가 기준:
1. 문법 오류가 있는지 확인
2. 어휘 선택이 자연스러운지
3. 문맥에 적절한지
4. 더 나은 표현 방법 제시

응답 형식 (반드시 준수):
{
  "evaluation": "구체적인 피드백만 (한국어로, 문법/어휘/표현에 대한 평가. 좋은 점과 개선할 점을 모두 언급)",
  "alternative": "더 자연스럽고 원어민스러운 표현만 (영어로)"
}

**절대 하지 말 것:**
- 문맥에 대한 답변 제공
- 질문과 피드백 혼합
- JSON 형식 외의 응답`;

  const userPrompt = `영어 답변 평가 요청:

문맥: ${context}
사용자 답변: ${userResponse}

위 사용자 답변에 대한 구체적인 피드백과 더 나은 표현만 알려주세요. 문맥에 대한 답변은 하지 마세요.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`평가 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response (Evaluation):', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    const content = data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error (Evaluation):', parseError, 'Content:', content);
      // JSON 파싱 실패 시 기본값 반환
      return {
        evaluation: 'Good try! Keep practicing to improve your English.',
        alternative: content || userResponse
      };
    }
  } catch (error) {
    console.error('Groq API Error (Evaluation):', error);
    if (error instanceof Error && error.message.includes('API 키')) {
      throw error;
    }
    throw new Error('평가 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// Speaking 피드백 생성
export async function generateSpeakingFeedback(
  question: string,
  recordingDuration: number,
  transcript?: string
): Promise<{ pronunciation: string; grammar: string; overall: string }> {
  const apiKey = getApiKey();

  const systemPrompt = `당신은 전문적인 영어 말하기 평가자입니다. 

**중요 규칙:**
1. 질문에 대한 답변을 제공하지 마세요. 오직 피드백만 제공하세요.
2. 사용자의 답변 내용을 평가하고 개선점을 제시하세요.
3. 질문과 피드백을 절대 섞지 마세요.
4. 응답은 반드시 JSON 형식으로만 제공하세요.

평가 항목:
- 발음 (pronunciation): 발음의 명확성, 강세, 억양에 대한 구체적인 피드백
- 문법 (grammar): 문법 사용의 정확성과 개선점
- 전체 평가 (overall): 종합적인 평가와 개선 제안

응답 형식 (반드시 준수):
{
  "pronunciation": "발음 피드백만 (한국어)",
  "grammar": "문법 피드백만 (한국어)",
  "overall": "전체 평가만 (한국어)"
}`;

  const userPrompt = `영어 말하기 연습 평가 요청:

질문: ${question}
녹음 시간: ${recordingDuration}초
${transcript ? `전사된 텍스트: ${transcript}` : '음성 녹음만 제공됨'}

위 정보를 바탕으로 발음, 문법, 전체 평가에 대한 피드백만 제공해주세요. 질문에 대한 답변은 하지 마세요.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`피드백 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response (Speaking):', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    const content = data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error (Speaking):', parseError, 'Content:', content);
      // JSON 파싱 실패 시 기본값 반환
      return {
        pronunciation: '발음 평가를 생성하는 중 오류가 발생했습니다.',
        grammar: '문법 평가를 생성하는 중 오류가 발생했습니다.',
        overall: '전체 평가를 생성하는 중 오류가 발생했습니다.'
      };
    }
  } catch (error) {
    console.error('Groq API Error (Speaking Feedback):', error);
    if (error instanceof Error && error.message.includes('API 키')) {
      throw error;
    }
    throw new Error('피드백 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

// Writing 피드백 생성
export async function generateWritingFeedback(
  topic: string,
  text: string,
  wordCount: number
): Promise<{ grammar: string; vocabulary: string; structure: string; overall: string }> {
  const apiKey = getApiKey();

  const systemPrompt = `당신은 전문적인 영어 쓰기 평가자입니다.

**중요 규칙:**
1. 주제에 대한 답변을 제공하지 마세요. 오직 피드백만 제공하세요.
2. 사용자가 작성한 텍스트를 평가하고 개선점을 제시하세요.
3. 주제와 피드백을 절대 섞지 마세요.
4. 응답은 반드시 JSON 형식으로만 제공하세요.

평가 항목:
- 문법 (grammar): 문법 사용의 정확성과 개선점
- 어휘 (vocabulary): 어휘 선택의 적절성과 개선 제안
- 구조 (structure): 에세이 구조와 논리적 흐름 평가
- 전체 평가 (overall): 종합적인 평가와 개선 제안

응답 형식 (반드시 준수):
{
  "grammar": "문법 피드백만 (한국어)",
  "vocabulary": "어휘 피드백만 (한국어)",
  "structure": "구조 피드백만 (한국어)",
  "overall": "전체 평가만 (한국어)"
}`;

  const userPrompt = `영어 쓰기 연습 평가 요청:

주제: ${topic}
작성된 텍스트: ${text}
단어 수: ${wordCount}

위 텍스트를 바탕으로 문법, 어휘, 구조, 전체 평가에 대한 피드백만 제공해주세요. 주제에 대한 답변은 하지 마세요.`;

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
            content: systemPrompt
          },
          {
            role: 'user',
            content: userPrompt
          }
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`피드백 생성 실패: ${errorData.error?.message || '알 수 없는 오류'}`);
    }

    const data = await response.json();
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response (Writing):', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    const content = data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error (Writing):', parseError, 'Content:', content);
      // JSON 파싱 실패 시 기본값 반환
      return {
        grammar: '문법 평가를 생성하는 중 오류가 발생했습니다.',
        vocabulary: '어휘 평가를 생성하는 중 오류가 발생했습니다.',
        structure: '구조 평가를 생성하는 중 오류가 발생했습니다.',
        overall: '전체 평가를 생성하는 중 오류가 발생했습니다.'
      };
    }
  } catch (error) {
    console.error('Groq API Error (Writing Feedback):', error);
    if (error instanceof Error && error.message.includes('API 키')) {
      throw error;
    }
    throw new Error('피드백 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
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
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq API Response (Grammar):', data);
      throw new Error('Groq API 응답 형식이 올바르지 않습니다.');
    }
    const content = data.choices[0].message.content;
    try {
      return JSON.parse(content);
    } catch (parseError) {
      console.error('JSON Parse Error (Grammar):', parseError, 'Content:', content);
      // JSON 파싱 실패 시 기본값 반환
      return {
        original: sentence,
        corrected: sentence,
        reason: '문법 교정 중 오류가 발생했습니다.',
        errorType: '오류 없음'
      };
    }
  } catch (error) {
    console.error('Groq API Error (Grammar Correction):', error);
    if (error instanceof Error && error.message.includes('API 키')) {
      throw error;
    }
    throw new Error('문법 교정 중 오류가 발생했습니다. 다시 시도해주세요.');
  }
}

