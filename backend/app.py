from flask import Flask, Response, stream_with_context
import os
import google.generativeai as genai
from dotenv import load_dotenv
from collections import defaultdict

# env shiz
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

# cfg
app = Flask(__name__)
genai.configure(api_key=GEMINI_API_KEY)
chat_sessions = defaultdict(lambda: model.start_chat())

# model
generation_config = {
  "temperature": 2, # Very unpredictable, amazing for scuffed chatbots ;)
  "top_p": 0.95,
  "top_k": 40,
  "max_output_tokens": 8192,
  "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
  model_name="gemini-2.0-flash-exp",
  generation_config=generation_config,
)

def generate_response(input_text, chat_session):
    response = chat_session.send_message(input_text, stream=True)
    for chunk in response:
        if chunk.text:
            yield chunk.text

@app.route("/<user_id>/<message>")
def chat_interface(user_id, message):
    user_session = chat_sessions[user_id]
    return Response(
        stream_with_context(generate_response(message, user_session)),
        content_type='text/plain'
    )
