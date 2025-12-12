@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo    GitHub에 푸시 및 자동 배포
echo ========================================
echo.

echo [1/6] 현재 디렉토리 확인
echo %CD%
echo.

echo [2/6] Git 저장소 확인/초기화
if not exist .git (
    echo Git 저장소 초기화 중...
    git init
    if errorlevel 1 (
        echo [오류] Git 초기화 실패
        pause
        exit /b 1
    )
    echo ✓ Git 저장소 초기화 완료
) else (
    echo ✓ Git 저장소 확인됨
)
echo.

echo [3/6] 원격 저장소 설정
git remote remove origin 2>nul
git remote add origin https://github.com/daeungo11-sys/daeunfinalproject.git
if errorlevel 1 (
    echo [경고] 원격 저장소 추가 실패 (이미 존재할 수 있음)
    git remote set-url origin https://github.com/daeungo11-sys/daeunfinalproject.git
)
echo ✓ 원격 저장소 설정 완료
git remote -v
echo.

echo [4/6] 변경사항 확인
git status --short
echo.

echo [5/6] 파일 추가 및 커밋
git add .
if errorlevel 1 (
    echo [오류] 파일 추가 실패
    pause
    exit /b 1
)
echo ✓ 파일 추가 완료
echo.

git commit -m "feat: 홈 페이지 하단에 RISE 지원 멘트 추가"
if errorlevel 1 (
    echo [경고] 커밋 실패 또는 변경사항 없음
)
echo.

echo [6/6] GitHub에 푸시
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo.
    echo [오류] 푸시 실패
    echo.
    echo 가능한 원인:
    echo - GitHub 인증이 필요할 수 있습니다
    echo - Personal Access Token이 필요할 수 있습니다
    echo.
    echo 해결 방법:
    echo 1. GitHub에서 Personal Access Token 생성
    echo    https://github.com/settings/tokens
    echo 2. 푸시 시 사용자명과 토큰 입력
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    푸시 완료!
echo ========================================
echo.
echo GitHub 저장소:
echo https://github.com/daeungo11-sys/daeunfinalproject
echo.
echo Vercel이 자동으로 배포를 시작합니다.
echo 배포 상태 확인:
echo https://vercel.com/dashboard
echo.
echo 배포된 사이트:
echo https://daeunfinalproject-ycgg.vercel.app
echo.
pause

