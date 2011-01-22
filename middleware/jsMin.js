var _ = require('underscore')
  , uglifyParse = require('uglify-js/parse-js')
  , uglifyProcess = require('uglify-js/process')

/* Basic file lookup */
exports.Ware = function(opts){
  return {
    /*
    * We assume that all the res is js at this point
    */
    process : function(paths, res, cb, opts){
      cb(false, uglifyProcess.gen_code(uglifyParse.parse(res)))
    }
  }
}    