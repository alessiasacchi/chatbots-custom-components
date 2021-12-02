"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

module.exports = {

  metadata: () => ({
      "name": "FilteredIntent",
      "properties": {
          "supportedIntents": { "type": "string", required: true },
          "nlpVariable": { "type":"string", "required":true },
          "confidenceThreshold": { "type":"number", "required": false },
      },
      "supportedActions": [
          "unresolved",
          "fail"
      ]
  }),

  invoke: (conversation, done) => {
    if(baseUtils.isEmpty(conversation.properties().supportedIntents) || baseUtils.isEmpty(conversation.properties().nlpVariable)){
      logger.error("Action List or nlpVariable name not present!")
      conversation.transition("fail");
      done();
      return;
    }
    var threshold = (conversation.properties().confidenceThreshold !== undefined ? conversation.properties().confidenceThreshold : 0.5);
    var nlp = conversation.nlpResult(conversation.properties().nlpVariable ? conversation.properties().nlpVariable : undefined );
    var supportedIntents = conversation.properties().supportedIntents;
    //var supportedIntents = conversation.properties().supportedIntents.split(",");
    //Parse the nlp results
    var result = null;
    for(var i=0; i<nlp._nlpresult.intentMatches.summary.length; i++){
      if(nlp._nlpresult.intentMatches.summary[i].score > threshold){
        //Check if it is part of our list
        var patt = new RegExp("(^|,)[\s]*" +nlp._nlpresult.intentMatches.summary[i].intent +"($|,)");
        if(patt.test(supportedIntents)){
          result = nlp._nlpresult.intentMatches.summary[i].intent;
          break;
        }
      }
    }
    if(!result){
      conversation.transition("unresolved");
    }else{
      conversation.transition(result);
    }
    done();
  }
};

