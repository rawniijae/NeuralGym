export function startSpeechRecognition(onResult, onError, onEnd) {
  // Check for browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
    return null;
  }

  const recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US';

  let currentTranscript = '';

  recognition.onresult = (event) => {
    if (event.results.length === 0) return;

    let parts = [];
    for (let i = 0; i < event.results.length; ++i) {
      parts.push(event.results[i][0].transcript.trim());
    }

    let finalString = parts[0];
    for (let i = 1; i < parts.length; i++) {
      let prev = parts[i-1];
      let curr = parts[i];
      
      // Android Web Speech API bug: Sometimes new result chunks contain the ENTIRE previous chunk.
      // If the new chunk starts with the previous chunk, it's an accumulation bug.
      // We replace the previous chunk instead of appending it to prevent exponential duplication.
      if (prev.length > 0 && curr.toLowerCase().startsWith(prev.toLowerCase())) {
        finalString = finalString.substring(0, finalString.length - prev.length) + curr;
      } else {
        finalString += ' ' + curr;
      }
    }

    currentTranscript = finalString;
    onResult(currentTranscript.trim());
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error !== 'no-speech') {
      onError(`Microphone error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd(currentTranscript.trim());
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    onError("Failed to start recording. Please check microphone permissions.");
    return null;
  }
}
