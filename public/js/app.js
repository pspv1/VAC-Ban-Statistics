document.addEventListener('DOMContentLoaded', () => {
    const ctx = document.getElementById('banChart').getContext('2d');
    
    // Your existing chart initialization code will go here
    // For now we'll just create a basic chart to ensure it works
    new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'VAC Bans',
                data: []
            }]
        },
        options: {
            responsive: true,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day'
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
});