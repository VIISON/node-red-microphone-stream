import { client as VoiceStreamingClient, eventNames } from 'node-sonos-voice-streaming'

import { Red } from 'node-red'
import { existsSync } from 'fs'
import { spawn } from 'child_process'

module.exports = function(RED) {
    let processes = []
    let on = false
    function universalNode(config) {
        RED.nodes.createNode(this, config)
        var node = this;

        const client = new VoiceStreamingClient(config.url)
        console.log('connecting to ' + config.url)
        client.on(eventNames.audioLiveStream.ready, () => {
            if (!on) {
                return
            }
            let compandArgs = 'compand 0.3,1 6:-10 15'
            let process
            if (existsSync('/tmp/noise.prof')) {
                process = client.record(`noisered /tmp/noise.prof 0.21 ${compandArgs}`.split(' '))
            } else {
                process = client.record(compandArgs.split(' '))
            }
            processes.push(process)

            node.send({
                topic: 'ready'
            });
        });

        node.on('input', function(msg) {
            const value = parseInt(msg.payload, 10)
            if (value === 1) {
                console.log("start")
                // let p = spawn('rec', '/tmp/noise-audio.wav'.split(' '));
                // setTimeout(() => {
                //     p.kill("SIGTERM")
                //     p.once('exit', () => {
                //         console.log('create noise profile')
                //         spawn('sox', '/tmp/noise-audio.wav -n noiseprof /tmp/noise.prof'.split(' '))
                //     });
                // }, 500)
                on = true
                client.startStream()
            } else {
                on = false
                processes.forEach(p => p.kill('SIGTERM'))
                processes = []
            }
        })
    }

    RED.nodes.registerType('pickware-mic-stream', universalNode);
}
