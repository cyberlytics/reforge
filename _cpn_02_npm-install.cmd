@echo off

rem ***************************************************************************
rem * author: Christoph P. Neumann
rem ***************************************************************************

echo == ROOTDIR: npm install ==
cd /d "%~dp0"
cmd /D/C npm install --silent

echo == Backend: npm install ==
cd /d "%~dp0"
cd sys-src\backend
cmd /D/C npm install --silent

echo == Frontend: npm install ==
cd /d "%~dp0"
cd sys-src\frontend
cmd /D/C npm install --silent

pause