@echo off
chcp 65001 >nul
echo.
echo ============================================================
echo   Team Best-Practice Skills - 一键安装到 Claude Code
echo ============================================================
echo.

set INSTALL_DIR=%~dp0
set SKILLS_DIR=%USERPROFILE%\.claude\skills

if not exist "%SKILLS_DIR%" mkdir "%SKILLS_DIR%"

for %%S in (cache-master smart-route plan-first session-compress context-budget output-control skillify) do (
    if not exist "%SKILLS_DIR%\%%S" mkdir "%SKILLS_DIR%\%%S"
    copy /Y "%INSTALL_DIR%%%S\SKILL.md" "%SKILLS_DIR%\%%S\SKILL.md" >nul
    rem 复制附加 .py .sh 文件（如 skillify.py）
    for %%E in ("%INSTALL_DIR%%%S\*.py" "%INSTALL_DIR%%%S\*.sh") do (
        if exist "%%E" copy /Y "%%E" "%SKILLS_DIR%\%%S\" >nul
    )
    echo   [OK] /%%S
)

echo.
echo ============================================================
echo   7 个团队最佳实践 Skill 已安装！
echo ============================================================
echo.
echo   重启 Claude Code 后可用:
echo     /cache-master      Cache 优化健康检查
echo     /smart-route       智能模型路由
echo     /plan-first        零返工工作流
echo     /session-compress  会话压缩保存
echo     /context-budget    上下文预算分析
echo     /output-control    输出控制器
echo     /skillify          个人笔记打包为 Skill
echo.
pause
