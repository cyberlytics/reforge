@echo off

rem ***************************************************************************
rem * author: Christoph P. Neumann
rem ***************************************************************************

cd /d "%~dp0"

echo == Versions ==
set /p=node: <nul
cmd /D/C node --version
set /p=npm: <nul
cmd /D/C npm --version

echo == Global: npm ls -g ==
cmd /D/C npm ls -g

echo == ROOTDIR: npm ls ==
cd /d "%~dp0"
cmd /D/C npm ls

echo == Backend: npm ls ==
cd /d "%~dp0"
cd sys-src\backend
cmd /D/C npm ls

echo == Frontend: npm ls ==
cd /d "%~dp0"
cd sys-src\frontend
cmd /D/C npm ls

pause