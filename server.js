var sys = require('sys')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , scriptTools = require('scriptTools')
  , _ =require('underscore')

var opts = scriptTools.optParse()  


/*
* 
*/
var parsePath = function(filepath){
  var paths = []
  
  var _subRec = function(path, prefix){
    var curr = ''
    
    for (var i=0, ii = path.length; i<ii; i++){
      var charAt = path.charAt(i);
      //if (charAt === '['){
      //  var x = _subRec(path.substring(i), prefix + currP)
      //  //x
      //}
      
      switch(charAt){
        case '[':
          i = i + _subRec(path.substring(i+1), prefix + curr)
          curr = ''
          break
        
        case ']':
          if (curr)
            paths.push(prefix + curr)
          return i
        
        case ',':
          paths.push(prefix + curr)
          curr = ''
          break
          
        default:
          curr += charAt
          break
      }
      
    }
    if (curr)
      paths.push(prefix + curr)
    return i
  }
  
  _subRec(filepath, '')
  console.log(filepath, "PATHS:", paths.join(" & "))
  return paths
}


http.createServer(function(request, response){
  
  var path = url.parse(request.url).pathname
  
  parsePath(path)
  
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("!")
  
}).listen(8090)

