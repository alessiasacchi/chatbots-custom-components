
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

module.exports = {

  metadata: () => ({
      "name": "util.entityMatcher",
      "properties": {
          "nlpVariable": { "type": "string", required: false },
          "entityName": { "type":"string", "required":true },
          "index": { "type":"number", "required": false },
          "variable":  { "type":"string", "required":true }
      },
      "supportedActions": [
          "success",
          "fail"
      ]
  }),

  invoke: (conversation, done) => {
    if(baseUtils.isEmpty(conversation.properties().entityName) || baseUtils.isEmpty(conversation.properties().variable)){
      logger.error("Entity Name or Variable name not present!")
      conversation.transition("fail");
      done();
      return;
    }
    var nlp = conversation.nlpResult(conversation.properties().nlpVariable ? conversation.properties().nlpVariable : undefined );
    var entityMatch = nlp.entityMatches(conversation.properties().entityName);
    if(entityMatch === undefined || entityMatch.length === 0){
      conversation.variable(conversation.properties().variable, null);
    }else{
      if(baseUtils.isEmpty(conversation.properties().index)){
        conversation.variable(conversation.properties().variable, entityMatch[0]);
      }else{
        conversation.variable(conversation.properties().variable, entityMatch[conversation.properties().index]);
      }
    }
    conversation.transition();
    done();
  }
};

