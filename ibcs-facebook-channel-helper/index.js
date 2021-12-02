const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const createHash = require('sha.js');
const shaOne = createHash('sha1');
const http = require('http');

const botConfig = require('./config/ibcs_config.json');



var app = express();
app.set('port', (process.env.PORT || 3300));

//Copy the raw bytes into a buffer for passing through using request
app.use(bodyParser.json());

//TODO: Validate inbound message!!!

//Add our rewrite middleware
app.use(logMessage);

app.all('/webhook', rewriteLocation, function(req, res){
  //Passthrough to backend
  var options = {
    url: botConfig.ibcsUrl,
    headers: req.headers,
    method: req.method,
    followRedirect: false
  };
  if(req.body){
    options.body = JSON.stringify(req.body);
    options.headers['X-Hub-Signature'] = signBody(JSON.stringify(req.body));
  }
  request(options, function(err, response, data){
    if(err){
      res.status(500).send("Error invoking backend service.");
      return;
    }
    if(!data){
      data = "";
    }
    logResponse(response, data);
    res.set(response.headers).status(response.statusCode).send(data);
  });
});

function rewriteLocation(req, res, next){
  if(req.body && req.body.entry && req.body.entry.length > 0){
    for(var i = 0; i<req.body.entry.length; i++){
      if(req.body.entry[i].messaging && req.body.entry[i].messaging.length > 0){
        for(var j = 0; j<req.body.entry[i].messaging.length; j++){
          if(req.body.entry[i].messaging[j].message.attachments && req.body.entry[i].messaging[j].message.attachments.length > 0){
            for(var k = 0; k<req.body.entry[i].messaging[j].message.attachments.length; k++){
              var attachment = req.body.entry[i].messaging[j].message.attachments[k];
              if(attachment.type && attachment.type === 'location'){
                if(attachment.payload && attachment.payload.coordinates){
                  if(!req.body.entry[i].messaging[j].message.text){
                    req.body.entry[i].messaging[j].message.text = "";  
                  }else{
                    req.body.entry[i].messaging[j].message.text += " ";
                  }
                  if(attachment.title){
                    req.body.entry[i].messaging[j].message.text += attachment.title +": ";
                  }
                  if(attachment.payload.coordinates.lat){
                    req.body.entry[i].messaging[j].message.text += "lat: " +attachment.payload.coordinates.lat;
                  }
                  if(attachment.payload.coordinates.long){
                    req.body.entry[i].messaging[j].message.text += " long: " +attachment.payload.coordinates.long;
                  }
                }
              }
            }
          }
        }  
      }  
    }
  }
  next();
}

function logMessage(req, res, next){
  console.log("REQUEST: " +req.method.toUpperCase() +" " +req.originalUrl);
  console.log("Headers: " +JSON.stringify(req.headers, null, 2));
  if(req.body){
    console.log("Body: " +JSON.stringify(req.body, null, 2));
  }
  next();
}

function logResponse(res, data){
  console.log("RESPONSE: " +res.statusCode);
  console.log("Headers: " +JSON.stringify(res.headers, null, 2));
  if(data){
    console.log("Body: " +JSON.stringify(data, null, 2));
  }
}

// Update the X-Hub-Signature so that our message still looks valid to IBCS
function signBody(body){
  //FB is not clear on whether it pre-pends or post-pends the key.
  //Going to assume post-pends in first test
  var hash = shaOne.update(body +botConfig.fbSecret, 'utf8').digest('hex');
  return hash;
}

//Helper to extract the components of the posted request
function getParameterByName(name, url) {
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("(^|&)" + name + "(=([^&#]*)|&|#|$)"),
      results = regex.exec(url);
  if (!results) return null;
  if (!results[3]) return '';
  return decodeURIComponent(results[3].replace(/\+/g, " "));
}

var httpServer = http.createServer(app);

httpServer.listen(app.get('port'), null, 511, function () {
  console.log('Facebook helper listening on port ' +app.get('port'));
});
