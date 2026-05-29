@REM ----------------------------------------------------------------------------
@REM Maven Wrapper startup batch script
@REM ----------------------------------------------------------------------------
@IF "%__MVNW_ARG0_NAME__%"=="" (SET "MVN_CMD=mvn") ELSE (SET "MVN_CMD=%__MVNW_ARG0_NAME__%")
@SET MAVEN_PROJECTBASEDIR=%~dp0

@SET WRAPPER_JAR="%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.jar"
@SET WRAPPER_LAUNCHER=org.apache.maven.wrapper.MavenWrapperMain
@SET WRAPPER_URL=https://repo.maven.apache.org/maven2/org/apache/maven/wrapper/maven-wrapper/3.2.0/maven-wrapper-3.2.0.jar

@SET DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.6/apache-maven-3.9.6-bin.zip

@FOR /F "usebackq tokens=1,2 delims==" %%A IN ("%MAVEN_PROJECTBASEDIR%.mvn\wrapper\maven-wrapper.properties") DO (
    @IF "%%A"=="distributionUrl" SET DOWNLOAD_URL=%%B
)

@SET MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin\apache-maven-3.9.6
@SET MVN_EXE=%MAVEN_HOME%\bin\mvn.cmd

@IF EXIST "%MVN_EXE%" GOTO run_maven

@ECHO Downloading Maven 3.9.6...
@SET MAVEN_ZIP=%TEMP%\apache-maven-3.9.6-bin.zip
@SET MAVEN_DIST_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-3.9.6-bin

@IF NOT EXIST "%MAVEN_DIST_DIR%" MKDIR "%MAVEN_DIST_DIR%"

powershell -Command "Invoke-WebRequest -Uri '%DOWNLOAD_URL%' -OutFile '%MAVEN_ZIP%'"
powershell -Command "Expand-Archive -Path '%MAVEN_ZIP%' -DestinationPath '%MAVEN_DIST_DIR%' -Force"
@DEL "%MAVEN_ZIP%"

:run_maven
@"%MVN_EXE%" %*
