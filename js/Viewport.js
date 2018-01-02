define([], function() {
  'use strict';

  /**
   * @author mrdoob / http://mrdoob.com/
   */

  var Viewport = function(editor) {

    var signals = editor.signals;
    console.log(signals);

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

        if (intersects.length > 0) {}

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

    var clearColor;

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

    signals.objectSelected.add(function(object) {

      selectionBox.visible = false;
      //transformControls.detach();

      if (object !== null) {

        if (object instanceof THREE.Object3D === true) {

          selectionBox.update(object);
          selectionBox.visible = true;

        }

        //transformControls.attach( object );

      }

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

    }

    function render() {

      sceneHelpers.updateMatrixWorld();
      scene.updateMatrixWorld();

      renderer.clear();
      renderer.render(scene, camera);

      if (renderer instanceof THREE.RaytracingRenderer === false) {

        renderer.render(sceneHelpers, camera);

      }

    }

    /*
      edited by suheeeee
    */
    function initRenderer() {
      this.renderer = new THREE.WebGLRenderer();
      renderer.setSize(document.getElementById("viewport").offsetWidth,
        document.getElementById("viewport").offsetHeight);
      renderer.autoClear = false;
      document.getElementById("viewport").appendChild(renderer.domElement);
    }

    return container;

  };

  return Viewport;
});
