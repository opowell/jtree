@echo off
REM jtree launcher for Windows: runs the bundled JAS server (vendor\jas) on
REM this repo's apps\ folder, with jtree (apps\jtree) as JAS's default app, so
REM jtree is served at the root: http://localhost:3000/admin/.
setlocal
set "DIR=%~dp0"
if "%DIR:~-1%"=="\" set "DIR=%DIR:~0,-1%"

if exist "%DIR%\vendor\jas\jas.cmd" goto deps
echo jtree: submodules missing, running git submodule update --init --recursive
git -C "%DIR%" submodule update --init --recursive || exit /b 1

:deps
REM jtree's own server dependencies (express, socket.io, ...) are not committed;
REM release archives ship them installed.
if exist "%DIR%\server\node_modules" goto run
echo jtree: installing server dependencies
pushd "%DIR%\server"
where pnpm >nul 2>nul
if errorlevel 1 (call npm install --omit=dev) else (call pnpm install --prod)
if errorlevel 1 (popd & exit /b 1)
popd

:run
set "JAS_APPS=%DIR%\apps"
set "JAS_DEFAULT_APP=jtree"
if not defined PORT set "PORT=3000"
call "%DIR%\vendor\jas\jas.cmd" %*
