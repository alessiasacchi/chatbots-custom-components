
const mockCentresBySuburb = require("./redcrooss/data/centresBySuburb.json");


console.log(getMainCity(getStateFromDpostcode("Abbotsford, 2046")));


function getMainCity(state){
 
    switch(state){
        case "VIC":
            return "Melbourne";
        case "NSW":
            return "Sydney";
        case "QLD":
            return "Brisbane";
        default:
            return "Melbourne";       
    }    
}

function getStateFromDpostcode(string){

  for(var i=0; i<mockCentresBySuburb["Abbotsford"]; i++) {
    if (mockCentresBySuburb["Abbotsford"][i].startsWith(string)){
      var indexOfSecondComma = nth_ocurrence(string, ',', 2);
      var state = string.substring(indexOfSecondComma+2,string.length);
      return state.trim();
    }
  }

  
}

function nth_ocurrence(str, needle, nth) {
  for (var i=0;i<str.length;i++) {
    if (str.charAt(i) == needle) {
        if (!--nth) {
           return i;    
        }
    }
  }
  return false;
}

