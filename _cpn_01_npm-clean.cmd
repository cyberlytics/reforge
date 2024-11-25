@echo off

rem ***************************************************************************
rem * author: Christoph P. Neumann
rem ***************************************************************************

cd /d "%~dp0"

echo == Clean global NPM cache: %USERPROFILE%\AppData\Local\npm-cache\_cacache ==
cmd /D/C npm cache clean --force

echo == ROOTDIR: clean ==
cd /d "%~dp0"
rmdir /s /q node_modules
del package-lock.json
cmd /D/C npm prune

echo == Backend: clean ==
cd /d "%~dp0"
cd sys-src\backend
rmdir /s /q node_modules
del package-lock.json
cmd /D/C npm prune

echo == Frontend: clean ==
cd /d "%~dp0"
cd sys-src\frontend
rmdir /s /q node_modules
del package-lock.json
cmd /D/C npm prune

pause