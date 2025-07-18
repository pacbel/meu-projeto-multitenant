@echo off
echo Importando bancos de dados para o sistema multitenant...
echo.

REM Configurações
set MYSQL_PATH=mysql
set MYSQL_USER=root
set MYSQL_PASS=
set MYSQL_HOST=localhost

echo Criando os bancos de dados...
%MYSQL_PATH% -h %MYSQL_HOST% -u %MYSQL_USER% < setup_databases.sql
if %errorlevel% neq 0 (
    echo Erro ao criar os bancos de dados!
    pause
    exit /b %errorlevel%
)

echo.
echo Importando dados para default_db...
%MYSQL_PATH% -h %MYSQL_HOST% -u %MYSQL_USER% default_db < dumps\default_db.sql
if %errorlevel% neq 0 (
    echo Erro ao importar default_db!
    pause
    exit /b %errorlevel%
)

echo.
echo Importando dados para cliente1_db...
%MYSQL_PATH% -h %MYSQL_HOST% -u %MYSQL_USER% cliente1_db < dumps\cliente1_db.sql
if %errorlevel% neq 0 (
    echo Erro ao importar cliente1_db!
    pause
    exit /b %errorlevel%
)

echo.
echo Importando dados para cliente2_db...
%MYSQL_PATH% -h %MYSQL_HOST% -u %MYSQL_USER% cliente2_db < dumps\cliente2_db.sql
if %errorlevel% neq 0 (
    echo Erro ao importar cliente2_db!
    pause
    exit /b %errorlevel%
)

echo.
echo Importação concluída com sucesso!
echo.
echo Pressione qualquer tecla para sair...
pause > nul
