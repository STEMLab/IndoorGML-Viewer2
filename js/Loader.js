/**
 * @author mrdoob / http://mrdoob.com/
 */

define([
  "./loader/loader_1_0_1",
  "./loader/loader_1_0_3"
], function(
  loader_1_0_1,
  loader_1_0_3
) {
  'use strict';

  function Loader(editor) {
    this.editor = editor;
    this.loader = new loader_1_0_1(editor);
  }

  Loader.prototype.loadFile = function(file){
    this.loader.loadFile(file);
  }

  Loader.prototype.handleJSON = function(data, file, filename){
    this.loader.loadFile(data, file, filename);
  }


  Loader.prototype.setLoaderVersion = function(version) {
    if (version === "1.0.1") {
      this.loader = new loader_1_0_1(this.editor);
    } else if (version === "1.0.3") {
      this.loader = new loader_1_0_3(this.editor);
    } else {
      alter("err. wrong loader version");
    }
  }



  return Loader;
});
