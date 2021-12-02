var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var showResults = require('../university/offerPackage')

describe("Test offerPackage Custom Component", function(){
  it("Fails when not passed itemNames", function(done){
    var props = {
      "itemImages":"image1, image2",
      "itemUrls":"url1, url2",
      "prompt":"Hi"
    };
    var vars = {"profile.firstName":"bob"};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Fails when not passed itemImages", function(done){
    var props = {
      "itemNames":"item1, item2",
      "itemUrls":"url1, url2",
      "prompt":"Hi"
    };
    var vars = {"profile.firstName":"bob"};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Fails when not passed itemUrls", function(done){
    var props = {
      "itemNames":"item1, item2",
      "itemImages":"url1, url2",
      "prompt":"Hi"
    };
    var vars = {"profile.firstName":"bob"};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal('fail');
      expect(results.replies).to.have.lengthOf(0);
      done();
    });
  });

  it("Shortens arrays of items to the length of the shortest", function(done){
    var props = {
      "itemNames":"item1, item2, item3",
      "itemImages":"image1",
      "itemUrls":"url1, url2"
    };
    var vars = {"profile.firstName":"bob"};

    var expectedResult = {
                          "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "elements":[
                                  {
                                    "title":"item1",
                                    "image_url":"image1",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "title": "Download",
                                        "url": "url1"
                                      }
                                    ]
                                  }
                                ]
                            }
                        }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal(null);
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[2]).to.deep.equal(expectedResult);
      done();
    });
  });

  it("Works to display a single item", function(done){
    var props = {
      "itemNames":"item1",
      "itemImages":"image1",
      "itemUrls":"url1"
    };
    var vars = {"profile.firstName":"bob"};

    var expectedResult = {
                          "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "elements":[
                                  {
                                    "title":"item1",
                                    "image_url":"image1",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "title": "Download",
                                        "url": "url1"
                                      }
                                    ]
                                  }
                                ]
                            }
                        }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal(null);
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[2]).to.deep.equal(expectedResult);
      done();
    });
  });

  it("Works to display a single item, with a prompt", function(done){
    var props = {
      "itemNames":"item1",
      "itemImages":"image1",
      "itemUrls":"url1",
      "prompt":"Hi"
    };
    var vars = {"profile.firstName":"bob"};

    var expectedResult = {
                          "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "elements":[
                                  {
                                    "title":"item1",
                                    "image_url":"image1",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "title": "Download",
                                        "url": "url1"
                                      }
                                    ]
                                  }
                                ]
                            }
                        }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal(null);
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[2]).to.equal("Hi");
      expect(results.replies[3]).to.deep.equal(expectedResult);
      done();
    });
  });

  it("Works to display multiple items, with a prompt", function(done){
    var props = {
      "itemNames":"item1,item2",
      "itemImages":"image1,image2",
      "itemUrls":"url1,url2",
      "prompt":"Hi"
    };
    var vars = {"profile.firstName":"bob"};

    var expectedResult = {
                          "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "elements":[
                                  {
                                    "title":"item1",
                                    "image_url":"image1",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "title": "Download",
                                        "url": "url1"
                                      }
                                    ]
                                  },
                                  {
                                    "title":"item2",
                                    "image_url":"image2",
                                    "buttons":[
                                      {
                                        "type":"web_url",
                                        "title": "Download",
                                        "url": "url2"
                                      }
                                    ]
                                  }
                                ]
                            }
                        }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);
    showResults.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.transition).to.equal(null);
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[2]).to.equal("Hi");
      expect(results.replies[3]).to.deep.equal(expectedResult);
      done();
    });
  });

});