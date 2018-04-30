call del ".\client\internal\docs" /Q /F
call rmdir ".\client\internal\docs" /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"
