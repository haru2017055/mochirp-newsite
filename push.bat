@echo off
:: === 自動 Push 腳本 ===
:: 作者：ChatGPT for MochiRP

:: 檢查是否有 git
where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [錯誤] 找不到 git，請先安裝 Git 再執行。
    pause
    exit /b
)

echo =============================
echo   MochiRP 自動 Push 腳本
echo =============================

:: 切換到專案資料夾 (請改成你自己的路徑)
cd /d "%~dp0"

:: 加入所有修改
git add .

:: 自動生成 commit 訊息 (附帶時間)
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do (
    set today=%%a-%%b-%%c
)
for /f "tokens=1-2 delims=: " %%a in ("%time%") do (
    set now=%%a-%%b
)
set msg=自動更新 %today% %now%

git commit -m "%msg%"

:: 推送到 main 分支
git push origin main

echo =============================
echo   ✅ 已推送到 GitHub
echo =============================
pause
