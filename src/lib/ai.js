const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

// OpenRouter's free tier is volatile, so we provide an array of reliable free models to auto-fallback if one is busy.
const MODELS = [
  "liquid/lfm-2.5-1.2b-instruct:free",
  "qwen/qwen3-coder:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "nousresearch/hermes-3-llama-3.1-405b:free"
];

export async function generateParagraph() {
  if (!OPENROUTER_API_KEY) throw new Error("API key missing");

  const prompt = "Generate a short, completely unique 2-sentence paragraph designed to test English pronunciation. Make it interesting (like a random fact, a tiny story, or a tongue twister). Do NOT wrap it in quotes, just return the raw text.";

  for (const model of MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "NeuralGym"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (response.ok) {
        const data = await response.json();
        return data.choices[0].message.content.trim().replace(/^"|"$/g, '');
      }
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
    }
  }
  // Fallback if all AI models fail
  return "The quick brown fox jumps over the lazy dog. This is a fallback paragraph because the AI servers are currently busy.";
}

export async function analyzePronunciation(targetText, spokenText) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing. Add it to .env.local!");
  }

  const prompt = `
You are an expert pronunciation and speech coach. I am going to give you a TARGET TEXT that a user was supposed to read aloud, and a SPOKEN TEXT which is what the speech-to-text engine heard them say.

Your job is to compare them and calculate an accuracy score (0-100) and identify which words they mispronounced, skipped, or mumbled.

Additionally, play detective: Based on the specific phonetic errors the speech-to-text engine made (e.g., confusing L and R, dropping Rs, confusing V and W), make a highly educated guess on what regional accent the user might have (e.g., Indian, British, East Asian, American, etc.). If they spoke perfectly, just say "Neutral/Native".

TARGET TEXT: "${targetText}"
SPOKEN TEXT: "${spokenText}"

Return your analysis strictly as a JSON object with this exact structure, and nothing else (no markdown formatting, no code blocks, just raw JSON):
{
  "accuracy": number, // 0 to 100
  "feedback": "A detailed 2-3 sentence feedback explaining EXACTLY which sounds/words they struggled with and how to physically move their mouth/tongue to fix it.",
  "guessedAccent": "Indian / British / American / Chinese / etc.",
  "mispronouncedWords": ["word1", "word2"] // Array of words they got wrong from the target text. Empty array if perfect.
}`;

  let lastError = null;

  // Try each model in the fallback list until one succeeds
  for (const model of MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "NeuralGym"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      let resultText = data.choices[0].message.content.trim();
      
      // Clean up markdown code blocks if the model accidentally includes them
      if (resultText.startsWith('```json')) resultText = resultText.slice(7);
      if (resultText.startsWith('```')) resultText = resultText.slice(3);
      if (resultText.endsWith('```')) resultText = resultText.slice(0, -3);

      return JSON.parse(resultText.trim()); // If successful, return instantly
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err; // Save the error and let the loop try the next model
    }
  }

  // If ALL models failed, throw the final error
  throw new Error(`All free AI models are currently busy. Try again in 30 seconds!`);
}

export async function generatePersonalityAnalysis(type, questionsAndAnswers) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing. Add it to .env.local!");
  }

  const prompt = `
You are an expert, highly empathetic personality psychologist. I just took an MBTI-style personality test.
Based on the test, my calculated personality type is: ${type}.

Here are the specific questions I answered, and how strongly I agreed or disagreed with them (Scale: 2=Strongly Agree, 1=Agree, 0=Neutral, -1=Disagree, -2=Strongly Disagree):
${questionsAndAnswers.map(qa => `- "${qa.question}": ${qa.answer}`).join('\n')}

Your job is to provide a comprehensive, personalized 3-4 paragraph psychological analysis of my personality. 
Do not just give generic ${type} traits. Specifically reference some of the key things I strongly agreed or disagreed with to explain WHY I am this way. 
Be insightful, warm, and highlight how my specific traits interact with the world. Focus on the nuances.

Return your analysis as plain text paragraphs. Do not use complex markdown, just return the raw text.
`;

  let lastError = null;

  for (const model of MODELS) {
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": window.location.href,
          "X-Title": "NeuralGym"
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }]
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errText}`);
      }

      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (err) {
      console.warn(`Model ${model} failed:`, err.message);
      lastError = err;
    }
  }

  throw new Error(`All free AI models are currently busy. Try again in 30 seconds!`);
}
