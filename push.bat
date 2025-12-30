@echo off
echo === MochiRP Website Push ===

git init
git branch -M main
git add .
git commit -m "deploy mochi website"

git remote remove origin 2>nul
git remote add origin https://github.com/haru2017055/mochirp-newsite.git

git push -u origin main

pause