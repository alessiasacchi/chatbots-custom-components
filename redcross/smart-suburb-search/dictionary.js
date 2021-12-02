/*
 * Implementation of a Dictionary structure, simple wrapper around a Trie datastructure
 */
const TrieNode = require('./util/trie-node');

function Dictionary(serializedTrie){
  if(serializedTrie){
    this.trie = new TrieNode(serializedTrie);
  }else{
    this.trie = new TrieNode();
  }	
}

Dictionary.prototype.addWord = function(word, wordPayload) {
  //Our dictionary is lower case, so searches can be case sensitive
	this.trie.addSuffix(word.toLowerCase(), wordPayload);
};

//Check is a word is in our dictionary. Case insensitive
Dictionary.prototype.containsWord = function(word) {
  return this.trie.containsSuffix(word.toLowerCase());
};

//Checks if a sequence of characters is in our dictionary at the start of a word
Dictionary.prototype.containsPrefix = function(prefix) {
  return this.trie.containsPrefix(prefix.toLowerCase());
};

module.exports = Dictionary;