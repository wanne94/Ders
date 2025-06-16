@echo off
echo.
echo ================================
echo  DERS.BA Deployment Tool
echo ================================
echo.

if "%1"=="web" (
    echo Deploying web aplikacija...
    call npm run deploy:web
    goto :end
)

if "%1"=="server" (
    echo Deploying server aplikacija...
    call npm run deploy:server
    goto :end
)

if "%1"=="health" (
    echo Checking application health...
    call npm run health
    goto :end
)

if "%1"=="help" (
    goto :help
)

if "%1"=="" (
    echo Deploying both web and server...
    call npm run deploy
    goto :end
)

echo Unknown command: %1
echo.

:help
echo Usage:
echo   deploy.bat [command]
echo.
echo Commands:
echo   (none)     Deploy both web and server
echo   web        Deploy only web application
echo   server     Deploy only server application
echo   health     Check application health
echo   help       Show this help
echo.
echo Examples:
echo   deploy.bat
echo   deploy.bat web
echo   deploy.bat server
echo   deploy.bat health

:end 