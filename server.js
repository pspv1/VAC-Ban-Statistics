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

// Helper function to safely parse JSON response
async function safeJsonParse(response) {
    const contentType = response.headers.get('content-type');
    
    if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        console.error('Expected JSON but received:', contentType);
        console.error('Response body:', responseText.substring(0, 200) + '...');
        throw new Error('Steam API returned non-JSON response. This usually indicates an invalid API key or API error.');
    }
    
    try {
        return await response.json();
    } catch (jsonError) {
        const responseText = await response.text();
        console.error('Failed to parse JSON:', jsonError);
        console.error('Response body:', responseText.substring(0, 200) + '...');
        throw new Error('Steam API returned invalid JSON response');
    }
}

// Get ban wave data (last 100 bans)
app.get('/api/banwave', async (req, res) => {
    try {
        // Check if Steam API key is configured
        if (!process.env.STEAM_API_KEY) {
            console.error('STEAM_API_KEY is not configured in .env file');
            return res.status(500).json({ error: 'Steam API key not configured' });
        }

        // In a real application, you would maintain a database of Steam IDs
        // For demo purposes, we'll use a small set of random Steam IDs
        const sampleSteamIds = Array.from({ length: 100 }, () => 
            (76561197960265728n + BigInt(Math.floor(Math.random() * 1000000000))).toString()
        );

        const response = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerBans/v1/?key=${process.env.STEAM_API_KEY}&steamids=${sampleSteamIds.join(',')}`
        );
        
        // Check if the response is ok before trying to parse JSON
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Steam API error:', response.status, errorText);
            return res.status(500).json({ error: 'Steam API request failed' });
        }

        let data;
        try {
            data = await safeJsonParse(response);
        } catch (parseError) {
            console.error('Error parsing Steam API response:', parseError.message);
            return res.status(500).json({ error: parseError.message });
        }
        
        if (!data.players) {
            return res.status(404).json({ error: 'No ban data available' });
        }

        // Filter and sort banned players
        const bannedPlayers = data.players
            .filter(player => player.VACBanned || player.NumberOfGameBans > 0)
            .sort((a, b) => b.DaysSinceLastBan - a.DaysSinceLastBan);

        // Get player details for banned players
        const playerDetailsResponse = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${
                bannedPlayers.map(player => player.SteamId).join(',')
            }`
        );
        
        // Check if the player details response is ok
        if (!playerDetailsResponse.ok) {
            const errorText = await playerDetailsResponse.text();
            console.error('Steam API player details error:', playerDetailsResponse.status, errorText);
            // Return just the ban data without player details
            return res.json(bannedPlayers);
        }

        let playerDetails;
        try {
            playerDetails = await safeJsonParse(playerDetailsResponse);
        } catch (parseError) {
            console.error('Error parsing Steam API player details response:', parseError.message);
            // Return just the ban data without player details
            return res.json(bannedPlayers);
        }
        
        // Combine ban data with player details
        const enrichedBanData = bannedPlayers.map(banData => {
            const playerInfo = playerDetails.response.players.find(
                player => player.steamid === banData.SteamId
            );
            return {
                ...banData,
                playerDetails: playerInfo || null
            };
        });

        res.json(enrichedBanData);
    } catch (error) {
        console.error('Error fetching ban wave data:', error);
        res.status(500).json({ error: 'Failed to fetch ban wave data' });
    }
});

// Get player ban information
app.get('/api/bans/:steamId', async (req, res) => {
    try {
        if (!process.env.STEAM_API_KEY) {
            return res.status(500).json({ error: 'Steam API key not configured' });
        }

        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerBans/v1/?key=${process.env.STEAM_API_KEY}&steamids=${steam64Id}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Steam API error:', response.status, errorText);
            return res.status(500).json({ error: 'Steam API request failed' });
        }

        let data;
        try {
            data = await safeJsonParse(response);
        } catch (parseError) {
            console.error('Error parsing Steam API response:', parseError.message);
            return res.status(500).json({ error: parseError.message });
        }

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
        if (!process.env.STEAM_API_KEY) {
            return res.status(500).json({ error: 'Steam API key not configured' });
        }

        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v2/?key=${process.env.STEAM_API_KEY}&steamids=${steam64Id}`
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Steam API error:', response.status, errorText);
            return res.status(500).json({ error: 'Steam API request failed' });
        }

        let data;
        try {
            data = await safeJsonParse(response);
        } catch (parseError) {
            console.error('Error parsing Steam API response:', parseError.message);
            return res.status(500).json({ error: parseError.message });
        }

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
        if (!process.env.STEAM_API_KEY) {
            return res.status(500).json({ error: 'Steam API key not configured' });
        }

        const steam64Id = convertToSteam64(req.params.steamId);
        if (!steam64Id) {
            return res.status(400).json({ error: 'Invalid Steam ID format' });
        }

        const response = await fetch(
            `${STEAM_API_BASE}/IPlayerService/GetOwnedGames/v1/?key=${process.env.STEAM_API_KEY}&steamid=${steam64Id}&include_appinfo=true&include_played_free_games=true`
        );

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Steam API error:', response.status, errorText);
            return res.status(500).json({ error: 'Steam API request failed' });
        }

        let data;
        try {
            data = await safeJsonParse(response);
        } catch (parseError) {
            console.error('Error parsing Steam API response:', parseError.message);
            return res.status(500).json({ error: parseError.message });
        }

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