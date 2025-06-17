@echo off
echo Cistim Expo i Metro cache...

echo.
echo [1/5] Cistim Metro cache...
npx expo start --clear

echo.
echo [2/5] Cistim watchman cache...
watchman watch-del-all 2>nul

echo.
echo [3/5] Cistim npm cache...
npm cache clean --force

echo.
echo [4/5] Brisem node_modules...
rmdir /s /q node_modules 2>nul

echo.
echo [5/5] Ponovo instaliram dependencies...
npm install

echo.
echo Cache je ociscen! Pokrenite aplikaciju sa: npm start
pause