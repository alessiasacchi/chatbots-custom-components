"use strict"

var request = require('request');
var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = {

    metadata: () => ({
        "name": "FacebookPostbackReceiver",
        "properties": {
            "tenantid": { "type": "string", "required": true },
            "channelid": { "type": "string", "required": true },
        },
        "supportedActions": [
            "success",
            "fail"
        ]
    }),

    invoke: (conversation, done) => {
        const baseUrl = 'http://bots-connectors:8000/connectors/v1/tenants/TENANT_ID/listeners/facebook/channels/CHANNEL_ID';

        var url = baseUrl.replace("TENANT_ID",conversation.variable(conversation.properties().tenantid));
        var url = url.replace("CHANNEL_ID",conversation.variable(conversation.properties().channelid));
        var custom_payload;

        logger.info('Calling out to=' + url);
        request(url, (error, response, body) => {
            if (!error && response.statusCode == 200) {
                var body = JSON.parse(body);
                // {'timestamp': 1461697120850, 'postback': {'payload': 'this is the value you get back'}, 'recipient': {'id': xxxxxxxx}, 'sender': {'id': xxxxxxxx}}
                var custom_payload = body.postback.payload;

                /*
                messaging_events = req.body.entry[0].messaging;
                for (i = 0; i < messaging_events.length; i++) {
                    var event = req.body.entry[0].messaging[i];
                    var sender = event.sender.id;
                    if (event.message && event.message.text) {
                      var text = event.message.text;
                      // Handle a text message from this sender
                    } else if (event.postback && event.postback.payload) {
                      payload = event.postback.payload;
                    } 
                } 
                */      


                if (!custom_payload.equals('')) {
                    conversation.reply({ text: custom_payload });
                }
                else {
                    logger.error("Custom Payload is empty.Unable to retrieve user selection");
                    // TO IMPLEMENT
                    conversation.transition("noSelection");
                }
            }
            else {
                logger.error("Error occurred parsing FacebookPostback");
                conversation.transition("fail");
                done();
            }
            conversation.transition();
            done();
        });
    }
};
