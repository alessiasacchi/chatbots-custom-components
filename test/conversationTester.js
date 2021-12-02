/*
 * Quick JS testing framework for custom components.
 * Mocks up the conversation object behaviour
 */

const NLPRESULT_TYPE = 'nlpresult';

const ConversationTester = class {
  constructor(){
    this._properties = {};
    this._variables = {};
    this._replies = [];
    this._transition = "";
    this._keepTurn = true;
  }

  setProperties(props){
    this._properties = props;
  }

  resetProperties(){
    this._properties = {};
  }

  setVariables(vars){
    this._variables = vars;
  }

  resetVariables(vars){
    this._variables = {};
  }

  botId() {
    return "12345-54321-ABCDE-EDCBA";
  }

  platformVersion() {
    return "0.1";
  }

  properties() {
    return this._properties;
  }

  channelType() {
    return "facebook";
  }

  variable(name, value) {
    if(value === undefined){
      if(!this._variables[name]){
        return undefined;
      }
      return this._variables[name].value;
    }
    if(this._variables[name]){
      this._variables[name].value = value;
    }else{
      this._variables[name] = {value: value};
    }    
  }

  getStatus(){
    var ret = {};
    ret.replies = this._replies;
    ret.variables = this._variables;
    ret.transition = this._transition;
    ret.keepTurn = this._keepTurn;
    return ret;
  }

  debug(){
    console.log("------------------------------");
    console.log("REPLIES:");
    for(var i = 0; i<this._replies.length; i++){
      console.log(this._replies[i]);
    }
    console.log("------------------------------");
    console.log("VARIABLE STATE:");
    console.log(JSON.stringify(this._variables, null, 2));
    console.log("------------------------------");
    console.log("TRANSITIONING TO: " +this._transition);
    console.log("------------------------------");
    console.log("WE ARE " +(this._keepTurn ? "" : "NOT ") +"KEEPING TURN");
  }

  transition(t){
    if(!t){
      t = null;
    }
    this._transition = t;
  }

  reply(reply){
    this._replies.push(reply);
    this._keepTurn = false;
  }

  keepTurn(k){
    this._keepTurn = k;
  }

  nlpResult(nlpVariableName) {
        if (nlpVariableName === undefined) {
            for (let name in this._variables) {
                if (this._variables[name].type === NLPRESULT_TYPE) {
                    nlpVariableName = name;
                    break;
                }
            }
            if (nlpVariableName === undefined) {
                throw new Error('SDK: no nlpresult variable present');
            }
        }

        const nlpVariable = this.variable(nlpVariableName);

        if (nlpVariable === undefined) {
            throw new Error('SDK: undefined var=' + nlpVariableName);
        }

        if (this._variables[nlpVariableName].type !== NLPRESULT_TYPE) {
            throw new Error('SDK: var=' + nlpVariableName + ' not of type nlpresult');
        }
        return new NLPResult(nlpVariable);
    }

}

/**
 * Wrapper object for accessing nlpresult
 */
const NLPResult = class {
    constructor(nlpresult) {
        this._nlpresult = nlpresult;
    }

    /**
     * Returns matches for the specified entity; may be an empty collection.
     * If no entity is specified, returns the map of all entities.
     */
    entityMatches(entity) {
      if (!this._nlpresult) {
        return entity === undefined ? {} : [];
      }

      if (entity === undefined) {
        // Retrieving entityMatches collection, or an empty collection if none
        return this._nlpresult.entityMatches ? this._nlpresult.entityMatches : {};
      }
      else {
        if (this._nlpresult.entityMatches) {
          return this._nlpresult.entityMatches[entity] ? this._nlpresult.entityMatches[entity] : [];
        }
        else {
          return [];
        }
      }
    }

};

module.exports = ConversationTester;