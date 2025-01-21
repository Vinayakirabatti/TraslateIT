const voiceSelect = document.querySelector('#voiceSelect');
const playButton = document.querySelector('#playButton');
const textInput = document.querySelector('textarea');
const languageSelect = document.querySelector('#languageSelect');

// Array of supported languages 
const languages =[
    {code: 'en', name: 'English'},
    {code: 'es', name: 'Spanish'},
    {code: 'fr', name: 'French'},
    {code: 'de', name: 'German'},
    {code: 'it', name: 'Italian'},
    {code: 'ja', name: 'Japanese'},
    {code: 'zh-CN', name: 'Chinese'},
    {code: 'hi', name: 'Hindi'},
    {code: 'mr', name: 'Marathi'},
    {code: 'te', name: 'Telugu'},
    {code: 'kn', name: 'kannada'},
       
];


languages.forEach(({ code, name }) => {
  const option = document.createElement('option');
  option.value = code;
  option.textContent = name;
  languageSelect.appendChild(option);
});


let voices = [];
function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = voices
    .map(
      (voice, index) =>
        `<option value="${index}">${voice.name} (${voice.lang})</option>`
    )
    .join('');
}


speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();


async function translateText(text, targetLang) {
  try {
    const response = await fetch('/api/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        text,
        target: targetLang,
      }),
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    return data.data.translations[0].translatedText;
  } catch (error) {
    console.error('Translation Error: ', error);
    alert('Failed to translate text');
    return text;
  }
}


function playText(text, voiceIndex) {
  const utterance = new SpeechSynthesisUtterance(text);
  if (voices[voiceIndex]) {
    utterance.voice = voices[voiceIndex];
  }
  speechSynthesis.speak(utterance);
}


playButton.addEventListener('click', async () => {
  const text = textInput.value.trim();
  const targetLang = languageSelect.value;
  const selectedVoiceIndex = voiceSelect.value;

  if (!text) {
    alert('Please enter some text!');
    return;
  }

  try {
    const translatedText = await translateText(text, targetLang);
    playText(translatedText, selectedVoiceIndex);
  } catch (error) {
    console.error('Error during processing: ', error);
    alert('An error occurred');
  }
});