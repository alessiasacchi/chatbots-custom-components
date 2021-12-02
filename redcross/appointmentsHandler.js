
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

//const mockCentres = require("./data/centres.json");
const mockCentres = require("./data/engineeredCentres.json");

const markerColours = ["green", "purple", "yellow", "blue", "gray", "orange", "red", "white", "black", "brown"]


module.exports = {

    metadata: () => ({
        "name": "redcross.appointmentsHandler",
        "properties": {
            "donorCentre": { "type":"string", "required":true },
            "timeVariable": { "type":"string", "required":false },
            "dateVariable": { "type":"string", "required":false }
        },
        "supportedActions": ["centreNotFound", "centerAvailable", "centreNotAvailable"]
    }),

    invoke: (conversation, done) => {

      var donorCentre = conversation.properties().donorCentre;
      var timeEntity,dateEntity;

      if(!donorCentre || donorCentre.length === 0 || mockCentres[donorCentre] === undefined){
        conversation.reply("Unfortunately we could not find a match for the requested donor centre");
        conversation.transition('centreNotFound');
        done();
        return;
      }

      if(conversation.properties().timeVariable){
        timeEntity = conversation.variable("myCat");
        conversation.variable("myCat","value")
      } else {
        timeEntity = conversation.nlpResult().entityMatches("TIME")[0];
      }

      if(conversation.properties().dateVariable){
        dateEntity = conversation.variable(conversation.properties().dateVariable);
      } else {
        dateEntity = conversation.nlpResult().entityMatches("DATE")[0];
      }

      if(!dateEntity){
        conversation.reply("Please tell us when you want to book your appointment");
        conversation.transition('fail');
        done();
        return;
      } 



      var centre = mockCentres[donorCentre];
      var queryTimeString = "";
      var queryDay;
      var queryTime = 0;
      var timeSpecified = false;
      var morning 
      //AM/PM - for morning/afternoon
      var timeOfDay;

      if(dateEntity){
        queryTimeString = dateEntity.originalString;
        queryDay = new Date(dateEntity.date).getDay();
      }

      if(timeEntity){
        timeOfDay = timeEntity.hourFormat;
        queryTimeString = timeEntity.originalString;

        if(timeEntity.originalString.indexOf(timeEntity.hrs) !== -1){
          // time specified, just morning or afternoon
          queryTime = timeEntity.hrs * 100 + timeEntity.mins;
          timeSpecified = true;
          if(timeOfDay === 'PM' && timeEntity.hrs !== 12){
            queryTime += 1200;
          }
        } 
      }

      var availability = false;
      var availableTimes = "";

      if(timeSpecified) {
        availability = areThereAnySlotsOnSpecifiedTime(donorCentre,queryDay,queryTime);
      } else {
        availableTimes = areThereAnySlotsMorningArvo(donorCentre,queryDay,timeOfDay);
        if (availableTimes.length !== 0)
          availability = true;
      }


      //if(isAvailable(donorCentre,queryDay,queryTime)){
      if(availability){  

        var address = centre.address;
        //var availableFrom = centre.availabilityHours[queryDay].from;
        //var availableTo = centre.availabilityHours[queryDay].to;
        var lat = centre.lat;
        var long = centre.long;
        var image_url = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="+centre.lat+","+centre.long+"&zoom=13&markers="+centre.lat+","+centre.long; 
        var map_url = "https:\/\/www.google.com\/maps\/dir\/\/"+centre.lat +","+centre.long+"\/@"+centre.lat +","+centre.long+",16z";
        

        var subtitle;
        if(availableTimes.length === 0){
            subtitle = queryTimeString + " available - " + "Address: " + address;
        } else {
            subtitle = "Availability on " + queryTimeString + ": " + availableTimes + " Address: " + address;
        }

        var attachment = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":donorCentre,
                          "image_url":image_url,
                          "subtitle":subtitle,
                          "buttons":[
                            {
                              "type":"web_url",
                              "url":map_url,
                              "title":"Get Directions"
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };


        conversation.reply(donorCentre + " is available on " + queryTimeString + ".Here's how you get there:");
        conversation.reply(attachment);
        conversation.reply("Would you like me to book you in?");
        conversation.transition("centerAvailable");
        done();


      } else {

        var message = "Unfortunately " + donorCentre + " is fully booked on " + queryTimeString + " but here's a list of nearby available centres:";

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

        var mapImage = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?center=Melbourne&zoom=10&size=600x300&maptype=roadmap"; 
        var nearbyCentres = mockCentres[donorCentre].nearbyCentres;
        

        for(var i=0; i<nearbyCentres.length; i++){

            
            var centerAvailable = false;
            var availableTimes2 = "";

           
            if(timeSpecified){
              centerAvailable = areThereAnySlotsOnSpecifiedTime(nearbyCentres[i],queryDay,queryTime);
            }else{
              availableTimes2 = areThereAnySlotsMorningArvo(nearbyCentres[i],queryDay,timeOfDay);
              if (availableTimes2.length !== 0)
                centerAvailable = true; 
              }
            
            if(centerAvailable){

              var subtitle;
              if(availableTimes.length === 0){
                  subtitle = queryTimeString + " available";
              } else {
                  subtitle = "Availability on " + queryTimeString + ": " + availableTimes + " Address: " + address;
              } 

              
              //Add a marker to our map image
              mapImage += "&markers=color:" +markerColours[i] +"|label:" + i +"|" + mockCentres[nearbyCentres[i]].lat +"," + mockCentres[nearbyCentres[i]].long;
              //var availableFrom = mockCentres[nearbyCentres[i]].availabilityHours[queryDay].from;
              //var availableTo = mockCentres[nearbyCentres[i]].availabilityHours[queryDay].to;
              var address = mockCentres[nearbyCentres[i]].address;
              centresList.attachment.payload.elements.push({
                "title": nearbyCentres[i] + " - " + address,
                "subtitle": subtitle
              });
            }  
        } 

        var mapResponse = {
          "attachment":{
            "type":"image",
            "payload":{
              "url": mapImage 
            }
          }
        };

        conversation.reply(message);
        conversation.reply(mapResponse);
        conversation.reply(centresList);
        conversation.reply("Does any of the alternative options work for you?");
        conversation.transition("centerNotAvailable");
        
        done();     
      }
 
    }   
  

}

function dayString(n){
    switch(n){
        case 0:
            return "Sunday";
        case 1:
            return "Monday";
        case 2:
            return "Tuesday";
        case 3:
            return "Wednesday";
        case 4:
            return "Thursday";
        case 5:
            return "Friday";
        case 6:
            return "Saturday";
        default:
            return dayString(n%7);       
    }    
}

function isAvailable(centreName,queryDay,queryTime){
    var centre = mockCentres[centreName];
    var availableFrom = centre.availabilityHours[queryDay].from;
    var availableTo = centre.availabilityHours[queryDay].to;
    return (queryTime > availableFrom && queryTime < availableTo);
}

function areThereAnySlotsOnSpecifiedTime(centreName,queryDay,queryTime){

    var centre = mockCentres[centreName];
    var maxSeats = centre.numSeats;

    var open = mockCentres[centreName].availability[queryDay].open;
    var close = mockCentres[centreName].availability[queryDay].close;

    if(queryTime >= open && queryTime < close){
      // centre is open
      // determine time
      var offset = (queryTime - open)/100;
      return (mockCentres[centreName].availability[queryDay].bookings[offset].count < maxSeats);
    }
    return false;
}

function areThereAnySlotsMorningArvo(centreName,queryDay,timeOfDay){
    var centre = mockCentres[centreName];
    
    var maxSeats = centre.numSeats;

    var open = mockCentres[centreName].availability[queryDay].open;
    var close = mockCentres[centreName].availability[queryDay].close;
    
    var available = false;
    var availableTimes = "";

  
    if(timeOfDay === 'AM' ){
     
      for (var j=0; j<5; j++){
        if(mockCentres[centreName].availability[queryDay].bookings[j].count < maxSeats){
          var available = true;
          availableTimes += mockCentres[centreName].availability[queryDay].bookings[j].time + "-";
        }
      }
      
    } else {
      
      for (var j=5; j<8; j++){
        if(mockCentres[centreName].availability[queryDay].bookings[j].count < maxSeats){
          var available = true;
          availableTimes += mockCentres[centreName].availability[queryDay].bookings[j].time + "-";
        }
      }
    }

    if(availableTimes.endsWith("-"))
      availableTimes = availableTimes.substring(0,availableTimes.length-1);
    return availableTimes;

}




function hasStock(storeName, item){
  return mockStock[item][storeName] ? mockStock[item][storeName] : false;
}

function timeStr(time){
    var hour = Math.floor(time/100)%12;
    var timeStr = "" +(hour === 0 ? 12 : hour) +":" 
              +padZeroes(time % 100,2) 
              +(time > 1200 ? "PM" : "AM");
    return timeStr;           
}

function padZeroes(num, width){
  var n = "" +num;
  return n.length >= width ? n : new Array(width - n.length + 1).join('0') + n;
}

function jsUcfirst(string) 
{
    return string.charAt(0).toUpperCase() + string.slice(1);
}   

