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
REM The first free port from PORT (default 3000) up, checked with the Node JAS
REM will run on: the bundled one (release archives), else node on PATH.
if not defined PORT set "PORT=3000"
set "FIND_NODE="
for /d %%D in ("%DIR%\vendor\jas\server\node\*-win-*") do if not defined FIND_NODE if exist "%%~fD\node.exe" set "FIND_NODE=%%~fD\node.exe"
if not defined FIND_NODE where node >nul 2>nul && set "FIND_NODE=node"
set "FREE_PORT="
if defined FIND_NODE for /f %%P in ('""%FIND_NODE%" "%DIR%\scripts\find-port.js" %PORT%"') do set "FREE_PORT=%%P"
if defined FREE_PORT if not "%FREE_PORT%"=="%PORT%" echo jtree: port %PORT% is in use, using %FREE_PORT%
if defined FREE_PORT set "PORT=%FREE_PORT%"

set "JAS_APPS=%DIR%\apps"
set "JAS_DEFAULT_APP=jtree"
call "%DIR%\vendor\jas\jas.cmd" %*
