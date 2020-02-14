# Generate HTML help files, used within jtree and on opowell.github.io/jtree.
# -------------------------
htmlDir="./client/internal/docs"
rm -rf $htmlDir
jsdoc -c "./build-tools/jsdoc-config.json"
cp -R $htmlDir ./docs/reference
# Generate JSON help content, used within the jtree editor.
# ---------------------------------------------------------
jsonFile="./client/internal/clients/shared/docjs.json"
rm $jsonFile
documentation build server/source/** -f json -o $jsonFile

#jsdoc -c ./build-tools/jsdoc-config.json
#cp -R ./client/internal/docs ./docs/reference
