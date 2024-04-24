# Node Map

![initial](https://github.com/ROZ-MOFUMOFU-ME/nodemap/assets/35634920/c228d968-9ad4-476e-a320-3e6e09bcea3d)

This project provides a web application for displaying information about cryptocurrensy coin daemon nodes using RPC. It visualizes node data on a Google Map and displays detailed information in a table format. The project is built with Node.js and uses PureCSS for styling.

## Features

- Visual representation of coin nodes on a Google Map.
- Detailed table view showing:
  - IP address and Reverse DNS
  - User agent (Wallet Version)
  - Block height
  - Country
  - Location (City)
  - Network details

## Prerequisites

Before you begin, ensure you have met the following requirements:
- You have installed Node.js 12+ and npm 6+.
- You have a basic understanding of JavaScript and Node.js.
- You have a IPinfo.io token or something else.
- You have a Google Maps API key.
- You have a Reverse Proxy. (Recommend Nginx)

## Installing Node Map

To install Node Map, follow these steps:

1. Clone the repository:
   ```bash
   git clone https://github.com/ROZ-MOFUMOFU-ME/nodemap.git
   ```
2. Navigate to the project directory:
   ```bash
   cd nodemap
   ```
3. Install the necessary packages:
   ```bash
   npm install
   ```
4. Add your Google Maps API key to the `public/index.html` file:
   ```html
   <script src="https://maps.googleapis.com/maps/api/js?key=<YOUR_GOOGLEMAPS_API_KEY>&callback=initMap" async defer></script>
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

Open your web browser and navigate to `http://localhost:3000` to view the application.

## Contributing to Node Map

To contribute to Node Map, follow these steps:

1. Fork this repository.
2. Create a branch: `git checkout -b <branch_name>`.
3. Make your changes and commit them: `git commit -m '<commit_message>'`
4. Push to the original branch: `git push origin <project_name>/<location>`
5. Create the pull request.

Alternatively, see the GitHub documentation on [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

## License

This project is licensed under the MIT License - see the LICENSE.md file for details.

## Contact

ROZ: [@ROZ_mofumofu_me](https://twitter.com/ROZ_mofumofu_me)

Aoi Emerauda: [@Aoi_Emerauda](https://twitter.com/Aoi_Emerauda) Alternative

Project Link: [https://github.com/ROZ-MOFUMOFU-ME/nodemap](https://github.com/ROZ-MOFUMOFU-ME/nodemap)

## Donations

Donations for development are greatly appreciated!

[GitHub Sponsors](https://github.com/sponsors/ROZ-MOFUMOFU-ME)

[Patreon](https://patreon.com/emerauda)

[FANBOX](https://emerauda.fanbox.cc/)

[Fantia](https://fantia.jp/emerauda)

[Buy Me a Coffee](https://buymeacoffee.com/emerauda)

BTC: 3C8oCWjVs2sycQcK3ttiPRSKV4AKBhC7xT

ETH: 0xc664a0416c23b1b13a18e86cb5fdd1007be375ae

LTC: Lh96WZ7Rw9Wf4GDX2KXpzieneZFV5Xe5ou

BCH: pzdsppue8uwc20x35psaqq8sgchkenr49c0qxzazxu

ETC: 0xc664a0416c23b1b13a18e86cb5fdd1007be375ae

MONA: MLEqE3vi11j4ZguMjkvMn5rUtze6kXbAzQ
