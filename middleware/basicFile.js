var _ = require('underscore')
  , fs = require('fs')

/* Basic file lookup */
exports.Ware = function(opts){
  return {
    process : function(paths, res, cb, opts){
        
      // Lookup Files
      var _f
        , out = ""

      try{
        _.each(paths, function(path){
          _f = opts['DIR'] + path;
          out += "\n/* " + _f + " */\n"
          out += fs.readFileSync(fs.realpathSync(_f), 'utf8')
        })

        cb(false, res + out);
      } catch (e){
        opts.debug.warn("Couldn't find file: ", _f)
        //errorResponse(response, 404, "Couldn't find script:" +  _f, e)
        cb({message: "Couldn't find file: " +  _f}, "");

      }       
    }
  }
}