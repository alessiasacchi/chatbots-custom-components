const expect = require('chai').expect;
const sinon = require('sinon');

var Conversation = require('./conversationTester');

var appointmentsHandler = require('../redcross/appointmentsHandler');

var clock;

describe("Test appointmentsHandler Function", function(){


  it("Fails when donor centre is not found", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);

    var expectedString = "Unfortunately we could not find a match for the requested donor centre";
    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedString);
      done();
    });
  });

it("Returns a map of how to get to the donor centre if there's availability on the requested date and time - date/time set in the conversation", function(done){

    clock = sinon.useFakeTimers(new Date(2017, 11, 06, 9, 0, 0, 0));

    var variables = {
      "date": {
          "value":{
              "date": 1510563600000,
              "entityName": "DATE",
              "originalString": "Monday morning at 9:00 AM"
            }
          },
      "time": {
        "value":{
              "mins": 0,
              "entityName": "TIME",
              "secs": 0,
              "hrs": 9,
              "originalString": "9 AM"
            }
        }      
    };

    var props = {
      "donorCentre" : "Melbourne CBD Blood Donor Centre",
      "dateVariable" : "date",
      "timeVariable" : "time"
    };
   
    var conversationHarness = new Conversation();
    conversationHarness.setVariables(variables);  
    conversationHarness.setProperties(props);
      

    var expectedString = "Melbourne CBD Blood Donor Centre is available on Monday morning at 9:00 AM.Here's how you get there:";
    var expectedResult = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":"Melbourne CBD Blood Donor Centre",
                          "image_url":"https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=-37.8172109,144.9624137&zoom=13&markers=-37.8172109,144.9624137",
                          "subtitle":"Monday morning at 9:00 AM available - Address: Level 1, 367, Collins St, Melbourne VIC 3000",
                          "buttons":[
                            {
                              "type":"web_url",
                              "url":"https:\/\/www.google.com\/maps\/dir\/\/-37.8172109,144.9624137\/@-37.8172109,144.9624137,16z",
                              "title":"Get Directions"
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };

     var message = "Would you like me to book you in?";    

    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      expect(results.replies[2]).to.equal(message);
      clock.restore();
      done();
    });

  });



