const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const MODEL = "meta-llama/llama-3.2-3b-instruct:free";

export async function analyzePronunciation(targetText, spokenText) {
  if (!OPENROUTER_API_KEY) {
    throw new Error("OpenRouter API key is missing. Add it to .env.local!");
  }

  const prompt = `
You are an expert pronunciation and speech coach. I am going to give you a TARGET TEXT that a user was supposed to read aloud, and a SPOKEN TEXT which is what the speech-to-text engine heard them say.

Your job is to compare them and calculate an accuracy score (0-100) and identify which words they mispronounced, skipped, or mumbled.

TARGET TEXT: "${targetText}"
SPOKEN TEXT: "${spokenText}"

Return your analysis strictly as a JSON object with this exact structure, and nothing else (no markdown formatting, no code blocks, just raw JSON):
{
  "accuracy": number, // 0 to 100
  "feedback": "A short, encouraging 1-sentence summary of how they did",
  "mispronouncedWords": ["word1", "word2"] // Array of words they got wrong from the target text. Empty array if perfect.
}`;

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
        model: MODEL,
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

    try {
      return JSON.parse(resultText.trim());
    } catch (parseError) {
      throw new Error(`AI returned invalid format: ${resultText}`);
    }
  } catch (error) {
    console.error("AI Analysis Failed:", error);
    throw new Error(`Failed to analyze speech: ${error.message}`);
  }
}
