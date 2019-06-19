# RUN THIS EVERY TIME A NEW VERSION IS STARTED.

Set-Variable -Name "vers" -Value "0.7.8"

(Get-Content README_template.md) -replace '{{VERSION}}', $vers | Set-Content README.md
(Get-Content .\build-tools\win\buildJTree_template.bat) -replace '{{VERSION}}', $vers | Set-Content .\build-tools\win\buildJTree.bat
(Get-Content .\server\source\jtree_template.js) -replace '{{VERSION}}', $vers | Set-Content .\server\source\jtree.js
(Get-Content .\client\internal\clients\admin\multiuser\webcomponents\ViewHome_template.js) -replace '{{VERSION}}', $vers | Set-Content .\client\internal\clients\admin\multiuser\webcomponents\ViewHome.js