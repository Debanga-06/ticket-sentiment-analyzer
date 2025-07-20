"""
Sentiment Analysis Utilities for Sentiment Watchdog

This module provides sentiment analysis functionality using both TextBlob and VADER
for comprehensive sentiment detection in support ticket messages.
"""

import re
from textblob import TextBlob
import nltk
from collections import Counter

# Download required NLTK data
try:
    nltk.data.find('tokenizers/punkt')
except LookupError:
    nltk.download('punkt')

try:
    nltk.data.find('vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

try:
    from nltk.sentiment.vader import SentimentIntensityAnalyzer
    VADER_AVAILABLE = True
except ImportError:
    print("VADER not available, using TextBlob only")
    VADER_AVAILABLE = False

# Initialize VADER analyzer if available
if VADER_AVAILABLE:
    vader_analyzer = SentimentIntensityAnalyzer()

def preprocess_text(text):
    """
    Clean and preprocess text for sentiment analysis
    
    Args:
        text (str): Raw text message
        
    Returns:
        str: Cleaned text
    """
    if not isinstance(text, str):
        return ""
    
    # Convert to lowercase and strip whitespace
    text = text.lower().strip()
    
    # Remove excessive punctuation (keep some for context)
    text = re.sub(r'[!]{2,}', '!', text)
    text = re.sub(r'[?]{2,}', '?', text)
    text = re.sub(r'[.]{2,}', '...', text)
    
    # Remove extra whitespace
    text = re.sub(r'\s+', ' ', text)
    
    return text

def get_textblob_sentiment(text):
    """
    Analyze sentiment using TextBlob
    
    Args:
        text (str): Text to analyze
        
    Returns:
        dict: Sentiment analysis results
    """
    blob = TextBlob(text)
    polarity = blob.sentiment.polarity  # Range: -1 to 1
    subjectivity = blob.sentiment.subjectivity  # Range: 0 to 1
    
    # Classify sentiment based on polarity thresholds
    if polarity > 0.2:
        sentiment = 'positive'
    elif polarity < -0.2:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    # Calculate confidence based on absolute polarity and subjectivity
    confidence = min(abs(polarity) + (subjectivity * 0.3), 1.0)
    
    return {
        'sentiment': sentiment,
        'score': round(polarity, 3),
        'confidence': round(confidence, 3),
        'subjectivity': round(subjectivity, 3),
        'method': 'textblob'
    }

def get_vader_sentiment(text):
    """
    Analyze sentiment using VADER
    
    Args:
        text (str): Text to analyze
        
    Returns:
        dict: Sentiment analysis results
    """
    if not VADER_AVAILABLE:
        return None
    
    scores = vader_analyzer.polarity_scores(text)
    compound = scores['compound']  # Range: -1 to 1
    
    # VADER classification thresholds
    if compound >= 0.05:
        sentiment = 'positive'
    elif compound <= -0.05:
        sentiment = 'negative'
    else:
        sentiment = 'neutral'
    
    # Confidence is the absolute compound score
    confidence = abs(compound)
    
    return {
        'sentiment': sentiment,
        'score': round(compound, 3),
        'confidence': round(confidence, 3),
        'positive': round(scores['pos'], 3),
        'neutral': round(scores['neu'], 3),
        'negative': round(scores['neg'], 3),
        'method': 'vader'
    }

def combine_sentiments(textblob_result, vader_result):
    """
    Combine TextBlob and VADER results for more robust analysis
    
    Args:
        textblob_result (dict): TextBlob analysis results
        vader_result (dict or None): VADER analysis results
        
    Returns:
        dict: Combined sentiment analysis
    """
    if not vader_result:
        return textblob_result
    
    # Weight the scores (VADER is generally better for social media/informal text)
    textblob_weight = 0.4
    vader_weight = 0.6
    
    combined_score = (textblob_result['score'] * textblob_weight + 
                     vader_result['score'] * vader_weight)
    
    # Determine final sentiment
    if combined_score > 0.15:
        final_sentiment = 'positive'
    elif combined_score < -0.15:
        final_sentiment = 'negative'
    else:
        final_sentiment = 'neutral'
    
    # Combine confidence scores
    combined_confidence = (textblob_result['confidence'] * textblob_weight + 
                          vader_result['confidence'] * vader_weight)
    
    return {
        'sentiment': final_sentiment,
        'score': round(combined_score, 3),
        'confidence': round(combined_confidence, 3),
        'method': 'combined',
        'textblob': textblob_result,
        'vader': vader_result
    }

def analyze_sentiment(text, method='combined'):
    """
    Main sentiment analysis function
    
    Args:
        text (str): Text to analyze
        method (str): Analysis method ('textblob', 'vader', 'combined')
        
    Returns:
        dict: Sentiment analysis results
    """
    if not text or not isinstance(text, str):
        return {
            'sentiment': 'neutral',
            'score': 0.0,
            'confidence': 0.0,
            'error': 'Invalid or empty text input'
        }
    
    # Preprocess the text
    clean_text = preprocess_text(text)
    
    if not clean_text:
        return {
            'sentiment': 'neutral',
            'score': 0.0,
            'confidence': 0.0,
            'error': 'Text became empty after preprocessing'
        }
    
    try:
        # Get TextBlob analysis
        textblob_result = get_textblob_sentiment(clean_text)
        
        # Get VADER analysis if requested and available
        vader_result = None
        if method in ['vader', 'combined'] and VADER_AVAILABLE:
            vader_result = get_vader_sentiment(clean_text)
        
        # Return results based on requested method
        if method == 'textblob':
            return textblob_result
        elif method == 'vader' and vader_result:
            return vader_result
        elif method == 'vader' and not vader_result:
            return textblob_result  # Fallback to TextBlob
        else:  # combined or default
            return combine_sentiments(textblob_result, vader_result)
            
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        return {
            'sentiment': 'neutral',
            'score': 0.0,
            'confidence': 0.0,
            'error': f'Analysis failed: {str(e)}'
        }

def get_sentiment_summary(tickets):
    """
    Generate summary statistics for a collection of tickets
    
    Args:
        tickets (list): List of ticket dictionaries
        
    Returns:
        dict: Summary statistics
    """
    if not tickets:
        return {
            'total_tickets': 0,
            'sentiment_distribution': {'positive': 0, 'neutral': 0, 'negative': 0},
            'average_sentiment_score': 0.0
        }
    
    sentiments = []
    scores = []
    
    for ticket in tickets:
        if 'sentiment_analysis' in ticket:
            analysis = ticket['sentiment_analysis']
        else:
            analysis = analyze_sentiment(ticket.get('message', ''))
        
        sentiments.append(analysis.get('sentiment', 'neutral'))
        scores.append(analysis.get('score', 0.0))
    
    sentiment_counts = Counter(sentiments)
    avg_score = sum(scores) / len(scores) if scores else 0.0
    
    return {
        'total_tickets': len(tickets),
        'sentiment_distribution': {
            'positive': sentiment_counts.get('positive', 0),
            'neutral': sentiment_counts.get('neutral', 0),
            'negative': sentiment_counts.get('negative', 0)
        },
        'sentiment_percentages': {
            'positive': round((sentiment_counts.get('positive', 0) / len(tickets)) * 100, 1),
            'neutral': round((sentiment_counts.get('neutral', 0) / len(tickets)) * 100, 1),
            'negative': round((sentiment_counts.get('negative', 0) / len(tickets)) * 100, 1)
        },
        'average_sentiment_score': round(avg_score, 3)
    }

def detect_keywords(text, sentiment):
    """
    Extract relevant keywords based on sentiment
    
    Args:
        text (str): Text to analyze
        sentiment (str): Detected sentiment
        
    Returns:
        list: List of relevant keywords
    """
    # Define keyword patterns for different sentiments
    positive_keywords = ['great', 'excellent', 'amazing', 'love', 'perfect', 'awesome', 'fantastic', 'good', 'happy', 'satisfied', 'resolved', 'quick', 'helpful']
    negative_keywords = ['terrible', 'awful', 'hate', 'worst', 'horrible', 'bad', 'broken', 'crash', 'error', 'problem', 'issue', 'bug', 'slow', 'frustrated']
    
    text_lower = text.lower()
    found_keywords = []
    
    if sentiment == 'positive':
        found_keywords = [kw for kw in positive_keywords if kw in text_lower]
    elif sentiment == 'negative':
        found_keywords = [kw for kw in negative_keywords if kw in text_lower]
    
    return found_keywords[:5]  # Return top 5 keywords