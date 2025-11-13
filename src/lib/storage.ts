// LocalStorage 관리 유틸리티

export type CEFRLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2' | 'Not Set';

export interface UserProgress {
  totalPoints: number;
  streak: number;
  lastStudyDate: string;
  studyDates: string[];
}

export interface UserLevel {
  level: CEFRLevel;
  testDate: string;
  score: number;
  weaknesses: string[];
  strengths: string[];
}

export interface SentenceHistory {
  id: string;
  original: string;
  corrected: string;
  reason: string;
  errorType: string;
  timestamp: string;
}

export interface ConversationHistory {
  id: string;
  scenario: string;
  messages: Array<{
    role: 'user' | 'assistant';
    content: string;
    evaluation?: {
      evaluation: string;
      alternative: string;
    };
  }>;
  timestamp: string;
}

export interface AICoachHistory {
  id: string;
  question: string;
  answer: string;
  timestamp: string;
}

export interface VocabularyItem {
  id: string;
  word: string;
  meaning: string;
  example: string;
  source: string;
  addedDate: string;
  reviewDates: string[];
  mastered: boolean;
}

export interface TestResult {
  id: string;
  type: 'recommended' | 'my_words';
  level?: CEFRLevel;
  score: number;
  total: number;
  date: string;
  words: Array<{
    word: string;
    meaning: string;
    correct: boolean;
  }>;
}

export interface DiaryEntry {
  id: string;
  date: string;
  type: 'speaking' | 'writing' | 'reading';
  difficulty: string;
  notes: string;
}

// 사용자 고유 ID 생성 및 관리
export function getUserId(): string {
  if (typeof window === 'undefined') return 'default';
  
  let userId = localStorage.getItem('userId');
  if (!userId) {
    // 고유 ID 생성: 타임스탬프 + 랜덤 문자열
    userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('userId', userId);
  }
  return userId;
}

// 사용자별 키 생성
function getUserKey(key: string): string {
  const userId = getUserId();
  return `${userId}_${key}`;
}

// 사용자 진행 상황
export function getUserProgress(): UserProgress {
  if (typeof window === 'undefined') {
    return { totalPoints: 0, streak: 0, lastStudyDate: '', studyDates: [] };
  }
  const data = localStorage.getItem(getUserKey('userProgress'));
  return data ? JSON.parse(data) : { totalPoints: 0, streak: 0, lastStudyDate: '', studyDates: [] };
}

export function saveUserProgress(progress: UserProgress): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserKey('userProgress'), JSON.stringify(progress));
}

export function updateProgress(points: number = 10): UserProgress {
  const progress = getUserProgress();
  const today = new Date().toISOString().split('T')[0];
  
  progress.totalPoints += points;
  
  if (!progress.studyDates.includes(today)) {
    progress.studyDates.push(today);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    if (progress.lastStudyDate === yesterdayStr) {
      progress.streak += 1;
    } else if (progress.lastStudyDate !== today) {
      progress.streak = 1;
    }
    progress.lastStudyDate = today;
  }
  
  saveUserProgress(progress);
  return progress;
}

// 문장 히스토리
export function getSentenceHistory(): SentenceHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('sentenceHistory'));
  return data ? JSON.parse(data) : [];
}

export function addSentenceHistory(sentence: SentenceHistory): void {
  if (typeof window === 'undefined') return;
  const history = getSentenceHistory();
  history.unshift(sentence);
  if (history.length > 100) history.pop();
  localStorage.setItem(getUserKey('sentenceHistory'), JSON.stringify(history));
}

export function deleteSentenceHistory(id: string): void {
  if (typeof window === 'undefined') return;
  const history = getSentenceHistory();
  localStorage.setItem(getUserKey('sentenceHistory'), JSON.stringify(history.filter(h => h.id !== id)));
}

export function analyzeErrorTypes(): { [key: string]: number } {
  const history = getSentenceHistory();
  const errorCounts: { [key: string]: number } = {};
  history.forEach(item => {
    if (item.errorType && item.errorType !== '오류 없음') {
      errorCounts[item.errorType] = (errorCounts[item.errorType] || 0) + 1;
    }
  });
  return errorCounts;
}

