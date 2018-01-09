/**
 * @author mrdoob / http://mrdoob.com/
 */

var Viewport = function(editor) {

  var signals = editor.signals;

  var container = new UI.Panel();
  container.setId('viewport');
  container.setPosition('absolute');

  //container.add( new Viewport.Info( editor ) );

  var scene = editor.scene;
  var sceneHelpers = editor.sceneHelpers;

  var objects = [];

  // helpers

  var grid = new THREE.GridHelper(30, 1);
  grid.visible = false;
  sceneHelpers.add(grid);

  //

  var camera = editor.camera;

  //

  var selectionBox = new THREE.BoxHelper();
  selectionBox.material.depthTest = false;
  selectionBox.material.transparent = true;
  selectionBox.visible = false;
  sceneHelpers.add(selectionBox);

  var objectPositionOnDown = null;
  var objectRotationOnDown = null;
  var objectScaleOnDown = null;


  /*
  	var transformControls = new THREE.TransformControls( camera, container.dom );
  	transformControls.addEventListener( 'change', function () {

  		var object = transformControls.object;

  		if ( object !== undefined ) {

  			selectionBox.update( object );

  			if ( editor.helpers[ object.id ] !== undefined ) {

  				editor.helpers[ object.id ].update();

  			}

  			signals.refreshSidebarObject3D.dispatch( object );

  		}

  		render();

  	} );
  	transformControls.addEventListener( 'mouseDown', function () {

  		var object = transformControls.object;

  		objectPositionOnDown = object.position.clone();
  		objectRotationOnDown = object.rotation.clone();
  		objectScaleOnDown = object.scale.clone();

  		controls.enabled = false;

  	} );
  	transformControls.addEventListener( 'mouseUp', function () {

  		var object = transformControls.object;

  		if ( object !== null ) {

  			switch ( transformControls.getMode() ) {

  				case 'translate':

  					if ( ! objectPositionOnDown.equals( object.position ) ) {

  						editor.execute( new SetPositionCommand( object, object.position, objectPositionOnDown ) );

  					}

  					break;

  				case 'rotate':

  					if ( ! objectRotationOnDown.equals( object.rotation ) ) {

  						editor.execute( new SetRotationCommand( object, object.rotation, objectRotationOnDown ) );

  					}

  					break;

  				case 'scale':

  					if ( ! objectScaleOnDown.equals( object.scale ) ) {

  						editor.execute( new SetScaleCommand( object, object.scale, objectScaleOnDown ) );

  					}

  					break;

  			}

  		}

  		controls.enabled = true;

  	} );

  	sceneHelpers.add( transformControls );
    */
  // fog

  var oldFogType = "None";
  var oldFogColor = 0xaaaaaa;
  var oldFogNear = 1;
  var oldFogFar = 5000;
  var oldFogDensity = 0.00025;

  // object picking

  var raycaster = new THREE.Raycaster();
  var mouse = new THREE.Vector2();

  // events

  function getIntersects(point, objects) {

    mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);

    raycaster.setFromCamera(mouse, camera);

    return raycaster.intersectObjects(objects);

  }

  var onDownPosition = new THREE.Vector2();
  var onUpPosition = new THREE.Vector2();
  var onDoubleClickPosition = new THREE.Vector2();

  function getMousePosition(dom, x, y) {

    var rect = dom.getBoundingClientRect();
    return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

  }

  function handleClick() {
    //TODO : selecting object 3D from viewport
    if (onDownPosition.distanceTo(onUpPosition) === 0) {

      var intersects = getIntersects(onUpPosition, objects);

      if (intersects.length > 0) {

        /*
				var object = intersects[ 0 ].object;
				for ( var i = 0; i < intersects.length; i++ ) {
						if(intersects[i].object.constructor === THREE.Object3D) {
							//console.log(typeof intersects[i].object);
							object = intersects[i].object;
							break;
						}
				}

				if ( object.userData.object !== undefined ) {

					// helper
					editor.select( object.userData.object );

				} else {

					editor.select( object );

				}

			} else {

				editor.select( null );
			*/
      }

      render();
    }
  }

  function onMouseDown(event) {

    event.preventDefault();

    var array = getMousePosition(container.dom, event.clientX, event.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('mouseup', onMouseUp, false);

  }

  function onMouseUp(event) {

    var array = getMousePosition(container.dom, event.clientX, event.clientY);
    onUpPosition.fromArray(array);

    handleClick();

    document.removeEventListener('mouseup', onMouseUp, false);

  }

  function onTouchStart(event) {

    var touch = event.changedTouches[0];

    var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
    onDownPosition.fromArray(array);

    document.addEventListener('touchend', onTouchEnd, false);

  }

  function onTouchEnd(event) {

    var touch = event.changedTouches[0];

    var array = getMousePosition(container.dom, touch.clientX, touch.clientY);
    onUpPosition.fromArray(array);

    handleClick();

    document.removeEventListener('touchend', onTouchEnd, false);

  }

  function onDoubleClick(event) {
    editor.select(null);
    render();
    //TODO : focusing object from viewport
    /*
		var array = getMousePosition( container.dom, event.clientX, event.clientY );
		onDoubleClickPosition.fromArray( array );

		var intersects = getIntersects( onDoubleClickPosition, objects );

		if ( intersects.length > 0 ) {

			var intersect = intersects[ 0 ];
			for ( var i = 0; i < intersects.length; i++ ) {
					if(typeof intersects[i].object === THREE.Object3D) {
						intersect = intersects[i];
						break;
					}
			}

			signals.objectFocused.dispatch( intersect.object );

		}
*/
  }

  container.dom.addEventListener('mousedown', onMouseDown, false);
  container.dom.addEventListener('touchstart', onTouchStart, false);
  container.dom.addEventListener('dblclick', onDoubleClick, false);

  // controls need to be added *after* main logic,
  // otherwise controls.enabled doesn't work.

  var controls = new THREE.EditorControls(camera, container.dom);
  controls.addEventListener('change', function() {

    //transformControls.update();
    signals.cameraChanged.dispatch(camera);

  });

  // signals

  signals.editorCleared.add(function() {

    controls.center.set(0, 0, 0);
    render();

  });

  var clearColor = 0x333333;

  signals.themeChanged.add(function(value) {

    switch (value) {

      case 'css/light.css':
        grid.setColors(0x444444, 0x888888);
        clearColor = 0xaaaaaa;
        break;
      case 'css/dark.css':
        grid.setColors(0xbbbbbb, 0x888888);
        clearColor = 0x333333;
        break;

    }

    renderer.setClearColor(clearColor);

    render();

  });

  signals.transformModeChanged.add(function(mode) {

    //transformControls.setMode( mode );

  });

  signals.snapChanged.add(function(dist) {

    //transformControls.setTranslationSnap( dist );

  });

  signals.spaceChanged.add(function(space) {

    //transformControls.setSpace( space );

  });

  signals.rendererChanged.add(function(newRenderer) {

    if (renderer !== null) {

      container.dom.removeChild(renderer.domElement);

    }

    renderer = newRenderer;

    renderer.autoClear = false;
    renderer.autoUpdateScene = false;
    renderer.setClearColor(clearColor);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

    container.dom.appendChild(renderer.domElement);

    render();

  });

  signals.sceneGraphChanged.add(function() {

    render();

  });

  var saveTimeout;

  signals.cameraChanged.add(function() {

    render();

  });

  var oldHighlightObj = null;
  var highlightColor = 0xffff00;
  var highlightOpacity = 0.99;
  var unHighlightCellColor = 0x000000;
  var unHighlightCellBoundaryColor = 0x00ffff;
  var unHighlightCellNodeColor = 0xffffff;
  var unHighlightEdgeColor = 0x00ffff;
  var unHighlightOpacity = 0.3;


  /**
   * change color of selected object
   */
  function highlightObj(objKey) {

    coloringObj(objKey, highlightColor);

  }

  function unHighlightOldObj() {

    if (oldHighlightObj == null) return;

    var type = AllGeometry[oldHighlightObj].parent.name;

    if (type == "CellSpace") {

      coloringObj(oldHighlightObj, unHighlightCellColor);

    } else if (type == "CellSpaceBoundary") {

      coloringObj(oldHighlightObj, unHighlightCellBoundaryColor);

    } else if (type == "nodes") {

      coloringObj(oldHighlightObj, unHighlightCellNodeColor);

    } else if (type == "edges") {

      coloringObj(oldHighlightObj, unHighlightEdgeColor);

    }

  }

  function coloringObj(objName, color) {
    var obj = AllGeometry[objName];

    obj.renderOrder = 999;

    obj.onBeforeRender = () => {
      renderer.clearDepth();
    };

    if (obj.parent.name == "CellSpace") {

      for (var i in obj.children) {

        if (obj.children[i].type == "Mesh") {
          obj.children[i].material.emissive.setHex(color);
          // obj.children[i].material.depthTest = false;
          // obj.children[i].material.depthWrite = false;
        }

      }

    } else if (obj.parent.name == "CellSpaceBoundary") {

      console.log(obj);

      for (var i in obj.children) {

        if (obj.children[i].type == "Mesh"){

          obj.children[i].material.color.setHex(color);
        }

      }

    } else if (obj.parent.name == "nodes") {

      obj.children[0].material.color.setHex(color);

    } else if (obj.parent.name == "edges") {

      obj.children[0].material.color.setHex(color);

    }

  }



  function changeOpacity(objKey) {

    // console.log(objKey);

    /**
     * give transparency to unhighligted object
     */
    for (var i in AllGeometry) {

      var obj = AllGeometry[i];

      if (obj.parent.name == "CellSpace" || obj.parent.name == "CellSpace") {

        for (var j in obj.children) {

          obj.children[j].material.opacity = 0.3;

          if (obj.children[j].type == "Line")
            obj.children[j].material.transparent = true;

        }

      } else if (obj.parent.name == "nodes") {

        obj.children[0].material.opacity = 0;
        obj.children[0].material.transparent = true;

      } else if (obj.parent.name == "edges") {

        obj.children[0].material.opacity = 0.3;
        obj.children[0].material.transparent = true;

      }
    }

    /**
     * remove transparency of unhighligted object
     */
    var obj = AllGeometry[objKey];

    if (obj.parent.name == "CellSpace" || obj.parent.name == "CellSpace") {

      for (var j in obj.children) {

        obj.children[j].material.opacity = 1;

        if (obj.children[j].type == "Line")
          obj.children[j].material.transparent = false;

      }

    } else if (obj.parent.name == "nodes") {

      obj.children[0].material.opacity = 1;

    } else if (obj.parent.name == "edges") {

      obj.children[0].material.opacity = 1;
      obj.children[0].material.transparent = false;

    }

  }


  signals.objectSelected.add(function(object) {

    if (object != null) {
      if (object.name == oldHighlightObj) {

        unHighlightAll();
        oldHighlightObj = null;

      } else if (object.parent.name == "CellSpace" ||
        object.parent.name == "CellSpaceBoundary" ||
        object.parent.name == "nodes" ||
        object.parent.name == "edges") {

        highlightObj(object.name);
        unHighlightOldObj();
        changeOpacity(object.name);
        oldHighlightObj = object.name;

        camera.lookAt(object.children[0].geometry.boundingSphere.center);
        camera.fov = 1;
        camera.updateProjectionMatrix();

        console.log(object);
      }
    } else {

      oldHighlightObj = null;

    }

    // selectionBox.visible = false;
    // //transformControls.detach();
    //
    // if ( object !== null ) {
    //
    // 	if (object instanceof THREE.Object3D === true) {
    //
    // 		selectionBox.update( object );
    // 		selectionBox.visible = true;
    //
    // 	}
    //
    // 	//transformControls.attach( object );
    //
    // }

    render();

  });

  signals.objectFocused.add(function(object) {

    controls.focus(object);

  });

  signals.geometryChanged.add(function(object) {

    if (object !== null) {

      selectionBox.update(object);

    }

    render();

  });

  signals.objectAdded.add(function(object) {

    object.traverse(function(child) {

      objects.push(child);

    });

  });

  signals.objectChanged.add(function(object) {

    if (editor.selected === object) {

      selectionBox.update(object);
      //transformControls.update();

    }

    if (object instanceof THREE.PerspectiveCamera) {

      object.updateProjectionMatrix();

    }

    if (editor.helpers[object.id] !== undefined) {

      editor.helpers[object.id].update();

    }

    render();

  });

  signals.objectRemoved.add(function(object) {

    object.traverse(function(child) {

      objects.splice(objects.indexOf(child), 1);

    });

  });

  signals.helperAdded.add(function(object) {

    objects.push(object.getObjectByName('picker'));

  });

  signals.helperRemoved.add(function(object) {

    objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);

  });

  signals.materialChanged.add(function(material) {

    render();

  });

  signals.fogTypeChanged.add(function(fogType) {

    if (fogType !== oldFogType) {

      if (fogType === "None") {

        scene.fog = null;

      } else if (fogType === "Fog") {

        scene.fog = new THREE.Fog(oldFogColor, oldFogNear, oldFogFar);

      } else if (fogType === "FogExp2") {

        scene.fog = new THREE.FogExp2(oldFogColor, oldFogDensity);

      }

      oldFogType = fogType;

    }

    render();

  });

  signals.fogColorChanged.add(function(fogColor) {

    oldFogColor = fogColor;

    updateFog(scene);

    render();

  });

  signals.fogParametersChanged.add(function(near, far, density) {

    oldFogNear = near;
    oldFogFar = far;
    oldFogDensity = density;

    updateFog(scene);

    render();

  });

  signals.windowResize.add(function() {

    // TODO: Move this out?

    editor.DEFAULT_CAMERA.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    editor.DEFAULT_CAMERA.updateProjectionMatrix();

    camera.aspect = container.dom.offsetWidth / container.dom.offsetHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(container.dom.offsetWidth, container.dom.offsetHeight);

    render();

  });

  signals.showGridChanged.add(function(showGrid) {

    grid.visible = showGrid;
    render();

  });

  //

  var renderer = null;

  animate();

  //

  function updateFog(root) {

    if (root.fog) {

      root.fog.color.setHex(oldFogColor);

      if (root.fog.near !== undefined) root.fog.near = oldFogNear;
      if (root.fog.far !== undefined) root.fog.far = oldFogFar;
      if (root.fog.density !== undefined) root.fog.density = oldFogDensity;

    }

  }

  function animate() {

    requestAnimationFrame(animate);

    /*

    // animations

    if ( THREE.AnimationHandler.animations.length > 0 ) {

    	THREE.AnimationHandler.update( 0.016 );

    	for ( var i = 0, l = sceneHelpers.children.length; i < l; i ++ ) {

    		var helper = sceneHelpers.children[ i ];

    		if ( helper instanceof THREE.SkeletonHelper ) {

    			helper.update();

    		}

    	}

    	render();

    }

    */

  }


  function render() {

    sceneHelpers.updateMatrixWorld();
    scene.updateMatrixWorld();

    renderer.autoclear = false;
    renderer.clear();
    renderer.render(scene, camera);

    if (renderer instanceof THREE.RaytracingRenderer === false) {

      renderer.render(sceneHelpers, camera);

    }

  }

  return container;

};
