from flask import Blueprint, request, jsonify
from utils.sentiment import analyze_sentiment, get_sentiment_summary
import json
import os
from datetime import datetime

analyze_bp = Blueprint('analyze', __name__)

def load_tickets():
    """Load tickets from JSON file"""
    try:
        tickets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'tickets.json')
        with open(tickets_path, 'r') as f:
            return json.load(f)
    except FileNotFoundError:
        # Return sample data if file doesn't exist
        return [
            {
                "id": 1,
                "message": "The app is crashing frequently after update.",
                "timestamp": "2025-07-18T10:45:00",
                "author": "User123"
            },
            {
                "id": 2,
                "message": "Great support, my issue was resolved quickly!",
                "timestamp": "2025-07-18T11:00:00",
                "author": "User456"
            },
            {
                "id": 3,
                "message": "I'm having trouble logging in to my account.",
                "timestamp": "2025-07-18T09:30:00",
                "author": "User789"
            }
        ]
    except Exception as e:
        print(f"Error loading tickets: {e}")
        return []

def save_ticket(ticket_data):
    """Save a new ticket to the JSON file"""
    try:
        tickets = load_tickets()
        
        # Generate new ID
        new_id = max([t.get('id', 0) for t in tickets], default=0) + 1
        
        # Create ticket object
        new_ticket = {
            "id": new_id,
            "message": ticket_data['message'],
            "timestamp": datetime.now().isoformat(),
            "author": ticket_data.get('author', 'Anonymous'),
            "priority": ticket_data.get('priority', 'medium')
        }
        
        tickets.append(new_ticket)
        
        # Save to file
        tickets_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'tickets.json')
        os.makedirs(os.path.dirname(tickets_path), exist_ok=True)
        
        with open(tickets_path, 'w') as f:
            json.dump(tickets, f, indent=2)
        
        return new_ticket
    except Exception as e:
        print(f"Error saving ticket: {e}")
        return None

@analyze_bp.route('/analyze-ticket', methods=['POST'])
def analyze_ticket():
    """
    Analyze sentiment of a support ticket message (with language detection + translation)
    """
    try:
        if not request.is_json:
            return jsonify({"error": "Invalid request format. JSON required.", "code": "INVALID_FORMAT"}), 400
        
        data = request.get_json()
        message = data.get('message', '').strip()

        if not message:
            return jsonify({"error": "Message cannot be empty", "code": "EMPTY_MESSAGE"}), 400
        
        # Language Detection
        detected_lang = detect_language(message)
        translated_message = message  # default is original

        if detected_lang != 'en':
            translated_message = translate_to_english(message)

        # Sentiment Analysis on Translated Message
        sentiment_result = analyze_sentiment(translated_message)

        # Optional ticket save
        ticket_saved = False
        if data.get('save_ticket', False):
            saved_ticket = save_ticket(data)
            ticket_saved = saved_ticket is not None

        # Final Response
        return jsonify({
            "original_message": message,
            "translated_message": translated_message,
            "language_detected": detected_lang,
            "sentiment": sentiment_result['sentiment'],
            "score": sentiment_result['score'],
            "confidence": sentiment_result['confidence'],
            "ticket_saved": ticket_saved,
            "analysis_timestamp": datetime.now().isoformat()
        }), 200

    except Exception as e:
        print(f"Error in analyze_ticket: {e}")
        return jsonify({
            "error": "Internal server error during sentiment analysis",
            "code": "ANALYSIS_ERROR"
        }), 500

@analyze_bp.route('/tickets', methods=['GET'])
def get_tickets():
    """
    Retrieve all tickets with their sentiment analysis
    
    Query parameters:
    - sentiment: filter by sentiment (positive, neutral, negative)
    - limit: limit number of results (default: 50)
    """
    try:
        tickets = load_tickets()
        
        # Apply sentiment filter if provided
        sentiment_filter = request.args.get('sentiment')
        if sentiment_filter:
            sentiment_filter = sentiment_filter.lower()
            if sentiment_filter in ['positive', 'neutral', 'negative']:
                filtered_tickets = []
                for ticket in tickets:
                    analysis = analyze_sentiment(ticket['message'])
                    if analysis['sentiment'] == sentiment_filter:
                        ticket['sentiment_analysis'] = analysis
                        filtered_tickets.append(ticket)
                tickets = filtered_tickets
        else:
            # Add sentiment analysis to all tickets
            for ticket in tickets:
                ticket['sentiment_analysis'] = analyze_sentiment(ticket['message'])
        
        # Apply limit
        limit = request.args.get('limit', type=int)
        if limit and limit > 0:
            tickets = tickets[:limit]
        
        # Get summary statistics
        summary = get_sentiment_summary(tickets)
        
        return jsonify({
            "tickets": tickets,
            "total_count": len(tickets),
            "summary": summary,
            "retrieved_at": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in get_tickets: {e}")
        return jsonify({
            "error": "Internal server error while retrieving tickets",
            "code": "RETRIEVAL_ERROR"
        }), 500

@analyze_bp.route('/tickets/<int:ticket_id>', methods=['GET'])
def get_ticket_by_id(ticket_id):
    """Get a specific ticket by ID with sentiment analysis"""
    try:
        tickets = load_tickets()
        ticket = next((t for t in tickets if t['id'] == ticket_id), None)
        
        if not ticket:
            return jsonify({
                "error": f"Ticket with ID {ticket_id} not found",
                "code": "TICKET_NOT_FOUND"
            }), 404
        
        # Add sentiment analysis
        ticket['sentiment_analysis'] = analyze_sentiment(ticket['message'])
        
        return jsonify({
            "ticket": ticket,
            "retrieved_at": datetime.now().isoformat()
        }), 200
        
    except Exception as e:
        print(f"Error in get_ticket_by_id: {e}")
        return jsonify({
            "error": "Internal server error while retrieving ticket",
            "code": "RETRIEVAL_ERROR"
        }), 500