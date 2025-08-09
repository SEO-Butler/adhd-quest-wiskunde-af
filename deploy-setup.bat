@echo off
echo ====================================
echo    ADHD Quest Deployment Setup
echo ====================================
echo.
echo This script will help you deploy your app to GitHub and Vercel
echo.
echo Step 1: Testing the build...
call npm run build
if %ERRORLEVEL% neq 0 (
    echo.
    echo ERROR: Build failed! Please fix any issues and try again.
    echo Check the error messages above and run 'npm run lint' to identify issues.
    pause
    exit /b 1
)
echo.
echo ✅ Build successful!
echo.
echo Step 2: Initializing Git repository...
git init
if %ERRORLEVEL% neq 0 (
    echo Git is not installed or not in PATH. Please install Git first.
    echo Download from: https://git-scm.com/download/win
    pause
    exit /b 1
)
echo.
echo Step 3: Adding files to Git...
git add .
git commit -m "Initial commit: ADHD Quest Wiskunde AF with Parent Portal"
echo.
echo ✅ Git repository initialized!
echo.
echo ====================================
echo           NEXT STEPS
echo ====================================
echo.
echo 1. Create a GitHub repository at: https://github.com/new
echo    - Repository name: adhd-quest-wiskunde-af
echo    - Make it PUBLIC for free Vercel hosting
echo    - Don't add README, .gitignore, or license (we have them)
echo.
echo 2. Connect your local repository to GitHub:
echo    Replace YOUR_USERNAME with your actual GitHub username:
echo.
echo    git remote add origin https://github.com/YOUR_USERNAME/adhd-quest-wiskunde-af.git
echo    git branch -M main  
echo    git push -u origin main
echo.
echo 3. Deploy to Vercel:
echo    - Go to https://vercel.com
echo    - Click "Add New..." → "Project"
echo    - Import your GitHub repository
echo    - Click Deploy (it will auto-detect Vite settings)
echo.
echo 4. Optional: Add environment variable VITE_LAZYBIRD_API_KEY
echo    in Vercel dashboard for TTS functionality
echo.
echo ====================================
echo.
echo For detailed instructions, see DEPLOYMENT.md
echo.
pause
