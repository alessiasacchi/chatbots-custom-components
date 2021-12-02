var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var optionsTemplate = require('../redcross/linksTemplate')

describe("Test optionsTemplate Function", function(){
  it("Fails when not passed props", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    optionsTemplate.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus(); 
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal("Prompt, urls, titles are mandatory. Titles and urls must be separated by comma");
      expect(results.transition).to.equal('fail');
      done();
    });
  });

 
 
  it("Shows a generic button template which includes one web url button", function(done){
    var props = {
      "prompt":"Just some text, I don't really care",
      "titles":"FAQ",
      "urls":"www.google.com"
    };

    var attachment = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"button",
                                  "text":"Just some text, I don't really care",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"www.google.com",
                                          "title":"FAQ"
                                        }
                                 
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    optionsTemplate.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(attachment);
      done();
    });
  });


   it("Shows a generic button template which includes two one web url buttons", function(done){
    var props = {
      "prompt":"Just some text, I don't really care",
      "titles":"FAQ,Register",
      "urls":"www.google.com,www.google.com"
    };

    var attachment = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"button",
                                  "text":"Just some text, I don't really care",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"www.google.com",
                                          "title":"FAQ"
                                        },
                                        {
                                          "type":"web_url",
                                          "url":"www.google.com",
                                          "title":"Register"
                                        }
                                 
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    optionsTemplate.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(attachment);
      done();
    });
  });


   it("Shows a generic button template which includes one call button", function(done){
    var props = {
      "prompt":"Just some text, I don't really care",
      "titles":"Call Pippo",
      "phoneNumber":"0426926756"
    };

    var attachment = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"button",
                                  "text":"Just some text, I don't really care",
                                  "buttons":[
                                        {
                                          "type":"phone_number",
                                          "title":"Call Pippo",
                                          "payload":"0426926756"
                                        }
                                 
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    optionsTemplate.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(attachment);
      done();
    });
  });

 
});