var sys = require('sys')
  , http = require('http')
  , fs = require('fs')
  , url = require('url')
  , path = require('path')
  , scriptTools = require('scriptTools')
  , _ = require('underscore')
  , mustache = require('mustache')
  , uglifyParse = require('uglify-js/parse-js')
  , uglifyProcess = require('uglify-js/process')

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


var error = "<h1>{{ code }}</h1><h2>{{ m }}<h3>{{ c }}"
var errorResponse = function(response, code, message, context){
  response.writeHead(code, {'Content-Type': 'text/html'})
  response.write(mustache.to_html(error, {code:code, m:message, c:context}))
  for(var i=0; i<514; i++){
    response.write(" ")
  } //Chrome blocks 404's - TEMP  
  response.end()
}



http.createServer(function(request, response){
  // TODO : Check cache
  
  
  
  var paths;
  
  // Parse URL
  try{
    var pathname = url.parse(request.url).pathname
    if (pathname.indexOf(URLPREFIX) === 0)
      pathname = pathname.substring(URLPREFIX.length)
    
    paths = parsePath(pathname)
  } catch (e){
    errorResponse(response, 500, "Couldn't parse url", e)
    return;
  }
  
  //[TODO Versioning]
  
  // Lookup Files
  var _f
    , out = ""
    
  try{
    _.each(paths, function(path){
      _f = DIR + path;
      out += "\n/* " + _f + " */\n"
      out += fs.readFileSync(fs.realpathSync(DIR + path), 'utf8')
    })
  } catch (e){
    debug.warn("Couldn't find file: ", _f)
    debug.log(e)
    errorResponse(response, 404, "Couldn't find script:" +  _f, e)
    return;
    
  }  
  
  
  //[TODO Dependencies?]
  
  // Concatenate
  
  // Minify
  out = uglifyProcess.gen_code(uglifyParse.parse(out))
  
  
  
  
  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end(out)
  
}).listen(PORT)
debug.log("Started server, port:", PORT, " serving from:" , DIR)
