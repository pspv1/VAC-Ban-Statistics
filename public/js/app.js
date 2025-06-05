document.addEventListener('DOMContentLoaded', () => {
    let banChart, gameChart;
    
    // Function to fetch and update ban wave data
    async function fetchBanWaveData() {
        try {
            const response = await fetch('/api/banwave');
            const data = await response.json();
            
            // Process the data for the charts
            const dailyBans = {};
            data.forEach(ban => {
                const banDate = new Date();
                banDate.setDate(banDate.getDate() - ban.DaysSinceLastBan);
                const dateKey = banDate.toISOString().split('T')[0];
                dailyBans[dateKey] = (dailyBans[dateKey] || 0) + 1;
            });

            // Sort dates and get the last 30 days
            const sortedDates = Object.keys(dailyBans).sort();
            const last30Days = sortedDates.slice(-30);
            const banCounts = last30Days.map(date => dailyBans[date] || 0);

            // Update the ban chart
            if (banChart) {
                banChart.data.labels = last30Days;
                banChart.data.datasets[0].data = banCounts;
                banChart.update();
            }

            // Update statistics
            const totalBans = data.length;
            const last30DaysBans = banCounts.reduce((a, b) => a + b, 0);
            const avgDaysSinceLastBan = Math.round(
                data.reduce((acc, ban) => acc + ban.DaysSinceLastBan, 0) / totalBans
            );

            // Update the statistics cards
            document.querySelector('.stat-card:nth-child(1) .value').textContent = totalBans.toLocaleString();
            document.querySelector('.stat-card:nth-child(2) .value').textContent = last30DaysBans.toLocaleString();
            document.querySelector('.stat-card:nth-child(3) .value').textContent = avgDaysSinceLastBan;
        } catch (error) {
            console.error('Error fetching ban wave data:', error);
        }
    }

    // Initialize the ban statistics chart
    const banCtx = document.getElementById('banChart').getContext('2d');
    banChart = new Chart(banCtx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [
                {
                    label: 'Daily Bans',
                    data: [],
                    borderColor: '#ff4655',
                    backgroundColor: 'rgba(255, 70, 85, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                }
            }
        }
    });

    // Initialize the top games chart
    const gameCtx = document.getElementById('gameChart').getContext('2d');
    gameChart = new Chart(gameCtx, {
        type: 'doughnut',
        data: {
            labels: ['Counter-Strike 2', 'Dota 2', 'Rust', 'Team Fortress 2', 'Apex Legends', 'Others'],
            datasets: [{
                data: [45, 22, 12, 8, 7, 6],
                backgroundColor: [
                    '#ff4655',
                    '#4caf50',
                    '#ff9800',
                    '#2196f3',
                    '#9c27b0',
                    '#607d8b'
                ],
                borderWidth: 0,
                hoverOffset: 15
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: '#f0f0f0',
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                }
            }
        }
    });

    // Add click handlers for buttons
    document.getElementById('searchBtn').addEventListener('click', function() {
        const steamId = document.getElementById('steamIdInput').value.trim();
        if (!steamId) {
            alert('Please enter a Steam ID');
            return;
        }
        // TODO: Implement search functionality
    });

    document.getElementById('steamBtn').addEventListener('click', function() {
        alert('Connecting to Steam...\nIn a real implementation, this would redirect to Steam authentication.');
    });

    // Add hover effects for buttons
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-3px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Fetch initial ban wave data
    fetchBanWaveData();

    // Update ban wave data every 5 minutes
    setInterval(fetchBanWaveData, 5 * 60 * 1000);
});