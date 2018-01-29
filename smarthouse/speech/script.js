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

var resultPara = document.querySelector('.result');
var diagnosticPara = document.querySelector('.output');


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
msg.rate = 0.80; // 0.1 to 10
msg.pitch = 1; //0 to 2
msg.text = text;
msg.lang = 'nb-NO';
speechSynthesis.speak(msg);

//chrome.tts.speak(text, {'lang': 'nb-NO', 'rate': 1.0});

}


mqtt_subscribe();




