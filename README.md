# Speech Processing
A demo of Xelera's speech processing pipeline including speech-to-text, natural language processing, speaker recognition and speaker diarization.
The speech-to-text backend transcribes the audio stream into a text message.
The natural language processing analyzes the text message and returns noticeable attributes like word types.
The speaker diarization separates different speakers during runtime without any preexisting knowledge about them.
The speaker recognition is permanently disabled inside this demo since it would require to store voice profiles of already diarized speakers.
This demo is not saving any user data beyond an active session.
Currently only the English language is supported for speech-to-text and nlp while the speaker diarization is not language depended.

## WebSocket API
The demo application accepts a single WebSocket client connection without any sub-path, in a format like `ws://XXX.XXX.XXX.XXX:YYYY/stt`. The demo supports only a single concurrent session. Trying to open multiple client connections at the same time will lead to wrong results at best.

The input is expected in two different formats: binary and text (as JSON). Both are sent to the same WebSocket connection. The output format is always text (as JSON).

### Binary Audio Input
A simple binary packet that contains raw, uncompressed audio data. This can for example be the content of a wave file (preferably without the header). The packages can have any size, they will be buffered inside the application until they are sufficiently big to be processed.

### Text Command Input
Control commands are sent as text messages in JSON format as shown below:

```json
{
    "request": string,
    "payload": {
        "oldName": string,
        "newName": string
    }
}
```

The `request` field is always mandatory and can contain one out of four strings:
* `RESET`: Marks the end of an audio packet. The application will keep appending results until a `RESET` is received. While it will also work with longer snippets it is recommended to send a `RESET` at the end of every sentence or whenever the current speaker makes a short break.
* `FINISH`: Marks the end of a conversation. It has the same effects as `RESET` but additionally closes all connection states inside the application cleanly. It should be sent at the end of a session.
* `CLEAR`: Clears all information about speakers that have been gathered so far. Speaker information do only exist during runtime and are never permanently saved but in case the user wants to start a completely new conversation inside the same session the `CLEAR` command can be used.
* `ASSIGN`: Assigns a name to an unknown speaker using the `payload` field. The application naturally assigns increasing ids to all diarized speakers. In order to assign a name to the first speaker `oldName` needs to be set to `Speaker 0` and `newName` to whatever the speaker should be known as from that moment onwards. The assigned name persists until the session ends or the `CLEAR` command is sent. The `payload` is not required for any of the other commands.

A NodeJS example of how to use the WebSocket API is [included](examples/websocket-client/websocket-client.js).

### Text Command Output
The WebSocket replies asynchronously with text messages in JSON format as shown below:
```json
{
  requestId: integer,
  response: {
    text: string,
    nlp: {
        text: string
        ents: []
        sents: [{start: number, end: number}]
        tokens: [{id: number, start: number, end: number, pos: string, tag: string, dep: string, head: number}]
    }
    speaker: string
  },
  reset: boolean
}
```

Since the application makes use of a lot of different AI backends the responses arrive and update the provided information asynchronously. In the first response a lot of the fields will still be empty while they fill up more and more with time.
* `requestId`: Represents the information generated for a specific request. One request consists of all audio packets that have been sent between two `RESET` commands. This basically means that the requestId will be incremented after each `RESET`.
* `response`.`text`: Contains the results of the speech-to-text backend.
* `response`.`nlp`: Contains the results of the natural language processing backend. The arrays provide information about words like their type or the position inside the text.
* `response`.`speaker`: Contains the name (or id) of the diarized speaker.
* `reset`: True if it is the last response corresponding to its respective `requestId`, false if more responses for the same `requestId` are expected.

## Dashboard
Xelera has created a dashboard for demonstration purposes that contains a variety of stored audio snippets but can also be used for live tests using a microphone. It can be accessed at the same address and port as the WebSocket API: `http://XXX.XXX.XXX.XXX:YYYY/dashboard`.

## Known problems
* Too many background noises can have a negative influence on all of the speech processing backends
* Overlapping speakers have a negative influence on all of the speech processing backends
* Some audio filters, even if the difference is barely noticeable by humans, can have a negative influence on all of the speech processing backends

## Contact
If you have any questions, problems or just like to talk, feel free to write us at support@xelera.io.