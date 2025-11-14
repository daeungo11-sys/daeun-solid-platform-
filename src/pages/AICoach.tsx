import { useState, useRef, useEffect } from 'react';
import { getUserLevel, getLevelName, addAICoachHistory } from '../lib/storage';
import { useLanguage } from '../contexts/LanguageContext';
import { generateAICoachResponse, type GroqMessage } from '../lib/groq';
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

  // 현재 언어 가져오기
  const getCurrentLanguage = () => {
    return localStorage.getItem('language') || 'ko';
  };

  // 향상된 AI 응답 생성 함수
  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();
    const trimmedInput = userInput.trim();

    // 문법 질문 처리
    if (lowerInput.includes('must') && lowerInput.includes('have to')) {
      return `"must"와 "have to"의 차이점을 설명해드릴게요! 📚

**Must:**
• 개인적인 의무나 강한 추론을 나타냅니다
• 예: "I must finish my homework." (나는 숙제를 끝내야 해)
• 예: "She must be tired." (그녀는 피곤할 거야 - 추론)

**Have to:**
• 외부적인 의무나 규칙을 나타냅니다
• 예: "I have to wear a uniform at school." (학교에서 교복을 입어야 해)
• 예: "You have to be 18 to vote." (투표하려면 18세여야 해)

**요약:**
- Must = 내가 생각하는 의무/강한 추론
- Have to = 외부 규칙/상황에 의한 의무

둘 다 "~해야 한다"는 의미지만, must가 더 주관적이고 강한 느낌입니다! 💡`;
    }

    if (lowerInput.includes('현재완료') || lowerInput.includes('present perfect') || lowerInput.includes('과거시제') || lowerInput.includes('past tense')) {
      return `현재완료와 과거시제의 차이를 설명해드릴게요! ⏰

**과거시제 (Past Tense):**
• 과거의 특정 시점에 일어난 일
• 예: "I went to Paris last year." (작년에 파리에 갔어)
• 예: "She studied English yesterday." (그녀는 어제 영어를 공부했어)

**현재완료 (Present Perfect):**
• 과거에 시작되어 현재까지 이어지거나, 과거의 경험이 현재에 영향을 미치는 일
• 예: "I have been to Paris." (파리에 가본 적이 있어 - 경험)
• 예: "She has studied English for 3 years." (3년째 영어를 공부하고 있어 - 계속)
• 예: "I have finished my homework." (숙제를 끝냈어 - 결과가 현재에 영향)

**핵심 차이:**
- 과거시제: "언제?" (when?) → 특정 시점 강조
- 현재완료: "경험/결과/계속" → 현재와의 연결 강조

**기억하기 쉬운 팁:**
과거시제는 "~했어" (완전히 끝난 일)
현재완료는 "~한 적 있어 / ~해왔어" (경험이나 계속되는 일) ✨`;
    }

    if (lowerInput.includes('관사') || lowerInput.includes('article') || lowerInput.includes('a/an/the')) {
      return `관사 (a/an/the) 사용법을 쉽게 설명해드릴게요! 📖

**A / An (부정관사):**
• 처음 언급하거나, 일반적인 것, 하나의 것
• A: 자음으로 시작하는 단어 앞 (a book, a car)
• An: 모음으로 시작하는 단어 앞 (an apple, an hour)
• 예: "I saw a dog." (개 한 마리를 봤어 - 처음 언급)

**The (정관사):**
• 이미 언급된 것, 특정한 것, 유일한 것
• 예: "The dog was cute." (그 개는 귀여웠어 - 앞서 언급한 개)
• 예: "The sun is bright." (태양은 밝아 - 유일한 것)
• 예: "I went to the library." (그 도서관에 갔어 - 특정 도서관)

**관사 없음:**
• 복수형 일반 명사, 고유명사, 추상명사
• 예: "I like dogs." (나는 개들을 좋아해)
• 예: "I live in Seoul." (서울에 살아)
• 예: "Love is beautiful." (사랑은 아름다워)

**빠른 체크리스트:**
1. 처음 말하는 것? → a/an
2. 특정한 것? → the
3. 일반적인 복수/고유명사? → 관사 없음

연습해보세요! 💪`;
    }

    if (lowerInput.includes('see') || lowerInput.includes('look') || lowerInput.includes('watch')) {
      return `"see", "look", "watch"의 차이를 설명해드릴게요! 👀

**See (보다):**
• 자연스럽게 눈에 들어오는 것 (의도 없이)
• 예: "I can see the mountains from here." (여기서 산이 보여)
• 예: "Did you see that car?" (그 차 봤어?)

**Look (보다):**
• 의도적으로 시선을 향하는 것 (짧은 시간)
• 예: "Look at this picture!" (이 사진 봐!)
• 예: "She looked at me." (그녀가 나를 봤어)

**Watch (보다):**
• 집중해서 지켜보는 것 (움직이는 것, 긴 시간)
• 예: "I watch TV every night." (매일 밤 TV를 봐)
• 예: "Watch the bird!" (새를 봐 - 움직임 관찰)

**비유로 이해하기:**
- See = "눈에 들어오다" (자동)
- Look = "고개를 돌려보다" (의도적, 짧음)
- Watch = "지켜보다" (집중, 길음)

**연습 예문:**
"I saw a movie" (영화를 봤어 - 일반적)
"I watched a movie" (영화를 봤어 - 집중해서)
"I looked at the poster" (포스터를 봤어 - 의도적으로) 🎬`;
    }

    // 문장 해석 요청
    if (trimmedInput.match(/^["'"].*["'"]$/) || (trimmedInput.match(/^[A-Z].*[.!?]$/) && trimmedInput.split(' ').length > 3)) {
      const sentence = trimmedInput.replace(/^["'"]|["'"]$/g, '').replace(/^해석|번역|translate|interpret/i, '').trim();
      if (sentence.length > 5 && /[a-zA-Z]/.test(sentence)) {
        // 간단한 문장 분석
        const words = sentence.toLowerCase().split(/\s+/);
        let analysis = `문장 해석을 도와드릴게요! 📝\n\n**문장:** "${sentence}"\n\n`;
        
        // 기본 구조 분석
        if (words.includes('i') || words.includes('you') || words.includes('he') || words.includes('she') || words.includes('we') || words.includes('they')) {
          analysis += `**구조 분석:**\n`;
          analysis += `• 주어가 있는 문장입니다\n`;
          if (words.some(w => ['am', 'is', 'are', 'was', 'were'].includes(w))) {
            analysis += `• Be동사가 사용되었습니다\n`;
          }
          if (words.some(w => ['will', 'would', 'can', 'could', 'should', 'must', 'may', 'might'].includes(w))) {
            analysis += `• 조동사가 사용되었습니다\n`;
          }
          analysis += `\n`;
        }
        
        // 일반적인 해석
        analysis += `**해석 팁:**\n`;
        analysis += `1. 주어(S)와 동사(V)를 먼저 찾아보세요\n`;
        analysis += `2. 전치사구는 "~에서/로/의" 등으로 해석\n`;
        analysis += `3. 형용사는 명사 앞에서 "~한"으로 해석\n`;
        analysis += `4. 부사는 동사/형용사를 꾸며줍니다\n\n`;
        analysis += `구체적인 문장 구조를 알려주시면 더 자세히 분석해드릴게요! 💡`;
        
        return analysis;
      }
    }

    // 해석/번역 키워드
    if (lowerInput.includes('해석') || lowerInput.includes('번역') || lowerInput.includes('translate') || lowerInput.includes('interpret')) {
      return `문장 해석을 도와드릴게요! 📝

**해석 방법:**
1. 문장 전체를 큰따옴표("")로 감싸서 보내주세요
2. 또는 영어 문장을 그대로 입력해주세요

**예시:**
• "I have been studying English for three years."
• "What does this sentence mean?"
• 해석: "I love learning new languages."

**제가 도와드릴 수 있는 것:**
✅ 문장 구조 분석
✅ 단어별 의미 설명
✅ 문법 요소 설명
✅ 자연스러운 한국어 번역

문장을 알려주시면 바로 해석해드릴게요! 💪`;
    }

    // 영어 학습법 질문
    if (lowerInput.includes('학습') || lowerInput.includes('공부') || lowerInput.includes('학습법') || lowerInput.includes('study method') || lowerInput.includes('how to learn')) {
      if (lowerInput.includes('말하기') || lowerInput.includes('speaking')) {
        return `영어 말하기 실력 향상 방법을 알려드릴게요! 🗣️

**1. 매일 조금씩 말하기 연습**
• 하루 10분이라도 영어로 말해보세요
• 거울 앞에서 연습하거나, 회화 시뮬레이터를 활용하세요

**2. 쉐도잉 (Shadowing)**
• 영어 영상/오디오를 듣고 따라 말하기
• 발음, 억양, 속도까지 똑같이 따라해보세요

**3. 일기 쓰기 → 말하기**
• 영어 일기를 쓰고, 그것을 소리 내어 읽어보세요
• 자신의 생각을 영어로 표현하는 연습이 됩니다

**4. 상황별 표현 암기**
• 식당, 쇼핑, 여행 등 상황별 필수 표현을 외우세요
• 실제 상황에서 바로 쓸 수 있게 준비하세요

**5. 실수 두려워하지 않기**
• 완벽하지 않아도 괜찮아요! 말하는 것이 중요합니다
• 실수에서 배우는 것이 많아요

**추천 연습:**
- 이 플랫폼의 "회화 시뮬레이터" 활용
- 매일 새로운 주제로 3분간 말하기 연습
- 자신의 목소리를 녹음하고 들어보기

꾸준함이 가장 중요해요! 💪`;
      }
      if (lowerInput.includes('듣기') || lowerInput.includes('listening')) {
        return `영어 듣기 실력 향상 방법을 알려드릴게요! 👂

**1. 매일 영어 오디오 듣기**
• 팟캐스트, 뉴스, 오디오북 등 매일 20-30분
• 처음엔 자막 없이, 나중엔 자막과 함께

**2. 단계별 듣기 연습**
• 1단계: 전체적인 내용 파악
• 2단계: 자세히 듣고 세부사항 파악
• 3단계: 따라 말하기 (쉐도잉)

**3. 다양한 속도로 듣기**
• 느린 속도 → 정상 속도 → 빠른 속도
• YouTube에서 재생 속도 조절 기능 활용

**4. 액티브 리스닝**
• 단순히 듣는 것이 아니라, 질문을 만들며 듣기
• "누가? 무엇을? 언제? 어디서? 왜?" 파악하기

**5. 영어 자막 활용**
• 처음엔 영어 자막, 나중엔 자막 없이
• 모르는 표현은 메모하고 나중에 확인

**추천 자료:**
- BBC Learning English
- VOA Learning English
- TED Talks
- Netflix 영어 콘텐츠

매일 조금씩, 꾸준히 듣는 것이 핵심이에요! 🎧`;
      }
      if (lowerInput.includes('읽기') || lowerInput.includes('reading')) {
        return `영어 읽기 실력 향상 방법을 알려드릴게요! 📚

**1. 자신의 레벨에 맞는 책 선택**
• 너무 쉬운 것도, 너무 어려운 것도 피하세요
• 이해도 70-80% 정도 되는 것이 적당해요

**2. 다양한 장르 읽기**
• 소설, 뉴스, 잡지, 블로그 등 다양한 텍스트
• 관심 있는 주제부터 시작하세요

**3. 모르는 단어 처리법**
• 처음엔 맥락으로 추측
• 중요한 단어만 사전 찾기
• 너무 자주 멈추지 마세요

**4. 빠른 읽기 연습**
• 처음엔 천천히, 점점 빠르게
• 전체적인 흐름 파악에 집중

**5. 요약하기**
• 읽은 내용을 영어로 요약해보기
• 이해도 확인과 쓰기 연습이 동시에!

**추천 방법:**
- 하루 20-30분 독서 습관 만들기
- 이 플랫폼의 "읽기 연습" 기능 활용
- 영어 뉴스 사이트 매일 읽기

읽는 양이 많아질수록 실력이 늘어요! 📖`;
      }
      return `영어 학습법을 종합적으로 알려드릴게요! 🎯

**효과적인 영어 학습의 핵심:**

**1. 균형잡힌 학습**
• 말하기, 듣기, 읽기, 쓰기를 골고루
• 한 가지에만 집중하지 마세요

**2. 매일 조금씩, 꾸준히**
• 하루 2시간보다 매일 30분이 더 효과적
• 습관화가 가장 중요해요

**3. 실전 연습**
• 배운 것을 바로 사용해보기
• 이 플랫폼의 다양한 기능 활용

**4. 오류에서 배우기**
• 실수는 학습의 기회
• 피드백을 받고 개선하기

**5. 목표 설정**
• 구체적이고 달성 가능한 목표
• 예: "3개월 후 영어 뉴스 이해하기"

**추천 학습 순서:**
1. 레벨 테스트로 현재 실력 파악
2. 약점 보완 (말하기/쓰기/읽기)
3. 어휘 확장 (단어장 활용)
4. 실전 연습 (회화 시뮬레이터)

어떤 부분을 더 구체적으로 알고 싶으신가요? 💡`;
    }

    // 단어 암기법
    if (lowerInput.includes('단어') || lowerInput.includes('어휘') || lowerInput.includes('vocabulary') || lowerInput.includes('memorize') || lowerInput.includes('암기')) {
      return `효과적인 단어 암기 방법을 알려드릴게요! 📝

**1. 간격 반복 학습 (Spaced Repetition)**
• 같은 단어를 여러 번, 간격을 두고 복습
• 이 플랫폼의 "단어장" 기능이 이 원리를 활용해요
• 망각 곡선을 고려한 복습이 핵심!

**2. 문맥 속에서 학습**
• 단어만 외우지 말고, 예문과 함께
• 실제 사용되는 상황을 이해하세요
• 예: "appreciate" → "I appreciate your help." (도움에 감사해)

**3. 연상법 활용**
• 단어의 소리나 모양으로 연상하기
• 예: "ambulance" (앰뷸런스) → "암뷸런스가 와요"

**4. 단어 카드 만들기**
• 앞면: 단어, 뒷면: 뜻 + 예문
• 이 플랫폼의 단어장에 저장하고 복습하세요

**5. 실제 사용하기**
• 배운 단어를 바로 문장에 사용
• 일기나 대화에서 써보기

**6. 단어 그룹화**
• 주제별로 묶어서 외우기
• 예: 감정 관련, 음식 관련 등

**추천 방법:**
- 하루 10-20개 단어 목표
- 이 플랫폼의 단어장 기능 활용
- 매일 복습 습관 만들기

꾸준함이 가장 중요해요! 하루에 많이 외우려 하지 말고, 매일 조금씩 외우고 복습하세요! 💪`;
    }

    // 문장 교정 요청
    if (lowerInput.includes('맞나') || lowerInput.includes('맞아') || lowerInput.includes('correct') || lowerInput.includes('right') || lowerInput.includes('grammatically')) {
      // 문장에서 문법 오류 찾기
      if (lowerInput.includes('i am go') || lowerInput.includes('i is') || lowerInput.includes('i are')) {
        return `문장을 교정해드릴게요! ✏️

**잘못된 문장:** "I am go to school."

**문제점:**
• "am" (be동사)와 "go" (일반동사)를 함께 사용할 수 없어요
• "go"는 동사원형이므로 주어와 직접 연결되어야 해요

**올바른 문장:**
• "I go to school." (나는 학교에 가)
• "I am going to school." (나는 학교에 가고 있어 - 현재진행형)
• "I will go to school." (나는 학교에 갈 거야 - 미래형)

**설명:**
- Be동사 (am/is/are)는 형용사나 명사와 함께 사용
- 일반동사 (go/come/eat 등)는 주어 바로 뒤에 사용
- 둘을 함께 쓰려면 진행형(-ing)이나 수동태로 만들어야 해요

**연습:**
• "I am study" → "I study" 또는 "I am studying"
• "She is go" → "She goes" 또는 "She is going"

더 많은 문장을 알려주시면 교정해드릴게요! 💡`;
      }
      return `문장 교정을 도와드릴게요! ✏️

구체적인 문장을 알려주시면 문법 오류를 찾아서 교정해드릴 수 있어요!

**교정 가능한 내용:**
• 문법 오류 (시제, 주어-동사 일치 등)
• 전치사 사용
• 관사 사용
• 어순 문제

**예시:**
"이 문장 맞나요? I am go to school."
→ "I go to school." 또는 "I am going to school."

문장을 알려주시면 바로 교정해드릴게요! 💪`;
    }

    // 추가 문법 질문들
    if (lowerInput.includes('수동태') || lowerInput.includes('passive')) {
      return `수동태 (Passive Voice)를 설명해드릴게요! 📚

**수동태란?**
• 주어가 행동을 "받는" 형태
• "~되다", "~당하다"의 의미

**구조:**
주어 + be동사 + 과거분사 (p.p.) + (by + 행동주)

**예시:**
• 능동태: "I wrote a letter." (나는 편지를 썼어)
• 수동태: "A letter was written by me." (편지가 나에 의해 쓰여졌어)

**Be동사 변화:**
• 현재: am/is/are + p.p.
• 과거: was/were + p.p.
• 미래: will be + p.p.
• 현재완료: have/has been + p.p.

**언제 사용하나요?**
1. 행동주가 중요하지 않을 때
   예: "The window was broken." (누가 깼는지 중요하지 않음)
2. 행동을 받는 대상이 중요할 때
   예: "English is spoken worldwide." (영어가 전 세계에서 사용됨)
3. 공식적인 글쓰기
   예: "The experiment was conducted." (실험이 수행되었다)

**연습:**
• "They built a house." → "A house was built by them."
• "She is reading a book." → "A book is being read by her."

수동태는 영어에서 매우 중요해요! 💡`;
    }

    if (lowerInput.includes('가정법') || lowerInput.includes('subjunctive') || lowerInput.includes('if')) {
      return `가정법 (Subjunctive/Conditional)을 설명해드릴게요! 🎭

**가정법이란?**
• 실제가 아닌 가정이나 조건을 나타내는 문법

**1형 (현재/미래 가능성):**
If + 주어 + 현재동사, 주어 + will/can + 동사원형
• 예: "If it rains, I will stay home." (만약 비가 오면, 집에 있을 거야)

**2형 (현재 불가능/비현실적):**
If + 주어 + 과거동사, 주어 + would/could + 동사원형
• 예: "If I were rich, I would travel the world." (만약 내가 부자라면, 세계를 여행할 텐데)

**3형 (과거 비현실적):**
If + 주어 + had + p.p., 주어 + would have + p.p.
• 예: "If I had studied harder, I would have passed." (더 열심히 공부했다면, 합격했을 텐데)

**특징:**
• 2형에서 "If I were" (was가 아님!)
• "I wish" 뒤에도 가정법 사용
  예: "I wish I were taller." (키가 더 컸으면 좋겠어)

**기억하기:**
- 1형: 가능한 일 (현재/미래)
- 2형: 불가능한 일 (현재)
- 3형: 되돌릴 수 없는 일 (과거)

연습해보세요! ✨`;
    }

    if (lowerInput.includes('관계대명사') || lowerInput.includes('relative pronoun') || lowerInput.includes('who') || lowerInput.includes('which') || lowerInput.includes('that')) {
      return `관계대명사 (Relative Pronoun)를 설명해드릴게요! 🔗

**관계대명사란?**
• 두 문장을 연결하는 대명사
• 앞 명사를 꾸며주는 역할

**종류:**
• **Who**: 사람 (주어)
  예: "The man who called you is my friend." (너에게 전화한 남자는 내 친구야)

• **Whom**: 사람 (목적어) - 구어에서는 who도 사용
  예: "The person whom I met was kind." (내가 만난 사람은 친절했어)

• **Which**: 사물/동물
  예: "The book which I read was interesting." (내가 읽은 책은 재미있었어)

• **That**: 사람/사물 모두 (비격식)
  예: "The car that I bought is red." (내가 산 차는 빨간색이야)

• **Whose**: 소유격 (사람/사물)
  예: "The student whose bag is red is my friend." (가방이 빨간 학생은 내 친구야)

**생략 가능한 경우:**
• 목적격 관계대명사는 생략 가능
• 예: "The book (which) I read" → "The book I read"

**구분하기:**
- 사람 주어 → who
- 사람 목적어 → whom/who (생략 가능)
- 사물 → which/that (생략 가능)
- 소유 → whose

**연습:**
• "I know the girl. She lives next door."
  → "I know the girl who lives next door."

관계대명사는 영어에서 매우 자주 사용돼요! 💪`;
    }

    if (lowerInput.includes('전치사') || lowerInput.includes('preposition') || lowerInput.includes('in on at')) {
      return `전치사 (Preposition)를 설명해드릴게요! 📍

**전치사란?**
• 명사/대명사 앞에 오는 단어
• 시간, 장소, 방향 등을 나타냄

**시간 전치사:**

**At:**
• 정확한 시각
• 예: at 3 o'clock, at noon, at night

**On:**
• 특정 날짜/요일
• 예: on Monday, on January 1st, on my birthday

**In:**
• 긴 기간/월/년도/계절
• 예: in 2024, in January, in summer, in the morning

**장소 전치사:**

**At:**
• 특정 지점
• 예: at the station, at home, at school

**On:**
• 표면/위치
• 예: on the table, on the wall, on the street

**In:**
• 넓은 공간/안
• 예: in the room, in Korea, in the box

**기타 자주 쓰는 전치사:**
• **For**: 기간 (for 3 years)
• **During**: ~하는 동안 (during the class)
• **By**: ~까지/~에 의해 (by tomorrow, by car)
• **With**: ~와 함께 (with my friend)
• **About**: ~에 대해 (about English)

**연습:**
• "I'll meet you ___ 3 PM ___ Monday ___ the library."
  → at, on, at

전치사는 많이 사용해보면 자연스럽게 익혀져요! 🎯`;
    }

    // 기본 응답
    return `좋은 질문이에요! 영어 학습에 도움이 되는 답변을 드리기 위해 더 구체적으로 질문해주시면 좋겠어요. 💡

**질문 예시:**
• "must와 have to의 차이는?"
• "현재완료와 과거시제 차이는?"
• "영어 말하기 실력 향상 방법은?"
• "이 문장 맞나요? I am go to school."
• "see, look, watch 차이점은?"
• "수동태는 어떻게 쓰나요?"
• "가정법 설명해주세요"
• "관계대명사 who, which 차이는?"

**제가 도와드릴 수 있는 것:**
✅ 문법 설명 (시제, 관사, 전치사, 수동태, 가정법 등)
✅ 단어 차이점 설명
✅ 영어 학습법 조언 (말하기/듣기/읽기/쓰기)
✅ 문장 교정
✅ 문장 해석 및 번역
✅ 단어 암기법

구체적인 질문을 해주시면 더 정확하고 상세한 답변을 드릴 수 있어요! 🚀`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setLoading(true);

    try {
      // Groq API를 사용하여 응답 생성
      const conversationHistory: GroqMessage[] = messages
        .slice(1) // 첫 번째 시스템 메시지 제외
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content
        }));

      const currentLang = getCurrentLanguage();
      
      const response = await generateAICoachResponse(
        userInput,
        conversationHistory,
        userLevel,
        currentLang
      );

      const assistantMessage: Message = {
        role: 'assistant',
        content: response,
      };

      setMessages((prev) => [...prev, assistantMessage]);

      addAICoachHistory({
        question: userInput,
        answer: response,
      });
    } catch (error) {
      console.error('AI Coach Error:', error);
      let errorMessage = '응답을 생성하는 중 오류가 발생했습니다.';
      
      if (error instanceof Error) {
        if (error.message.includes('API 키')) {
          errorMessage = 'Groq API 키가 설정되지 않았습니다. Vercel 환경 변수에 VITE_GROQ_API_KEY를 추가해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      // 에러 발생 시 기본 응답 생성 함수 사용
      const fallbackResponse = generateResponse(userInput);
      const assistantMessage: Message = {
        role: 'assistant',
        content: errorMessage.includes('API 키') 
          ? `⚠️ ${errorMessage}\n\n대신 기본 응답을 제공합니다:\n\n${fallbackResponse}`
          : `⚠️ ${errorMessage}\n\n대신 기본 응답을 제공합니다:\n\n${fallbackResponse}`,
      };
      setMessages((prev) => [...prev, assistantMessage]);
      
      addAICoachHistory({
        question: userInput,
        answer: fallbackResponse,
      });
    } finally {
      setLoading(false);
    }
  };

  // 언어별 빠른 질문
  const quickQuestions = [
    t.quickQuestion1,
    t.quickQuestion2,
    t.quickQuestion3,
    t.quickQuestion4,
  ];

  const handleQuickQuestion = (question: string) => {
    setInput(question);
  };

  return (
    <div className="ai-coach-page">
      <div className="ai-coach-container">
        <div className="coach-header">
          <div className="coach-title-section">
            <div className="robot-icon">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="12" y="16" width="24" height="20" rx="2" fill="#6366f1" stroke="#4f46e5" strokeWidth="2"/>
                <circle cx="18" cy="24" r="2" fill="white"/>
                <circle cx="30" cy="24" r="2" fill="white"/>
                <rect x="18" y="30" width="12" height="2" rx="1" fill="white"/>
                <rect x="10" y="20" width="4" height="4" rx="1" fill="#6366f1"/>
                <rect x="34" y="20" width="4" height="4" rx="1" fill="#6366f1"/>
                <rect x="20" y="10" width="8" height="6" rx="1" fill="#6366f1"/>
              </svg>
            </div>
            <div>
              <h1>{t.aiCoachPageTitle}</h1>
              <p>{t.aiCoachPageDesc}</p>
            </div>
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




