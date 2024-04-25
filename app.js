const express = require('express');
const Client = require('bitcoin-core');
const axios = require('axios');
const app = express();

const client = new Client({
    host: process.env.DAEMON_RPC_HOST || '127.0.0.1',
    port: process.env.DAEMON_RPC_PORT || 8333,
    username: process.env.DAEMON_RPC_USERNAME,
    password: process.env.DAEMON_RPC_PASSWORD,
    ssl: false,
    timeout: 30000
});

const ipInfoToken = process.env.IPINFO_TOKEN;

client.command('getpeerinfo').then(response => {
    console.log(response);
}).catch(error => {
    console.error('Error accessing coind:', error);
});

function extractIp(address) {
    if (address.includes('[')) {
        return address.substring(0, address.indexOf(']') + 1);
    }
    return address.split(':')[0];
}

async function getGeoLocation(ip) {
    try {
        const cleanIp = ip.replace(/\[|\]/g, '');
        const encodedIP = encodeURIComponent(cleanIp);
        const url = `https://ipinfo.io/${encodedIP}?token=${ipInfoToken}`;
        console.log("Requesting URL:", url);
        const response = await axios.get(url);
        console.log("API Response: ", response.data);
        return response.data;
    } catch (error) {
        console.error('Error getting location:', error);
        return null;
    }
}

app.get('/peer-locations', async (req, res) => {
    try {
        const peers = await client.command('getpeerinfo');
        const locations = await Promise.all(peers.map(async (peer) => {
            const ip = extractIp(peer.addr);
            const geoInfo = await getGeoLocation(ip) || {};
            return {
                ip: ip + '<br><span class="text-light">' + (await reverseDnsLookup(ip) + '</span>' || ''),
                userAgent: peer.subver + '<br><span class="text-light">' + peer.version + '</span>',
                blockHeight: peer.startingheight,
                location: geoInfo.loc ? geoInfo.loc.split(',') : '',
                country: (geoInfo.country && geoInfo.timezone) ? `${geoInfo.country}<br><span class="text-light">${geoInfo.timezone}</span>` : '',
                region: geoInfo.region || '',
                city: (geoInfo.city && geoInfo.region) ? `${geoInfo.city}<br><span class="text-light">${geoInfo.region}</span>` : '',
                hostname: geoInfo.hostname || '',
                org: (geoInfo.asn && geoInfo.asn.name) ? `${geoInfo.asn.name}<br><span class="text-light">${geoInfo.asn.asn}</span>` : ''
            };
        }));
        res.json(locations);
    } catch (error) {
        console.error('Detailed error:', error);
        res.status(500).json({ error: 'Error fetching peer locations', details: error.message });
    }
});

async function reverseDnsLookup(ip) {
    const dns = require('dns').promises;
    try {
        const hostnames = await dns.reverse(ip);
        return hostnames[0];
    } catch (error) {
        return '';
    }
}

const path = require('path');

app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
