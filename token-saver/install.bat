@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo   Token Saver 完整闭环 - 一键安装
echo ============================================================
echo.

set INSTALL_DIR=%~dp0
set SKILLS_DIR=%USERPROFILE%\.claude\skills

if not exist "%SKILLS_DIR%" mkdir "%SKILLS_DIR%"

rem 安装 shareable-skills
for %%S in (cache-master smart-route plan-first session-compress context-budget output-control capture-lessons skillify) do (
    if exist "%INSTALL_DIR%shareable-skills\%%S\SKILL.md" (
        if not exist "%SKILLS_DIR%\%%S" mkdir "%SKILLS_DIR%\%%S"
        copy /Y "%INSTALL_DIR%shareable-skills\%%S\SKILL.md" "%SKILLS_DIR%\%%S\SKILL.md" >nul
        for %%E in ("%INSTALL_DIR%shareable-skills\%%S\*.py" "%INSTALL_DIR%shareable-skills\%%S\*.sh") do (
            if exist "%%E" copy /Y "%%E" "%SKILLS_DIR%\%%S\" >nul
        )
        echo   [OK] /%%S
    )
)

rem 安装 diagnostic-skills
for %%S in (dev-monitor token-report duplicate-check rework-check efficiency-score session-review) do (
    if exist "%INSTALL_DIR%diagnostic-skills\%%S\SKILL.md" (
        if not exist "%SKILLS_DIR%\%%S" mkdir "%SKILLS_DIR%\%%S"
        copy /Y "%INSTALL_DIR%diagnostic-skills\%%S\SKILL.md" "%SKILLS_DIR%\%%S\SKILL.md" >nul
        echo   [OK] /%%S
    )
)

rem analyzer.py
if not exist "%SKILLS_DIR%\_shared" mkdir "%SKILLS_DIR%\_shared"
if exist "%INSTALL_DIR%analyzer.py" (
    copy /Y "%INSTALL_DIR%analyzer.py" "%SKILLS_DIR%\_shared\analyzer.py" >nul
    echo   [OK] analyzer.py
)

echo.
echo ============================================================
echo   安装完成
echo ============================================================
echo.
echo   下一步：
echo     1. 将 TOKEN_SAVER_RULES.md 追加到你项目的 CLAUDE.md
echo     2. (可选) 配置 ~/.claude/settings.json 的 hooks
echo     3. 重启 Claude Code
echo.
echo   核心闭环命令：
echo     /dev-monitor      到 体检
echo     /capture-lessons  到 封装教训 MD
echo     /skillify         到 打包成可分享 Skill
echo     /token-saver-guide 到 查看完整使用说明
echo.
pause
