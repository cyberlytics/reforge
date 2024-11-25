@echo off

rem ***************************************************************************
rem * author: Christoph P. Neumann
rem ***************************************************************************

cd /d "%~dp0"

echo == Update global NPM packages ==
cmd /D/C npm install npm@latest -g --silent
cmd /D/C npm outdated -g --depth=0
rem cmd /D/C ncu -g
rem cmd /D/C ncu -g -u
rem cmd /D/C npm update -g --silent
rem cmd /D/C npm outdated

echo == ROOTDIR: npm update ==
cd /d "%~dp0"
cmd /D/C npm update --silent
cmd /D/C npm outdated
cmd /D/C ncu
cmd /D/C ncu -u
cmd /D/C npm install --silent
cmd /D/C npm outdated

echo == Backend: npm update ==
cd /d "%~dp0"
cd sys-src\backend
cmd /D/C npm update --silent
cmd /D/C npm outdated
cmd /D/C ncu
cmd /D/C ncu -u
cmd /D/C npm install --silent
cmd /D/C npm outdated

echo == Frontend: npm update ==
cd /d "%~dp0"
cd sys-src\frontend
cmd /D/C npm update --silent
cmd /D/C npm outdated
cmd /D/C ncu
cmd /D/C ncu -u
cmd /D/C npm install --silent
cmd /D/C npm outdated

pause