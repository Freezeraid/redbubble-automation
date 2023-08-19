#!/bin/bash
killall Xvfb
Xvfb :100 -ac -screen 0 1920x1080x24 &
export DISPLAY=:100
cd redbubble-scrapper/
npm start
killall Xvfb