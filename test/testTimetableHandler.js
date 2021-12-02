const expect = require('chai').expect;
const sinon = require('sinon');

var Conversation = require('./conversationTester');

var timetable = require('../university/timetableHandler')

var clock;

//Use a fake time to ensure our results are consistent.
//Our fake now time is Monday at 1:30PM
// beforeEach(function() {
//   clock = sinon.useFakeTimers(new Date(2017, 7, 10, 13, 30, 0, 0));
// });

// afterEach(function(){
//   clock.restore();
// })

describe("Test timetableHandler Custom Component", function(){
  it("Responds with a single subject time and location when asked about the 'next' subject", function(done){
    //Use fake timers to ensure that 'today' is known
    clock = sinon.useFakeTimers(new Date(2017, 6, 10, 13, 30, 0, 0));

    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What is my next class?",
          "entityMatches":{
            "UpcomingTime": ["next"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedResult = "Your next class is a STATS 101 - Intro to Stats lab at 2:30PM today. "
    +"It is in 10.04 in Building C.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      clock.restore();
      done();
    });

  });

  it("Handles the concept of 'tomorrow'", function(done){
    //Use fake timers to ensure that 'today' is a known entity (here Monday)
    clock = sinon.useFakeTimers(new Date(2017, 6, 10, 13, 30, 0, 0));

    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What do I have on tomorrow?",
          "entityMatches":{
            "UpcomingTime": ["tomorrow"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedResult = "Tomorrow you have a PROG 102 - Intro to Java lecture at 12:30PM. It is in 3.04 in Building C.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      clock.restore();
      done();
    });

  });

  it("Handles the concept of 'tomorrow' in concert with a time", function(done){
    //Use fake timers to ensure that 'today' is a known entity (here Monday)
    clock = sinon.useFakeTimers(new Date(2017, 6, 10, 13, 30, 0, 0));

    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What do I have on at 12PM tomorrow?",
          "entityMatches":{
            "TIME": [
              {
                "hrs": 12,
                "mins": 30,
                "secs": 0,
                "originalString": "12:30PM",
                "hourFormat": "PM",
                "entityName": "TIME"
              }
            ],
            "UpcomingTime": ["tomorrow"]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedResult = "At 12:30PM tomorrow you have a PROG 102 - Intro to Java lecture. It is in 3.04 in Building C.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      clock.restore();
      done();
    });

  });

  it("It responds with a list of subjects associated with a time/date asked about", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have on Monday?",
          "entityMatches": {
            "DATE": [
              {
                "date": new Date(2017, 6, 10, 8, 0, 0, 0),
                "originalString": "Monday",
                "entityName": "DATE"
              }
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedString = "Your classes for Monday:";
    var expectedResult = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"2:30PM - STATS 101 - Intro to Stats",
              "subtitle":"Lab - Building C - 10.04"
            },
            {
              "title":"8:30PM - COMP 203 - Advanced Algorithms",
              "subtitle":"Lecture - Miller Center - Hall 2"
            }
          ]
        }
      }
    };

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      done();
    });

  });

  it("It sets the location variable in the flow if it is only responding with one subject", function(done){
    clock = sinon.useFakeTimers(new Date(2017, 7, 10, 13, 30, 0, 0));
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What maths classes do I have on Thursday morning?",
            "entityMatches": {
            "DATE": [
              {
                "date": 1500537600000,
                "originalString": "Thursday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Thursday morning",
                "hourFormat": "AM",
                "entityName": "TIME"
              }
            ],
            "SubjectType": [
              "maths"
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.variables["variableToSet"].value).to.equal('Miller Center');
      clock.restore();
      done();
    });
  });

  it("It doesn't set the location variable in the flow if there are multiple subjects", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have on Thursday morning?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1500537600000,
                "originalString": "Thursday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Thursday morning",
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

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.variables["variableToSet"]).to.be.undefined;
      done();
    });
  });

  it("It responds with a particular subject when asked about that specific subject, even if that isn't next", function(done){
    clock = sinon.useFakeTimers(new Date(2017, 6, 10, 13, 30, 0, 0));
    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"When is my next programming class?",
          "entityMatches":{
            "UpcomingTime": [
              "next"
            ],
            "SubjectType": [
              "programming"
            ]
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedResult = "Your next programming class is a PROG 102 - Intro to Java lecture at 12:30PM Tuesday. "
    +"It is in 3.04 in Building C.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      clock.restore();
      done();
    });
  });

  it("Provides a link to the whole timetable", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What is my timetable?",
          "entityMatches":{
            
          }
        }
      }
    };
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);

    var expectedResult =
    {
      "attachment": {
        "type": "template",
        "payload": {
            "template_type": "button",
            "text":"Save your timetable offline for easy access",
            "buttons": [
              {
                "type":"web_url",
                "url":"timetablelink",
                "title":"Download Timetable"
              }
            ]
        }
      }
    };

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.deep.equal(expectedResult);
      done();
    });

  });

  it("Returns a filtered list by time of day", function(done){

    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have on Thursday morning?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1500537600000,
                "originalString": "Thursday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Thursday morning",
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

    var expectedString = "Your classes for Thursday morning:";
    var expectedResult = {
      "attachment":{
        "type": "template",
        "payload": {
          "template_type": "list",
          "top_element_style":"compact",
          "elements": [
            {
              "title":"9:00AM - COMP 203 - Advanced Algorithms",
              "subtitle":"Lab - Building A - 5.09"
            },
            {
              "title":"11:00AM - MATH 201 - Matrices and Vectors",
              "subtitle":"Lecture - Miller Center - Hall 3"
            }
          ]
        }
      }
    };

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(2);
      expect(results.replies[0]).to.equal(expectedString);
      expect(results.replies[1]).to.deep.equal(expectedResult);
      done();
    });

  });

  it("Returns a single class if that is all the satisfies the time of day and subject", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What maths classes do I have on Thursday morning?",
            "entityMatches": {
            "DATE": [
              {
                "date": 1500537600000,
                "originalString": "Thursday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Thursday morning",
                "hourFormat": "AM",
                "entityName": "TIME"
              }
            ],
            "SubjectType": [
              "maths"
            ]
          }
        }
      }
    };

    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    conversationHarness.setVariables(vars);
    var expectedResult = "On Thursday morning you have a MATH 201 - Matrices and Vectors lecture at 11:00AM. "
    +"It is in Hall 3 in Miller Center.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      done();
    });
  });

  it("Returns a single class if that is all the satisfies the time of day", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have on Friday morning?",
          "entityMatches": {
            "DATE": [
              {
                "date": new Date(2017, 6, 14, 8, 0, 0, 0),
                "originalString": "Friday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Friday morning",
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
    var expectedResult = "On Friday morning you have a MATH 201 - Matrices and Vectors lecture at 9:00AM. "
    +"It is in Hall 1 in Miller Center.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      done();
    });

  });

  it("Returns no classes if there are none", function(done){
    var props = {
      "timetableURL":"timetablelink",
      "locationVariable" : "variableToSet"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have on Wednesday morning?",
          "entityMatches": {
            "DATE": [
              {
                "date": 1500451200000,
                "originalString": "Wednesday morning",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 0,
                "secs": 0,
                "originalString": "Wednesday morning",
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

    var expectedString = "You have no classes on Wednesday morning.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedString);
      done();
    });
  });

  it("It responds with a particular class when asked about a specific time", function(done){

    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have at 9AM Friday?",
          "entityMatches": {
            "DATE": [
              {
                "date": new Date(2017, 6, 14, 9, 0, 0, 0),
                "originalString": "9AM Friday",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 9,
                "mins": 0,
                "secs": 0,
                "originalString": "9AM Friday",
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

    var expectedResult = "At 9AM Friday you have a MATH 201 - Matrices and Vectors lecture. It is in Hall 1 in Miller Center.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      done();
    });
  });

  it("It responds with a 'close-enough' class when asked about a specific time (and there is no class at that time)", function(done){

    var props = {
      "timetableURL":"timetablelink"
    };
    var vars = {
      "iResult":{
        "type":"nlpresult",
        "value":{
          "query":"What classes do I have at 9AM Friday?",
          "entityMatches": {
            "DATE": [
              {
                "date": new Date(2017, 6, 14, 8, 30, 0, 0),
                "originalString": "8:30AM Friday",
                "entityName": "DATE"
              }
            ],
            "TIME": [
              {
                "hrs": 8,
                "mins": 30,
                "secs": 0,
                "originalString": "8:30AM Friday",
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

    var expectedResult = "You don't have a class at 8:30AM Friday, however you have a MATH 201 - Matrices and Vectors lecture at 9:00AM. "
    +"It is in Hall 1 in Miller Center.";

    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(1);
      expect(results.replies[0]).to.equal(expectedResult);
      done();
    });
  });

  it("Should fail if we don't pass a timetable URL", function(done){
    var props = {};
    var conversationHarness = new Conversation();
    conversationHarness.setProperties(props);
    timetable.invoke(conversationHarness, function(){
      var results = conversationHarness.getStatus();
      expect(results.replies).to.have.lengthOf(0);
      expect(results.transition).to.equal('fail');
      done();
    });
  });

});