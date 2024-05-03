const express = require('express');
const Client = require('bitcoin-core');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns').promises;
const NodeCache = require('node-cache');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup cache with a standard TTL of 60 minutes
const cache = new NodeCache({ stdTTL: 3600 });
let lastCacheUpdateTime = null;
// Validates that all necessary environment variables are set
if (!process.env.DAEMON_RPC_HOST || !process.env.IPINFO_TOKEN || !process.env.GOOGLE_MAPS_API_KEY) {
    console.error("Required .env environment variables are missing.");
    process.exit(1);
}

/// Configures the coind client with environment variables
const client = new Client({
    host: process.env.DAEMON_RPC_HOST,
    port: process.env.DAEMON_RPC_PORT,
    username: process.env.DAEMON_RPC_USERNAME,
    password: process.env.DAEMON_RPC_PASSWORD,
    ssl: process.env.DAEMON_RPC_SSL === 'true',
    timeout: parseInt(process.env.DAEMON_RPC_TIMEOUT || '30000')
});

const ipInfoToken = process.env.IPINFO_TOKEN;
const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

// Attempt to get peer information
client.command('getpeerinfo').then((response) => {
    console.log("Successfully retrieved peer information.");
    // console.log("Coin Daemon Peer Info:", response);
}).catch((error) => {
    console.error('Error accessing Coin Daemon:', error);
});

// Helper function to extract IP address
function extractIp(address) {
    if (address.includes('[')) {
        return address.substring(0, address.indexOf(']') + 1);
    }
    return address.split(':')[0];
}

// Fetches geolocation information using the ipinfo.io API
async function getGeoLocation(ip) {
    const cacheKey = `geo:${ip}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
        const cleanIp = ip.replace(/\[|\]/g, '');
        const encodedIP = encodeURIComponent(cleanIp);
        const url = `https://ipinfo.io/${encodedIP}?token=${ipInfoToken}`;
        // console.log("Requesting URL:", url);
        const response = await axios.get(url);
        cache.set(cacheKey, response.data);
        // console.log("API Response: ", response.data);
        return response.data;
    } catch (error) {
        // console.error('Error getting location data for IP:', ip, error);
        return null;
    }
}

// Performs a reverse DNS lookup
async function reverseDnsLookup(ip) {
    const cacheKey = `dns:${ip}`;
    const cachedData = cache.get(cacheKey);
    if (cachedData) return cachedData;

    try {
        const hostnames = await dns.reverse(ip);
        cache.set(cacheKey, hostnames[0]);
        return hostnames[0];
    } catch (error) {
        // console.error('Reverse DNS lookup failed for IP:', ip, error);
        return '';
    }
}

// Function to format the 'org' data
function formatOrg(org) {
    const regex = /(AS\d+)\s*(.*)/;
    const match = org.match(regex);
    if (match) {
        // If matched, switch the order so the AS number appears after the company name
        return `${match[2]}<br><span class="text-light">${match[1]}</span>`;
    }
    // If no match is found, return the original string
    return org;
}

// Endpoint to serve peer location data
async function fetchAndCachePeerLocations() {
    try {
        const peers = await client.command('getpeerinfo');
        const locations = [];

        for (const peer of peers) {
            const ip = extractIp(peer.addr);

            // Skip local network and localhost IPs
            if (ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.") || ip.startsWith("172.")) {
                continue;
            }

            const geoInfo = await getGeoLocation(ip) || {};
            const dnsLookup = await reverseDnsLookup(ip) || '';
            locations.push({
                ip: ip + '<br><span class="text-light">' + (await reverseDnsLookup(ip) + '</span>' || ''),
                userAgent: peer.subver + '<br><span class="text-light">' + peer.version + '</span>',
                blockHeight: peer.startingheight,
                location: geoInfo.loc ? geoInfo.loc.split(',') : '',
                country: (geoInfo.country && geoInfo.timezone) ? `${geoInfo.country}<br><span class="text-light">${geoInfo.timezone}</span>` : '',
                region: geoInfo.region || '',
                city: (geoInfo.city && geoInfo.region) ? `${geoInfo.city}<br><span class="text-light">${geoInfo.region}</span>` : '',
                hostname: await reverseDnsLookup(ip) || '',
                org: geoInfo.org ? formatOrg(geoInfo.org) : ''
            });
        }

        cache.set('peer-locations', locations);
        lastCacheUpdateTime = new Date();
        console.log(`Peer locations updated and cached at ${lastCacheUpdateTime}.`)
    } catch (error) {
        console.error('Failed to fetch peer locations:', error);
    }
};

// Set an interval to refresh the cache every 1 hour
setInterval(fetchAndCachePeerLocations, 3600000);

// Initial fetch and cache when the server starts
fetchAndCachePeerLocations();

// Configure express app and routes...
app.get('/peer-locations', async (req, res) => {
    try {
        const cachedLocations = cache.get('peer-locations');
        if (cachedLocations) {
            res.json(cachedLocations);
        } else {
            throw new Error('Failed to retrieve peer locations from cache');
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Configures static file serving and ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static('public'));

// Main page route
app.get('/', (req, res) => {
    res.render('index', { googleMapsApiKey });
});

// Start the server
app.listen(port, () => {
    console.log(`Node Map Server running on http://localhost:${port}`);
});
