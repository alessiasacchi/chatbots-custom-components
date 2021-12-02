/*
 * Little parameter parsing utility for UNIX style CLI parameters
 */

module.exports.parseParamFlags = function(argv){
  var flags = {};
  //Assumption is that flags will starts with a '-'
  //Start parsing at 2, since 0 is 'node' and 1 is 'main.js'
  for(var i = 2; i<argv.length; i++){
    if(argv[i].charAt(0) === '-'){
      var flagName = argv[i].match(/-+(.*)/)[1];
      flags[flagName] = {};
      //Lookahead to see if it is a toggle flag, or has been passed a value
      if(i+1 !== argv.length && argv[i+1].charAt(0) !== '-'){
        flags[flagName].value = argv[i+1];
        i++;
      }
    }
  }
  return flags;
}