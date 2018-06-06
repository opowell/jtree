REM Requirements
REM - 7z.exe and 7z.dll
REM - jsdoc
REM - pkg

REM Assumes main folder is one level up from this file.

REM Should match what is in server/jtree.js and doc-pages/release-notes.md.
set "vers=0.5.3"

REM ------- Prepare output folder.
call del ".\releases\%vers%" /Q /F
call rmdir ".\releases\%vers%" /Q /S
mkdir ".\releases\%vers%"

REM ------- Compile program.
call pkg --targets win-x64,win-x86,linux,macos --out-path ".\releases\%vers%" .\server\source\jtree.js

REM ------- Compile docs.
call ./build-tools/buildDocs.bat

REM ------- Copy all files to release folder.
call xcopy ".\client\apps\beauty-contest" ".\releases\%vers%\apps\beauty-contest\" /E
call xcopy ".\client\apps\centipede" ".\releases\%vers%\apps\centipede\" /E
call xcopy ".\client\apps\dictator-game" ".\releases\%vers%\apps\dictator-game\" /E
call xcopy ".\client\apps\display-profit" ".\releases\%vers%\apps\display-profit\" /E
call xcopy ".\client\apps\double-auction" ".\releases\%vers%\apps\double-auction\" /E
call xcopy ".\client\apps\enter-id" ".\releases\%vers%\apps\enter-id\" /E
call xcopy ".\client\apps\market-entry-game" ".\releases\%vers%\apps\market-entry-game\" /E
call xcopy ".\client\apps\public-good" ".\releases\%vers%\apps\public-good-w-punish\" /E
call xcopy ".\client\apps\questionnaire" ".\releases\%vers%\apps\questionnaire\" /E
call xcopy ".\client\apps\questionnaire-bootstrap" ".\releases\%vers%\apps\questionnaire-bootstrap\" /E
call xcopy ".\client\apps\real-effort-sums" ".\releases\%vers%\apps\real-effort-sums\" /E
call xcopy ".\client\apps\stag-hunt-game" ".\releases\%vers%\apps\stag-hunt-game\" /E
call xcopy ".\client\apps\travellers-dilemma" ".\releases\%vers%\apps\travellers-dilemma\" /E
call xcopy ".\client\apps\trust-game" ".\releases\%vers%\apps\trust-game\" /E
call xcopy ".\client\apps\ultimatum-game" ".\releases\%vers%\apps\ultimatum-game\" /E

call xcopy ".\client\queues" ".\releases\%vers%\queues\" /E
call xcopy ".\client\internal" ".\releases\%vers%\internal\" /E
call xcopy ".\client\help.html" ".\releases\%vers%\"
call xcopy ".\server\source" ".\releases\%vers%\internal\source\" /E

call del ".\releases\%vers%\internal\logs" /Q /F
call rmdir ".\releases\%vers%\internal\logs" /Q /S
call del ".\releases\%vers%\internal\serverState*.*" /Q /F
call del ".\releases\%vers%\internal\settings.js" /Q /F

REM ------- Create zip files
call .\build-tools\7z.exe a ".\releases\%vers%\jtree-%vers%-winxp.zip" ".\releases\%vers%\jtree-win-x86.exe" ".\releases\%vers%\apps" ".\releases\%vers%\queues" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\7z.exe a ".\releases\%vers%\jtree-%vers%-win.zip" ".\releases\%vers%\jtree-win-x64.exe" ".\releases\%vers%\apps" ".\releases\%vers%\queues" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\7z.exe a ".\releases\%vers%\jtree-%vers%-macos.zip" ".\releases\%vers%\jtree-macos-x64" ".\releases\%vers%\apps" ".\releases\%vers%\queues" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\7z.exe a ".\releases\%vers%\jtree-%vers%-linux.zip" ".\releases\%vers%\jtree-linux-x64" ".\releases\%vers%\apps" ".\releases\%vers%\queues" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"

REM ------- Clean up
call del ".\releases\%vers%\jtree-win-x86.exe" /Q /F
call del ".\releases\%vers%\jtree-win-x64.exe" /Q /F
call del ".\releases\%vers%\jtree-macos-x64" /Q /F
call del ".\releases\%vers%\jtree-linux-x64" /Q /F
call del ".\releases\%vers%\apps" /Q /F
call del ".\releases\%vers%\internal" /Q /F
call del ".\releases\%vers%\queues" /Q /F
call del ".\releases\%vers%\help.html" /Q /F
call rmdir ".\releases\%vers%\apps" /Q /S
call rmdir ".\releases\%vers%\internal" /Q /S
call rmdir ".\releases\%vers%\queues" /Q /S
