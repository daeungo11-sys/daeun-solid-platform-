# Groq API 설정 가이드

## 1. Groq API 키 발급

1. [Groq Console](https://console.groq.com/)에 접속
2. 회원가입 또는 로그인
3. API Keys 메뉴로 이동
4. "Create API Key" 클릭하여 새 API 키 생성
5. 생성된 API 키를 복사 (다시 볼 수 없으니 안전한 곳에 보관)

## 2. Vercel 환경 변수 설정

### 방법 1: Vercel 대시보드에서 설정

1. [Vercel Dashboard](https://vercel.com/dashboard)에 로그인
2. 프로젝트 선택
3. Settings → Environment Variables 메뉴로 이동
4. "Add New" 클릭
5. 다음 정보 입력:
   - **Key**: `VITE_GROQ_API_KEY`
   - **Value**: 발급받은 Groq API 키
   - **Environment**: Production, Preview, Development 모두 선택
6. "Save" 클릭
7. **중요**: 변경사항 적용을 위해 프로젝트를 재배포해야 합니다
   - Deployments 탭 → 최신 배포의 "..." 메뉴 → "Redeploy" 클릭

### 방법 2: Vercel CLI로 설정

```bash
vercel env add VITE_GROQ_API_KEY
# 프롬프트에 따라 환경 선택 (Production, Preview, Development)
# API 키 입력
```

## 3. 로컬 개발 환경 설정

프로젝트 루트에 `.env` 파일 생성:

```env
VITE_GROQ_API_KEY=your-groq-api-key-here
```

⚠️ **주의**: `.env` 파일은 `.gitignore`에 포함되어 있어야 합니다 (이미 포함되어 있음)

## 4. 확인 방법

1. 브라우저 개발자 도구 (F12) 열기
2. Console 탭 확인
3. AI 기능 사용 시 에러가 없으면 정상 작동
4. "Groq API Key Error" 메시지가 보이면 환경 변수가 제대로 설정되지 않은 것

## 5. 문제 해결

### 문제: "Groq API 키가 설정되지 않았습니다" 오류

**해결 방법:**
1. Vercel 환경 변수에 `VITE_GROQ_API_KEY`가 올바르게 설정되었는지 확인
2. 환경 변수 이름이 정확히 `VITE_GROQ_API_KEY`인지 확인 (대소문자 구분)
3. 프로젝트를 재배포했는지 확인
4. 브라우저 캐시를 지우고 새로고침

### 문제: "Groq API 오류 (401)" 또는 "Unauthorized"

**해결 방법:**
1. API 키가 올바른지 확인
2. API 키에 공백이나 특수문자가 포함되지 않았는지 확인
3. Groq Console에서 API 키가 활성화되어 있는지 확인

### 문제: "Groq API 오류 (429)" 또는 "Rate limit exceeded"

**해결 방법:**
1. Groq API 사용량 한도 확인
2. 잠시 후 다시 시도
3. 필요시 Groq 플랜 업그레이드

## 6. API 사용량 확인

[Groq Console](https://console.groq.com/)의 Usage 메뉴에서 API 사용량을 확인할 수 있습니다.

## 7. 지원되는 모델

현재 사용 중인 모델: `llama-3.1-70b-versatile`

다른 모델로 변경하려면 `src/lib/groq.ts`의 `MODEL` 상수를 수정하세요:
- `llama-3.1-70b-versatile` (현재)
- `mixtral-8x7b-32768`
- `llama-3.1-8b-instant`