it("Returns a map of how to get to the donor centre if there's availability on the requested date and time", function(done){

    clock = sinon.useFakeTimers(new Date(2017, 11, 06, 9, 0, 0, 0));

    var props = {
      "donorCentre" : "Melbourne CBD Blood Donor Centre"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"Can I schedule an appointment at Melbourne CBD Blood Donor Centre on Monday morning at 9:00 AM?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1510563600000,
                "originalString": "Monday morning at 9:00 AM",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 9,
                "mins": 0,
                "secs": 0,
                "originalString": "Monday morning at 9:00 AM",
                "hourFormat": "AM",
                "entityName": "TIME"
              }
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedString = "Melbourne CBD Blood Donor Centre is available on Monday morning at 9:00 AM.Here's how you get there:";
    var expectedResult = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":"Melbourne CBD Blood Donor Centre",
                          "image_url":"https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=-37.8172109,144.9624137&zoom=13&markers=-37.8172109,144.9624137",
                          "subtitle":"Monday morning at 9:00 AM available - Address: Level 1, 367, Collins St, Melbourne VIC 3000",
                          "buttons":[
                            {
                              "type":"web_url",
                              "url":"https:\/\/www.google.com\/maps\/dir\/\/-37.8172109,144.9624137\/@-37.8172109,144.9624137,16z",
                              "title":"Get Directions"
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };

    var message = "Would you like me to book you in?";       

    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      expect(results.replies[2]).to.equal(message);
      clock.restore();
      done();
    });

  });



 it("Returns a list of nearby centres if the preferred one is fully booked on the requested date and time", function(done){

    clock = sinon.useFakeTimers(new Date(2017, 11, 07, 8, 0, 0, 0));

    var props = {
      "donorCentre" : "Melbourne CBD Blood Donor Centre"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"Can I schedule an appointment at Melbourne CBD Blood Donor Centre on Tuesday morning at 8:00 AM?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1510646400000,
                "originalString": "Tuesday morning at 8:00 AM",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Tuesday morning at 8:00 AM",
                "hourFormat": "AM",
                "entityName": "TIME"
              }
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedString = "Unfortunately Melbourne CBD Blood Donor Centre is fully booked on Tuesday morning at 8:00 AM but here's a list of nearby available centres:";
    var expectedMap = {
            "attachment":{
              "type":"image",
              "payload":{
                "url": "https://maps.googleapis.com/maps/api/staticmap?center=Melbourne&zoom=12&size=600x300&maptype=roadmap&markers=color:green|label:0|-37.914768,144.9773248&markers=color:purple|label:1|-37.9157528,145.1038213" 
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
              "title":"Caulfield Donor Centre - 322 Hawthorn Road, Caulfield VIC 3162",
              "subtitle":"Tuesday morning at 8:00 AM available"
            },
            {
              "subtitle": "Tuesday morning at 8:00 AM available",
              "title": "Mt Waverley Donor Centre - 45 Centreway, Mt Waverley VIC 3149"
            }
          ]
        }
      }
    };

    var message = "Does any of the alternative options work for you?";   

    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(4);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedMap);
      expect(results.replies[2]).to.deep.equal(expectedList);
      expect(results.replies[3]).to.deep.equal(message);
      clock.restore();
      done();
    });

  });



 it("Returns a map of how to get to the donor centre if it's available by time of day", function(done){

    clock = sinon.useFakeTimers(new Date(2017, 11, 06, 12, 0, 0, 0));

    var props = {
      "donorCentre" : "Melbourne CBD Blood Donor Centre"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"Can I schedule an appointment at Melbourne CBD Blood Donor Centre on Monday afternoon?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1510574400000,
                "originalString": "Monday afternoon",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 12,
                "mins": 0,
                "secs": 0,
                "originalString": "Monday afternoon",
                "hourFormat": "PM",
                "entityName": "TIME"
              }
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedString = "Melbourne CBD Blood Donor Centre is available on Monday afternoon.Here's how you get there:";
    var expectedResult = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":"Melbourne CBD Blood Donor Centre",
                          "image_url":"https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=-37.8172109,144.9624137&zoom=13&markers=-37.8172109,144.9624137",
                          "subtitle":"Availability on Monday afternoon: 1:00pm-2:00pm-3:00pm Address: Level 1, 367, Collins St, Melbourne VIC 3000",
                          "buttons":[
                            {
                              "type":"web_url",
                              "url":"https:\/\/www.google.com\/maps\/dir\/\/-37.8172109,144.9624137\/@-37.8172109,144.9624137,16z",
                              "title":"Get Directions"
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };

   var message = "Would you like me to book you in?";     

    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      expect(results.replies[2]).to.equal(message);
      clock.restore();
      done();
    });

  });

  it("Returns a map of how to get to the donor centre if it's available by time of day - using props", function(done){

    clock = sinon.useFakeTimers(new Date(2017, 11, 06, 12, 0, 0, 0));

    var props = {
      "donorCentre" : "Melbourne CBD Blood Donor Centre",
      "date": {
              "date": 1510574400000,
              "entityName": "DATE",
              "originalString": "Monday afternoon"
            },
      "time": {
              "mins": 0,
              "entityName": "TIME",
              "secs": 0,
              "hrs": 12,
              "originalString": "Monday afternoon",
              "hourFormat": "PM"
            }      
    };
    
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    //conversationHarness.setVariables(vars);

    var expectedString = "Melbourne CBD Blood Donor Centre is available on Monday afternoon.Here's how you get there:";
    var expectedResult = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":"Melbourne CBD Blood Donor Centre",
                          "image_url":"https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center=-37.8172109,144.9624137&zoom=13&markers=-37.8172109,144.9624137",
                          "subtitle":"Availability on Monday afternoon: 1:00pm-2:00pm-3:00pm Address: Level 1, 367, Collins St, Melbourne VIC 3000",
                          "buttons":[
                            {
                              "type":"web_url",
                              "url":"https:\/\/www.google.com\/maps\/dir\/\/-37.8172109,144.9624137\/@-37.8172109,144.9624137,16z",
                              "title":"Get Directions"
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };

    var message = "Would you like me to book you in?";  

    appointmentsHandler.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(3);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      expect(results.replies[2]).to.equal(message);
      clock.restore();
      done();
    });

  });

  it('Fails when date or time variable is not a date or a time', function(done){
    expect("Not implemented").to.equal(false);
    done();
  });

});