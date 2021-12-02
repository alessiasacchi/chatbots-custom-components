
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

module.exports = {

    metadata: () => ({
        "name": "stockquery.shareLocation",
        "properties": {
            "prompt": { "type":"string", "required":false },
        },
        "supportedActions": [
            "success",
            "fail"
        ]
    }),

    invoke: (conversation, done) => {
                
                var imageObj; 
                if(conversation.channelType() === 'facebook') {
                    if(!baseUtils.isEmpty(conversation.properties().prompt)){
                      conversation.reply(conversation.properties().prompt);    
                    }
                    imageObj = {
                            "text":"Please share your location:",
                            "quick_replies":[
                              {
                                "content_type":"location"
                              }
                            ]
                    };
                } else {
                    imageObj = "Share location not available on this channel";
                }
                conversation.reply(imageObj);
                conversation.transition();
               
        
        done();
    }
};

