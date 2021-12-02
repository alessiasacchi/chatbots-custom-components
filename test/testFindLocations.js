var expect = require('chai').expect;

var Conversation = require('./conversationTester');

var findLocations = require('../redcross/findLocations')

describe("Test findLocations Function", function(){
  it("Fails when not passed suburb", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    findLocations.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus(); 
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal("Suburb is mandatory - postcode and state are optional");
      expect(results.transition).to.equal('fail');
      done();
    });
  });

  it("When passed suburb no state no postcode (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "suburb" : "Port Melbourne"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=Melbourne&zoom=10&size=600x300&maptype=roadmap&markers=color:green|label:0|-37.8171725,144.96245479999993&markers=color:purple|label:1|-37.8587085,144.8965607&markers=color:yellow|label:2|-37.885623107432764,145.0219251215458&markers=color:blue|label:3|-37.834291284368916,145.05871295928955" 
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
              "subtitle":"Permanent"
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Mobile"
            },
            {
              "title": "322 Hawthorn Road, Caulfield VIC 3162 Australia",
              "subtitle":"Permanent"
            },
            {
              "title": "Camberwell Civic Precinct Parkview Room Cnr Inglesby and Camberwell Roads, Camberwell VIC 3124 Australia",
              "subtitle":"Mobile"
            }
          ]
        }
      }
    };

    var afterMapMessage = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "text": "Click below to make an appointment",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"http://www.donateblood.com.au",
                                          "title":"Make an appointment"
                                        }      
                                  ]
                              }
                          }
                      };

    findLocations.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[0]).to.equal("Below your nearest donor centres:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2]).to.deep.equal(expectedList);
      expect(results.replies[3]).to.deep.equal(afterMapMessage);
      done();
    });     

 });



 it("When passed suburb and state (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "suburb" : "Sunshine",
      "state" : "NSW"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=Melbourne&zoom=10&size=600x300&maptype=roadmap&markers=color:green|label:0|-37.71487302341949,144.89097833633423&markers=color:purple|label:1|-37.8587085,144.8965607&markers=color:yellow|label:2|-37.8171725,144.96245479999993&markers=color:blue|label:3|-37.902841,144.660079" 
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
              "title":"93 Matthews Avenue, Airport West VIC 3042 Australia",
              "subtitle":"Permanent"
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Mobile"
            },
            {
              "title": "Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Permanent"
            },
            {
              "title": "7 Bridge Street, Werribee VIC 3030 Australia",
              "subtitle":"Permanent"
            }
          ]
        }
      }
    };    

    var afterMapMessage = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "text": "Click below to make an appointment",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"http://www.donateblood.com.au",
                                          "title":"Make an appointment"
                                        }      
                                  ]
                              }
                          }
                      }; 

    findLocations.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[0]).to.equal("Below your nearest donor centres:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2]).to.deep.equal(expectedList);
      expect(results.replies[3]).to.deep.equal(afterMapMessage);
      done();
    });

  });

 it("When passed suburb and postcode (one match found) returns a list of nearby locations and displays a map with markers", function(done){
    this.timeout(30000);

    var props = {
      "suburb" : "Sunshine",
      "postcode" : "3020"
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    
   var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=Melbourne&size=600x300&maptype=roadmap&markers=color:green|label:1|-37.71487302341949,144.89097833633423&markers=color:purple|label:2|-37.8587085,144.8965607&markers=color:yellow|label:3|-37.8171725,144.96245479999993&markers=color:blue|label:4|-37.902841,144.660079" 
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
              "title":"93 Matthews Avenue, Airport West VIC 3042 Australia",
              "subtitle":"Permanent"
            },
            {
              "title": "104 Ferguson Street, Williamstown VIC 3016 Australia",
              "subtitle":"Mobile"
            },
            {
              "title": "Level 1 367 Collins St, Melbourne VIC 3000 Australia",
              "subtitle":"Permanent"
            },
            {
              "title": "7 Bridge Street, Werribee VIC 3030 Australia",
              "subtitle":"Permanent"
            }
          ]
        }
      }
    };   

    var afterMapMessage = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"generic",
                                  "text": "Click below to make an appointment",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"http://www.donateblood.com.au",
                                          "title":"Make an appointment"
                                        }      
                                  ]
                              }
                          }
                      };   

    findLocations.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[0]).to.equal("Below your nearest donor centres:");
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2]).to.deep.equal(expectedList);
      expect(results.replies[3]).to.deep.equal(afterMapMessage);
      done();
    });

  });

 it("if there is more than one possible match show the list of all possible matches", function(done){

    
    var props = {
      "suburb" : "Sunshine"
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
                                          "type":"postback",
                                          "title":"Sunshine, 3020, VIC",
                                          "payload":"Sunshine, 3020, VIC"
                                        },
                                        {
                                          "type":"postback",
                                          "title":"Sunshine, 2264, NSW",
                                          "payload":"Sunshine, 2264, NSW"
                                        }      
                                  ]
                              }
                          }
                      };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    findLocations.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.equal(expectedMessage);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      done();
    });

  });

 });