# Run the app with npm or vscode
npm start

# Packaging
### 1. Create a 512px,512px desktop png icon file

### 2. Upload the png file to https://iconverticons.com/online/
Get the app.icns file (Mac),
the app.ico file (Windows),
the app.png file (Linux)
Copy all the 3 file in the root of the project : /app.ico, ./app.icns, ./app.png

### 3. Use electron-packager (a community tool to avoid building all) and rimraf (clean the directory when building multiple times) :
npm i electron-packager rimraf -D

### 4. In package.json, --plateform Mac, Windows, Linux. --arch 62b architecture. --icon is the name of the icon used.
### All options are here : https://github.com/electron-userland/electron-packager/blob/master/usage.txt
"scripts": {
    "build": "rimraf git-checker-* && electron-packager . --platform=darwin,linux,win32 --arch=x64 --icon=app --overwrite",
	"start": "electron ."
}

### 5. Run the followinf command in administrator mode. This will create 3 directory, one for each plateform with executables inside. Ex: 'git-checker-win32-x64'.
npm run build

### 6. Test the programm on all OS with Virtual box VMs.
