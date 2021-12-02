"use strict"

var log4js = require('log4js');
var logger = log4js.getLogger();
var baseUtils = require("../util/baseUtils.js");

module.exports = {

    metadata: () => ({
        "name": "stockquery.searchItems",
        "properties": {
            "item": { "type": "string", "required": true },
            "colour": { "type": "string", "required": true },
            "variable": { "type":"string", "required":true }
        },
        "supportedActions": [
            "noItems",
            "success",
            "fail"
        ]
    }),

    invoke: (conversation, done) => {   
    	var items = [];     
        if(!baseUtils.isEmpty(conversation.properties().item)){
            var searchTerm = conversation.properties().item;
            //TODO: Call search. For now, mock.
			switch(searchTerm){
				case "dress":
					if(!baseUtils.isEmpty(conversation.properties().colour) && conversation.properties().colour === "black"){
						items.push({"name":"Satin Slip Dress", "url":"https://jpac2-gse00009991.documents.us2.oraclecloud.com/documents/link/LD06D90BC80DF5DE3AC7BA2BECCA8B41B03CE5889340/file/DF96A73D80D83B9E684DC96CECCA8B41B03CE5889340/_black.jpeg"});
					}else{
						items.push({"name":"Satin Slip Dress", "url":"https://jpac2-gse00009991.documents.us2.oraclecloud.com/documents/link/LD06D90BC80DF5DE3AC7BA2BECCA8B41B03CE5889340/file/DF96A73D80D83B9E684DC96CECCA8B41B03CE5889340/_black.jpeg"});
						items.push({"name":"Denim Shirt Dress", "url":"https://jpac2-gse00009991.documents.us2.oraclecloud.com/documents/link/LD27349DBB6B481AD6D241F2ECCA8B41B03CE5889340/file/D42BBC8BE086C098DF0E28FAECCA8B41B03CE5889340/_white.jpeg"});	
					}					
					break;
				case "shoes":
					items.push({"name":"Gemma Heeled Boot", "url":"https://www.countryroad.com.au/ProductImages_Display/PREVIEW/1/63754_314429_176369.jpg"});
					items.push({"name":"Eliza Boot", "url":"https://www.countryroad.com.au/ProductImages_Display/PREVIEW/1/63770_314557_176329.jpg"});
					break;
				default:
			}
        }
        conversation.variable(conversation.properties().variable, JSON.stringify(items));
        conversation.transition(items.length === 0 ? "noItems" : "success");
        done();
    }
};
