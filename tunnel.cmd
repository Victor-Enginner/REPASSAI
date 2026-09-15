@echo off
chcp 65001 >nul
setlocal

echo Procurando devtunnel.exe...
if exist "%~dp0devtools\devtunnel.exe" (
  set DT=%~dp0devtools\devtunnel.exe
) else if exist "%~dp0devtunnel.exe" (
  set DT=%~dp0devtunnel.exe
) else (
  echo ERRO: devtunnel.exe nao encontrado.
  pause
  exit /b 1
)

echo Iniciando tunnel publico na porta 5501 com host-header nr1ztfcj-5500.brs.devtunnels.ms ...
start /B "" "%DT%" host --port 5501 --allow-anonymous --host-header nr1ztfcj-5500.brs.devtunnels.ms

timeout /t 3 /nobreak >nul
echo.
echo Testando URL publica ...
curl -kI https://nr1ztfcj-5500.brs.devtunnels.ms || (
  echo.
  echo Se falhar agora, confira se o tunnel subiu.
)

endlocal
pause