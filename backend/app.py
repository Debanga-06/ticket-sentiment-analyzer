from flask import Flask
from flask_cors import CORS
from routes.analyze import analyze_bp
import os

def create_app():
    """Application factory pattern for Flask app creation"""
    app = Flask(__name__)
    
    # Enable CORS for all domains and routes
    CORS(app, resources={
        r"/api/*": {
            "origins": "*",
            "methods": ["GET", "POST", "PUT", "DELETE"],
            "allow_headers": ["Content-Type", "Authorization"]
        }
    })
    
    # Register blueprints
    app.register_blueprint(analyze_bp, url_prefix='/api')
    print("✅ Blueprint 'analyze_bp' registered at /api")

    
    # Health check endpoint
    @app.route('/health')
    def health_check():
        return {"status": "healthy", "message": "Sentiment Watchdog Backend is running!"}
    
    # Root endpoint
    @app.route('/')
    def root():
        return {
            "service": "Sentiment Watchdog Backend",
            "version": "1.0.0",
            "endpoints": {
                "analyze_ticket": "/api/analyze-ticket (POST)",
                "get_tickets": "/api/tickets (GET)",
                "health": "/health (GET)"
            }
        }
    
    return app

# Create the app instance at module level for Gunicorn
app = create_app()

if __name__ == '__main__':
    # Get port from environment variable or default to 5000
    port = int(os.environ.get('PORT', 5001))
    
    print(f"🚀 Starting Sentiment Watchdog Backend on port {port}")
    print(f"📊 Dashboard API available at: http://localhost:{port}")
    print(f"🔍 Analyze endpoint: http://localhost:{port}/api/analyze-ticket")
    
    app.run(
        host='0.0.0.0',
        port=port,
        debug=True
    )
