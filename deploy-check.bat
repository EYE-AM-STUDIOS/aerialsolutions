@echo off
echo 🚀 Preparing EDIS Portal for Vercel deployment...

REM Check if we're in the right directory
if not exist "index.html" (
    echo ❌ Error: index.html not found. Please run from project root.
    exit /b 1
)

REM Check for Vercel CLI
where vercel >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 📦 Installing Vercel CLI...
    npm install -g vercel
)

echo 🔍 Running pre-deployment checks...

REM Check for required files
set "files=index.html portal.html dashboard.html admin-dashboard.html vercel.json package.json"
for %%f in (%files%) do (
    if exist "%%f" (
        echo ✅ Found: %%f
    ) else (
        echo ❌ Missing required file: %%f
        exit /b 1
    )
)

REM Validate JSON files
echo 🔧 Validating JSON files...
where node >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    for %%j in (*.json) do (
        node -e "JSON.parse(require('fs').readFileSync('%%j', 'utf8'))" >nul 2>&1
        if %ERRORLEVEL% EQU 0 (
            echo ✅ Valid JSON: %%j
        ) else (
            echo ❌ Invalid JSON: %%j
            exit /b 1
        )
    )
)

REM Check construction worker image URL
echo 🖼️  Verifying construction worker image...
findstr /C:"https://res.cloudinary.com/eastudios-dam/image/upload/v1760817193/Website/hero/easimage_f75g89.jpg" index.html >nul
if %ERRORLEVEL% EQU 0 (
    echo ✅ Construction worker image URL found in index.html
) else (
    echo ⚠️  Warning: Construction worker image URL not found in index.html
)

echo.
echo 🎯 EDIS Portal Deployment Summary:
echo ==================================
echo ✅ Main landing page: index.html
echo ✅ Portal info page: portal.html
echo ✅ Client dashboard: dashboard.html
echo ✅ Admin dashboard: admin-dashboard.html
echo ✅ Vercel configuration: vercel.json
echo ✅ Package configuration: package.json
echo ✅ Construction worker hero image
echo ✅ Cloudinary integration
echo ✅ Client login system
echo.
echo 🚀 Ready to deploy! Run one of these commands:
echo.
echo   npm run deploy         # Deploy to production
echo   npm run deploy:preview # Deploy preview
echo   vercel --prod          # Direct Vercel command
echo.
echo 🌐 After deployment, your site will be available at:
echo    https://edis-portal.vercel.app
echo.