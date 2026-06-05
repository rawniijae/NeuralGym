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
    let text = '';
    for (let i = 0; i < event.results.length; ++i) {
      text += event.results[i][0].transcript;
    }
    currentTranscript = text;
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
