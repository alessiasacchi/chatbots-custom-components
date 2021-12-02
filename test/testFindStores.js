var expect = require('chai').expect;
var nock = require('nock');

var Conversation = require('./conversationTester');

var findStores = require('../aldi/findStores');

/*
//Uncomment to record the calls
//process.env.CACHING_INTERNAL_CACHE_URL = "internal_instance";
nock.recorder.rec({
  dont_print: true,
  output_objects: true
});
*/
var mockServices = nock.load(__dirname +"/findStoresMocks.json");

describe("Test findStores Function", function(){
  it("Fails when not passed suburb", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus(); 
      expect(results.transition).to.equal('needMoreInfo');
      done();
    });
  });

  it("When passed suburb no state no postcode (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "location" : "Port Melbourne"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=-37.83,144.96&size=600x300&maptype=roadmap&markers=color:green|label:A|-37.8171725,144.96245479999993&markers=color:purple|label:A|-37.8587085,144.8965607" 
              }
            }
    };
    var expectedList = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172066,144.960225/@-37.8172066,144.960225,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },  
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585118,144.8940753/@-37.8585118,144.8940753,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }
          ]
        }
      }
    };


    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal("These are the closest stores to your location:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2].attachment.payload.elements).to.have.deep.members([{
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172109,144.9624137/@-37.8172109,144.9624137,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585161,144.896264/@-37.8585161,144.896264,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }]);
      done();
    });
  });   

  it("Returns a list of nearby locations and displays a map with markers when passed a lat and long", function(done){
    this.timeout(30000);

    var props = {
      "location": {
                  "latitude": -37.8585161,
                  "title": null,
                  "url": null,
                  "longitude": 144.896264
                }
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=-37.8585161,144.896264&size=600x300&maptype=roadmap&markers=color:green|label:A|-37.8171725,144.9624547&markers=color:purple|label:A|-37.8587085,144.8965607" 
              }
            }
    };
    var expectedMapCenter = "center=-37.8585161,144.896264";
    var expectedMarkerOne = "label:A|-37.8171725,144.9624547";
    var expectedMarkerTwo = "|label:A|-37.8587085,144.8965607";
    var expectedList = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172066,144.960225/@-37.8172066,144.960225,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },  
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585118,144.8940753/@-37.8585118,144.8940753,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }
          ]
        }
      }
    };


    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal("These are the closest stores to your location:");
      expect(results.replies[1].attachment.payload.url).to.include(expectedMapCenter);
      expect(results.replies[1].attachment.payload.url).to.include(expectedMarkerOne);
      expect(results.replies[1].attachment.payload.url).to.include(expectedMarkerTwo);
      expect(results.replies[2].attachment.payload.elements).to.have.deep.members([{
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172109,144.9624137/@-37.8172109,144.9624137,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585161,144.896264/@-37.8585161,144.896264,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }]);
      done();
    });  

 });



 it("When passed suburb and state (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "location" : "Port Melbourne",
      "state" : "VIC"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
    var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=-37.83,144.96&size=600x300&maptype=roadmap&markers=color:green|label:A|-37.8171725,144.96245479999993&markers=color:purple|label:A|-37.8587085,144.8965607" 
              }
            }
    };
    var expectedList = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172066,144.960225/@-37.8172066,144.960225,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },  
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585118,144.8940753/@-37.8585118,144.8940753,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }
          ]
        }
      }
    };


    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal("These are the closest stores to your location:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2].attachment.payload.elements).to.have.deep.members([{
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172109,144.9624137/@-37.8172109,144.9624137,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585161,144.896264/@-37.8585161,144.896264,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }]);
      done();
    });

  });

 it("When passed suburb and postcode (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "location" : "Port Melbourne",
      "postcode" : "3207"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=-37.83,144.96&size=600x300&maptype=roadmap&markers=color:green|label:A|-37.8171725,144.96245479999993&markers=color:purple|label:A|-37.8587085,144.8965607" 
              }
            }
    };
    var expectedList = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172066,144.960225/@-37.8172066,144.960225,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },  
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585118,144.8940753/@-37.8585118,144.8940753,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }
          ]
        }
      }
    };


    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal("These are the closest stores to your location:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2].attachment.payload.elements).to.have.deep.members([{
              "title":"Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8172109,144.9624137/@-37.8172109,144.9624137,16z",
                            "title":"Get Directions"
                          }      
                        ]
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
              "buttons":[
                          {
                            "type":"web_url",
                            "url":"https://www.google.com/maps/dir/-37.8585161,144.896264/@-37.8585161,144.896264,16z",
                            "title":"Get Directions"
                          }      
                        ]
            }]);
      done();
    });
  });

 it("if there is more than one possible match show the list of all possible matches", function(done){

    
    var props = {
      "location" : "Sunshine"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    var expectedMessage = "We've found more than one possible match:"
    
    var expectedResult = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type": "list",
                                  "top_element_style":"compact",
                                  "elements":[
                                        {
                                          "title":"Sunshine, 2264",
                                          "buttons": [
                                             {
                                              "title":"Select",
                                              "type":"postback",
                                              "payload": "Sunshine, 2264"
                                             }
                                          ]
                                        },
                                        {
                                          "title":"Sunshine, 3020",
                                          "buttons": [
                                             {
                                              "title":"Select",
                                              "type":"postback",
                                              "payload": "Sunshine, 3020"
                                             }
                                          ]
                                        }     
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    findStores.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.equal(expectedMessage);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      done();
    });

  });

  /*
  //Uncomment to create nock objects!
  after(function(){
    
    
    var nockCalls = nock.recorder.play();
    require('fs').writeFileSync("./test/mocks.json", JSON.stringify(nockCalls, null, 2));
    console.log("Wrote mocks.json!");
  });*/

 });