
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

const mockStores = require("./data/stores.json");
const mockStock = require("./data/stock.json");

const markerColours = ["green", "purple", "yellow", "blue", "gray", "orange", "red", "white", "black", "brown"]


module.exports = {

    metadata: () => ({
        "name": "stockquery.lookupStores",
        "properties": {
            "item": { "type":"string", "required":true },
            "purchaseLocation":  { "type":"string", "required":true }
        },
        "supportedActions": ["storeNotFound", "success", "fail"]
    }),

    invoke: (conversation, done) => {

      var purchaseLocation = conversation.properties().purchaseLocation;
      logger.info("--- STORE:" + purchaseLocation);
      if(!purchaseLocation || purchaseLocation.length === 0 || mockStores[purchaseLocation] === undefined){
        conversation.reply("Unfortunately we couldn't find your store.");
        conversation.transition('storeNotFound');
        done();
        return;
      }
      if(!conversation.properties().item || conversation.properties().item.length === 0 ){
          conversation.transition('fail');
          done();
          return;
      }
      var stockAvailability = mockStock[conversation.properties().item][purchaseLocation];

      // valid store and item in stock and store is open
      if(stockAvailability){
        var store = mockStores[purchaseLocation];
        // store open
        var today = new Date().getDay();
        var open = store.openingHours[today].open;
        var close = store.openingHours[today].close;
        var address = store.address;
        var lat = store.lat;
        var long = store.long;
        var image_url = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?size=764x400&center="+store.lat+","+store.long+"&zoom=13&markers="+store.lat+","+store.long; 
        var map_url = "https:\/\/www.google.com\/maps\/dir\/\/"+store.lat +","+store.long+"\/@"+store.lat +","+store.long+",16z";
        // Wednesday Hours:8:00AM-6:00PM - Address:252 Toorak Rd, South Yarra VIC 3141

        var subtitle = dayString(today) + " Hours:" + timeStr(open) + "-" + timeStr(close) + " - " + "Address:" + address;

        var attachment = {
              "attachment": {
                  "type":"template",
                  "payload":{
                      "template_type":"generic",
                      "elements":[{
                          "title":purchaseLocation,
                          "image_url":image_url,
                          "subtitle":subtitle,
                          "buttons":[
                            {
                              "type":"web_url",
                              "title":"Get Directions",
                              "url":map_url
                            }
                          ]
                      }
                      ]
                      
                  }
              }
        };

        if(isStoreOpen(purchaseLocation))
          conversation.reply(purchaseLocation + " has the item in stock and is currently open. More store info below:");
        else
          conversation.reply(purchaseLocation + " has the item in stock, but is currently closed. More store info below:");


        conversation.reply(attachment);
        conversation.transition("success");
        done();

    } else {
      // Item not in stock
      var message = "Unfortunately " + purchaseLocation + " doesn't have the item in stock. Here's a list of nearby stores that have your item:";
      
      var storeList = {
        "attachment":{
          "type": "template",
          "payload": {
            "template_type": "list",
            "top_element_style":"compact",
            "elements": []
          }
        }
      };


      var mapImage = "https:\/\/maps.googleapis.com\/maps\/api\/staticmap?center=Melbourne&zoom=12&size=600x300&maptype=roadmap"; 
      var nearbyStores = mockStores[purchaseLocation].nearbyStores;

      for(var i=0; i<nearbyStores.length; i++){
        if(hasStock(nearbyStores[i], conversation.properties().item)){
          //Add a marker to our map image
          mapImage += "&markers=color:" +markerColours[i] +"|label:" + i +"|" + mockStores[nearbyStores[i]].lat +"," + mockStores[nearbyStores[i]].long;
          var today = new Date().getDay();
          var open = mockStores[nearbyStores[i]].openingHours[today].open;
          var close = mockStores[nearbyStores[i]].openingHours[today].close;
          var address = mockStores[nearbyStores[i]].address;
          storeList.attachment.payload.elements.push({
            "title": nearbyStores[i] +(isStoreOpen(nearbyStores[i])? " - OPEN NOW" : ""),
            "subtitle": dayString(today) + " Hours:" + timeStr(open) + "-" + timeStr(close) + " - " + "Address:" + address
          });
        } else {
          conversation.reply("Sorry, that item in that size is not in stock in any store near you. It is available from our online store.");
          conversation.transition("success");
          done();
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
       conversation.reply(storeList);
       conversation.transition("success");
       done();
    }
    
    
  }

};

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

function isStoreOpen(storeName){
    var store = mockStores[storeName];
    var today = new Date().getDay();
    var open = store.openingHours[today].open;
    var close = store.openingHours[today].close;
    var d = new Date();
    var nowTime = d.getHours()*100 + d.getMinutes();
    return (nowTime > open && nowTime < close);
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

