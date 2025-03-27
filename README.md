### Redbubble AI Automation V1

This script allows you to create an image and its redbubble parameters using AI (ChatGPT and Replicate), and upload it to your redbubble account. No maintenance required, just set up the project on an ubuntu machine, create the cron task and let the script do the work for you.

Set up the following environment variables in an .env file at the root of the project

<code>REDBUBBLE_URL=https://www.redbubble.com/
OPENAI_API_KEY=sk- //Your OPENAI API Key
REPLICATE_API_KEY= //Your Replicate API Key
REDBUBBLE_LOGIN= //Redbubble account email
REDBUBBLE_PW= //Redbubble account password
START_DATE= //Date of creation and setup of account information, YYYY-MM-DD</code>


Use the following Ubuntu commands to set up the picture upload automation every 30mins. 


<code>sudo apt update
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.35.3/install.sh | bash

nvm install 18.0.0
nvm use v18.0.0
curl -sL https://deb.nodesource.com/setup_18.x | sudo -E bash -

sudo apt-get install -y xfce4 xfce4-goodies
sudo apt install xrdp -y
sudo systemctl enable xrdp
sudo reboot

sudo apt-get install -y nodejs
npm install -g npm@latest

sudo apt install cron
sudo systemctl enable cron

cd /redbubble-automation
chmod +x run.sh
#Check that EOL is Unix format (LF) 

sudo apt-get install -y libxi6 libxtst6 libcups2 libxss1 libxrandr2 libasound2 libpangocairo-1.0-0 libgtk-3-0 xvfb x11-xkb-utils xfonts-100dpi xfonts-75dpi xfonts-scalable xfonts-cyrillic x11-apps libx11-xcb1 libxcomposite1 libxdamage1 libxext6 libxfixes3 libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libgtk-3-0 libxrandr2 libxshmfence1 libgbm1 libasound2

crontab -e
*/30 * * * * /home/ubuntu/redbubble-automation/run.sh >> /home/ubuntu/redbubble-automation/cron.log 2>&1

sudo reboot</code>

Check my web developer website <a href="https://killiandoubre.com" rel="dofollow">https://killiandoubre.com</a>
