/**
 * @author mrdoob / http://mrdoob.com/
 */
define([
  "./MenubarFile",
  "./MenubarHelp",
  "./MenubarSettings"
], function(
  MenubarFile,
  MenubarSettings,
  MenubarHelp
) {
  'use strict';

	var Menubar = function ( editor ) {

		var container = new UI.Panel();
		container.setId( 'menubar' );

		container.add( new MenubarFile( editor ) );
		container.add( new MenubarSettings( editor ) );
		container.add( new MenubarHelp( editor ) );

		/**
		*	@deprecated hgryoo
		*
			container.add( new Menubar.Edit( editor ) );
			container.add( new Menubar.Add( editor ) );
			container.add( new Menubar.Play( editor ) );
			container.add( new Menubar.Examples( editor ) );
			container.add( new Menubar.Status( editor ) );
		*/

		return container;

	};

  return Menubar;
});
