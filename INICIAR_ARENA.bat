@echo off
setlocal
title Arena Marks - Primeira versao
cd /d "%~dp0"
set "ARENA_NODE="
for /f "delims=" %%N in ('where node.exe 2^>nul') do if not defined ARENA_NODE set "ARENA_NODE=%%N"
if not defined ARENA_NODE set "ARENA_NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not exist "%ARENA_NODE%" (
  echo Node.js nao encontrado. Instale o Node.js para iniciar a Arena Marks.
  pause
  exit /b 1
)
if not exist "node_modules\next\dist\bin\next" (
  echo Dependencias ausentes. Execute pnpm install antes de iniciar.
  pause
  exit /b 1
)
"%ARENA_NODE%" -e "fetch('http://localhost:3100').then(r=>r.text()).then(t=>process.exit(t.includes('Arena Marks')?0:1)).catch(()=>process.exit(1))"
if not errorlevel 1 (
  start "" "http://localhost:3100"
  exit /b 0
)
start "" "http://localhost:3100"
echo Arena Marks: http://localhost:3100
echo Mantenha esta janela aberta enquanto estiver usando a previa.
"%ARENA_NODE%" node_modules\next\dist\bin\next dev --hostname 0.0.0.0 --port 3100
pause
