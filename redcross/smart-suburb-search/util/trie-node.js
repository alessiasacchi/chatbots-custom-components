/*
 * Implementation of a Trie Data structure, configurable with arbitrary payloads.
 */

function TrieNode(serializedTrie){
  if(serializedTrie){
    this.isWord = serializedTrie.i;
    this.payload = serializedTrie.p;
    this.children = {};
    for(var child in serializedTrie.c){
      this.children[child] = new TrieNode(serializedTrie.c[child]);
    }
  }else{
    this.isWord = false;
    this.payload;
    this.children = {};
  }
	
}

TrieNode.prototype.addSuffix = function(suffix, suffixPayload) {
	if(suffix.length === 0){
		this.isWord = true;
    this.payload = suffixPayload;
    return;
	}
  if(!this.children[suffix.charAt(0)]){
    this.children[suffix.charAt(0)] = new TrieNode();
  }
  this.children[suffix.charAt(0)].addSuffix(suffix.substring(1), suffixPayload);
};

//Recurse through the dictionary, returning the payload if the suffix exists, or false if it does not.
TrieNode.prototype.containsSuffix = function(suffix) {
  if(suffix.length === 0){
    if(this.isWord){
      return this.payload !== undefined && this.payload !== null ? this.payload : true;
    }
    return false;
  }
  if(this.children[suffix.charAt(0)]){
    return this.children[suffix.charAt(0)].containsSuffix(suffix.substring(1));
  }
  return false;
};

//Recurse through the dictionary, returning true if the whole prefix exists, or false if it does not.
TrieNode.prototype.containsPrefix = function(prefix) {
  if(prefix.length === 0){
    return true;
  }
  if(this.children[prefix.charAt(0)]){
    return this.children[prefix.charAt(0)].containsPrefix(prefix.substring(1));
  }
  return false;
};

//Custom serialize function, since recursion otherwise breaks it.
TrieNode.prototype.serialize = function(){
  var thisObj = {};
  thisObj.i = this.isWord;
  thisObj.p = (this.payload ? this.payload : null);
  thisObj.c = {};
  for(var child in this.children){
    thisObj.c[child] = this.children[child].serialize();
  }
  return thisObj;
};


module.exports = TrieNode;