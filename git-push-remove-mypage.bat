@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo ========================================
echo    마이페이지 제거 후 재배포
echo ========================================
echo.

echo [1/4] 현재 디렉토리 확인
echo %CD%
echo.

echo [2/4] Git 저장소 확인
if not exist .git (
    echo Git 저장소 초기화 중...
    git init
    echo ✓ Git 저장소 초기화 완료
) else (
    echo ✓ Git 저장소 확인됨
)
echo.

echo [3/4] 원격 저장소 설정
git remote remove origin 2>nul
git remote add origin https://github.com/daeungo11-sys/daeun-solid-platform-.git
if errorlevel 1 (
    git remote set-url origin https://github.com/daeungo11-sys/daeun-solid-platform-.git
)
echo ✓ 원격 저장소 설정 완료
git remote -v
echo.

echo [4/4] 변경사항 추가, 커밋 및 푸시
git add .
if errorlevel 1 (
    echo [오류] 파일 추가 실패
    pause
    exit /b 1
)
echo ✓ 파일 추가 완료
echo.

git commit -m "feat: 마이페이지 제거 (학습 기록만 남김)

- 학습 기록/마이페이지에서 마이페이지 부분 제거
- statistics 탭 및 관련 기능 제거
- 학습 기록 캘린더만 유지"
if errorlevel 1 (
    echo [경고] 커밋 실패 또는 변경사항 없음
)
echo.

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
    pause
    exit /b 1
)

echo.
echo ========================================
echo    푸시 완료!
echo ========================================
echo.
echo GitHub 저장소:
echo https://github.com/daeungo11-sys/daeun-solid-platform-
echo.
echo Vercel이 자동으로 재배포를 시작합니다.
echo 배포 상태 확인:
echo https://vercel.com/dashboard
echo.
pause

