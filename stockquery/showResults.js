
"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

module.exports = {

    metadata: () => ({
        "name": "stockquery.showResults",
        "properties": {
            "noItemsPrompt": { "type":"string", "required":false },
            "singleItemPrompt":  { "type":"string", "required":false },
            "multiItemPrompt": { "type":"string", "required":false },
            "items": { "type":"string", "required":true },
            "variable": { "type":"string", "required":true },
            "keepTurn": { "type":"boolean", "required":false }
        },
        "supportedActions": [
            "noItems",
            "singleOption",
            "multipleOptions",
            "fail"
        ]
    }),

    invoke: (conversation, done) => {
        if(baseUtils.isEmpty(conversation.properties().items)){
            logger.error("No items passed to showResults!");
            conversation.transition("fail");
            done();
            return;
        }
        var items = [];
        try{
            items = JSON.parse(conversation.properties().items);
            if(!Array.isArray(items)){
                throw new Error();
            }
        }catch(e){
            logger.error("Error occurred parsing the items passed to showResults.")
            conversation.transition("fail");
            done();
            return;
        }
        switch(items.length){
            case 0:
                if(!baseUtils.isEmpty(conversation.properties().noItemsPrompt)){
                    conversation.reply(conversation.properties().noItemsPrompt);
                    if(conversation.properties().keepTurn !== null){
                        conversation.keepTurn(conversation.properties().keepTurn);
                    }
                }else{
                    logger.warn("No items passed to showResults");    
                }
                conversation.transition("noItems");
                break;
            case 1:
                var imageObj;              
                if(conversation.channelType() === 'facebook') {
                    imageObj = {
                        "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "image_aspect_ratio":"square",
                                "elements":[{
                                    "title":items[0].name,
                                    "image_url":items[0].url,
                                    "buttons":[
                                        {
                                          "type":"web_url",
                                          "url":rewriteImageUrl(items[0].url),
                                          "title":"Full Size"
                                        }
                                    ]
                                }]
                            }
                        }
                    };
                } else {
                    imageObj = "<img src=\"" +items[0].url +"\"><br/>" +items[0].name;
                }
                conversation.variable(conversation.properties().variable,items[0].name);
                conversation.reply(imageObj);
                if(!baseUtils.isEmpty(conversation.properties().singleItemPrompt)){
                    conversation.reply(conversation.properties().singleItemPrompt);    
                }
                if(conversation.properties().keepTurn !== null){
                    conversation.keepTurn(conversation.properties().keepTurn);
                }
                conversation.transition("singleOption");
                break;
            default:
                var carouselObj;
                //Carousel
                if(conversation.channelType() === 'facebook') {
                    carouselObj = {
                        "attachment": {
                            "type":"template",
                            "payload":{
                                "template_type":"generic",
                                "image_aspect_ratio":"square",
                                "elements":[]
                            }
                        }
                    };
                    for(var i = 0; i<items.length; i++){
                        var itemEntry = {}      ;
                        itemEntry.image_url = items[i].url;
                        itemEntry.title = items[i].name;
                        itemEntry.buttons = [];
                        itemEntry.buttons.push({
                            "type":"postback",
                            "title": "Select " +items[i].name,
                            "payload": items[i].name
                        });
                        itemEntry.buttons.push({
                            "type":"web_url",
                            "url":rewriteImageUrl(items[i].url),
                            "title": "Full Size"
                        });
                        carouselObj.attachment.payload.elements.push(itemEntry);
                    }
                }else{
                    carouselObj = "";
                    for(var i = 0; i<items.length; i++){
                        carouselObj += items[i].name +"<br/>";
                    }
                }
                conversation.reply(carouselObj);
                if(!baseUtils.isEmpty(conversation.properties().multiItemPrompt)){
                    conversation.reply(conversation.properties().multiItemPrompt);    
                }
                if(conversation.properties().keepTurn !== null){
                    conversation.keepTurn(conversation.properties().keepTurn);
                }
                conversation.transition("multipleOptions");
                break;
        }
        done();
    }
};


function rewriteImageUrl(str) {  
    //var begin = str.indexOf("link"); 
    //var end = str.lastIndexOf("/D");
    //var substr = str.substring(begin, end);
    //var res1 = str.replace(substr, "embed/fileview");
    var res1 = str.replace("link", "embed/link");
    var res2 = res1.replace("file", "fileview");
    var res3 = res2.concat("?hide=breadcrumbs+sidebar+header&show=fitpage");
    return res3;
}