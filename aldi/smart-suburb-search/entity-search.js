
//Assumption is that dictionary is a Trie
module.exports.containsEntity = function(str, dict){
  if(typeof dict.containsWord !== "function" || typeof dict.containsPrefix !== "function"){
    throw new SyntaxError("Dictionary doesn't implement appropriate interface!");
    return;
  }
  var ret = [];
	//How to traverse our incoming query?
  //Can't entity check every word because some entities are mutli-word
  //Hmm... Don't want to validate letter-wise
  //Ignore mid-word entities, i.e. if 'tea' is an entity, don't find it in 'instead'

  //Ok. Word-by-word, but how to split our string around spaces/punctuation?
  //Full stops are definite. Don't entity match across them. But what about IP addresses?! Eh, use regex for them.
  //Commas? Could be part of entities, but also might not be.
  //Semi-colons? Who uses those?
  //Colons - don't match across them
  //Why even make a set of punctuation?
  //Javascript string.split is too imprecise - since we lose what the trailing character is...
  //Instead walk the string with indexOf? Nope, can't accept set of characters...
  //Guess we are using regex!
  var splitString = str.match(/[\w\-]+[\W]*/g);
  //We now have a string split into words, but we didn't lose the trailing punctuation
  for(var i=0; i<splitString.length; i++){
    var res = _matchSequence(dict, splitString, i, "");
    if(res.match){
      ret.push(res.match);
    }
    if(res.index){
      i = res.index;
    }    
  }
  return ret;
}

/*
 * Need a recursive function for finding n-word sequences
 */
function _matchSequence(dict, splitString, index, currentString){
  if(dict.containsPrefix(currentString + splitString[index]) && index+1 < splitString.length){
    //Look ahead for the next word
    var res = _matchSequence(dict, splitString, index+1, currentString + splitString[index]);
    if(res.match){
      return res;
    }
  }
  //Split our word out into word components and punctuation
  var word = splitString[index].match(/([\w\-]+)([\W]*)/)[1];
  var match = dict.containsWord(currentString+word);
  return {match: match, index: match?index:null};
}