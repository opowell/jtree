set "htmlDir=.\client\internal\docs"
call del %htmlDir% /Q /F
call rmdir %htmlDir% /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"

set "mdDir=.\client\internal\docjs-md"
call del %mdDir% /Q /F
call documentation build server/source/App.js -f md -o %mdDir%\app.md --github --shallow
call documentation build server/source/Group.js -f md -o %mdDir%\group.md --github --shallow
call documentation build server/source/** -f json -o .\client\internal\docjs.json --config build-tools/documentation.yml --github
