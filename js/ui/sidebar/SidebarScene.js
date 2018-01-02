/**
 * @author mrdoob / http://mrdoob.com/
 */
define([], function() {
  'use strict';

  function SidebarScene(editor) {

    var signals = editor.signals;

    var container = new UI.Panel();
    container.setBorderTop('0');
    container.setPaddingTop('10px');

    var ignoreObjectSelectedSignal = false;

    /* outliner settings */
    var outliner = new UI.Outliner(editor);
    outliner.setId('outliner');
    outliner.onChange(function() {

      ignoreObjectSelectedSignal = true;

      editor.selectById(parseInt(outliner.getValue()));

      ignoreObjectSelectedSignal = false;

    });
    outliner.onDblClick(function() {

      editor.focusById(parseInt(outliner.getValue()));

    });
    container.add(outliner);
    container.add(new UI.Break());

    var expandList = [];
    var parents = [];
    // fog

    /*var updateFogParameters = function () {

			var near = fogNear.getValue();
			var far = fogFar.getValue();
			var density = fogDensity.getValue();

			signals.fogParametersChanged.dispatch( near, far, density );

		};*/

    /*var fogTypeRow = new UI.Row();
		var fogType = new UI.Select().setOptions( {

			'None': 'None',
			'Fog': 'Linear',
			'FogExp2': 'Exponential'

		} ).setWidth( '150px' );
		fogType.onChange( function () {

			var type = fogType.getValue();
			signals.fogTypeChanged.dispatch( type );

			refreshFogUI();

		} );

		fogTypeRow.add( new UI.Text( 'Fog' ).setWidth( '90px' ) );
		fogTypeRow.add( fogType );

		container.add( fogTypeRow );

		// fog color

		var fogColorRow = new UI.Row();
		fogColorRow.setDisplay( 'none' );

		var fogColor = new UI.Color().setValue( '#aaaaaa' )
		fogColor.onChange( function () {

			signals.fogColorChanged.dispatch( fogColor.getHexValue() );

		} );

		fogColorRow.add( new UI.Text( 'Fog color' ).setWidth( '90px' ) );
		fogColorRow.add( fogColor );

		container.add( fogColorRow );

		// fog near

		var fogNearRow = new UI.Row();
		fogNearRow.setDisplay( 'none' );

		var fogNear = new UI.Number( 1 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

		fogNearRow.add( new UI.Text( 'Fog near' ).setWidth( '90px' ) );
		fogNearRow.add( fogNear );

		container.add( fogNearRow );

		var fogFarRow = new UI.Row();
		fogFarRow.setDisplay( 'none' );

		// fog far

		var fogFar = new UI.Number( 5000 ).setWidth( '60px' ).setRange( 0, Infinity ).onChange( updateFogParameters );

		fogFarRow.add( new UI.Text( 'Fog far' ).setWidth( '90px' ) );
		fogFarRow.add( fogFar );

		container.add( fogFarRow );

		// fog density

		var fogDensityRow = new UI.Row();
		fogDensityRow.setDisplay( 'none' );

		var fogDensity = new UI.Number( 0.00025 ).setWidth( '60px' ).setRange( 0, 0.1 ).setPrecision( 5 ).onChange( updateFogParameters );

		fogDensityRow.add( new UI.Text( 'Fog density' ).setWidth( '90px' ) );
		fogDensityRow.add( fogDensity );

		container.add( fogDensityRow );*/

    //

    // this.

    // this.

    /*var refreshFogUI = function () {

			var type = fogType.getValue();

			fogColorRow.setDisplay( type === 'None' ? 'none' : '' );
			fogNearRow.setDisplay( type === 'Fog' ? '' : 'none' );
			fogFarRow.setDisplay( type === 'Fog' ? '' : 'none' );
			fogDensityRow.setDisplay( type === 'FogExp2' ? '' : 'none' );

		};*/

    this.refreshUI();

    // events

    signals.sceneGraphChanged.add(this.refreshUI);

    signals.objectSelected.add(function(object) {

      if (object !== null) {
        if ((typeof Information[object.name] == 'undefined') && (typeof StateInformation[object.name] == 'undefined')) {
          //console.log("refreshui in signals.objectSelected.add");
          refreshUI();
        }

      }

      if (ignoreObjectSelectedSignal === true) return;

      outliner.setValue(object !== null ? object.id : null);


    });

    return container;

  }

  SidebarScene.prototype.getScript = function(uuid) {
    if (editor.scripts[uuid] !== undefined) {
      return ' <span class="type Script"></span>';
    }
    return '';
  }

  SidebarScene.prototype.addObjects = function(objects, pad, options) {
    var thisObj = this;

    var objectLength = objects.length;
    for (var i = 0; i < objectLength; i++) {

      var object = objects[i];

      if (object.type == 'Object3D') {

        var html = pad + '<span class="type ' + object.type + '"></span> ' + object.name;
        //var html = pad + '<input type="checkbox" id=' + object.name + '> ' + object.name;

        /*if ( object instanceof THREE.Mesh ) {

          var geometry = object.geometry;
          var material = object.material;

          html += ' <span class="type ' + geometry.type + '"></span> ' + geometry.name;
          html += ' <span class="type ' + material.type + '"></span> ' + material.name;

        }*/

        html += this.getScript(object.uuid);

        options.push({
          value: object.id,
          html: html
        });

        if (editor.selected !== null) {
          var index = this.parents.indexOf(object);
          if (index != -1) {
            this.addObjects(object.children, pad + '&nbsp;&nbsp;&nbsp;', options);
            continue;
          }

          if (object == editor.selected) {
            index = expandList.indexOf(object);
            if (index == -1) {
              expandList.push(object);
            } else {
              expandList.splice(index, 1);
            }
          }
        }
        //console.log(editor.selected);
        var index = expandList.indexOf(object);
        if (index != -1) {
          var expand = expandList[index];
          while (expand) {
            if (object == expand) {
              this.addObjects(object.children, pad + '&nbsp;&nbsp;&nbsp;', options);
            }
            expand = expand.parent;
          }
        }
        /*
        var selected = editor.selected;
        while(selected) {
          if(object == selected) {
              this.addObjects( selected.children, pad + '&nbsp;&nbsp;&nbsp;', options);
          }
          selected = selected.parent;
        }
        */
      }
    }
  }

  SidebarScene.prototype.refreshUI = function() {

    var camera = editor.camera;
    var scene = editor.scene;

    var options = [];

    //options.push( { static: true, value: camera.id, html: '<span class="type ' + camera.type + '"></span> ' + camera.name } );
    //options.push( { static: true, value: scene.id, html: '<span class="type ' + scene.type + '"></span> ' + scene.name + getScript( scene.uuid ) } );

    if (editor.selected !== null) {
      var parent = editor.selected.parent;
      while (parent) {
        this.parents.push(parent);
        parent = parent.parent;
      }
    }

    this.addObjects(scene.children, '', options);
    if( this.parents != undefined ){
      this.parents.splice(0, this.parents.length);
    }

    this.outliner.setOptions(options);

    if (editor.selected !== null) {
      outliner.setValue(editor.selected.id);
    }
    /*if ( scene.fog ) {

      fogColor.setHexValue( scene.fog.color.getHex() );

      if ( scene.fog instanceof THREE.Fog ) {

        fogType.setValue( "Fog" );
        fogNear.setValue( scene.fog.near );
        fogFar.setValue( scene.fog.far );

      } else if ( scene.fog instanceof THREE.FogExp2 ) {

        fogType.setValue( "FogExp2" );
        fogDensity.setValue( scene.fog.density );

      }

    } else {

      fogType.setValue( "None" );

    }

    refreshFogUI();*/

  };



  return SidebarScene;
});
