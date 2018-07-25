call del ".\client\internal\docs" /Q /F
call rmdir ".\client\internal\docs" /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"

set "api-docs-folder=.\client\internal\source-docs"
call del %api-docs-folder% /Q /F
call rmdir %api-docs-folder% /Q /S
call documentation build server/source/** -f html -o %api-docs-folder% --config build-tools/documentation.yml --github
