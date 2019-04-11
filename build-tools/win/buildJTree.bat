REM Requirements
REM - 7z.exe and 7z.dll
REM - jsdoc
REM - pkg

REM PROCEDURE
REM **************************************
REM 1. Set version (here, jtree.js, ViewHome.js, and release-notes.md). 
REM 2. Call this file from root folder (/jtree), which should be two levels up from this file (jtree/build-tools/win/buildJTree.bat).
REM 3. Update README.md.
REM 4. Update docs/README.md.
REM 5. Commit to Github.

set "vers=0.7.6"

REM ------- Prepare output folder.
call del ".\releases\%vers%" /Q /F
call rmdir ".\releases\%vers%" /Q /S
mkdir ".\releases\%vers%"

REM ------- Compile program.
call pkg --targets win-x64,win-x86,linux,macos --out-path ".\releases\%vers%" .\server\source\jtree.js

REM ------- Compile docs.
call ./build-tools/win/buildDocs.bat

REM ------- Copy files to release folder.
call xcopy ".\client\apps" ".\releases\%vers%\apps\" /E

call xcopy ".\client\internal" ".\releases\%vers%\internal\" /E

call del ".\releases\%vers%\internal\clients\admin" /Q /F
call rmdir ".\releases\%vers%\internal\clients\admin" /Q /S
call xcopy ".\client\internal\clients\admin\multiuser" ".\releases\%vers%\internal\clients\admin\multiuser\" /E
call xcopy ".\client\internal\clients\admin\shared" ".\releases\%vers%\internal\clients\admin\shared\" /E
call xcopy ".\client\help.html" ".\releases\%vers%\"
call xcopy ".\server\source" ".\releases\%vers%\internal\source\" /E

call del ".\releases\%vers%\internal\logs" /Q /F
call rmdir ".\releases\%vers%\internal\logs" /Q /S
call del ".\releases\%vers%\internal\serverState*.*" /Q /F
call del ".\releases\%vers%\internal\settings.js" /Q /F

REM ------- Create zip files
call .\build-tools\win\7z.exe a ".\releases\%vers%\jtree-%vers%-winxp.zip" ".\releases\%vers%\jtree-win-x86.exe" ".\releases\%vers%\apps" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\win\7z.exe a ".\releases\%vers%\jtree-%vers%-win.zip" ".\releases\%vers%\jtree-win-x64.exe" ".\releases\%vers%\apps" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\win\7z.exe a ".\releases\%vers%\jtree-%vers%-macos.zip" ".\releases\%vers%\jtree-macos-x64" ".\releases\%vers%\apps" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"
call .\build-tools\win\7z.exe a ".\releases\%vers%\jtree-%vers%-linux.zip" ".\releases\%vers%\jtree-linux-x64" ".\releases\%vers%\apps" ".\releases\%vers%\internal" ".\releases\%vers%\help.html"

REM ------- Update latest release
call xcopy ".\releases\%vers%\jtree-%vers%-winxp.zip" ".\releases" /i /Y
call xcopy ".\releases\%vers%\jtree-%vers%-win.zip" ".\releases" /i /Y
call xcopy ".\releases\%vers%\jtree-%vers%-macos.zip" ".\releases" /i /Y
call xcopy ".\releases\%vers%\jtree-%vers%-linux.zip" ".\releases" /i /Y
call del ".\releases\jtree-win.zip" /Q /F
call del ".\releases\jtree-winxp.zip" /Q /F
call del ".\releases\jtree-macos.zip" /Q /F
call del ".\releases\jtree-linux.zip" /Q /F
ren ".\releases\jtree-%vers%-winxp.zip" "jtree-winxp.zip"
ren ".\releases\jtree-%vers%-win.zip" "jtree-win.zip"
ren ".\releases\jtree-%vers%-macos.zip" "jtree-macos.zip"
ren ".\releases\jtree-%vers%-linux.zip" "jtree-linux.zip"

REM ------- Store version
call del ".\releases\older\%vers%" /Q /F
call xcopy ".\releases\%vers%" ".\releases\older\%vers%" /E /i

REM ------- Clean up
call del ".\releases\%vers%\jtree-win-x86.exe" /Q /F
call del ".\releases\%vers%\jtree-win-x64.exe" /Q /F
call del ".\releases\%vers%\jtree-macos-x64" /Q /F
call del ".\releases\%vers%\jtree-linux-x64" /Q /F
call del ".\releases\%vers%\apps" /Q /F
call del ".\releases\%vers%\internal" /Q /F
call del ".\releases\%vers%\help.html" /Q /F
call rmdir ".\releases\%vers%\apps" /Q /S
call rmdir ".\releases\%vers%\internal" /Q /S
call del ".\releases\%vers%" /Q /F
call rmdir ".\releases\%vers%" /Q /S
