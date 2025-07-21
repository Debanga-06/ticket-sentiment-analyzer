from langdetect import detect
from deep_translator import GoogleTranslator

def detect_language(text):
    try:
        return detect(text)
    except Exception:
        return 'en'

def translate_to_english(text):
    try:
        lang = detect_language(text)
        if lang != 'en':
            return GoogleTranslator(source=lang, target='en').translate(text)
        return text
    except Exception:
        return text