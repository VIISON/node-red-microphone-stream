"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_sonos_voice_streaming_1 = require("node-sonos-voice-streaming");
var fs_1 = require("fs");
module.exports = function (RED) {
    var processes = [];
    var on = false;
    function universalNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var client = new node_sonos_voice_streaming_1.client(config.url);
        console.log('connecting to ' + config.url);
        client.socket.on('authenticate', function () {
            console.log('Authenticating with server...');
            client.socket.emit('authentication', {
                username: config.username,
                password: config.password,
            });
        });
        client.socket.on(node_sonos_voice_streaming_1.eventTopics.audioLiveStream.ready, function () {
            if (!on) {
                return;
            }
            var compandArgs = 'compand 0.3,1 6:-10 15';
            var process;
            if (fs_1.existsSync('/tmp/noise.prof')) {
                process = client.record(("noisered /tmp/noise.prof 0.21 " + compandArgs).split(' '));
            }
            else {
                process = client.record(compandArgs.split(' '));
            }
            processes.push(process);
            node.send({
                topic: 'ready'
            });
        });
        node.on('input', function (msg) {
            var value = parseInt(msg.payload, 10);
            if (value === 1) {
                console.log("start");
                on = true;
                client.startStream();
            }
            else {
                on = false;
                processes.forEach(function (p) { return p.kill('SIGTERM'); });
                processes = [];
            }
        });
    }
    RED.nodes.registerType('pickware-mic-stream', universalNode);
};
