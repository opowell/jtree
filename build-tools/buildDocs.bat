call del ".\client\internal\docs" /Q /F
call rmdir ".\client\internal\docs" /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"

set "htmlFolder="
set "mdFolder="
set "jsonFolder="
call del %api-docs-folder% /Q /F
call rmdir %api-docs-folder% /Q /S
call documentation build server/source/** -f html -o .\client\internal\docjs-html --config build-tools/documentation.yml --github
call documentation build server/source/** -f md -o .\client\internal\docjs.md --config build-tools/documentation.yml --github
call documentation build server/source/** -f json -o .\client\internal\docjs.json --config build-tools/documentation.yml --github
