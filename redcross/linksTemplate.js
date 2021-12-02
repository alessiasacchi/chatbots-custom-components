
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();

module.exports = {

    metadata: () => ({
        "name": "redcross.linksTemplate",
        "properties": {
            "prompt": { "type":"string", "required":true },
            "titles": { "type":"string", "required":true },
            "urls": { "type":"string", "required":false },
            "phoneNumber": { "type":"string", "required":false },
        },
        "supportedActions": ["success", "fail"]
    }),

    invoke: (conversation, done) => {


      var urls = conversation.properties().urls;
      var prompt = conversation.properties().prompt;
      var titles = conversation.properties().titles;
      var phoneNumber = conversation.properties().phoneNumber;

      if(!prompt && !titles){
        conversation.reply("Prompt, urls, titles are mandatory. Titles and urls must be separated by comma");
        conversation.transition('fail');
        done();
        return;
      }


      if(conversation.channelType() === 'facebook') {
          var links = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"button",
                                  "text":prompt,
                                  "buttons":[]
                              }
                          }
                      };
          
          if ( urls ) {           
            if( titles.split(",").length >=1 && urls.split(",").length >=1 ){
                for (var i=0; i<titles.split(",").length; i++ ){
                    links.attachment.payload.buttons.push({
                                  "type":"web_url",
                                  "url":urls.split(",")[i],
                                  "title":titles.split(",")[i]
                               });
                }
            }
          }  else {
              links.attachment.payload.buttons.push({
                                  "type":"phone_number",
                                  "title":titles.split(",")[0],
                                  "payload":phoneNumber
                               });
          }               

          conversation.reply(links);
      } else {
          conversation.reply(prompt + "." + titles[0] + "-" + titles[1]);
      }    
      conversation.transition("success");
        
      done();     
      
 
  }   
}  



