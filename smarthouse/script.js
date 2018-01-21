
function mqtt_publish(broker, topic, payload) {
    var mqc = null;
    mqc  = mqtt.connect(broker);
    mqc.publish(topic, payload);
    mqc.close();
}



var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var phrases = [
  'god dag',
  'slå på lyset',
  'slå av lyset',
  'skru på kaffemaskinen',
  'skru av kaffemaskinen',
  'det er lit kald',
  'det er lit varm',
  'planten trenger vann'
]

var responses = [
  'Hei på deg!',
  'OK, la det bli lys!',
  'OK, jeg slår av lysene, god natt! ',
  'OK',
  'OK',
  'OK',
  'OK',
  'OK'
]

var mqtttopics = [
  'speech',
  'st/BL1/switch',
  'st/BL1/switch',
  'st/PL1/switch',
  'st/PL1/switch',
  'st/PL2/switch',
  'st/PL2/switch',
  'smartplant/pumpwater'
]

var payloads = [
  'hello',
  'on',
  'off',
  'on',
  'off',
  'on',
  'off',
  '5'
]

var resultPara = document.querySelector('.result');
var diagnosticPara = document.querySelector('.output');
var cmds = document.querySelector('.cmds');

//cmds.appendChild(makeUL(phrases));

for (var i = 0; i < phrases.length; i++) {
  //cmds.fromHtml += phrases[i] + '<br/>'
  cmds.appendChild(document.createTextNode(phrases[i]));
  cmds.appendChild(document.createElement('br'));
}

var testBtn = document.querySelector('button');

function randomPhrase() {
  var number = Math.floor(Math.random() * phrases.length);
  return number;
}

function makeUL(array) {
    // Create the list element:
    var list = document.createElement('p');

    for(var i = 0; i < array.length; i++) {
        // Create the list item:
        var item = document.createElement('li');

        // Set its contents:
        item.appendChild(document.createTextNode(array[i]));

        // Add it to the list:
        list.appendChild(item);
    }

    // Finally, return the constructed list:
    return list;
}

function tts(text) {

  var msg = new SpeechSynthesisUtterance();
var voices = window.speechSynthesis.getVoices();

/*
for (var i = 0; i < voices.length; i++) {
  console.log('Voice ' + i + ':');
  console.log('  name: ' + voices[i].voiceName);
  console.log('  lang: ' + voices[i].lang);
  console.log('  gender: ' + voices[i].gender);
  console.log('  extension id: ' + voices[i].extensionId);
  console.log('  event types: ' + voices[i].eventTypes);
}
*/
//msg.voice = voices[1]; // Note: some voices don't support altering params
//msg.voiceURI = 'native';
//msg.volume = 1; // 0 to 1
msg.rate = 0.7; // 0.1 to 10
msg.pitch = 0.8; //0 to 2
msg.text = text;
msg.lang = 'nb-NO';
speechSynthesis.speak(msg);

//chrome.tts.speak(text, {'lang': 'nb-NO', 'rate': 1.0});

}

function testSpeech() {
  testBtn.disabled = true;
  testBtn.textContent = 'Listening...';

  var phrase = phrases[randomPhrase()];
  resultPara.textContent = '';
  resultPara.style.background = 'rgba(0,0,0,0.2)';
  diagnosticPara.textContent = '';

  // Create the grammar which contains the list of commands
  var grammar = '#JSGF V1.0; grammar command; public <command> = '
  for (var i = 0; i < phrases.length; i++) {
      grammar += phrases[i];
      if (i < phrases.length - 1) grammar += ' | '
  }
  grammar += ' ;'

  console.log('Grammar: ' + grammar);

  var recognition = new SpeechRecognition();
  var speechRecognitionList = new SpeechGrammarList();
  speechRecognitionList.addFromString(grammar, 1);
  recognition.grammars = speechRecognitionList;
  recognition.lang = 'nb-NO';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = function(event) {
    // The SpeechRecognitionEvent results property returns a SpeechRecognitionResultList object
    // The SpeechRecognitionResultList object contains SpeechRecognitionResult objects.
    // It has a getter so it can be accessed like an array
    // The first [0] returns the SpeechRecognitionResult at position 0.
    // Each SpeechRecognitionResult object contains SpeechRecognitionAlternative objects that contain individual results.
    // These also have getters so they can be accessed like arrays.
    // The second [0] returns the SpeechRecognitionAlternative at position 0.
    // We then return the transcript property of the SpeechRecognitionAlternative object
    var speechResult = event.results[0][0].transcript;
    diagnosticPara.textContent = 'Heard: ' + speechResult + ' (confidence = ' + event.results[0][0].confidence + ').';

    

    var understood = false;

    for (var i = 0; i < phrases.length; i++) {
      if(speechResult.toUpperCase() === phrases[i].toUpperCase()) {
        resultPara.textContent = responses[i];
        resultPara.style.background = 'lime';
        understood = true;
        mqtt_publish("ws://192.168.8.5:9001", mqtttopics[i], payloads[i]);
        break;
      }
    }
    if (understood == false) {
      resultPara.textContent = 'Jeg skjønte ikke det! Prøv en gang til.';
      resultPara.style.background = 'red';
      mqtt_publish("ws://192.168.8.5:9001", "speech", speechResult);
    }
    tts(resultPara.textContent);
  //  console.log('Confidence: ' + event.results[0][0].confidence);
  }

  recognition.onspeechend = function() {
    recognition.stop();
    testBtn.disabled = false;
    testBtn.textContent = 'Listen';
  }

  recognition.onerror = function(event) {
    testBtn.disabled = false;
    testBtn.textContent = 'Listen';
    diagnosticPara.textContent = 'Error occurred in recognition: ' + event.error;
  }

}

testBtn.addEventListener('click', testSpeech);
