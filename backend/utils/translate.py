from googletrans import Translator

translator = Translator()

def detect_language(text):
    return translator.detect(text).lang

def translate_to_english(text):
    result = translator.translate(text, dest='en')
    return result.text