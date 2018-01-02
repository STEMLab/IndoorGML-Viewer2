/**
 * @author mrdoob / http://mrdoob.com/
 */

define([], function() {
  'use strict';

	function MenubarFile( editor ) {

		var container = new UI.Panel();
		container.setClass( 'menu' );

		var title = new UI.Panel();
		title.setClass( 'title' );
		title.setTextContent( 'File' );
		container.add( title );

		var options = new UI.Panel();
		options.setClass( 'options' );
		container.add( options );

		// New
		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'New' );
		option.onClick( function () {
			if ( confirm( 'Any unsaved data will be lost. Are you sure?' ) ) {
				editor.clear();
			}
		});
		options.add( option );

		options.add( new UI.HorizontalRule() );

		// Import
		var option = new UI.Row();
		option.setClass( 'option' );
		option.setTextContent( 'Import' );
		options.add( option );

    var importOptions = new UI.Panel();
    importOptions.setClass( 'options' );
    option.add( importOptions );

    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'IndoorGML_1.0.1' );
    option.onClick( function () {
			console.log(">>>> now import IndoorGML_1.0.1");
      editor.loader.setLoaderVersion("1.0.1");
      editor.loader.loadFile();
		});
    importOptions.add( option );

    var option = new UI.Row();
    option.setClass( 'option' );
    option.setTextContent( 'IndoorGML_1.0.3' );
    option.onClick( function () {
        console.log(">>>> now import IndoorGML_1.0.3");
        editor.loader.setLoaderVersion("1.0.3");
        editor.loader.loadFile();
    });
    importOptions.add( option );

		return container;

	};

  return MenubarFile;
});
