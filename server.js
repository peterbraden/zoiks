var sys = require('sys')
  , http = require('http')
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , scriptTools = require('scriptTools')
  , _ = require('underscore')

var opts = scriptTools.optParse(process.argv.slice(2))  
  , PORT = opts[0]['-p'] || 80
  , DEBUGLEVEL = opts[0]['--debug']
  , DIR = opts[1][0] || __dirname
  , URLPREFIX = opts[0]['--prefix'] || '/'


var debug = {
  'warn' : {log:function(){}, warn: console.log}
, 'debug' : {log:console.log, warn: console.log} 
}[DEBUGLEVEL] || {log:function(){}, warn: function(){}}


/*
*  Parse the url path and return a list of paths
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
  return paths
}


http.createServer(function(request, response){
  var paths;
  
  // Parse URL
  try{
    var pathname = url.parse(request.url).pathname
    if (pathname.indexOf(URLPREFIX) === 0)
      pathname = pathname.substring(URLPREFIX.length)
    
    paths = parsePath(pathname)
  } catch (e){
    response.writeHead(500, {'Content-Type': 'text/plain'})
    response.end("Error:", e) 
    return;
  }
  
  //[TODO Versioning]
  
  // Lookup Files
  var _f
  try{
    _.each(paths, function(path){
      _f = DIR + path;
      console.log(fs.readFileSync(fs.realpathSync(DIR + path), 'utf8'))
    
    })
  } catch (e){
    debug.warn("Couldn't find file: ", _f)
    debug.log(e)
    response.writeHead(404, {'Content-Type': 'text/html'})
    response.write("Couldn't find script:" +  _f)
    response.write("While serving:" + paths.join(" "))
    response.end("Error:" + e) 
    return;
    
  }  
  
  
  //[TODO Dependencies?]
  
  // Concatenate
  
  //[TODO MINIFY]
  
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end("!")
  
}).listen(PORT)
debug.log("Started server, port:", PORT, " serving from:" , DIR)
