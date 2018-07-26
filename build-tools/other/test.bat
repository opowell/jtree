REM Requirements
REM - 7z.exe and 7z.dll
REM - jsdoc
REM - pkg

REM Assumes main folder is one level up from this file.

REM Should match what is in the main jtree.js file.
set "vers=0.4.1"

REM ------- Prepare output folder.
call del ".\releases\%vers%" /Q /F
call rmdir ".\releases\%vers%" /Q /S
mkdir ".\releases\%vers%"

REM ------- Compile program.
call pkg --targets win-x64,win-x86,linux,macos --out-path ".\releases\%vers%" .\source\jtree.js

REM ------- Compile docs.
call ./build-tools/buildDocs.bat

REM ------- Copy all files to release folder.
call xcopy "..\jtree\apps\beauty-contest" ".\releases\%vers%\apps\beauty-contest\" /E
call xcopy "..\jtree\apps\centipede" ".\releases\%vers%\apps\centipede\" /E
call xcopy "..\jtree\apps\dictator-game" ".\releases\%vers%\apps\dictator-game\" /E
call xcopy "..\jtree\apps\display-profit" ".\releases\%vers%\apps\display-profit\" /E
call xcopy "..\jtree\apps\double-auction" ".\releases\%vers%\apps\double-auction\" /E
call xcopy "..\jtree\apps\enter-id" ".\releases\%vers%\apps\enter-id\" /E
call xcopy "..\jtree\apps\market-entry-game" ".\releases\%vers%\apps\market-entry-game\" /E
call xcopy "..\jtree\apps\public-good" ".\releases\%vers%\apps\public-good-w-punish\" /E
call xcopy "..\jtree\apps\questionnaire" ".\releases\%vers%\apps\questionnaire\" /E
call xcopy "..\jtree\apps\questionnaire-bootstrap" ".\releases\%vers%\apps\questionnaire-bootstrap\" /E
call xcopy "..\jtree\apps\real-effort-sums" ".\releases\%vers%\apps\real-effort-sums\" /E
call xcopy "..\jtree\apps\travellers-dilemma" ".\releases\%vers%\apps\travellers-dilemma\" /E
call xcopy "..\jtree\apps\trust-game" ".\releases\%vers%\apps\trust-game\" /E
call xcopy "..\jtree\apps\ultimatum-game" ".\releases\%vers%\apps\ultimatum-game\" /E

call xcopy "..\jtree\queues" ".\releases\%vers%\queues\" /E
call xcopy "..\jtree\internal" ".\releases\%vers%\internal\" /E
call xcopy "..\jtree\help.html" ".\releases\%vers%\"
call xcopy ".\source" ".\releases\%vers%\internal\source\" /E
