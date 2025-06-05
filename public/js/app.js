document.addEventListener('DOMContentLoaded', () => {
    // Initialize the ban statistics chart
    const banCtx = document.getElementById('banChart').getContext('2d');
    const banChart = new Chart(banCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
            datasets: [
                {
                    label: 'New Bans',
                    data: [1200, 1900, 1500, 2200, 1800, 2400, 2100, 1742, 2000, 1850, 2300, 2500],
                    borderColor: '#ff4655',
                    backgroundColor: 'rgba(255, 70, 85, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Appeals Granted',
                    data: [80, 120, 90, 150, 100, 130, 110, 95, 120, 140, 100, 90],
                    borderColor: '#4caf50',
                    backgroundColor: 'rgba(76, 175, 80, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.3
                },
                {
                    label: 'Repeat Offenders',
                    data: [320, 450, 380, 510, 420, 580, 490, 520, 480, 510, 550, 600],
                    borderColor: '#ff9800',
                    backgroundColor: 'rgba(255, 152, 0, 0.1)',
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
    const gameChart = new Chart(gameCtx, {
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
});