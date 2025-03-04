// Test script for fallback synthesizer
const { synthesizeFromResults } = require('./src/utils/fallbackSynthesizer');
const fs = require('fs');

// Raw search results example
const results = [
  {
    "title": "Making AI helpful for everyone - Google AI - Google AI",
    "url": "https://ai.google/",
    "snippet": "Google AI on Android reimagines your mobile device experience, helping you be more creative, get more done, and stay safe with powerful protection from Google.",
    "source": "web",
    "type": "organic",
    "relevanceScore": 0.8500000000000001
  },
  {
    "title": "OpenAI",
    "url": "https://openai.com/",
    "snippet": "We believe our research will eventually lead to artificial general intelligence, a system that can solve human-level problems. Building safe and beneficial ...",
    "source": "web",
    "type": "organic",
    "relevanceScore": 0.8400000000000001
  },
  {
    "title": "AI Chat - DeepAI",
    "url": "https://deepai.org/chat",
    "snippet": "AI Chat is an AI chatbot that writes text. You can use it to write stories, messages, or programming code. You can use the AI chatbot as a virtual tutor in ...",
    "source": "web",
    "type": "organic",
    "relevanceScore": 0.8400000000000001
  },
  {
    "title": "AI | University of Florida",
    "url": "https://ai.ufl.edu/",
    "snippet": "AI for Everyone, Everywhere. We integrate AI into education, research and industry collaborations across all disciplines, from healthcare to agriculture and ...",
    "source": "web",
    "type": "organic",
    "relevanceScore": 0.8200000000000001
  },
  {
    "title": "‎Gemini - chat to supercharge your ideas",
    "url": "https://gemini.google.com/",
    "snippet": "Bard is now Gemini. Get help with writing, planning, learning, and more from Google AI.",
    "source": "web",
    "type": "organic",
    "relevanceScore": 0.81
  }
];

// Test the synthesizer
const query = "AI platforms and tools";
const synthesizedResult = synthesizeFromResults(query, results);

// Output the result
console.log("SYNTHESIZED RESULT:");
console.log(JSON.stringify(synthesizedResult, null, 2));

// Save to a file for inspection
fs.writeFileSync('synthesized-output.json', JSON.stringify(synthesizedResult, null, 2));
console.log("Results also saved to synthesized-output.json");
