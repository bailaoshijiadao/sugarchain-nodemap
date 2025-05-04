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
const cache = new NodeCache({ stdTTL: 3600 }); // Setup cache TTL set for 60 minutes
let lastCacheUpdateTime = null;

// Validates essential environment variables are set
const requiredVars = ['DAEMON_RPC_HOST', 'IPINFO_TOKEN'];
const missingVars = requiredVars.filter(varName => !process.env[varName]);

if (missingVars.length) {
    console.log("Missing required environment variables:", missingVars.join(', '));
    return;
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

// Function to retrieve peer information
async function fetchPeerInfo() {
    try {
        return await client.command('getpeerinfo');
    } catch (error) {
        console.error('Error accessing Coin Daemon for getpeerinfo:', error);
        return [];
    }
}

// Function to retrieve network information, with fallback to getinfo if getnetworkinfo fails
async function fetchNetworkInfo() {
    try {
        return await client.command('getnetworkinfo');
    } catch (error) {
        console.error('Error accessing Coin Daemon for getnetworkinfo:', error);
        try {
            // Fallback to getinfo if getnetworkinfo is not available
            const info = await client.command('getinfo');
            // Extract and reformat data to match the expected structure from getnetworkinfo
            return {
                subversion: info.version,
                protocolversion: info.protocolversion,
                localaddresses: [{
                    address: info.ip,
                    port: process.env.DAEMON_RPC_PORT || 34229
                }],
            };
        } catch (fallbackError) {
            console.error('Error accessing Coin Daemon for getinfo:', fallbackError);
            return {};
        }
    }
}

// Function to retrieve mining information
async function fetchMiningInfo() {
    try {
        return await client.command('getmininginfo');
    } catch (error) {
        console.error('Error accessing Coin Daemon for getmininginfo:', error);
        return {};
    }
}

// Skip local and private addresses
function isLocalAddress(ip) {
    return ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(ip) ||
        ip.startsWith("192.168") || ip.startsWith("10.") || ip.startsWith("fe80:") || (ip.startsWith("172.") && parseInt(ip.split('.')[1], 10) >= 16 && parseInt(ip.split('.')[1], 10) <= 31);
}

// Helper function to extract IP address, modified to handle IPv6 addresses correctly
function extractIp(address) {
    if (address.includes('[')) {
        // This is for IPv6 addresses enclosed in brackets, typically with a port
        return address.substring(1, address.indexOf(']'));
    } else if (address.includes(':')) {
        // Check if it's an IPv6 without brackets or an IPv4 with port
        const parts = address.split(':');
        if (parts.length > 2) {
            // It's an IPv6 address without brackets
            return address;
        } else {
            // It's an IPv4 address with port
            return parts[0];
        }
    } else {
        // Plain IPv4 or IPv6 address without port
        return address;
    }
}

// Fetches geolocation information using the ipinfo.io API
async function getGeoLocation(ip) {
    const cacheKey = `geo:${ip}`;
    const data = cache.get(cacheKey);
    if (data) return data;

    try {
        const cleanIp = ip.replace(/\[|\]/g, '');
        const encodedIP = encodeURIComponent(cleanIp);
        const url = `https://ipinfo.io/${encodedIP}?token=${ipInfoToken}`;
        console.log("Requesting URL:", url);
        const response = await axios.get(url);
        cache.set(cacheKey, data);
        console.log("API Response: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting location data for IP:', ip, error);
        return null;
    }
}

// Performs a reverse DNS lookup
async function reverseDnsLookup(ip) {
    const cacheKey = `dns:${ip}`;
    let data = cache.get(cacheKey);
    if (data) return data;

    try {
        [hostname] = await dns.reverse(ip);
        cache.set(cacheKey, hostname);
        return hostname;
    } catch (error) {
        // console.error('Reverse DNS lookup failed for IP:', ip, error);
        return '';
    }
}

// Function to format the 'org' data without adding HTML tags
function formatOrg(org) {
    if (!org) return { name: '', number: '' };
    const regex = /(AS\d+)\s*(.*)/;
    const match = org.match(regex);
    if (match) {
        // Return the company name and AS number as separate properties
        return { name: match[2], number: match[1] };
    }
    return { name: org, number: '' };
}

// Endpoint to serve peer location data
async function updatePeerLocations() {
    try {
        const peers = await fetchPeerInfo();
        const networkInfo = await fetchNetworkInfo();
        const miningInfo = await fetchMiningInfo();
        if (!peers) return;

        const peerLocations = await Promise.all(peers.map(async peer => {
            const ip = extractIp(peer.addr);
            if (isLocalAddress(ip)) {
                return null;
            }

            const geoInfo = await getGeoLocation(ip) || {};
            const dnsLookup = await reverseDnsLookup(ip) || '';
            const orgInfo = formatOrg(geoInfo.org);

            return {
                ip: `${ip}<br><span class="text-light">${dnsLookup}</span>`,
                userAgent: `${peer.subver}<br><span class="text-light">${peer.version}</span>`,
                blockHeight: peer.startingheight,
                location: geoInfo.loc ? geoInfo.loc.split(',') : '',
                country: `${geoInfo.country}<br><span class="text-light">${geoInfo.timezone}</span>`,
                city: `${geoInfo.city}<br><span class="text-light">${geoInfo.region}</span>`,
                org: `${orgInfo.name}<br><span class="text-light">${peer.addr}</span>`
            }
        }));

        const localAddresses = await Promise.all(networkInfo.localaddresses.map(async addr => {
            const ip = extractIp(addr.address);
            const geoInfo = await getGeoLocation(addr.address) || {};
            const dnsLookup = await reverseDnsLookup(addr.address) || '';
            const orgInfo = formatOrg(geoInfo.org);

            return {
                ip: `${ip}<br><span class="text-light">${dnsLookup}</span>`,
                userAgent: `${networkInfo.subversion}<br><span class="text-light">${networkInfo.protocolversion}</span>`,
                blockHeight: miningInfo.blocks,
                location: geoInfo.loc ? geoInfo.loc.split(',') : '',
                country: `${geoInfo.country}<br><span class="text-light">${geoInfo.timezone}</span>`,
                city: `${geoInfo.city}<br><span class="text-light">${geoInfo.region}</span>`,
                org: `${orgInfo.name}<br><span class="text-light">${peer.addr}</span>`
            }
        }));

        // Combine peer locations with local address locations
        const combinedLocations = peerLocations.filter(location => location).concat(localAddresses);
        cache.set('peer-locations', combinedLocations);
        const now = new Date();
        lastCacheUpdateTime = `${now.getFullYear()}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getDate().toString().padStart(2, '0')} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        console.log(`Peer locations updated and cached at ${lastCacheUpdateTime}.`)
    } catch (error) {
        console.error('Failed to fetch peer locations:', error)
    }
};

setInterval(updatePeerLocations, 3600000); // Refresh cache every hour
updatePeerLocations(); // Initial fetch and cache when the server starts

// Configure express app and routes...
app.get('/peer-locations', async (req, res) => {
    try {
        const locations = cache.get('peer-locations');
        if (locations) {
            res.json({
                locations: locations,
                lastUpdated: lastCacheUpdateTime
            })
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// Configures static file serving and ejs view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'public'));
app.use(express.static('public'));

// Main page route
app.get('/', (req, res) => {
    res.render('index');
});

// Start the server
app.listen(port, () => {
    console.log(`Node Map Server running on http://localhost:${port}`);
});

module.exports = app;