REM Requirements
REM - 7z.exe and 7z.dll
REM - jsdoc
REM - pkg

REM PROCEDURE
REM **************************************
REM 1. Call this file from root folder (/jtree), which should be two levels up from this file (jtree/build-tools/win/buildJTree.bat).
REM 2. Update README.md.
REM 3. Update docs/README.md.
REM 4. Commit to Github.

set "vers=0.8.5"

REM ------- Prepare output folder.
call del ".\release" /Q /F
call rmdir ".\release" /Q /S
mkdir ".\release"

REM ------- Compile program.
call pkg --targets win-x64,win-x86,linux,macos --out-path ".\release" .\server\source\jtree.js

REM ------- Compile docs.
call ./build-tools/win/buildDocs.bat

REM ------- Copy files to release folder.
call xcopy ".\client\apps" ".\release\apps\" /E

call xcopy ".\client\internal" ".\release\internal\" /E

call del ".\release\internal\clients\admin" /Q /F
call rmdir ".\release\internal\clients\admin" /Q /S
call xcopy ".\client\internal\clients\admin\multiuser" ".\release\internal\clients\admin\multiuser\" /E
call xcopy ".\client\internal\clients\admin\shared" ".\release\internal\clients\admin\shared\" /E
call xcopy ".\client\internal\clients\admin\vue" ".\release\internal\clients\admin\vue\" /E
call xcopy ".\client\help.html" ".\release\"
call xcopy ".\server\source" ".\release\internal\source\" /E

call del ".\release\internal\logs" /Q /F
call rmdir ".\release\internal\logs" /Q /S
call del ".\release\internal\serverState*.*" /Q /F
call del ".\release\internal\settings.js" /Q /F

REM ------- Create zip files
call .\build-tools\win\7z.exe a ".\release\jtree-%vers%-winxp.zip" ".\release\jtree-win-x86.exe" ".\release\apps" ".\release\internal" ".\release\help.html"
call .\build-tools\win\7z.exe a ".\release\jtree-%vers%-win.zip" ".\release\jtree-win-x64.exe" ".\release\apps" ".\release\internal" ".\release\help.html"
call .\build-tools\win\7z.exe a ".\release\jtree-%vers%-macos.zip" ".\release\jtree-macos-x64" ".\release\apps" ".\release\internal" ".\release\help.html"
call .\build-tools\win\7z.exe a ".\release\jtree-%vers%-linux.zip" ".\release\jtree-linux-x64" ".\release\apps" ".\release\internal" ".\release\help.html"