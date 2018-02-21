require.config({
  waitSeconds: 1000,
  paths: {
    text: "../json/text",
    json: "../json/json" //alias to plugin
  }
});


require([
  "./Editor",
  "./ui/menubar/Menubar" //,
  // "./Viewport" ,
  // "./ui/sidebar/Sidebar"
], function(
  Editor,
  Menubar //,
  // Viewport,
  // Sidebar
) {
  'use strict';

  Number.prototype.format = function() {
    return this.toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, "$1,");
  };


  // var editor = new Editor();
  var editor = new Editor();

  var viewport = new Viewport(editor);
  document.body.appendChild(viewport.dom);

  var sidebar = new Sidebar(editor);
  document.body.appendChild(sidebar.dom);

  var menubar = new Menubar(editor);
  document.body.appendChild(menubar.dom);

  var modal = new UI.Modal();
  document.body.appendChild(modal.dom);

  /* Windows Resize */
  function onWindowResize(event) {
    editor.signals.windowResize.dispatch();
  }
  window.addEventListener('resize', onWindowResize, false);

  onWindowResize();

});
