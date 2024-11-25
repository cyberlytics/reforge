@echo off

rem ***************************************************************************
rem * author: Christoph P. Neumann
rem ***************************************************************************

echo == Backend: npm start ==
cd /d "%~dp0"
cd sys-src\backend
rem open in additional console:
start npm start

echo == Frontend: npm start ==
cd /d "%~dp0"
cd sys-src\frontend
cmd /D/C npm start

pause