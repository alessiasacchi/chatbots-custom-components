/* List-To-Trie.js
 * Utility designed to read in a list of strings, then convert them into a Trie (dictionary tree) 
 * 
 * Usage:
 * node list-to-trie <input_file> [-o <output_file>] [-d] [-s separator] [-t payload_type]
 * 
 * -o : specify the output file. Defaults to <input_filename>_trie.json
 * -d : debug output - pretty print the output JSON
 * -s : separator for including a payload, defaults to ',' stores all the information after the separator against the word
 * -t : payload type - Describes how to parse the payload, options include 'number', 'object' defaults to 'string'
 */
const cliParser = require('./util/cli-params');
const Dictionary = require('./dictionary');
const fs = require('fs');


if(process.argv.length < 3){
  console.log("Usage: node list-to-trie <input_file> [-o <output_file>] [-d] [-s separator] [-t payload_type]");
  process.exit();
}

//Parse parameters
var flags = cliParser.parseParamFlags(process.argv);

//Attempt to read the input file
//Could do this line by line... probably should to spare memory...
//If you want a Trie with say, every city in the world, you should probably write your own loader.
fs.readFile(process.argv[2], function(err, data){
  if(err){
    if(err.code){
      switch (err.code){
        case 'ENOENT':
          console.error('Could not open file \'' +(err.path ? err.path : process.argv[2]) +'\'');
          console.error('Are you sure this is a valid file?');
          break;
        case 'EISDIR':
          console.error('Directory specified. It is a bit hard to read a list from that.');
          console.error('Maybe a list of files in the directory? Sorry, but you have to generate that yourself.');
          console.error('Use something like: \'ls > filelist.txt\'. That isn\'t too hard is it?');
          break;
        case 'EPERM':
          console.error('No read access for \'' +(err.path ? err.path : process.argv[2]) +'\'');
          break;
        default:
          console.error(err);
      }
    }else{
      console.error(err);
    }
    process.exit();
  }
  //We have the data in a buffer or string now
  if(Buffer.isBuffer(data)){
    data = data.toString('utf8');
  }
  //Split per line
  var fileLines = data.split("\n");
  //Allow data to be cleaned up
  data = null;
  var separatorChar = (flags["s"] && flags["s"].value && flags["s"].value.length != 0 ? flags["s"].value : ",");
  var objectType = (flags["t"] && flags["t"].value && flags["t"].value.length != 0 ? flags["t"].value : "string");

  //Actual holder for our entity
  var rootNode = new Dictionary();
  for(var i=0; i<fileLines.length; i++){
    var line = fileLines[i].trim();
    var separatorIndex = line.indexOf(separatorChar);
    if(separatorIndex != -1){
      var payload;
      switch(objectType){
        case "object":
          try{
            payload = JSON.parse(line.substring(separatorIndex+1));  
          }catch(ex){
            console.error('Error parsing entry on line ' +i +' with payload type set to "object". Payload does not appear to be a valid object.');
            console.error('Not adding word to Trie');
            continue;
          }
          break;
        case "number":
          payload = Number(line.substring(separatorIndex+1));
          if(isNaN(payload)){
            console.error('Error parsing entry on line ' +i +' with payload type set to "number". Payload is NaN.');
            console.error('Not adding word to Trie');
            continue;
          }
          break;
        default:
          payload = line.substring(separatorIndex+1);
      }
      /****** BEGIN CUSTOMISATION FOR SUBURB LISTING *****/
      var word = line.substring(0, separatorIndex);
      var existingEntry = rootNode.containsWord(word);
      if(existingEntry){
        //Validate if there is already an entry for this state
        var stateEntry = false;
        for(var j=0; j<existingEntry.matches.length; j++){
          if(existingEntry.matches[j].state === payload.state){
            stateEntry = true;
            break;
          }
        }
        if(!stateEntry){
          existingEntry.matches.push(payload);
          payload = existingEntry;
        }else{
          continue;
        }
      }else{
        payload = {matches:[payload]};
      }
      /****** END CUSTOMISATION FOR SUBURB LISTING *****/
      rootNode.addWord(line.substring(0, separatorIndex), payload);
    }else{
      //Just add the word, no need for a payload
      rootNode.addWord(line);
    }
  }
  //Output the resulting dictionary
  var fileName;
  if(flags["o"] && flags["o"].value){
    fileName = flags["o"].value;
  }else{
    //cut off the file extension of the input file
    if(process.argv[2].lastIndexOf('.') != -1){
      fileName = process.argv[2].substring(0, process.argv[2].lastIndexOf('.')) +'_trie.json';
    }else{
      fileName = process.argv[2] +'_trie.json';
    }
  }
  if(flags["d"]){
    fs.writeFile(fileName, JSON.stringify(rootNode.trie.serialize(), null, 2), function(err){
      if(err){
        console.error(err);
      }else{
        console.log("Wrote Trie out in debug mode to " +fileName);
      }
    });
  }else{
    fs.writeFile(fileName, JSON.stringify(rootNode.trie.serialize()), function(err){
      if(err){
        console.error(err);
      }else{
        console.log("Wrote Trie out to " +fileName);
      }
    });
  }
});

