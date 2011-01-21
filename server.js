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


var op = scriptTools.optParse(process.argv.slice(2))

scriptTools.loadConfig(op[0]['--config'] || './zoiks-config', function(config){



  var opts = _.extend(config, op[0])  
    , PORT = opts['-p'] || 80
    , DEBUGLEVEL = opts['--debug']
    , DIR = op[1][0] || __dirname
    , URLPREFIX = opts['--prefix'] || '/'
    , MINIFY = opts['--minify']
    , MIDDLEWARE = opts['middleware']
    , mws = []

  var debug = {
    'warn' : {log:function(){}, warn: console.log}
  , 'debug' : {log:console.log, warn: console.log} 
  }[DEBUGLEVEL] || {log:function(){}, warn: function(){}}

  _.each(MIDDLEWARE || {'./middleware/basicFile':{}}, function(mw, name, l){
    mws.push(require(name).Ware(mw)) //HACKY - doesn't follow ecmascript - relys on ordered object props
  })
 
 
 
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
  
  
    var respond = function (out){
        console.log("respond")
        if (MINIFY){
          // Minify
          out = uglifyProcess.gen_code(uglifyParse.parse(out))
        }
        
        response.writeHead(200, {'Content-Type': 'text/plain'});
        response.end(out) 
    }
  
    mws[0].process(paths, respond, {'DIR' : DIR, 'debug' : debug})
  
  
  }).listen(PORT)
  debug.log("Started server, port:", PORT, " serving from:" , DIR)

})
