
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");
var request = require('request');
const Dictionary = require('entity-matcher').Dictionary;
const EntitySearch = require('entity-matcher').EntitySearch; 
const suburbData = require('./smart-suburb-search/suburbs.json');
var suburbDict = new Dictionary(suburbData);  

const mockCentres = require("./data/centres.json");
//const mockCentresBySuburb = require("./data/centresBySuburb.json");

const markerColours = ["green", "purple", "yellow", "blue", "gray", "orange", "red", "white", "black", "brown"]


module.exports = {

    metadata: () => ({
        "name": "redcross.findLocations",
        "properties": {
            "suburb": { "type":"string", "required":true },
            "postcode": { "type":"string", "required":false },
            "state": { "type":"string", "required":false }
        },
        "supportedActions": ["multipleMatches", "singleMatch", "fail"]
    }), 

    invoke: (conversation, done) => {

      var suburb = conversation.properties().suburb;
      logger.debug("postcode:" +conversation.properties().postcode +" state:" +conversation.properties().state);
      var postcode = (conversation.properties().postcode !== "${postcode.value}" ? conversation.properties().postcode : undefined );
      var state = (conversation.properties().state !== "${state.value}" ? conversation.properties().state : undefined );
      var multipleMatches;
      var dpostcode;  
      

      if(!suburb || suburb.length === 0){
        conversation.reply("Suburb is mandatory - postcode and state are optional");
        conversation.transition('fail');
        done();
        return;
      } 

      //console.log("SUBURB:" + suburb);
      //console.log(mockCentresBySuburb[suburb].matches);
      //multipleMatches = mockCentresBySuburb[suburb].matches;
      var suburbList = EntitySearch.containsEntity(suburb, suburbDict);
      multipleMatches = suburbList[0] ? suburbList[0].matches : [];


      if(multipleMatches.length > 1 && (postcode === undefined && state === undefined )) {

            // build the list
            var message = "We've found more than one possible match:";

            var matchesList = {
                            "attachment": {
                                "type":"template",
                                "payload":{
                                    "template_type":"list",
                                    "top_element_style": "compact",
                                    "elements":[]
                                }
                            }
            };

            for (var i=0; i< multipleMatches.length; i++) {           
                matchesList.attachment.payload.elements.push({
                  "title": suburb +", "+multipleMatches[i].postcode,
                  "buttons": [
                     {
                      "title":"Select",
                      "type":"postback",
                      "payload": suburb +", "+multipleMatches[i].postcode
                     }
                  ]
                });            
            }  

            
            conversation.reply(message);
            conversation.reply(matchesList);
            conversation.transition("multipleMatches");
            done();
            return;
           
        } else {

          // postcode and state null - one entry
          if (postcode === undefined) {
            if(multipleMatches.length == 1){
              var indexOfSecondComma = nth_ocurrence(multipleMatches[0], ',', 2);
              dpostcode = suburb +", " +multipleMatches[0].postcode;
            } else {
              dpostcode = returnDpostcodeFromState(state,multipleMatches);

            }   
            
          } else {
            dpostcode = suburb + ', ' + postcode;
          }

          //logger.info("built postcode:" + dpostcode);

          /*
          if(postcode === undefined &&& state != undefined) {
            for (var i=0; i< multipleMatches.length; i++) {           
                  if (multipleMatches[i].includes(state.toUpperCase())) {   
                      var str2repl = ', ' + state.toUpperCase();
                      dpostcode = multipleMatches[i].replace(str2repl,"");
                      break;
                  }         
            } 
          }  
          // this is executed when there's just one match
          
          if(dpostcode === undefined && postcode != undefined){
            dpostcode = suburb + ', ' + postcode;
          }
          */

          // call RC service
          callGetMapListing(dpostcode, function(err, locationData){

            var center = getMapCenter(dpostcode,mockCentres);

            console.log(center);
            
            var mapImage = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?center=" + center;
            mapImage = mapImage + "&size=600x300&maptype=roadmap"; 
            var centresList = {
              "attachment":{
                "type": "template",
                "payload": {
                  "template_type": "list",
                  "top_element_style":"compact",
                  "elements": []
                }
              }
            };

          for(var i=0; i<(locationData.length >= 4 ? 4 : locationData.length); i++){
            var centre = locationData[i];
            mapImage += "&markers=color:" +markerColours[i] +"|label:" + (i+1) +"|" + centre[0] +"," + centre[1];
            centresList.attachment.payload.elements.push({
                  "title": centre[2],
                  "subtitle": centre[3].trim()
            });
           
          }

          var expectedMap = {
              "attachment":{
                "type":"image",
                "payload":{
                  "url": mapImage 
                }
              }
          };

          var afterMapMessage = {
                          "attachment": {
                              "type":"template",
                              "payload":{
                                  "template_type":"button",
                                  "text": "Head to our self-service page to book an appointment at one of these locations",
                                  "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":"https://aurcbloodservices--tst3.custhelp.com",
                                          "title":"Book an Appointment"
                                        }      
                                  ]
                              }
                          }
          };


          conversation.reply("These are the donor centres closest to your location:");
          conversation.reply(expectedMap);
          conversation.reply(centresList);
          conversation.reply(afterMapMessage);
          conversation.transition("singleMatch");
          done();
        });
    }
 
  }  

}   
  
