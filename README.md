# AI 영어 학습 플랫폼

AI와 함께하는 종합 영어 학습 플랫폼으로, 말하기, 쓰기, 읽기, 교정, 회화 연습, 어휘 학습 등 다양한 기능을 제공합니다.

## 주요 기능

### 🎤 말하기 연습
- 매일 새로운 질문 제공
- 3분 제한 시간 내 답변 녹음
- AI 튜터가 발음 및 문법 교정
- 실시간 녹음 및 재생 기능

### ✍️ 쓰기 연습
- 짧은 주제에 대한 에세이 작성
- 10분 제한 시간 설정
- 실시간 단어 수 카운트
- AI 피드백 (문법, 어휘, 구조, 종합 평가)

### 📖 읽기 연습
- 토익, 토플, 수능 독해 지문 제공
- 문제당 2분 제한 시간
- 즉시 채점 및 상세 해설 제공
- 각 문제별 해결 방법 제시

### 📝 문장 교정
- 실시간 문법 교정
- 상세한 설명 제공
- 개인 피드백 리포트
- 오답노트 기능

### 💬 상황별 회화 시뮬레이터
- 8가지 실생활 상황 (카페, 레스토랑, 쇼핑몰, 병원, 공항, 호텔, 면접, 회의)
- AI와 실제 대화 연습
- 실시간 평가 및 피드백
- 대안 표현 제시

### 📚 어휘 학습
- 간격 반복 학습 시스템 (1일 → 3일 → 7일)
- 레벨별 권장 단어 테스트
- 내 단어장 테스트
- 단어 추가/삭제/복습 기능

### 🤖 AI 코치
- 무제한 질문 & 답변
- 레벨별 맞춤 설명
- 실시간 대화형 학습
- 학습 기록 저장

### 📊 레벨 테스트
- CEFR 기준 레벨 진단 (A1~C2)
- 객관식, 서술형, 독해, 번역 문제
- 강점 & 약점 분석
- 맞춤형 학습 추천

### 🌍 다국어 지원
- 한국어
- English
- 日本語
- 中文

### 🌙 다크모드 지원
- 라이트/다크 모드 전환
- 자동 설정 저장

## 기술 스택

- **React 18** - 사용자 인터페이스
- **TypeScript** - 타입 안정성
- **Vite** - 빠른 개발 환경
- **React Router** - 라우팅
- **Lucide React** - 아이콘
- **LocalStorage** - 클라이언트 사이드 데이터 저장
- **Groq API** - AI 기반 응답 생성 (AI Coach, 회화 시뮬레이터, 피드백, 문법 교정)

## 시작하기

### Groq API 키 설정

1. [Groq Console](https://console.groq.com/)에서 API 키를 발급받으세요.
2. 프로젝트 루트에 `.env` 파일을 생성하고 다음을 추가하세요:

```env
VITE_GROQ_API_KEY=your-groq-api-key-here
```

3. Vercel에 배포하는 경우, Vercel 대시보드의 Environment Variables에 `VITE_GROQ_API_KEY`를 추가하세요.

### 설치

```bash
npm install
```

### 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173)로 접속하세요.

### 빌드

```bash
npm run build
```

### 미리보기

```bash
npm run preview
```

## 프로젝트 구조

```
src/
├── pages/              # 페이지 컴포넌트
│   ├── Home.tsx
│   ├── Speaking.tsx
│   ├── Writing.tsx
│   ├── Reading.tsx
│   ├── Correction.tsx
│   ├── Simulator.tsx
│   ├── Vocabulary.tsx
│   ├── AICoach.tsx
│   ├── LevelTest.tsx
│   ├── Calendar.tsx
│   └── MyPage.tsx
├── contexts/           # React Context
│   ├── LanguageContext.tsx
│   └── ThemeContext.tsx
├── lib/                # 유틸리티
│   ├── storage.ts
│   ├── translations.ts
│   └── recommendedWords.ts
├── App.tsx            # 메인 앱 컴포넌트
└── main.tsx           # 엔트리 포인트
```

## 주요 특징

### 📱 반응형 디자인
모바일, 태블릿, 데스크톱에서 최적화된 UI

### ⏱️ 시간 제한 시스템
실제 시험 환경을 모방한 시간 제한 기능

### 🤖 AI 피드백 (Groq API)
- Groq API를 사용한 실시간 AI 기반 피드백 제공
- AI Coach: 문법, 어휘, 학습법 질문에 대한 상세한 답변
- 회화 시뮬레이터: 상황별 자연스러운 대화 생성 및 평가
- 말하기/쓰기 피드백: 발음, 문법, 어휘, 구조에 대한 전문적인 평가
- 문법 교정: 실시간 문법 오류 검출 및 수정 제안

### 🎨 현대적인 UI/UX
직관적이고 사용하기 쉬운 인터페이스

### 💾 LocalStorage 기반 저장
모든 학습 데이터를 브라우저에 안전하게 저장

## 라이선스

MIT
