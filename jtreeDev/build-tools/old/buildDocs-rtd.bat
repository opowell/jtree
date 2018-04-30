REM 2018.02.14: Throws error when compiling.
call del ".\releases\docsTemp" /Q /F
call rmdir ".\releases\docsTemp" /Q /S
call jsdoc -c ".\build-tools\docs-jsdoc-rtd.json"
