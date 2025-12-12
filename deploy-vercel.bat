@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo    Vercel 배포
echo ========================================
echo.

echo [1/4] 현재 디렉토리 확인
echo %CD%
echo.

echo [2/4] Vercel CLI 확인
vercel --version
if errorlevel 1 (
    echo [오류] Vercel CLI가 설치되어 있지 않습니다.
    echo 설치 명령어: npm install -g vercel
    pause
    exit /b 1
)
echo.

echo [3/4] 프로젝트 빌드
if not exist "dist" (
    echo dist 폴더가 없습니다. 빌드를 시작합니다...
)
call npm run build
if errorlevel 1 (
    echo [오류] 빌드 실패!
    pause
    exit /b 1
)
echo ✓ 빌드 완료
echo.

echo [4/4] Vercel에 배포
echo 로그인이 필요할 수 있습니다.
echo.
vercel --prod --yes

if errorlevel 1 (
    echo.
    echo [오류] 배포 실패
    echo.
    echo 해결 방법:
    echo 1. vercel login 으로 로그인 확인
    echo 2. Vercel 대시보드에서 직접 배포
    echo    https://vercel.com/dashboard
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo    배포 완료!
echo ========================================
echo.
echo 배포 URL은 위에 표시됩니다.
echo Vercel 대시보드에서도 확인할 수 있습니다:
echo https://vercel.com/dashboard
echo.
pause

