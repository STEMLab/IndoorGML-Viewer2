define([], function() {
  'use strict';

  function loader_1_0_3() {
    var scope = this;
    var signals = editor.signals;

    this.texturePath = '';
    this.contents = null;
  }

  loader_1_0_3.prototype.loadFile = function() {
    var inputFile = document.createElement('input');
    inputFile.type = 'file';

    var thisobj = this;

    inputFile.addEventListener('change', function(event) {
      var extension = inputFile.files[0].name.split('.').pop().toLowerCase();

      if (extension != 'gml') {
        alert('Unsupported file format (' + extension + ').');
        return;
      }


      var xhr = new XMLHttpRequest();
      var formData = new FormData();

      xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status == 200) {
          thisobj.contents = JSON.parse(JSON.parse(xhr.response));
          console.log(thisobj.contents);
          console.log("succeed in converting gml to json object");

          thisobj.parseJsonObj();
        }
      }

      xhr.open("POST", "http://127.0.0.1:8080/upload_1_0_3", true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      var files = inputFile.files;
      for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i], "upload");
      }
      xhr.send(formData);
    });

    inputFile.click();
  }


  loader_1_0_3.prototype.parseJsonObj = function() {

    var inlineWorkerText = "self.addEventListener('message', function(e) { postMessage(e); } ,false);";
    var indoor = new Indoor("1.0.3");
    var maxmin_xyz = indoor.init(this.contents);
    console.log("init indoorfeature!!");
    console.log(indoor);

    var ic = new SetIndoorGMLCommand();
    ic.makeGeometry(indoor, maxmin_xyz);

    console.log("move center & triangulation!!");
    var object = ic.createObject(indoor);
    console.log("create mesh!!");
    tree = new node();
    tree.init(object, null);
    editor.execute(new AddObjectCommand(object));
  }

  return loader_1_0_3;
});
