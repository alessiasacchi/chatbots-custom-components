var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var showResults = require('../stockquery/showResults')

describe("Test showResults Function", function(){
  it("Fails when not passed items", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Fails when items is an invalid format", function(done){
    var props = {"items":"This String Should be an Array"};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Keeps the turn when the property is set", function(done){
    var props = {
      "singleItemPrompt":"",
      "items":JSON.stringify([{name: "itemOne", url:"imageURL"}]),
      "keepTurn":true
    };

    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "elements":[{
                                      "title":"itemOne",
                                      "image_url":"imageURL"
                                  }]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('singleOption');
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      expect(results.keepTurn).to.equal(true);
      done();
    });
  });

  it("Shows an image for single item", function(done){
    var props = {
      "singleItemPrompt":"",
      "items":JSON.stringify([{name: "itemOne", url:"imageURL"}])
    };

    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "elements":[{
                                      "title":"itemOne",
                                      "image_url":"imageURL"
                                  }]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('singleOption');
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      done();
    });
  });

  it("Shows an image and prompt for single item when prompt passed", function(done){
    var props = {
      "singleItemPrompt":"This is a prompt",
      "items":JSON.stringify([{name: "itemOne", url:"imageURL"}])
    };

    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "elements":[{
                                      "title":"itemOne",
                                      "image_url":"imageURL"
                                  }]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('singleOption');
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      expect(results.replies[1]).to.equal("This is a prompt");
      done();
    });
  });

  it("Shows a carousel for multiple items", function(done){
    var props = {
      "multiItemPrompt":"",
      "items":JSON.stringify([{name: "itemOne", url:"imageURL"}, {name: "itemTwo", url:"imageURLTwo"}])
    };

    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "elements":[{
                                      "title":"itemOne",
                                      "image_url":"imageURL",
                                      "buttons":[
                                        {
                                          "type":"postback",
                                          "title":"Select itemOne",
                                          "payload":"itemOne"
                                        }
                                      ]
                                  },
                                  {
                                      "title":"itemTwo",
                                      "image_url":"imageURLTwo",
                                      "buttons":[
                                        {
                                          "type":"postback",
                                          "title":"Select itemTwo",
                                          "payload":"itemTwo"
                                        }
                                      ]
                                  }
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('multipleOptions');
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      done();
    });
  });

  it("Shows a carousel and prompt for multiple items when prompt passed", function(done){
    var props = {
      "multiItemPrompt":"This is a prompt",
      "items":JSON.stringify([{name: "itemOne", url:"imageURL"}, {name: "itemTwo", url:"imageURLTwo"}])
    };

    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "elements":[{
                                      "title":"itemOne",
                                      "image_url":"imageURL",
                                      "buttons":[
                                        {
                                          "type":"postback",
                                          "title":"Select itemOne",
                                          "payload":"itemOne"
                                        }
                                      ]
                                  },
                                  {
                                      "title":"itemTwo",
                                      "image_url":"imageURLTwo",
                                      "buttons":[
                                        {
                                          "type":"postback",
                                          "title":"Select itemTwo",
                                          "payload":"itemTwo"
                                        }
                                      ]
                                  }
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('multipleOptions');
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      expect(results.replies[1]).to.equal("This is a prompt");
      done();
    });
  });

});