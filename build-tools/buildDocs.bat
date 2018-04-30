call del "..\jtree\internal\docs" /Q /F
call rmdir "..\jtree\internal\docs" /Q /S
call jsdoc -c ".\build-tools\jsdoc-config.json"
