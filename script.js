
// Configuration
const API_URL = 'https://ticket-sentiment-analyzer.onrender.com';

// Sample data (fallback if backend is not available)
const sampleTickets = [
    {
        id: "001",
        message: "I absolutely love this new feature! It works perfectly and saves me so much time. Great job!",
        sentiment: "Joy",
        priority: "low",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "002", 
        message: "This is completely broken! I've been trying for hours and nothing works. Very frustrated!",
        sentiment: "Anger",
        priority: "high",
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
    },
    {
        id: "003",
        message: "I'm not sure how to use this feature. The documentation is unclear and I'm confused about the next steps.",
        sentiment: "Confusion",
        priority: "medium", 
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "004",
        message: "Thank you for the quick response! The solution worked perfectly. Excellent support team!",
        sentiment: "Joy",
        priority: "low",
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
    },
    {
        id: "005",
        message: "The system keeps crashing when I try to upload files. This is blocking my work completely!",
        sentiment: "Anger", 
        priority: "high",
        timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString()
    }
];

// Initialize dashboard
document.addEventListener('DOMContentLoaded', function() {
    loadDashboard();
    setupEventListeners();
});

function setupEventListeners() {
    document.getElementById('refreshBtn').addEventListener('click', loadDashboard);
    document.getElementById('analyzeNewBtn').addEventListener('click', () => {
        document.getElementById('analyzeModal').classList.remove('hidden');
        document.getElementById('analyzeModal').classList.add('flex');
    });
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('quickAnalyzeBtn').addEventListener('click', quickAnalyze);
    document.getElementById('modalAnalyzeBtn').addEventListener('click', modalAnalyze);
    
    // Close modal on background click
    document.getElementById('analyzeModal').addEventListener('click', (e) => {
        if (e.target.id === 'analyzeModal') closeModal();
    });
}

function closeModal() {
    document.getElementById('analyzeModal').classList.add('hidden');
    document.getElementById('analyzeModal').classList.remove('flex');
    document.getElementById('modalResults').classList.add('hidden');
    document.getElementById('modalAnalyzeText').value = '';
}

function setModalExample(text) {
    document.getElementById('modalAnalyzeText').value = text;
}

async function loadDashboard() {
    try {
        // Try to load from JSON file first
        const response = await fetch('tickets.json');
        if (response.ok) {
            const data = await response.json();
            displayTickets(data);
            updateStats(data);
            createSentimentChart(data);
            console.log('✅ Dashboard loaded from tickets.json');
        } else {
            throw new Error('tickets.json not found');
        }
    } catch (error) {
        console.log('📝 Loading sample data (tickets.json not found)');
        displayTickets(sampleTickets);
        updateStats(sampleTickets);
        createSentimentChart(sampleTickets);
    }
}

// Your existing functions with some enhancements
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
    },
    'Positive': {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-200',
        emoji: '😊'
    },
    'Negative': {
        bg: 'bg-red-100',
        text: 'text-red-800',
        border: 'border-red-200',
        emoji: '😠'
    },
    'Neutral': {
        bg: 'bg-gray-100',
        text: 'text-gray-800',
        border: 'border-gray-200',
        emoji: '😐'
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
    const colors = sentimentColors[ticket.sentiment] || sentimentColors['Neutral'];
    const priorityColor = priorityColors[ticket.priority] || priorityColors['medium'];
    
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
    const positiveCount = tickets.filter(t => t.sentiment === 'Joy' || t.sentiment === 'Positive').length;
    
    document.getElementById('totalTickets').textContent = total;
    document.getElementById('urgentCount').textContent = urgentCount;
    document.getElementById('positiveCount').textContent = positiveCount;
}

let sentimentChartInstance = null;

function createSentimentChart(tickets) {
    const sentimentCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
        return acc;
    }, {});

    const ctx = document.getElementById('sentimentChart').getContext('2d');
    
    // Destroy existing chart if it exists
    if (sentimentChartInstance) {
        sentimentChartInstance.destroy();
    }
    
    sentimentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sentimentCounts),
            datasets: [{
                data: Object.values(sentimentCounts),
                backgroundColor: [
                    '#EF4444', // Red for Anger/Negative
                    '#22C55E', // Green for Joy/Positive  
                    '#F59E0B', // Yellow for Confusion
                    '#6B7280'  // Gray for Neutral
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

async function quickAnalyze() {
    const text = document.getElementById('quickAnalyzeText').value.trim();
    if (!text) return;

    const btn = document.getElementById('quickAnalyzeBtn');
    const results = document.getElementById('quickResults');
    
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        const sentiment = await analyzeSentiment(text);
        displayQuickResults(sentiment);
        results.classList.remove('hidden');
    } catch (error) {
        console.error('Analysis failed:', error);
        document.getElementById('quickResultsContent').innerHTML = 
            '<div class="text-red-600">Analysis failed. Check if backend is running.</div>';
        results.classList.remove('hidden');
    } finally {
        btn.textContent = 'Analyze Sentiment';
        btn.disabled = false;
    }
}

async function modalAnalyze() {
    const text = document.getElementById('modalAnalyzeText').value.trim();
    if (!text) return;

    const btn = document.getElementById('modalAnalyzeBtn');
    const results = document.getElementById('modalResults');
    
    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        const sentiment = await analyzeSentiment(text);
        displayModalResults(sentiment);
        results.classList.remove('hidden');
    } catch (error) {
        console.error('Analysis failed:', error);
        document.getElementById('modalResultsContent').innerHTML = 
            '<div class="text-red-600">Analysis failed. Check if backend is running.</div>';
        results.classList.remove('hidden');
    } finally {
        btn.textContent = '🔍 Analyze Sentiment';
        btn.disabled = false;
    }
}

async function analyzeSentiment(text) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: text })
    });
    
    if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
    }
    
    return await response.json();
}

function getSentimentLabel(compound) {
    if (compound >= 0.05) return 'Positive';
    if (compound <= -0.05) return 'Negative';
    return 'Neutral';
}

function displayQuickResults(data) {
    const sentiment = getSentimentLabel(data.compound);
    const colors = sentimentColors[sentiment];
    
    document.getElementById('quickResultsContent').innerHTML = `
        <div class="flex items-center space-x-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}">
                ${colors.emoji} ${sentiment}
            </span>
            <div class="text-sm text-gray-600">
                Score: <strong>${data.compound.toFixed(2)}</strong>
            </div>
        </div>
    `;
}

function displayModalResults(data) {
    const sentiment = getSentimentLabel(data.compound);
    const colors = sentimentColors[sentiment];
    
    document.getElementById('modalResultsContent').innerHTML = `
        <div class="text-center mb-4">
            <span class="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${colors.bg} ${colors.text}">
                ${colors.emoji} ${sentiment}
            </span>
        </div>
        <div class="grid grid-cols-2 gap-4">
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-900">${data.compound.toFixed(3)}</div>
                <div class="text-sm text-gray-600">Compound Score</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-green-600">${(data.pos * 100).toFixed(1)}%</div>
                <div class="text-sm text-gray-600">Positive</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-red-600">${(data.neg * 100).toFixed(1)}%</div>
                <div class="text-sm text-gray-600">Negative</div>
            </div>
            <div class="text-center">
                <div class="text-2xl font-bold text-gray-600">${(data.neu * 100).toFixed(1)}%</div>
                <div class="text-sm text-gray-600">Neutral</div>
            </div>
        </div>
    `;
}