define([
  "../model/model",
  "../commands/SetIndoorGMLCommand",
  "../commands/AddObjectCommand"
], function() {
  'use strict';

  function loader_1_0_1(editor) {

    var scope = this;
    var signals = editor.signals;

    this.texturePath = '';
    this.contents = null;
  }


  loader_1_0_1.prototype.parseJsonObj = function() {

    // console.log(this.contents);

    var inlineWorkerText = "self.addEventListener('message', function(e) { postMessage(e); } ,false);";
    var indoor = new Indoor("1.0.1");
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

  loader_1_0_1.prototype.loadFile = function() {
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
          console.log("succeed in converting gml to json object");

          thisobj.parseJsonObj();
        }
      }

      xhr.open("POST", "http://127.0.0.1:8080/upload_1_0_1", true);
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      var files = inputFile.files;
      for (var i = 0; i < files.length; i++) {
        formData.append("files", files[i], "upload");
      }
      xhr.send(formData);
    });

    inputFile.click();
  }

  loader_1_0_1.prototype.handleJSON = function(data, file, filename) {

    if (data.metadata === undefined) { // 2.0

      data.metadata = {
        type: 'Geometry'
      };

    }

    if (data.metadata.type === undefined) { // 3.0

      data.metadata.type = 'Geometry';

    }

    if (data.metadata.formatVersion !== undefined) {

      data.metadata.version = data.metadata.formatVersion;

    }

    switch (data.metadata.type.toLowerCase()) {

      case 'buffergeometry':

        var loader = new THREE.BufferGeometryLoader();
        var result = loader.parse(data);

        var mesh = new THREE.Mesh(result);

        editor.execute(new AddObjectCommand(mesh));

        break;

      case 'geometry':

        var loader = new THREE.JSONLoader();
        loader.setTexturePath(scope.texturePath);

        var result = loader.parse(data);

        var geometry = result.geometry;
        var material;

        if (result.materials !== undefined) {

          if (result.materials.length > 1) {

            material = new THREE.MultiMaterial(result.materials);

          } else {

            material = result.materials[0];

          }

        } else {

          material = new THREE.MeshStandardMaterial();

        }

        geometry.sourceType = "ascii";
        geometry.sourceFile = file.name;

        var mesh;

        if (geometry.animation && geometry.animation.hierarchy) {

          mesh = new THREE.SkinnedMesh(geometry, material);

        } else {

          mesh = new THREE.Mesh(geometry, material);

        }

        mesh.name = filename;

        editor.execute(new AddObjectCommand(mesh));

        break;

      case 'object':

        var loader = new THREE.ObjectLoader();
        loader.setTexturePath(scope.texturePath);

        var result = loader.parse(data);

        if (result instanceof THREE.Scene) {

          editor.execute(new SetSceneCommand(result));

        } else {

          editor.execute(new AddObjectCommand(result));

        }

        break;

      case 'scene':

        // DEPRECATED

        var loader = new THREE.SceneLoader();
        loader.parse(data, function(result) {

          editor.execute(new SetSceneCommand(result.scene));

        }, '');

        break;

      case 'app':

        editor.fromJSON(data);

        break;

    }

  }


  return loader_1_0_1;
});
