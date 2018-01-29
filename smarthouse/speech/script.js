var mqtt_url = "wss://192.168.8.5:8889";
var mqsub = null;

function mqtt_subscribe() {
    
    mqsub  = mqtt.connect(mqtt_url)
    
    mqsub.subscribe("speech/tts");
    
    mqsub.on("message", function (topic, payload) {
        try {
            console.log("mqtt", topic, payload);
            if (topic === "speech/tts") {

                var text = payload;
                tts(text)

              
            }
        } catch (err) {
            console.log("mqtt err", err);
        }
    })

}


function mqtt_publish(broker, topic, payload) {
    var mqc = null;
    mqc  = mqtt.connect(broker);
    mqc.publish(topic, payload);
    mqc.end();
}

function send_mqtt_commands(broker, commands_to_send) {
    var mqc = null;
    mqc  = mqtt.connect(broker);
    var cmds = commands_to_send.split("|");
    for (var i=0; i<cmds.length; i++) {
        var tp = cmds[i].split("#");
        mqc.publish(tp[0], tp[1]);
    }
    mqc.end();
}

var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList;
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent;

var phrases = [
  'Hvor er vesken min',
  'Hvor er brillene mine',
  'slå på lyset',
  'slå av lyset',
  'Setter du på kaffen',
  'skru av kaffemaskinen',
  'Det er kaldt her',
  'Det er varmt her',
  'Kan du åpne opp døra',
  'planten trenger vann'
]

var responses = [
  'Vesken din ligger i gangen',
  'Brillene dine er på kjøkkenet',
  'OK, la det bli lys',
  'OK, jeg slår av lysene',
  '',
  '',
  '',
  '',
  '',
  ''
]

var commands = [
  'log#SearchBag',
  'log#SearchGlasses',
  'st/BL1/switch#on|st/BL2/switch#on|st/BL3/switch#on',
  'st/BL1/switch#off|st/BL2/switch#off|st/BL3/switch#off',
  'st/PL1/switch#on',
  'st/PL1/switch#off',
  'st/PL2/switch#on',
  'st/PL2/switch#off',
  'log#OpenDoor',
  'smartplant/pumpwater#5'
]

/*
var mqtttopics = [
  'speech',
  'st/BL1/switch|st/BL2/switch|st/BL3/switch',
  'st/BL1/switch|st/BL2/switch|st/BL3/switch',
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
*/

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
msg.rate = 0.75; // 0.1 to 10
msg.pitch = 1; //0 to 2
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

        send_mqtt_commands(mqtt_url, commands[i]);

      
        break;
      }
    }
    if (understood == false) {
      resultPara.textContent = 'Jeg skjønte ikke det! Prøv en gang til.';
      resultPara.style.background = 'red';
      mqtt_publish(mqtt_url, "speech", speechResult);
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
mqtt_subscribe();




