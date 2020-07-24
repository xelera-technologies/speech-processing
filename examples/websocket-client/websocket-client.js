const WebSocket = require('ws')
const fs = require("fs");
const wav = require('node-wav');



function sendAudio(buffer) {
    connection.send(buffer)
}

function assignSpeaker(oldName, newName) {
    var msg = {
        request: "ASSIGN",
        payload: {
            oldName: oldName,
            newName: newName,
        }
    };
    connection.send(JSON.stringify(msg))
}

function clearStream() {
    var msg = {
        request: "CLEAR"
    };
    connection.send(JSON.stringify(msg))
}

function finishStream() {
    var msg = {
        request: "FINISH"
    };
    connection.send(JSON.stringify(msg))
}

function resetStream() {
    var msg = {
        request: "RESET"
    };
    connection.send(JSON.stringify(msg))
}



// Read audio file
var buffer = fs.readFileSync("example.wav");

// Decode audio buffer
var result = wav.decode(buffer);
if (result.sampleRate < 16000 || result.sampleRate > 16000) {
    console.error('Warning: Original sample rate (' + result.sampleRate + ') is lower than 16kHz. Up-sampling might produce erratic speech recognition.');
}

function sleep(ms) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, ms);
    });
}

// Connect WebSocket
const url = 'ws://127.0.0.1:9870/stt'
const connection = new WebSocket(url)

// Receive answer
connection.onmessage = e => {
    console.log(JSON.parse(e.data));
}

async function asyncMain() {
    await sleep(2000);
    sendAudio(buffer);
    await sleep(2000);
    resetStream();
    await sleep(2000);
    assignSpeaker("Speaker 0", "Max");
    await sleep(2000);
    sendAudio(buffer);
    await sleep(2000);
    resetStream();
    await sleep(2000);
    clearStream();
    await sleep(2000);
    sendAudio(buffer);
    await sleep(2000);
    resetStream();
    await sleep(2000);
    finishStream();
    await sleep(2000);
}

connection.onopen = () => {
    asyncMain().then();   
}

connection.onclose = () => {
    console.log('finish');
}
