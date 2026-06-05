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

  let finalTranscript = '';

  recognition.onresult = (event) => {
    let interimTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript + ' ';
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }
    // Pass both final and interim to the callback so the UI feels responsive
    onResult((finalTranscript + interimTranscript).trim());
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error !== 'no-speech') {
      onError(`Microphone error: ${event.error}`);
    }
  };

  recognition.onend = () => {
    onEnd(finalTranscript.trim());
  };

  try {
    recognition.start();
    return recognition;
  } catch (err) {
    onError("Failed to start recording. Please check microphone permissions.");
    return null;
  }
}
