// ✅ Backend API URL
const API_URL = 'https://ticket-sentiment-analyzer.onrender.com/api/analyze-ticket';

// ✅ Sample fallback data
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
    }
];

// ✅ DOM Ready
document.addEventListener('DOMContentLoaded', function () {
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

    // Click outside to close modal
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

// ✅ Load from JSON or fallback
async function loadDashboard() {
    try {
        const response = await fetch('https://ticket-sentiment-analyzer.onrender.com/api/tickets');
        if (!response.ok) throw new Error('Failed to fetch backend tickets');
        const data = await response.json();
        const tickets = data.tickets.map(t => ({
            id: t.id,
            message: t.message,
            sentiment: t.sentiment_analysis.sentiment || 'Neutral',
            priority: t.priority || 'medium',
            timestamp: t.timestamp
        }));
        displayTickets(tickets);
        updateStats(tickets);
        createSentimentChart(tickets);
    } catch (error) {
        console.warn('Backend unavailable, using sampleTickets');
        displayTickets(sampleTickets);
        updateStats(sampleTickets);
        createSentimentChart(sampleTickets);
    }
}

// ✅ Formatting Helpers
const sentimentColors = {
    'Anger': { bg: 'bg-red-100', text: 'text-red-800', emoji: '😠' },
    'Joy': { bg: 'bg-green-100', text: 'text-green-800', emoji: '😊' },
    'Confusion': { bg: 'bg-yellow-100', text: 'text-yellow-800', emoji: '🤔' },
    'Positive': { bg: 'bg-green-100', text: 'text-green-800', emoji: '😊' },
    'Negative': { bg: 'bg-red-100', text: 'text-red-800', emoji: '😠' },
    'Neutral': { bg: 'bg-gray-100', text: 'text-gray-800', emoji: '😐' }
};

const priorityColors = {
    'high': 'bg-red-500',
    'medium': 'bg-yellow-500',
    'low': 'bg-green-500'
};

function formatTimeAgo(timestamp) {
    const now = new Date();
    const time = new Date(timestamp);
    const diff = Math.floor((now - time) / 1000);
    if (diff < 60) return "Just now";
    const mins = Math.floor(diff / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

// ✅ Ticket display
function createTicketCard(ticket) {
    const colors = sentimentColors[ticket.sentiment] || sentimentColors['Neutral'];
    const priorityColor = priorityColors[ticket.priority] || 'bg-gray-400';
    return `
    <div class="ticket-card p-4 border rounded-lg bg-white dark:bg-white shadow-sm hover:shadow-md transition">
        <div class="flex items-center justify-between mb-2">
            <span class="inline-flex items-center px-2.5 py-0.5 text-xs font-medium ${colors.bg} ${colors.text} rounded-full">
                ${colors.emoji} ${ticket.sentiment}
            </span>
            <span class="text-xs text-gray-500 dark:text-white">#${ticket.id}</span>
        </div>
        <p class="text-sm text-gray-700 dark:text-white mb-3">${ticket.message}</p>
        <div class="flex justify-between text-xs text-gray-500 dark:text-white">
            <span>${formatTimeAgo(ticket.timestamp)}</span>
            <span class="inline-block w-2 h-2 rounded-full ${priorityColor}" title="${ticket.priority} priority"></span>
        </div>
    </div>`;
}

function displayTickets(tickets) {
    const container = document.getElementById('ticketsContainer');
    container.innerHTML = tickets.map(createTicketCard).join('');
}

function updateStats(tickets) {
    document.getElementById('totalTickets').textContent = tickets.length;
    document.getElementById('urgentCount').textContent = tickets.filter(t => t.priority === 'high').length;
    document.getElementById('positiveCount').textContent = tickets.filter(t => ['Joy', 'Positive'].includes(t.sentiment)).length;
}

let sentimentChartInstance = null;

function createSentimentChart(tickets) {
    const ctx = document.getElementById('sentimentChart').getContext('2d');
    const sentimentCounts = tickets.reduce((acc, ticket) => {
        acc[ticket.sentiment] = (acc[ticket.sentiment] || 0) + 1;
        return acc;
    }, {});

    if (sentimentChartInstance) sentimentChartInstance.destroy();

    sentimentChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(sentimentCounts),
            datasets: [{
                data: Object.values(sentimentCounts),
                backgroundColor: ['#EF4444', '#22C55E', '#F59E0B', '#6B7280'],
                borderWidth: 2,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
                            const val = ctx.parsed;
                            const pct = Math.round((val / total) * 100);
                            return `${ctx.label}: ${val} (${pct}%)`;
                        }
                    }
                }
            }
        }
    });
}

