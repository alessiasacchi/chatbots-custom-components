var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var filteredIntent = require('../util/filteredIntent')

var sampleIntentVar = {
                    "iResult": {
                      "type": "nlpresult",
                      "value": {
                        "timeStamp": 1499264265247,
                        "intentMatches": {
                          "summary": [
                            {
                              "score": 0.890028793910992,
                              "intent": "StockQuery"
                            },
                            {
                              "score": 0.5562785927069341,
                              "intent": "Greeting"
                            }
                        ]},
                        "query": "I like your red dress",
                        "entityMatches": {
                          "Item": [
                            "dress"
                          ],
                          "Colour": [
                            "red"
                          ]
                        }
                      }
                    }
                  };

describe("Test showResults Function", function(){
  it("Fails when not passed items", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    filteredIntent.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Appropriately selects the highest intent when multiple are supported", function(done){
    var props = {
      "supportedIntents":"StockQuery,Greeting",
      "nlpVariable":"iResult"
    };
    var conversationHarness = new Conversation();
    conversationHarness.setVariables(sampleIntentVar);
    conversationHarness.setProperties(props);

    filteredIntent.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('StockQuery');
      done();
    });
  });

  it("Returns 'Greeting' even though it isn't the highest", function(done){
    var props = {
      "supportedIntents":"Greeting,otherWrongIntent",
      "nlpVariable":"iResult"
    };
    var conversationHarness = new Conversation();
    conversationHarness.setVariables(sampleIntentVar);
    conversationHarness.setProperties(props);

    filteredIntent.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('Greeting');
      done();
    });
  });

  it("Returns 'unresolved' when there are no actions that match with appropriate confidence", function(done){
    var props = {
      "supportedIntents":"StockQuery,Greeting",
      "nlpVariable":"iResult",
      "confidenceThreshold": 0.9
    };
    var conversationHarness = new Conversation();
    conversationHarness.setVariables(sampleIntentVar);
    conversationHarness.setProperties(props);

    filteredIntent.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('unresolved');
      done();
    });
  });

  it("Returns 'unresolved' when there are no actions that match", function(done){
    var props = {
      "supportedIntents":"notaRealIntent,otherWrongIntent",
      "nlpVariable":"iResult"
    };
    var conversationHarness = new Conversation();
    conversationHarness.setVariables(sampleIntentVar);
    conversationHarness.setProperties(props);

    filteredIntent.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('unresolved');
      done();
    });
  });
});