function callGetMapListing(dpostcode, callback){
  var options = {
    url: 'http://www.donateblood.com.au/sites/all/themes/custom/arcbs/includes/getmaplisting.php',
    method: 'POST',
    headers: {
      'content-type': 'application/x-www-form-urlencoded'
    },
    form: {
      dpostcode: dpostcode
    }
  };
  console.log("sending to service:" + dpostcode);
  request(options, function(err, res, body) {
    if(err){
      callback(err);
      return;
    }
    //parse out the location info
    callback(null, parseRawMapResponse(body));
  });
}    

function parseRawMapResponse(rawBody){
  var bodyMatches = rawBody.match(/var LocationData = ([^;]*)/m);
  var locationStr;
  if(bodyMatches && bodyMatches.length >= 1){
    locationStr = bodyMatches[1];  
  }else{
    //Ah! Response is of some other format...
    logger.info(rawBody)
    logger.error("Error parsing string from Raw Red Cross Service.");
    return [];
  }  
  //console.log(locationStr);
  //Fix the stupid trailing ','
  locationStr = locationStr.replace("],]", "]]");
  var locationData;
  try{
    locationData = JSON.parse(locationStr);
  }catch(ex){
    logger.error("Error parsing string from Raw Red Cross Body:" +ex);
    return [];
  }
  return locationData;
}



function nth_ocurrence(str, needle, nth) {
  for (var i=0;i<str.length;i++) {
    if (str.charAt(i) == needle) {
        if (!--nth) {
           return i;    
        }
    }
  }
  return false;
}


function getMapCenter(dpostcode,mockCentres){

  console.info("lat" + mockCentres[dpostcode].lat);
  console.info("long" + mockCentres[dpostcode].long);
  return(mockCentres[dpostcode].lat + ',' + mockCentres[dpostcode].long);

}


function returnDpostcodeFromState(state,matches){
  for(var i=0; i<matches.length; i++) {
    if (matches[i].includes(state)){
      var indexOfSecondComma = nth_ocurrence(matches[i], ',', 2);
      var dpostcode = matches[i].substring(0,indexOfSecondComma);
      return dpostcode;
    }
  }
}

/*
function getMainCity(state){
 
    switch(state){
        case "VIC":
            return "Melbourne";
        case "NSW":
            return "Sydney";
        case "QLD":
            return "Brisbane";
        default:
            return "Melbourne";       
    }    
}

function getState(string,matches){
  for(var i=0; i<matches.length; i++) {
    if (matches[i].startsWith(string)){
      var indexOfSecondComma = nth_ocurrence(matches[i], ',', 2);
      var state = matches[i].substring(indexOfSecondComma + 2,matches[i].length);
      return state.trim();
    }
  }
}
*/