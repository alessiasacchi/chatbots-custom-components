
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");
var request = require('request');
const Dictionary = require('entity-matcher').Dictionary;
const EntitySearch = require('entity-matcher').EntitySearch; 
const suburbData = require('./smart-suburb-search/suburbs.json');
const each = require('async').each;
var suburbDict = new Dictionary(suburbData);
const config = require('./config.json')
//const mockCentresBySuburb = require("./data/centresBySuburb.json");

const markerColours = ["green", "purple", "yellow", "blue", "gray", "orange", "red", "white", "black", "brown"]


module.exports = {

    metadata: () => ({
        "name": "aldi.findStores",
        "properties": {
            "location": { "type":"string", "required":true },
            "postcode": { "type":"string", "required":false },
            "state": { "type":"string", "required":false }
        },
        "supportedActions": ["multipleMatches", "singleMatch", "needMoreInfo", "fail"]
    }), 

    invoke: (conversation, done) => {

      var location = conversation.properties().location;
      var postcode = (conversation.properties().postcode !== "${postcode.value}" ? conversation.properties().postcode : undefined );
      var state = (conversation.properties().state !== "${state.value}" ? conversation.properties().state : undefined );
      //var latlong = (conversation.properties().latlong !== "${latlong.value}" ? conversation.properties().latlong : undefined );
      var multipleMatches;
      var dpostcode;  
      var suburb;
      var latlong;
      

      if( !location || location.length === 0){
        //conversation.reply("Suburb or current location (as lat and long) are mandatory - postcode and state are optional");
        conversation.transition('needMoreInfo');
        done();
        return;
      } else {
        // check if locations contains a valid suburb or is a latlong
        var parsedJSON = tryParseJSON(location);
        console.info("what do we have: " + parsedJSON);
        if(!parsedJSON){
          suburb = location;
        } else {
          latlong = parsedJSON.latitude+","+parsedJSON.longitude;
        }
        /*
        if(location.latitude === undefined){
          suburb = location;
        } else {
          latlong = location.latitude+","+location.longitude;
        }
        */
      }

      console.info("postcode:" +conversation.properties().postcode +" state:" +conversation.properties().state + " latlong:" + latlong + " suburb:" + suburb);

      if(latlong !== undefined){
        callGoogleReverseGeocode(latlong, function(err, addrInfo) {
          if(err || !addrInfo.suburb || !addrInfo.postcode){
            conversation.reply("Sorry we couldn't determine your current location, enter the suburb in which you need to find a store.");
            conversation.transition("multipleMatches");
            done();
            return;
          }
          suburb = addrInfo.suburb;
          postcode = addrInfo.postcode;
          dpostcode = suburb + ', ' + postcode;
          callGetMapListing(dpostcode, function(err, locationData){
            assembleResponseMessage(locationData, latlong, function(err, map, list){
              conversation.reply("These are the closest stores to your location:");
              conversation.reply(map);
              conversation.reply(list);
              conversation.transition("singleMatch");
              done();
              return;
            });  
          });
        }); 
      } else {
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
              postcode = multipleMatches[0].postcode;
              dpostcode = suburb +", " +multipleMatches[0].postcode;
            } else {
             // dpostcode = returnDpostcodeFromState(state,multipleMatches);
             postcode = returnPostcodeFromState(state,multipleMatches);
             dpostcode = suburb + ', ' + postcode;

            }   
            
          } else {
            dpostcode = suburb + ', ' + postcode;
          }

         

          // call RC service
          callGetMapListing(dpostcode, function(err, locationData){
            if(err){
              console.error(err);
              conversation.reply("We are having issues communicating with the location service. Sorry.");
              conversation.transition("fail");
              done();
              return;
            }
            var center = getMapCenter(postcode,multipleMatches);
            assembleResponseMessage(locationData, center, function(err, map, list){
              conversation.reply("These are the closest stores to your location:");
              conversation.reply(map);
              conversation.reply(list);
              conversation.transition("singleMatch");
              done();
              return;
            });  
          });
        }
      }
  }
}

