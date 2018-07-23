REM Requirements
REM - 7z.exe and 7z.dll
REM - jsdoc
REM - pkg

REM Call from root folder (/jtree), which should be one level up from this file (jtree/build-tools/buildJTree.bat).

REM Should match what is in server/jtree.js and doc-pages/release-notes.md.
set "vers=0.6.0"

REM ------- Prepare output folder.
call del ".\releases\%vers%" /Q /F
call rmdir ".\releases\%vers%" /Q /S
mkdir ".\releases\%vers%"

REM ------- Compile program.
call pkg --targets win-x64,win-x86,linux,macos --out-path ".\releases\%vers%" .\server\source\jtree.js

REM ------- Compile docs.
call ./build-tools/buildDocs.bat

REM ------- Copy all files to release folder.
call xcopy ".\client\apps\beauty-contest.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\centipede.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\dictator-game.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\display-profit.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\enter-id.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\language-test.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\market-entry-game.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\public-good.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\public-good-w-punish.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\questionnaire.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\stag-hunt-game.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\travellers-dilemma.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\trust-game.jtt" ".\releases\%vers%\apps\" /E
call xcopy ".\client\apps\ultimatum-game.jtt" ".\releases\%vers%\apps\" /E

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
