"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_sonos_voice_streaming_1 = require("node-sonos-voice-streaming");
var child_process_1 = require("child_process");
var fs_1 = require("fs");
module.exports = function (RED) {
    function universalNode(config) {
        RED.nodes.createNode(this, config);
        var node = this;
        var client = new node_sonos_voice_streaming_1.client(config.url);
        console.log('connecting to' + config.url);
        client.on(node_sonos_voice_streaming_1.eventNames.audioLiveStream.ready, function () {
            console.log("ready");
            var compandArgs = 'compand 0.3,1 6:-10 15';
            if (fs_1.existsSync('/tmp/noise.prof')) {
                console.log('hello');
                client.record(("noisered /tmp/noise.prof 0.21 " + compandArgs).split(' '));
            }
            else {
                client.record(compandArgs.split(' '));
            }
            node.send({
                topic: 'ready'
            });
        });
        node.on('input', function (msg) {
            var value = parseInt(msg.payload, 10);
            if (value === 1) {
                console.log("start");
                var p_1 = child_process_1.spawn('rec', '/tmp/noise-audio.wav'.split(' '));
                setTimeout(function () {
                    p_1.kill("SIGTERM");
                    p_1.once('exit', function () {
                        console.log('create noise profile');
                        child_process_1.spawn('sox', '/tmp/noise-audio.wav -n noiseprof /tmp/noise.prof'.split(' '));
                    });
                }, 500);
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
