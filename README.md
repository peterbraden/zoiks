# Zoiks #

Serve your scripts in a single request.
 
## intro
Each request you make to the server is slow. Rather than package your
javascript up at build time, why not just ask for several files at once, and
bundle them together on the server. One more command line flag and they're 
minified. Another and the output is cached. And it's in node, so it's faster 
than you'll ever need.


## use
    node server.js -p=<PORT> --debug=<DEBUG LEVEL = debug/warn> /path/to/your/files
  
  
then:

request files, separated with commas in the url:

    http://localhost:8090/foo.js,bar.js  

if you have long path names you can save characters by using brackets:

    http://localhost:8090/foo/bar/[baz.js,bong.js]

and you can nest brackets:

    http://localhost:8090/foo/bar/[baz.js,bong.js,bing/[bang.js,bot.js]]

## Middleware  

You can run arbitrary scripts on your files - so you can retrieve dependancies in js, use sass for your css...