function assembleResponseMessage(locationData, mapCenter, callback){
  var mapImage = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?center=" + mapCenter;
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

            var centreAddresses = [];

            for(var i=0; i<(locationData.length >= 4 ? 2 : locationData.length); i++){
                var centre = locationData[i];
                //var map_url;
                console.info("address:" + centre[2]);
                mapImage += "&markers=color:" +markerColours[i] +"|label:A|" + centre[0] +"," + centre[1];
                //Add centre to our list of addresses to call in parallel later
                centreAddresses.push(centre[2]);
            }

            //Use async to construct our response in parallel
            //i.e for each of centreAddresses...
            each(centreAddresses, function(address, callback){
              callGoogleGeocode(address, function(err, storeLatLong){
                if(!err){     
                  var map_url = "https:\/\/www.google.com\/maps\/dir\/"+storeLatLong+"\/@"+storeLatLong+",16z";
                  centresList.attachment.payload.elements.push({
                        "title": address,
                        "subtitle": "Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM",
                        "buttons":[
                                {
                                  "type":"web_url",
                                  "url":map_url,
                                  "title":"Get Directions"
                                }      
                              ]
                  });
                }else{
                  centresList.attachment.payload.elements.push({
                        "title": address,
                        "subtitle": "Tue: 8:30AM - 8PM Wed - Mon: 8:30AM - 8PM"
                  });
                }                
                callback();
              });
            }, function(err){
              var centresMap = {
                  "attachment":{
                    "type":"image",
                    "payload":{
                      "url": mapImage 
                    }
                  }
              };
              callback(null, centresMap, centresList);
          });
}


function callGoogleGeocode(address,callback){

  var address = address.replace(/ /g, '+');
  var options = {
    url: 'https://maps.googleapis.com/maps/api/geocode/json?address='+address+"&key=" +config.key,
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  };

  request(options, function(err, res, body) {
    if(err){
      callback(err);
      return;
    }
        
    //parse out the location info
    callback(null, parseGeocodeResponse(body));
  });
} 


function parseGeocodeResponse(body){
  //parse out the location info

    var body = JSON.parse(body); 
    if(body["status"] == "OK" && body["results"].length > 0) {
      var geometry = body["results"][0]["geometry"];
      var lat = geometry["location"]["lat"];
      var long = geometry["location"]["lng"];
      console.info(lat+","+long);
      return lat+","+long;
    }  
}


function callGoogleReverseGeocode(latlong,callback){

  var options = {
    url: 'https://maps.googleapis.com/maps/api/geocode/json?latlng='+latlong+"&result_type=postal_code&key=" +config.key,
    method: 'GET',
    headers: {
      'content-type': 'application/json'
    }
  };

  request(options, function(err, res, body) {
    if(err){
      callback(err);
      return;
    }
        
    //parse out the location info
    callback(null, parseReverseGeocodeResponse(body));
  });
} 


function parseReverseGeocodeResponse(body){
  //parse out the location info

    var body = JSON.parse(body); 
    if(body["status"] == "OK" && body["results"].length > 0) {
      var addrInfo = {};
      for(var component in body.results[0].address_components){
        if(body.results[0].address_components[component].types.length > 0){
          switch(body.results[0].address_components[component].types[0]){
            case "locality":
              addrInfo.suburb = body.results[0].address_components[component].long_name;
              break;
            case "postal_code":
              addrInfo.postcode = body.results[0].address_components[component].long_name;
          }
        }
      }
      
      console.info(JSON.stringify(addrInfo));
      return addrInfo;
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


function getMapCenter(postcode,multipleMatches){

  for (var i=0; i< multipleMatches.length; i++) {           
    if(multipleMatches[i].postcode == postcode)  {
      return(multipleMatches[i].lat + ',' + multipleMatches[i].long);
    } 
  }         

  //console.info("lat" + mockCentres[dpostcode].lat);
  //console.info("long" + mockCentres[dpostcode].long);
  //return(mockCentres[dpostcode].lat + ',' + mockCentres[dpostcode].long);

}


function returnPostcodeFromState(state,matches){
  for(var i=0; i<matches.length; i++) {
    if (matches[i].state == state){
      var postcode = matches[i].postcode;
      return postcode;
    }
  }
}

function tryParseJSON (jsonString){
    try {
        var o = JSON.parse(jsonString);

        // Handle non-exception-throwing cases:
        // Neither JSON.parse(false) or JSON.parse(1234) throw errors, hence the type-checking,
        // but... JSON.parse(null) returns null, and typeof null === "object", 
        // so we must check for that, too. Thankfully, null is falsey, so this suffices:
        if (o && typeof o === "object") {
            console.info("JSON!!!!!!!!");
            return o;
        }
    }
    catch (e) { }

    return false;
};