export function generatePersonalFeedback(): string {
  const errorTypes = analyzeErrorTypes();
  const entries = Object.entries(errorTypes).sort((a, b) => b[1] - a[1]);
  if (entries.length === 0) {
    return '아직 충분한 데이터가 없습니다. 더 많은 문장을 입력해보세요!';
  }
  const topError = entries[0];
  const totalErrors = entries.reduce((sum, [, count]) => sum + count, 0);
  const percentage = Math.round((topError[1] / totalErrors) * 100);
  let feedback = `📊 총 ${totalErrors}개의 문법 오류를 수정했습니다.\n\n`;
  feedback += `가장 많이 나타난 오류: ${topError[0]} (${percentage}%)\n\n`;
  feedback += '오류 유형별 분석:\n';
  entries.forEach(([type, count], index) => {
    feedback += `${index + 1}. ${type}: ${count}회\n`;
  });
  return feedback;
}

// 회화 히스토리
export function getConversationHistory(): ConversationHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('conversationHistory'));
  return data ? JSON.parse(data) : [];
}

export function addConversationHistory(conversation: ConversationHistory): void {
  if (typeof window === 'undefined') return;
  const history = getConversationHistory();
  history.unshift(conversation);
  if (history.length > 50) history.pop();
  localStorage.setItem(getUserKey('conversationHistory'), JSON.stringify(history));
}

export function deleteConversationHistory(id: string): void {
  if (typeof window === 'undefined') return;
  const history = getConversationHistory();
  localStorage.setItem(getUserKey('conversationHistory'), JSON.stringify(history.filter(h => h.id !== id)));
}

// AI 코치 기록
export function getAICoachHistory(): AICoachHistory[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('aiCoachHistory'));
  return data ? JSON.parse(data) : [];
}

export function addAICoachHistory(record: Omit<AICoachHistory, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  const history = getAICoachHistory();
  const newRecord: AICoachHistory = {
    ...record,
    id: Date.now().toString(),
    timestamp: new Date().toISOString()
  };
  history.unshift(newRecord);
  if (history.length > 50) history.pop();
  localStorage.setItem(getUserKey('aiCoachHistory'), JSON.stringify(history));
}

// 사용자 레벨
export function getUserLevel(): UserLevel {
  if (typeof window === 'undefined') {
    return { level: 'Not Set', testDate: '', score: 0, weaknesses: [], strengths: [] };
  }
  const data = localStorage.getItem(getUserKey('userLevel'));
  return data ? JSON.parse(data) : { level: 'Not Set', testDate: '', score: 0, weaknesses: [], strengths: [] };
}

export function saveUserLevel(levelData: UserLevel): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserKey('userLevel'), JSON.stringify(levelData));
}

export function getLevelName(level: CEFRLevel): string {
  const levelNames: Record<CEFRLevel, string> = {
    'A1': '초급 (A1)', 'A2': '초급+ (A2)', 'B1': '중급 (B1)', 'B2': '중급+ (B2)',
    'C1': '고급 (C1)', 'C2': '고급+ (C2)', 'Not Set': '미설정'
  };
  return levelNames[level];
}

// 어휘
export function getVocabulary(): VocabularyItem[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('vocabulary'));
  return data ? JSON.parse(data) : [];
}

export function addVocabulary(item: Omit<VocabularyItem, 'id' | 'addedDate' | 'reviewDates' | 'mastered'>): void {
  if (typeof window === 'undefined') return;
  const vocabulary = getVocabulary();
  const newItem: VocabularyItem = {
    ...item,
    id: Date.now().toString(),
    addedDate: new Date().toISOString(),
    reviewDates: [],
    mastered: false
  };
  vocabulary.unshift(newItem);
  localStorage.setItem(getUserKey('vocabulary'), JSON.stringify(vocabulary));
}

