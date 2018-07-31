REM Generate HTML help files, used within jtree and on opowell.github.io/jtree.
REM -------------------------
set "htmlDir=.\client\internal\docs"
call del %htmlDir% /Q /F
call rmdir %htmlDir% /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"

REM Generate JSON help content, used within the jtree editor.
REM ---------------------------------------------------------
set "jsonFile=.\client\internal\clients\shared\docjs.json"
call del %jsonFile% /Q /F
call documentation build server/source/** -f json -o %jsonFile%