// ✅ Backend sentiment analysis
async function analyzeSentiment(text) {
    return fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            message: text,
            save_ticket: false,
            priority: 'medium',
            author: 'frontend-user'
        })
    })
        .then(response => {
            if (!response.ok) throw new Error(`Server error: ${response.status}`);
            return response.json();
        });
}


function getSentimentLabel(score) {
    if (score >= 0.05) return 'Positive';
    if (score <= -0.05) return 'Negative';
    return 'Neutral';
}

// ✅ Quick analysis (inline)
async function quickAnalyze() {
    const text = document.getElementById('quickAnalyzeText').value.trim();
    const result = document.getElementById('quickResults');
    const content = document.getElementById('quickResultsContent');
    const btn = document.getElementById('quickAnalyzeBtn');

    if (!text) return;

    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        const data = await analyzeSentiment(text);
        const label = getSentimentLabel(data.score);
        const colors = sentimentColors[label];

        content.innerHTML = `
    <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colors.bg} ${colors.text}">
        ${colors.emoji} ${label}
    </span>
    <div class="text-sm text-gray-600">Score: ${data.score.toFixed(2)}</div>
    <div class="text-sm text-gray-600">Confidence: ${(data.confidence * 100).toFixed(1)}%</div>
`;

        result.classList.remove('hidden');
    } catch (err) {
        content.innerHTML = `<span class="text-red-600">Error: ${err.message}</span>`;
        result.classList.remove('hidden');
    } finally {
        btn.textContent = 'Analyze Sentiment';
        btn.disabled = false;
    }
}

// ✅ Modal analysis
async function modalAnalyze() {
    const text = document.getElementById('modalAnalyzeText').value.trim();
    const result = document.getElementById('modalResults');
    const content = document.getElementById('modalResultsContent');
    const btn = document.getElementById('modalAnalyzeBtn');

    if (!text) return;

    btn.textContent = 'Analyzing...';
    btn.disabled = true;

    try {
        const data = await analyzeSentiment(text);
        const label = getSentimentLabel(data.score);
        const colors = sentimentColors[label];

        content.innerHTML = `
            <div class="text-center mb-2">
                <span class="inline-flex items-center px-4 py-2 rounded-full text-lg font-medium ${colors.bg} ${colors.text}">
                    ${colors.emoji} ${label}
                </span>
            </div>
            <div class="grid grid-cols-2 gap-4 text-center text-sm">
                <div><strong>${data.score.toFixed(3)}</strong><br>Score</div>
                <div><strong>${(data.confidence * 100).toFixed(1)}%</strong><br>Confidence</div>
                <div><strong>${data.sentiment}</strong><br>Type</div>
            </div>
        `;

        result.classList.remove('hidden');
    } catch (err) {
        content.innerHTML = `<span class="text-red-600">Error: ${err.message}</span>`;
        result.classList.remove('hidden');
    } finally {
        btn.textContent = '🔍 Analyze Sentiment';
        btn.disabled = false;
    }
}

// ✅ Theme toggle logic
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);

    // Optionally change icon
    const icon = document.getElementById('themeToggle');
    icon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function loadTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', saved);

    const icon = document.getElementById('themeToggle');
    icon.textContent = saved === 'dark' ? '☀️' : '🌙';
}

// ✅ Attach on DOM load
document.addEventListener('DOMContentLoaded', () => {
    loadTheme();
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
});
