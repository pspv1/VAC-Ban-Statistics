document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('banChart').getContext('2d');
    
    // Sample data for the past week
    const data = [];
    const now = Date.now();
    for (let i = 6; i >= 0; i--) {
        data.push({
            x: now - (i * 24 * 60 * 60 * 1000),
            y: Math.floor(Math.random() * 100)
        });
    }

    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'VAC Bans',
                data: data,
                borderColor: '#ff4655',
                backgroundColor: 'rgba(255, 70, 85, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: '#f0f0f0'
                    }
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                },
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    ticks: {
                        color: '#b0b0b0'
                    }
                }
            }
        }
    });
});