"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var request = require('request');

module.exports = {

    metadata: () => ({
        "name": "orderumbrella.send_email",
        "properties": {
          "email": { "type": "string", "required": true},
          "topic": { "type": "string", "required": true},
          "successPrompt": { "type": "string", "required": false}
        },
        "supportedActions": ["success","fail"]
    }),

    invoke: (conversation, done) => {

      var successPrompt;

      if(!conversation.properties().email || conversation.properties().email.length === 0 ){
          conversation.reply("email and topic are mandatory");
          conversation.transition('fail');
          done();
          return;
      }

      if(!conversation.properties().topic || conversation.properties().topic.length === 0 ){
          conversation.reply("email and topic are mandatory")
          conversation.transition('fail');
          done();
          return;
      }

      if(!conversation.properties().successPrompt || conversation.properties().successPrompt.length === 0 ){
          successPrompt = "Email Sent! We appreciate your interest in our Cloud, I'm here to help if you need me again!";
      } else {
          successPrompt = conversation.properties().successPrompt;
      }

      var email = conversation.properties().email;
      var topic; 

      switch(conversation.properties().topic){
        case "Integration Cloud": 
          topic = "integration";
          break;
        case "Mobile & Chatbots":
          topic = "chatbot";
          break;
        case "Customer Experience":
          topic = "CX";
          break;
        case "Blockchain":
          topic = "blockchain";
          break;
        default:
          topic = conversation.properties().topic;
      }


      // call SendEmail service
      callSendEmailService(email, topic, function(err, responseError){

        if(err){
            conversation.reply("We could not send out the email. Sorry for the inconvenience, please try again later");  
            conversation.transition();
            done();
            return;
          }

        if (responseError) {
          conversation.reply(responseError);
        }else{
          conversation.reply(successPrompt);
        }
        conversation.transition();
        done();
        return;
      });
    }
}

function callSendEmailService(email, topic, callback){

var options = { method: 'POST',
  url: 'https://apis4saas-gse00011671.apaas.us2.oraclecloud.com/notification/promos',
  qs: { solution: topic, method: 'email' },
  headers: 
    {'content-type': 'application/json'},
  body: 
   { Method: 
      { Mobile: '61xxxxx',
        Email: email,
        Address: '417 St. Kilda Rd, 3004, Melbourne, Victoria, Australia' } },
  json: true };

  request(options, function (error, response, body) {
     if(error){
        callback(error);
        return;
      }
      callback(null, checkResponseError(body));
  });
}    

function checkResponseError(responseBody){
  console.info(JSON.stringify(responseBody));
  return (responseBody.Error ? responseBody.Error : null)
}

