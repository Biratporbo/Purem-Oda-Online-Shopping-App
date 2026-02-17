@echo off
REM Compile Java code
echo Compiling OrderProcessor.java...
javac OrderProcessor.java

if errorlevel 1 (
    echo Compilation failed!
    exit /b 1
)

echo Compilation successful!
echo OrderProcessor.class created in java-service directory
pause
