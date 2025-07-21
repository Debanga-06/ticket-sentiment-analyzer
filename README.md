
# 🐾 Sentiment Watchdog – Real-Time Support Ticket Sentiment Tracker

**Sentiment Watchdog** is a real-time sentiment analysis tool built for support teams to monitor the tone of incoming tickets. By integrating NLP-powered sentiment detection with a dynamic dashboard, it helps identify frustrated users and prioritize responses.

## 🚀 Demo
 
🌐 Live URL: [Link](https://ticket-sentiment-analyzer.vercel.app) 

📂 Backend API: `/analyze`, `/tickets`, `/stats` (Flask-based)

---

## 🧠 Problem Statement

Support teams often struggle to understand the **emotion behind user tickets**. Negative sentiment buried in polite language may go unnoticed, leading to delayed resolutions and user dissatisfaction.

---

## 💡 Our Solution

Sentiment Watchdog offers:
- 🎯 Real-time ticket sentiment classification (Positive, Negative, Neutral)
- 📊 Dashboard insights: sentiment trends, critical ticket alerts
- 🔁 Easy integration with existing ticketing platforms
- 📥 Upload or stream tickets (manual or API-based)

---

## 🔧 Features

| Feature                       | Description                                                                 |
|------------------------------|-----------------------------------------------------------------------------|
| 🧠 AI Sentiment Analysis      | Powered by VADER (NLTK) or advanced transformer-based models (optional)     |
| ⚡ REST API                   | Analyze and retrieve ticket data in real-time                              |
| 📈 Visual Dashboard (Planned) | Bar charts, pie charts, and sentiment history (React-based)                |
| 🏷️ Tagging                   | Automatic tagging of negative or urgent tickets                             |

---

## 🏗️ Architecture

```
Frontend (React - Coming Soon)
       |
       v
Backend (Flask API)
  ├── /analyze (POST)
  ├── /tickets (GET)
  └── /stats (GET)
       |
       v
Sentiment Model (VADER / Custom ML)
```

---

## 🛠️ Tech Stack

- **Frontend**: HTML, JavaScript, (React – upcoming)
- **Backend**: Python, Flask, Flask-CORS
- **Sentiment Engine**: NLTK VADER, (BERT / HuggingFace optional)
- **Database**: JSON storage / MongoDB (planned)
- **Deployment**: Render / Vercel / Localhost

---

## 📦 Installation

```bash
git clone https://github.com/Debanga-06/sentiment-watchdog.git
cd sentiment-watchdog
pip install -r requirements.txt
python app.py
```

Visit: `http://localhost:5000`

---

## 🧪 API Endpoints

| Method | Endpoint      | Description                         |
|--------|---------------|-------------------------------------|
| POST   | `/analyze`    | Analyze sentiment of ticket text    |
| GET    | `/tickets`    | Retrieve all analyzed tickets       |
| GET    | `/stats`      | Get sentiment distribution summary  |

📌 Sample Request:
```json
POST /analyze
{
  "ticket": "I am very unhappy with your service!"
}
```

📌 Sample Response:
```json
{
  "sentiment": "Negative",
  "score": -0.71,
  "timestamp": "2025-07-21T14:20:33Z"
}
```

---

## 🧑‍💻 Team Members

- **Debanga** – AI Engineering Student & Full Stack Web Developer
- **Subhadip** - AI Engineering Student & Frontend Developer

---

## 📈 Future Enhancements

- ✅ Web dashboard (React.js)
- 🔒 User authentication (JWT/Firebase)
- 🔔 Email/SMS alert for critical sentiment spikes
- 🌍 Multi-language sentiment support
- 📊 Export analytics as CSV/PDF

---

## 🤝 Contributing

We welcome pull requests, issue reports, and feedback.  
Please read our [CONTRIBUTING.md](CONTRIBUTING.md) before submitting changes.

---

## 📄 License

This project is licensed under the **MIT License**.  
See the [LICENSE](LICENSE) file for details.

---

## 📬 Contact

📧 Email: debanga078@gmail.com  
🔗 GitHub: [Debanga-06](https://github.com/Debanga-06)  
🌐 Project Page: [Link](https://ticket-sentiment-analyzer.vercel.app)

---

> Built with ❤️ at AI Agent Hackathon
