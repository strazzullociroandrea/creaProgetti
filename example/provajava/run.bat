
@echo off
if not exist out (
  mkdir out
)
javac -d out src\Main.java
if %errorlevel% neq 0 (
  echo Compilazione fallita
  exit /b %errorlevel%
)
java -cp out Main
pause
