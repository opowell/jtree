# Requi#ents
# - 7z.exe and 7z.dll
# - jsdoc
# - pkg

# PROCEDURE
# **************************************
# 1. Call this file from root folder (/jtree), which should be two levels up from this file (jtree/build-tools/win/buildJTree.bat).
# 2. Update README.md.
# 3. Update docs/README.md.
# 4. Commit to Github.

VERS="0.8.7"

# ------- Prepare output folder.
rm -rf "./release"
mkdir "./release"

# ------- Compile program.
# TODO: Add win-x86
pkg --targets win-x64,linux,macos --out-path "./release" ./server/source/jtree.js

# ------- Compile docs.
source ./build-tools/linux/buildDocs.sh

# ------- Copy files to release folder.
cp -R "./client/apps" "./release"
cp -R "./client/internal" "./release"
cp -R "./client/help.html" "./release"
cp -R "./server/source" "./release/internal"

rm -rf "./release/internal/logs"
rm ./release/internal/serverState*.*
rm ./release/internal/settings.js

# ------- Create zip files
#zip "./release/jtree-$VERS-winxp.zip" "./release/jtree-win-x86.exe" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./release/jtree-$VERS-win.zip" "./release/jtree-win.exe" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./release/jtree-$VERS-macos.zip" "./release/jtree-macos" "./release/apps" "./release/internal" "./release/help.html"
zip -r "./release/jtree-$VERS-linux.zip" "./release/jtree-linux" "./release/apps" "./release/internal" "./release/help.html"