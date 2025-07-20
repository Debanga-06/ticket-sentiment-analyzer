fetch('tickets.json')
  .then(response => response.json())
  .then(data => {
    displayTickets(data);
    updateStats(data);
    createSentimentChart(data);
    console.log('✅ Sentiment Watchdog Dashboard loaded successfully!');
  })
  .catch(error => {
    console.error("Failed to load ticket data:", error);
    document.getElementById('ticketsContainer').innerHTML = `
        <div class="text-center py-8 text-red-500">
            <div class="text-4xl mb-2">❌</div>
            Error loading dashboard
        </div>
    `;
  });

// Sentiment color mapping
const sentimentColors = {
    'Anger': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        emoji: '😠'
    },
    'Joy': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        emoji: '😊'
    },
    'Confusion': {
        bg: 'bg-yellow-100',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        emoji: '🤔'
    }
};

const priorityColors = {
    'high': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
};

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInHours = Math.floor((now - time) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
}

function createTicketCard(ticket) {
    const colors = sentimentColors[ticket.sentiment];
    const priorityColor = priorityColors[ticket.priority];
    
    return `
        <div class="ticket-card p-4 border rounded-lg hover:shadow-md transition-shadow bg-white">
            <div class="flex items-start justify-between mb-3">
                <div class="flex items-center space-x-2">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors.bg} ${colors.text} ${colors.border} border">
                        ${colors.emoji} ${ticket.sentiment}
                    </span>
                    <div class="w-2 h-2 rounded-full ${priorityColor}" title="${ticket.priority} priority"></div>
                </div>
                <span class="text-xs text-gray-500">#${ticket.id}</span>
            </div>
            <p class="text-gray-700 text-sm leading-relaxed mb-3">${ticket.message}</p>
            <div class="flex items-center justify-between text-xs text-gray-500">
                <span>${formatTimeAgo(ticket.timestamp)}</span>
                <span class="capitalize">${ticket.priority} priority</span>
            </div>
        </div>
    `;
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    container.innerHTML = tickets.map(ticket => createTicketCard(ticket)).join('');
}

function updateStats(tickets) {
    const total = tickets.length;
    const urgentCount = tickets.filter(t => t.priority === 'high').length;
    const positiveCount = tickets.filter(t => t.sentiment === 'Joy').length;
    
    document.getElementById('totalTickets').textContent = total;
    document.getElementById('urgentCount').textContent = urgentCount;
    document.getElementById('positiveCount').textContent = positiveCount;
}

function createSentimentChart(tickets) {
    const sentimentCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sentimentCounts),
            datasets: [{
                data: Object.values(sentimentCounts),
                backgroundColor: [
                    '#EF4444', // Red for Anger
                    '#22C55E', // Green for Joy  
                    '#F59E0B'  // Yellow for Confusion
                ],
                borderWidth: 2,
                borderColor: '#ffffff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((value / total) * 100);
                            return `${label}: ${value} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    });
}