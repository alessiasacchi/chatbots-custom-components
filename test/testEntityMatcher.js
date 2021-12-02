var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var entityMatcher = require('../util/entityMatcher')

describe("Test entityMatcher Function", function(){
  it("Extracts an entity from the nlpresult of the conversation", function(done){
    var props = {
      "entityName": "myTestEntity",
      "variable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"I want a red one and a blue one",
          "entityMatches":{
            "myTestEntity": ["red", "blue"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    entityMatcher.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.variables["variableToSet"].value).to.equal('red');
      done();
    });
  });

  it("Extracts an entity from the nlpresult, specifying an index", function(done){
    var props = {
      "entityName": "myTestEntity",
      "variable" : "variableToSet",
      "index":1
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"I want a red one and a blue one",
          "entityMatches":{
            "myTestEntity": ["red", "blue"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    entityMatcher.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.variables["variableToSet"].value).to.equal('blue');
      done();
    });
  });

  it("Set variable to null, when the entity is not found", function(done){
    var props = {
      "entityName": "myOtherEntity",
      "variable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"I want a red one and a blue one",
          "entityMatches":{
            "myTestEntity": ["red", "blue"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    entityMatcher.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.variables["variableToSet"].value).to.equal(null);
      done();
    });
  });
});