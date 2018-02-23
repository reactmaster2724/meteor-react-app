/*
 * The PhantomJS driver for generating PDF files
  */
var page = require('webpage').create();
var fs = require('fs');
var assets_root = 'assets/app/';
var system = require('system');
var args = system.args;

var content = "";
var loc ="/tmp/pdfgen_" + Date.now() + ".pdf";

if(args.length == 1){
  content = "Must supply a file to read from."
} else {
  try {
    content = fs.read(args[1]);
    if(args[1].indexOf('.json') >= 0){
      // We're dealing with a json file
      var json = JSON.parse(content);
      content = json.body;
    }

  } catch (e) {
    content = JSON.stringify(e);
  }

}

//page.setContent("<html><body><div style='font-size:30px;'>Test</div></body></html>");
page.setContent( "<html><body>"+content+"</body></html>", function(){

});

page.render(loc, {format: 'pdf', quality: '100'});

console.log(loc);
phantom.exit();