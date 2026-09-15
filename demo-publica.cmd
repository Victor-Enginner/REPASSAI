@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

REM ============================================================
REM  REPASS AI - Link publico para demonstracao
REM
REM  Abre um tunel HTTPS da Microsoft apontando para o REPASS que
REM  esta rodando nesta maquina, na porta 3000.
REM
REM  DE GRACA, SEM CARTAO. So precisa de conta Microsoft ou GitHub.
REM
REM  IMPORTANTE: o link so funciona enquanto este computador estiver
REM  ligado e esta janela aberta. Fechou a janela, o link morre.
REM ============================================================

set "DT=%LOCALAPPDATA%\Microsoft\WinGet\Packages\Microsoft.devtunnel_Microsoft.Winget.Source_8wekyb3d8bbwe\devtunnel.exe"

if not exist "%DT%" (
  echo.
  echo ERRO: devtunnel nao encontrado em:
  echo   %DT%
  echo.
  echo Instale com:  winget install Microsoft.devtunnel
  echo.
  pause
  exit /b 1
)

echo.
echo ============================================
echo   REPASS AI - Link publico de demonstracao
echo ============================================
echo.

REM --- O REPASS esta no ar nesta maquina? ---
echo [1/3] Conferindo se o REPASS esta rodando na porta 3000...
powershell -NoProfile -Command "try { $r = Invoke-WebRequest -Uri 'http://localhost:3000' -UseBasicParsing -TimeoutSec 5; exit 0 } catch { exit 1 }"
if errorlevel 1 (
  echo.
  echo ERRO: nada respondendo em http://localhost:3000
  echo.
  echo O REPASS precisa estar rodando ANTES de abrir o tunel.
  echo Peca ao Claude para subir a pilha de producao.
  echo.
  pause
  exit /b 1
)
echo       OK - REPASS respondendo.
echo.

REM --- Login (so na primeira vez) ---
echo [2/3] Conferindo login no servico de tunel...
"%DT%" user show 2>nul | findstr /C:"Not logged in" >nul
if not errorlevel 1 (
  echo       Voce ainda nao esta logado. Abrindo o login agora...
  echo       Uma janela do navegador vai abrir. Entre com GitHub ou Microsoft.
  echo.
  "%DT%" user login -g
  if errorlevel 1 (
    echo.
    echo ERRO no login. Tente de novo.
    pause
    exit /b 1
  )
) else (
  echo       OK - ja esta logado.
)
echo.

REM --- Abrir o tunel ---
echo [3/3] Abrindo o tunel publico...
echo.
echo ============================================
echo   A URL publica aparece abaixo.
echo   Copie a linha que termina em .devtunnels.ms
echo.
echo   NAO FECHE ESTA JANELA enquanto estiver
echo   demonstrando - o link cai junto.
echo.
echo   Para encerrar: Ctrl+C
echo ============================================
echo.

REM `-p`, nao `--port`. O devtunnel chama a opcao de `--port-number`, e com
REM `--port` ele recusa, imprime a ajuda inteira e sai sem erro claro.
"%DT%" host -p 3000 -a

echo.
echo Tunel encerrado. O link publico nao funciona mais.
pause
