var express = require("express");
var fileUpload = require("express-fileupload");
var app = express();
var path = require("path");
var fs = require("fs");
var bodyParser = require('body-parser');

app.use('/', express.static(__dirname));
app.use(fileUpload());

var server = app.listen(8080, function() {
  console.log('Example app listening on port 8080...');
})


app.post('/upload_1_0_1', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  console.log("1.0.1 >> file uploaded");
  let file = req.files.files;

  file.mv('tmpgml.gml', function(err) {
    if (err)
      return res.status(500).send(err);

    var Jsonix = require('jsonix').Jsonix;
    var XLink_1_0 = require('w3c-schemas').XLink_1_0;
    var GML_3_2_1 = require('ogc-schemas').GML_3_2_1;
    var IndoorGML_Core_1_0 = require('ogc-schemas').IndoorGML_Core_1_0;
    var IndoorGML_Navigation_1_0 = require('ogc-schemas').IndoorGML_Navigation_1_0;

    var mappings = [XLink_1_0, GML_3_2_1, IndoorGML_Core_1_0, IndoorGML_Navigation_1_0];

    var context = new Jsonix.Context(mappings, {
      namespacePrefixes: {
        'http://www.w3.org/1999/xlink': 'xlink',
        'http://www.opengis.net/gml/3.2': 'gml',
        'http://www.opengis.net/indoorgml/1.0/core': '',
        'http://www.opengis.net/indoorgml/1.0/navigation': 'ns4'
      }
    });

    var unmarshaller = context.createUnmarshaller();
    var resume = unmarshaller.unmarshalFile("tmpgml.gml", function(result) {
      console.log("1.0.1 >> converting complete");
      // res.writeHead(200, {'Content-Type': 'application/json'});
      var responseData = JSON.stringify(result, null, 1);
      res.json(responseData);

      console.log("1.0.1 >> send json");
    });
  });
});


app.post('/upload_1_0_3', function(req, res) {
  if (!req.files)
    return res.status(400).send('No files were uploaded.');

  console.log("1.0.3 >> file uploaded");
  let file = req.files.files;

  file.mv('tmpgml.gml', function(err) {
    if (err)
      return res.status(500).send(err);

    var IndoorGML_Core_1_0_3 = require('./json/IndoorGML_Core_1_0_3.js').IndoorGML_Core_1_0_3;
    var Jsonix = require('jsonix').Jsonix;
    var context = new Jsonix.Context([IndoorGML_Core_1_0_3]);
    var unmarshaller = context.createUnmarshaller();

    var unmarshaller = context.createUnmarshaller();
    var resume = unmarshaller.unmarshalFile("tmpgml.gml", function(result) {
      console.log("1.0.3 >> converting complete");

      var responseData = JSON.stringify(result, null, 1);
      res.json(responseData);

      console.log("1.0.3 >> send json");
    });
  });
});
