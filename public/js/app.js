// API endpoints
const API_BASE = 'http://localhost:3000/api';

// Initialize the ban statistics chart
const banCtx = document.getElementById('banChart').getContext('2d');
const banChart = new Chart(banCtx, {
    // Previous chart configuration remains the same
});

// Initialize the top games chart
const gameCtx = document.getElementById('gameChart').getContext('2d');
const gameChart = new Chart(gameCtx, {
    // Previous chart configuration remains the same
});

// Player ban history chart
const playerBanCtx = document.getElementById('playerBanChart').getContext('2d');
const playerBanChart = new Chart(playerBanCtx, {
    // Previous chart configuration remains the same
});

// Search functionality
async function searchPlayer(steamId) {
    try {
        // Fetch player summary
        const playerResponse = await fetch(`${API_BASE}/player/${steamId}`);
        const playerData = await playerResponse.json();

        // Fetch ban information
        const banResponse = await fetch(`${API_BASE}/bans/${steamId}`);
        const banData = await banResponse.json();

        // Fetch games
        const gamesResponse = await fetch(`${API_BASE}/games/${steamId}`);
        const gamesData = await gamesResponse.json();

        // Update UI with player data
        updatePlayerUI(playerData, banData, gamesData);
    } catch (error) {
        console.error('Error fetching player data:', error);
        alert('Failed to fetch player data. Please try again.');
    }
}

function updatePlayerUI(playerData, banData, gamesData) {
    // Show player info section
    document.getElementById('playerInfoSection').style.display = 'flex';

    // Update player details
    document.getElementById('playerName').textContent = playerData.personaname;
    document.getElementById('playerSteamId').textContent = playerData.steamid;
    document.getElementById('playerAvatar').src = playerData.avatarfull;

    // Update ban information
    document.getElementById('vacBans').textContent = banData.NumberOfVACBans;
    document.getElementById('gameBans').textContent = banData.NumberOfGameBans;
    document.getElementById('daysSinceBan').textContent = banData.DaysSinceLastBan || '-';

    // Update games table
    updateGamesTable(gamesData);
}

function updateGamesTable(games) {
    const tableBody = document.querySelector('.table-container tbody');
    tableBody.innerHTML = '';

    games.slice(0, 10).forEach(game => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${game.name}</td>
            <td>${Math.round(game.playtime_forever / 60)}</td>
            <td>${formatLastPlayed(game.rtime_last_played)}</td>
            <td><span class="badge badge-success">Clean</span></td>
        `;
        tableBody.appendChild(row);
    });
}

function formatLastPlayed(timestamp) {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
}

// Event listeners
document.getElementById('searchBtn').addEventListener('click', function() {
    const steamId = document.getElementById('steamIdInput').value.trim();
    if (!steamId) {
        alert('Please enter a Steam ID');
        return;
    }
    searchPlayer(steamId);
});

// Tab functionality
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', function() {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        this.classList.add('active');
        document.getElementById(this.dataset.tab + 'Tab').classList.add('active');
    });
});

// Button hover effects
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-3px)';
    });
    
    button.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0)';
    });
});