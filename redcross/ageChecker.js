"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = {

    metadata: () => ({
        "name": "redcross.ageChecker",
        "properties": {
            "age": { "type": "integer", "required": true }
        },
        "supportedActions": [
            "wrongAge18",
            "rightAge",
            "wrongAge70"
        ]
    }),

    invoke: (conversation, done) => {
        // Parse a number out of the incoming message
        var age = conversation.properties().age;

        if(!age){
          conversation.reply("Age is mandatory");
          conversation.transition('fail');
          done();
          return;
        }

        if(age < 18){
          conversation.transition("wrongAge18");
          console.log("too young");
          done();
          return;
        }
        if(age > 70){
          conversation.transition("wrongAge70");
          done();
          return;
        }
        conversation.transition("rightAge");  
        console.log("right");
        done();
    }
};
