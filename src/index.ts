import { Red } from 'node-red'
import { client as VoiceStreamingClient, eventNames } from 'node-sonos-voice-streaming'
import { spawn } from 'child_process'
import { existsSync } from 'fs'

module.exports = function(RED) {
    function universalNode(config) {
        RED.nodes.createNode(this, config)
        var node = this;

        const client = new VoiceStreamingClient(config.url)
        console.log('connecting to' + config.url)
        client.on(eventNames.audioLiveStream.ready, () => {
            console.log("ready")
            let compandArgs = 'compand 0.3,1 6:-10 15'
            if (existsSync('/tmp/noise.prof')) {
                console.log('hello')
                client.record(`noisered /tmp/noise.prof 0.21 ${compandArgs}`.split(' '))
            } else {
                client.record(compandArgs.split(' '))
            }

            node.send({
                topic: 'ready'
            });
        });

        node.on('input', function(msg) {
            const value = parseInt(msg.payload, 10)
            if (value === 1) {
                console.log("start")
                let p = spawn('rec', '/tmp/noise-audio.wav'.split(' '));
                setTimeout(() => {
                    p.kill("SIGTERM")
                    p.once('exit', () => {
                        console.log('create noise profile')
                        spawn('sox', '/tmp/noise-audio.wav -n noiseprof /tmp/noise.prof'.split(' '))
                    });
                }, 500)
                client.startStream()
            } else {
                console.log("stop")
                client.recordProcess && client.recordProcess.kill('SIGTERM');
            }
        })
    }

    RED.nodes.registerType('pickware-mic-stream', universalNode);
}
