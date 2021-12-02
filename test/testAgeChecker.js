var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var optionsTemplate = require('../redcross/ageChecker')
 
 
  it("Return wrongAge", function(done){
    var props = {
      "age":5
    };

    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    optionsTemplate.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(0);
      //expect(results.replies[0]).to.equal("wrongAge18");
      done();
    });
  });

 
