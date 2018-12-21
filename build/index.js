"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_sonos_voice_streaming_1 = require("node-sonos-voice-streaming");
module.exports = function (RED) {
    function universalNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var client = new node_sonos_voice_streaming_1.client(config.url);
        console.log('connecting to' + config.url);
        client.on(node_sonos_voice_streaming_1.eventNames.audioLiveStream.ready, function () {
            console.log("ready");
            node.send({
                topic: 'ready'
            });
        });
        node.on('input', function (msg) {
            var value = parseInt(msg.payload, 10);
            if (value === 1) {
                console.log("start");
                client.startStream();
            }
            else {
                console.log("stop");
                client.recordProcess && client.recordProcess.kill('SIGTERM');
            }
        });
    }
    RED.nodes.registerType('pickware-mic-stream', universalNode);
};