export function markVocabularyReviewed(id: string): void {
  if (typeof window === 'undefined') return;
  const vocabulary = getVocabulary();
  const item = vocabulary.find(v => v.id === id);
  if (item) {
    item.reviewDates.push(new Date().toISOString());
    if (item.reviewDates.length >= 3) item.mastered = true;
    localStorage.setItem(getUserKey('vocabulary'), JSON.stringify(vocabulary));
  }
}

export function getVocabularyForReview(): VocabularyItem[] {
  const vocabulary = getVocabulary();
  const today = new Date();
  return vocabulary.filter(item => {
    if (item.mastered) return false;
    if (item.reviewDates.length === 0) return true;
    const lastReview = new Date(item.reviewDates[item.reviewDates.length - 1]);
    const daysSinceReview = Math.floor((today.getTime() - lastReview.getTime()) / (1000 * 60 * 60 * 24));
    const intervals = [1, 3, 7];
    const reviewCount = item.reviewDates.length;
    const nextInterval = intervals[Math.min(reviewCount, intervals.length - 1)];
    return daysSinceReview >= nextInterval;
  });
}

export function deleteVocabulary(id: string): void {
  if (typeof window === 'undefined') return;
  const vocabulary = getVocabulary();
  localStorage.setItem(getUserKey('vocabulary'), JSON.stringify(vocabulary.filter(v => v.id !== id)));
}

// 테스트 결과
export function getTestResults(): TestResult[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('testResults'));
  return data ? JSON.parse(data) : [];
}

export function saveTestResult(result: Omit<TestResult, 'id' | 'date'>): void {
  if (typeof window === 'undefined') return;
  const results = getTestResults();
  const newResult: TestResult = {
    ...result,
    id: Date.now().toString(),
    date: new Date().toISOString()
  };
  results.unshift(newResult);
  if (results.length > 50) results.pop();
  localStorage.setItem(getUserKey('testResults'), JSON.stringify(results));
}

export function deleteTestResult(id: string): void {
  if (typeof window === 'undefined') return;
  const results = getTestResults();
  localStorage.setItem(getUserKey('testResults'), JSON.stringify(results.filter(r => r.id !== id)));
}

// 학습 기록 (Calendar)
export function getDiaryEntries(): DiaryEntry[] {
  if (typeof window === 'undefined') return [];
  const data = localStorage.getItem(getUserKey('diaryEntries'));
  return data ? JSON.parse(data) : [];
}

export function saveDiaryEntries(entries: DiaryEntry[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(getUserKey('diaryEntries'), JSON.stringify(entries));
}

export function addDiaryEntry(entry: Omit<DiaryEntry, 'id'>): void {
  if (typeof window === 'undefined') return;
  const entries = getDiaryEntries();
  const newEntry: DiaryEntry = {
    ...entry,
    id: Date.now().toString()
  };
  entries.push(newEntry);
  saveDiaryEntries(entries);
}

export function updateDiaryEntry(id: string, entry: Partial<DiaryEntry>): void {
  if (typeof window === 'undefined') return;
  const entries = getDiaryEntries();
  const index = entries.findIndex(e => e.id === id);
  if (index !== -1) {
    entries[index] = { ...entries[index], ...entry };
    saveDiaryEntries(entries);
  }
}

export function deleteDiaryEntry(id: string): void {
  if (typeof window === 'undefined') return;
  const entries = getDiaryEntries();
  saveDiaryEntries(entries.filter(e => e.id !== id));
}

// 모든 사용자 데이터 초기화 (기존 공유 데이터 제거)
export function clearSharedData(): void {
  if (typeof window === 'undefined') return;
  
  // 기존 공유 키들 제거 (사용자별 키가 아닌 것들)
  const sharedKeys = [
    'diaryEntries',
    'userProgress',
    'sentenceHistory',
    'conversationHistory',
    'aiCoachHistory',
    'userLevel',
    'vocabulary',
    'testResults'
  ];
  
  sharedKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
    }
  });
}





