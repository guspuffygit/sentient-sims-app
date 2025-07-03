rm -f SentientSims.zip | true

APP_VERSION=$(jq -r .version release/app/package.json)
echo "$APP_VERSION"

rm -fR universal | true

mkdir universal

gh release download "v${APP_VERSION}" --repo guspuffygit/sentient-sims-app --pattern "SentientSims-${APP_VERSION}-universal-mac.zip" --dir universal

unzip "universal/SentientSims-${APP_VERSION}-universal-mac.zip" -d universal

codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/libEGL.dylib"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/libGLESv2.dylib"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/libvk_swiftshader.dylib"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Libraries/libffmpeg.dylib"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Helpers/chrome_crashpad_handler"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Squirrel.framework/Versions/A/Resources/ShipIt"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Resources/app.asar.unpacked/node_modules/better-sqlite3/build/Release/better_sqlite3.node"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/SentientSims Helper (Plugin).app"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/SentientSims Helper (GPU).app"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/SentientSims Helper (Renderer).app"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/SentientSims Helper.app"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework/Versions/A/Electron Framework"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Electron Framework.framework"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Squirrel.framework/Versions/A/Squirrel"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/Frameworks/Squirrel.framework"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app/Contents/MacOS/SentientSims"
codesign --force --options runtime --timestamp --entitlements "assets/entitlements.mac.plist" --verbose=4 --sign "Developer ID Application: Sentient Simulations LLC (JKSSH5AMBR)" "universal/SentientSims.app"

ditto -c -k --sequesterRsrc --keepParent universal/SentientSims.app SentientSims.zip

xcrun notarytool submit SentientSims.zip --apple-id "$APPLE_ID" --password "$APPLE_ID_PASS" --team-id "$APPLE_TEAM_ID" --wait

xcrun stapler staple "universal/SentientSims.app"

spctl --assess --type execute --verbose universal/SentientSims.app

export GH_TOKEN=$(gh auth token)

npm exec electron-builder -- --publish always --prepackaged universal/SentientSims.app --mac --universal -c.mac.target.arch='universal'
