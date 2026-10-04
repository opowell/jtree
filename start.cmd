@echo off
REM jtree launcher for Windows: runs the bundled JAS server (vendor\jas) on
REM this repo's apps\ folder, where apps\jtree starts jtree's server under
REM /jtree ("route" in apps\jtree\settings.json).
setlocal
set "DIR=%~dp0"
if "%DIR:~-1%"=="\" set "DIR=%DIR:~0,-1%"

if exist "%DIR%\vendor\jas\jas.cmd" goto deps
echo jtree: submodules missing, running git submodule update --init --recursive
git -C "%DIR%" submodule update --init --recursive || exit /b 1

:deps
REM jtree's own server dependencies (express 4, socket.io 2, ...) are not committed.
if exist "%DIR%\server\node_modules" goto run
echo jtree: installing server dependencies
pushd "%DIR%\server"
where pnpm >nul 2>nul
if errorlevel 1 (call npm install) else (call pnpm install)
if errorlevel 1 (popd & exit /b 1)
popd

:run
set "JAS_APPS=%DIR%\apps"
if not defined PORT set "PORT=3000"
echo jtree admin: http://localhost:%PORT%/jtree/admin
call "%DIR%\vendor\jas\jas.cmd" %*
