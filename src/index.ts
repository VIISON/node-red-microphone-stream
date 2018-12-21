import { Red } from 'node-red'
import { client as VoiceStreamingClient, eventNames } from 'node-sonos-voice-streaming'

module.exports = function(RED) {
    function universalNode(config) {
        RED.nodes.createNode(this, config)
        var node = this;

        const client = new VoiceStreamingClient(config.url)
        console.log('connecting to' + config.url)
        client.on(eventNames.audioLiveStream.ready, () => {
            console.log("ready")

            node.send({
                topic: 'ready'
            });
        });

        node.on('input', function(msg) {
            const value = parseInt(msg.payload, 10)
            if (value === 1) {
                console.log("start")
                client.startStream()
            } else {
                console.log("stop")
                client.recordProcess && client.recordProcess.kill('SIGTERM');
            }
        })
    }

    RED.nodes.registerType('pickware-mic-stream', universalNode);
}
