# GitHub에 푸시하기

다음 명령어를 순서대로 실행하세요:

## 1. 프로젝트 폴더로 이동
```bash
cd "cursor newnew project\cursor newnew project"
```

## 2. Git 저장소 초기화 (아직 안 했다면)
```bash
git init
```

## 3. 원격 저장소 추가
```bash
git remote add origin https://github.com/daeungo11-sys/-.git
```

## 4. 모든 파일 추가
```bash
git add .
```

## 5. 커밋
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

## 6. 푸시
```bash
git push -u origin main
```

또는 브랜치가 master인 경우:
```bash
git branch -M main
git push -u origin main
```

## 참고사항
- 이미 원격 저장소가 설정되어 있다면 3번 단계는 건너뛰세요
- 첫 푸시 후에는 `git push`만으로 푸시 가능합니다



