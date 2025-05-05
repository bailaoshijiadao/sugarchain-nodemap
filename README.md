# Node Map

<details>
<summary>Click to view manual deployment</summary>
<br>

*Note: The node map does  need to be on the same server as the API node*

This project provides a web application for displaying information about cryptocurrency coin daemon nodes using RPC. It visualizes node data on a OpenStreetMap and displays detailed information in a table format. The project is built with Node.js and uses PureCSS for styling.

## Features

- Visual representation of coin nodes on a OpenStreetMap.
- Node data will be cached for 60 minutes.
- Detailed table view showing using IPinfo.io:
  - IP address and Hostname (if available)
  - User agent (Wallet Version)
  - Coin block height
  - Country and Timezone
  - Location (City, States)
  - Network details, ASN Number

## Prerequisites

Before you begin, ensure you have met the following requirements:
- Ubuntu >= 20.04
- You have installed Node.js 12+ and npm 6+.
- You have a basic understanding of JavaScript and Node.js.
- You have a cryptocurrency daemon node can accessible via RPC.
- You have a IPinfo.io token or something else.
- You have a Reverse Proxy and web server. (Recommend Nginx)

## nvm install
   ```bash
   sudo apt-get update
   cd && curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.9/install.sh | bash

   vim /etc/profile
   ```
Append at the end of the file
   ```bash
   export NVM_DIR="$HOME/.nvm"
   [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # This loads nvm
   [ -s "$NVM_DIR/bash_completion" ] && . "$NVM_DIR/bash_completion"  # This loads nvm bash_completion
   ```
Then `:wq` save and re source the file
   ```bash
   source /etc/profile
   ```
## Nodejs install
   ```bash
   nvm install v12.14.0
   ```
## Installing Node Map

To install Node Map, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/bailaoshijiadao/sugarchain-nodemap.git
   ```
2. Navigate to the project directory:
   ```bash
   cd sugarchain-nodemap
   ```
3. Install the necessary packages:
   ```bash
   npm install
   ```
4. Add RPC Client Settings and IPinfo token and Google Maps API Key to the `.env` file:
   ```app.js
   # RPC server settings
   DAEMON_RPC_HOST=127.0.0.1
   DAEMON_RPC_PORT=34229
   DAEMON_RPC_USERNAME=your_username
   DAEMON_RPC_PASSWORD=your_password
   DAEMON_RPC_SSL=false
   DAEMON_RPC_TIMEOUT=30000

   # IPinfo.io token
   IPINFO_TOKEN=your_ipinfo_token

   # Node Map server port
   PORT=3000
   ```
   
## Using Node Map

To use Node Map, run the following command from the root of the project:
  ```bash
  node app.js
  ```
or
  ```bash
  npm start
  ```
or
  ```bash
  pm2 start app.js --name nodemap
  ```

Open your web browser and navigate to `http://localhost:3000` to view nodemap.

# Optional Settings

## PM2 settings

PM2 is an excellent Node process management tool that can help applications automatically restart after a crash.

### PM2 install
   ```bash
   npm install pm2 -g
   ```
### Start web map

Stop the web map first, then use this command to start
   ```bash
   cd sugarchain-nodemap
   pm2 start ./bin/www --name sugarchain-nodemap
   ```
### View project information
   ```bash
   pm2 info sugarchain-nodemap
   ```
### View resource usage
   ```bash
   pm2 monit
   ```


## Domain settings

### Point domain to your server

### Install Nginx
   ```bash
   sudo apt-get update
   sudo apt install nginx -y
   ```
### Create nginx config (replace map.example.com with your domain)
   ```bash
   sudo unlink /etc/nginx/sites-enabled/map.example.com.conf
   rm -rf /etc/nginx/sites-available/map.example.com.conf
   sudo vim /etc/nginx/sites-available/map.example.com.conf
   ```
Write the following content (replace map.example.com with your domain)
   ```bash
   server {
      server_name map.example.com;

      location / {
         proxy_pass http://localhost:3000;
         proxy_http_version 1.1;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection 'upgrade';
         proxy_set_header Host $host;
         proxy_cache_bypass $http_upgrade;
      }

      listen 80;
   }
   ```
### Activate nginx config (replace map.example.com with your domain)
   ```bash
   sudo ln -s /etc/nginx/sites-available/map.example.com.conf /etc/nginx/sites-enabled
   ```
### Install certbot for ssl certificate
   ```bash
   sudo apt install snapd -y
   sudo snap install --classic certbot
   ```
### Obtain certificate (replace map.example.com with your domain)
   ```bash
   sudo certbot --nginx -d map.example.com
   ```
After that web map should be accessible via domain you pointed 

</details>


