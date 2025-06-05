import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Steam API endpoints
const STEAM_API_BASE = 'https://api.steampowered.com';

// Convert various Steam ID formats to Steam64 ID
function convertToSteam64(steamId) {
    // Handle Steam64 ID (already in correct format)
    if (/^\d{17}$/.test(steamId)) {
        return steamId;
    }

    // Handle Steam ID format (STEAM_X:Y:Z)
    const steamIdMatch = steamId.match(/^STEAM_(\d):([0-1]):(\d+)$/);
    if (steamIdMatch) {
        const y = parseInt(steamIdMatch[2]);
        const z = parseInt(steamIdMatch[3]);
        return BigInt(z * 2n + 76561197960265728n + BigInt(y)).toString();
    }

    // Handle Steam3 ID format ([U:1:X])
    const steam3Match = steamId.match(/^\[U:1:(\d+)\]$/);
    if (steam3Match) {
        return BigInt(parseInt(steam3Match[1]) + 76561197960265728n).toString();
    }

    return null;
}

// Get player ban information
app.get('/api/bans/:steamId', async (req, res) => {
    try {
        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerBans/v1/?key=${process.env.STEAM_API_KEY}&steamids=${steam64Id}`
        );
        const data = await response.json();

        if (!data.players || !data.players.length) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json(data.players[0]);
    } catch (error) {
        console.error('Error fetching ban data:', error);
        res.status(500).json({ error: 'Failed to fetch ban data' });
    }
});

// Get player summary (name, avatar, etc.)
app.get('/api/player/:steamId', async (req, res) => {
    try {
        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steam64Id}`
        );
        const data = await response.json();

        if (!data.response.players || !data.response.players.length) {
            return res.status(404).json({ error: 'Player not found' });
        }

        res.json(data.response.players[0]);
    } catch (error) {
        console.error('Error fetching player data:', error);
        res.status(500).json({ error: 'Failed to fetch player data' });
    }
});

// Get player's owned games
app.get('/api/games/:steamId', async (req, res) => {
    try {
        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steam64Id}&include_appinfo=true&include_played_free_games=true`
        );
        const data = await response.json();

        if (!data.response || !data.response.games) {
            return res.status(404).json({ error: 'No games found or profile is private' });
        }

        res.json(data.response.games);
    } catch (error) {
        console.error('Error fetching games data:', error);
        res.status(500).json({ error: 'Failed to fetch games data' });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});