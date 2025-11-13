import { CEFRLevel } from './storage';

export interface RecommendedWord {
  word: string;
  meaning: string;
  example: string;
}

export const recommendedWordsByLevel: Record<CEFRLevel, RecommendedWord[]> = {
  'A1': [
    { word: 'hello', meaning: '안녕하세요', example: 'Hello, how are you?' },
    { word: 'book', meaning: '책', example: 'I read a book every day.' },
    { word: 'water', meaning: '물', example: 'I drink water.' },
    { word: 'friend', meaning: '친구', example: 'She is my friend.' },
    { word: 'house', meaning: '집', example: 'This is my house.' },
    { word: 'family', meaning: '가족', example: 'I love my family.' },
    { word: 'school', meaning: '학교', example: 'I go to school.' },
    { word: 'happy', meaning: '행복한', example: 'I am happy today.' },
    { word: 'food', meaning: '음식', example: 'I like Korean food.' },
    { word: 'time', meaning: '시간', example: 'What time is it?' },
  ],
  'A2': [
    { word: 'important', meaning: '중요한', example: 'This is very important.' },
    { word: 'different', meaning: '다른', example: 'We are different.' },
    { word: 'possible', meaning: '가능한', example: 'Everything is possible.' },
    { word: 'problem', meaning: '문제', example: 'We have a problem.' },
    { word: 'answer', meaning: '답, 대답하다', example: 'I know the answer.' },
    { word: 'question', meaning: '질문', example: 'Can I ask a question?' },
    { word: 'beautiful', meaning: '아름다운', example: 'She is beautiful.' },
    { word: 'difficult', meaning: '어려운', example: 'This is difficult.' },
    { word: 'easy', meaning: '쉬운', example: 'English is easy.' },
    { word: 'remember', meaning: '기억하다', example: 'I remember you.' },
  ],
  'B1': [
    { word: 'although', meaning: '비록 ~이지만', example: 'Although it rained, we went out.' },
    { word: 'achieve', meaning: '달성하다', example: 'I want to achieve my goals.' },
    { word: 'benefit', meaning: '이익, 혜택', example: 'Exercise has many benefits.' },
    { word: 'challenge', meaning: '도전', example: 'This is a big challenge.' },
    { word: 'consider', meaning: '고려하다', example: 'I will consider your idea.' },
    { word: 'develop', meaning: '개발하다, 발전하다', example: 'We need to develop new skills.' },
    { word: 'experience', meaning: '경험', example: 'I have experience in teaching.' },
    { word: 'improve', meaning: '개선하다', example: 'I want to improve my English.' },
    { word: 'opportunity', meaning: '기회', example: 'This is a great opportunity.' },
    { word: 'suggest', meaning: '제안하다', example: 'I suggest we meet tomorrow.' },
  ],
  'B2': [
    { word: 'accomplish', meaning: '성취하다', example: 'We can accomplish our goals.' },
    { word: 'analyze', meaning: '분석하다', example: 'Let me analyze the data.' },
    { word: 'appreciate', meaning: '감사하다, 감상하다', example: 'I appreciate your help.' },
    { word: 'approach', meaning: '접근하다, 방법', example: 'We need a new approach.' },
    { word: 'assume', meaning: '가정하다', example: 'I assume you know this.' },
    { word: 'contribute', meaning: '기여하다', example: 'Everyone can contribute.' },
    { word: 'demonstrate', meaning: '증명하다, 시연하다', example: 'Let me demonstrate this.' },
    { word: 'establish', meaning: '설립하다', example: 'We need to establish rules.' },
    { word: 'evaluate', meaning: '평가하다', example: 'We should evaluate the results.' },
    { word: 'indicate', meaning: '나타내다', example: 'The data indicates success.' },
  ],
  'C1': [
    { word: 'accomplish', meaning: '성취하다', example: 'We accomplished our mission.' },
    { word: 'comprehensive', meaning: '포괄적인', example: 'This is a comprehensive study.' },
    { word: 'contemporary', meaning: '현대의', example: 'Contemporary art is interesting.' },
    { word: 'distinguish', meaning: '구별하다', example: 'Can you distinguish them?' },
    { word: 'elaborate', meaning: '상세한, 설명하다', example: 'Please elaborate on this.' },
    { word: 'facilitate', meaning: '촉진하다', example: 'This will facilitate learning.' },
    { word: 'fundamental', meaning: '근본적인', example: 'This is fundamental knowledge.' },
    { word: 'hypothesis', meaning: '가설', example: 'Let me test this hypothesis.' },
    { word: 'implement', meaning: '구현하다', example: 'We need to implement this plan.' },
    { word: 'phenomenon', meaning: '현상', example: 'This is an interesting phenomenon.' },
  ],
  'C2': [
    { word: 'ambiguous', meaning: '모호한', example: 'The statement was ambiguous.' },
    { word: 'comprehensive', meaning: '포괄적인', example: 'A comprehensive analysis.' },
    { word: 'controversial', meaning: '논란의 여지가 있는', example: 'This is controversial.' },
    { word: 'elaborate', meaning: '정교한', example: 'An elaborate design.' },
    { word: 'inevitable', meaning: '불가피한', example: 'Change is inevitable.' },
    { word: 'paradox', meaning: '역설', example: 'This is a paradox.' },
    { word: 'phenomenon', meaning: '현상', example: 'A rare phenomenon.' },
    { word: 'sophisticated', meaning: '정교한, 세련된', example: 'A sophisticated system.' },
    { word: 'ubiquitous', meaning: '어디에나 있는', example: 'Technology is ubiquitous.' },
    { word: 'versatile', meaning: '다재다능한', example: 'A versatile tool.' },
  ],
  'Not Set': [],
};

export function getRandomWordsByLevel(level: CEFRLevel, count: number = 10): RecommendedWord[] {
  const words = recommendedWordsByLevel[level];
  if (!words || words.length === 0) return [];
  
  const shuffled = [...words].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, words.length));
}








