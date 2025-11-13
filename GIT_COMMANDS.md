# Git 커밋 및 푸시 가이드

## 1. Git 저장소 초기화 (아직 안 했다면)
```bash
cd "cursor newnew project\cursor newnew project"
git init
```

## 2. 원격 저장소 추가 (GitHub 등)
```bash
git remote add origin <YOUR_REPOSITORY_URL>
```

## 3. 모든 파일 추가
```bash
git add .
```

## 4. 커밋
```bash
git commit -m "feat: 통합 영어 학습 플랫폼 완성

- 교정 기능 추가
- 시뮬레이터 기능 추가 (8가지 상황별 대화 연습)
- 어휘 학습 기능 추가 (간격 반복 학습)
- AI 코치 기능 추가
- 다국어 지원 추가 (한국어/영어/일본어/중국어)
- 다크모드 지원 추가
- LocalStorage 기반 데이터 저장
- 레벨별 권장 단어 시스템"
```

## 5. 푸시
```bash
git push -u origin main
```

또는 브랜치가 master인 경우:
```bash
git push -u origin master
```

## 참고사항
- 원격 저장소가 없으면 먼저 GitHub/GitLab 등에서 저장소를 생성하세요
- 첫 푸시 시 `-u origin main` 옵션을 사용하면 이후 `git push`만으로 푸시 가능합니다



