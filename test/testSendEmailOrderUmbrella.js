var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var sendEmail = require('../paas4saas/send_email.js')
 
 
  it("Returns emailSentSuccessfully", function(done){
    this.timeout(30000);
    var props = {
      "email": "alessia.sacchi@gmail.com",
      "topic": "integration"
    };

    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    sendEmail.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal("Email Sent! We appreciate your interest in our Cloud, I'm here to help if you need me again!");
      done();
    });
  });


it("Returns unableToSendEmail", function(done){
  this.timeout(30000);
    var props = {
      "email": "alessia.sacchi@gmail.com",
      "topic": "Sausages"
    };

    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    sendEmail.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal("The Solution that you sent is not available, please choose from: integration, chatbot, blockchain, erp, cx and hcm. Thank you.");
      done();
    });
  });

it("Return missingMandatoryProps", function(done){
    var props = {};

    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    sendEmail.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal("email and topic are mandatory");
      done();
    });
  });
 
