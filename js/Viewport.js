define([], function() {
  'use strict';

  /**
   * @author mrdoob / http://mrdoob.com/
   */

  function Viewport(editor) {

    this.signals = editor.signals;
    this.container = new UI.Panel();

    this.scene = editor.scene;
    this.sceneHelpers = editor.sceneHelpers;

    this.objects = [];

    // helpers

    this.grid = new THREE.GridHelper(30, 1);

    //

    this.camera = editor.camera;

    //

    this.renderer = null;


    this.selectionBox = new THREE.BoxHelper();


    this.objectPositionOnDown = null;
    this.objectRotationOnDown = null;
    this.objectScaleOnDown = null;

    // fog

    this.oldFogType = "None";
    this.oldFogColor = 0xaaaaaa;
    this.oldFogNear = 1;
    this.oldFogFar = 5000;
    this.oldFogDensity = 0.00025;

    // object picking

    this.raycaster = new THREE.Raycaster();
    this.mouse = new THREE.Vector2();

    // events

    this.onDownPosition = new THREE.Vector2();
    this.onUpPosition = new THREE.Vector2();
    this.onDoubleClickPosition = new THREE.Vector2();

    this.controls = new THREE.EditorControls(this.camera, this.container.dom);

    this.clearColor;
    this.saveTimeout;

    this.init(editor);

    return this.container;
  };

  Viewport.prototype.init = function(editor) {

    this.container.setId('viewport');
    this.container.setPosition('absolute');

    this.grid.visible = false;
    this.sceneHelpers.add(this.grid);

    //

    this.selectionBox.material.depthTest = false;
    this.selectionBox.material.transparent = true;
    this.selectionBox.visible = false;
    this.sceneHelpers.add(this.selectionBox);

    this.setEvent(editor);




    // controls need to be added *after* main logic,
    // otherwise controls.enabled doesn't work.

    this.controls.addEventListener('change', function() {

      //transformControls.update();
      this.signals.cameraChanged.dispatch(camera);

    });

    // signals

    this.setSignals(editor);

    animate();

    //

    function updateFog(root) {

      if (root.fog) {

        root.fog.color.setHex(this.oldFogColor);

        if (root.fog.near !== undefined) root.fog.near = this.oldFogNear;
        if (root.fog.far !== undefined) root.fog.far = this.oldFogFar;
        if (root.fog.density !== undefined) root.fog.density = this.oldFogDensity;

      }

    }

    function animate() {

      requestAnimationFrame(animate);

    }

    function render() {

      this.sceneHelpers.updateMatrixWorld();
      this.scene.updateMatrixWorld();

      this.renderer.clear();
      this.renderer.render(this.scene, this.camera);

      if (this.renderer instanceof THREE.RaytracingRenderer === false) {

        this.renderer.render(this.sceneHelpers, this.camera);

      }

    }

  }

  Viewport.prototype.setEvent = function(editor) {

    // events

    function getIntersects(point, objects) {

      this.mouse.set((point.x * 2) - 1, -(point.y * 2) + 1);

      this.raycaster.setFromCamera(mouse, camera);

      return this.raycaster.intersectObjects(objects);

    }


    function getMousePosition(dom, x, y) {

      var rect = dom.getBoundingClientRect();
      return [(x - rect.left) / rect.width, (y - rect.top) / rect.height];

    }

    function handleClick() {
      //TODO : selecting object 3D from viewport
      if (this.onDownPosition.distanceTo(this.onUpPosition) === 0) {

        var intersects = getIntersects(this.onUpPosition, this.objects);

        if (intersects.length > 0) {}

        render();
      }
    }

    function onMouseDown(event) {

      event.preventDefault();

      var array = getMousePosition(this.container.dom, event.clientX, event.clientY);
      this.onDownPosition.fromArray(array);

      document.addEventListener('mouseup', onMouseUp, false);

    }

    function onMouseUp(event) {

      var array = getMousePosition(this.container.dom, event.clientX, event.clientY);
      this.onUpPosition.fromArray(array);

      handleClick();

      document.removeEventListener('mouseup', onMouseUp, false);

    }

    function onTouchStart(event) {

      var touch = event.changedTouches[0];

      var array = getMousePosition(this.container.dom, touch.clientX, touch.clientY);
      this.onDownPosition.fromArray(array);

      document.addEventListener('touchend', onTouchEnd, false);

    }

    function onTouchEnd(event) {

      var touch = event.changedTouches[0];

      var array = getMousePosition(this.container.dom, touch.clientX, touch.clientY);
      this.onUpPosition.fromArray(array);

      handleClick();

      document.removeEventListener('touchend', onTouchEnd, false);

    }

    function onDoubleClick(event) {
      editor.select(null);
      render();
      //TODO : focusing object from viewport

    }

    this.container.dom.addEventListener('mousedown', onMouseDown, false);
    this.container.dom.addEventListener('touchstart', onTouchStart, false);
    this.container.dom.addEventListener('dblclick', onDoubleClick, false);
  }
  Viewport.prototype.setSignals = function(editor) {
    this.signals.editorCleared.add(function() {

      this.controls.center.set(0, 0, 0);
      render();

    });

    this.signals.themeChanged.add(function(value) {

      switch (value) {

        case 'css/light.css':
          this.grid.setColors(0x444444, 0x888888);
          this.clearColor = 0xaaaaaa;
          break;
        case 'css/dark.css':
          this.grid.setColors(0xbbbbbb, 0x888888);
          this.clearColor = 0x333333;
          break;

      }

      this.renderer.setClearColor(this.clearColor);

      this.render();

    });

    this.signals.transformModeChanged.add(function(mode) {

      //transformControls.setMode( mode );

    });

    this.signals.snapChanged.add(function(dist) {

      //transformControls.setTranslationSnap( dist );

    });

    this.signals.spaceChanged.add(function(space) {

      //transformControls.setSpace( space );

    });


    this.signals.rendererChanged.add(function(newRenderer) {

      console.log(this);
      if (this.renderer !== null) {

        this.container.dom.removeChild(this.renderer.domElement);

      }

      this.renderer = newRenderer;

      this.renderer.autoClear = false;
      this.renderer.autoUpdateScene = false;
      this.renderer.setClearColor(clearColor);
      this.renderer.setPixelRatio(window.devicePixelRatio);
      this.renderer.setSize(this.container.dom.offsetWidth, this.container.dom.offsetHeight);

      this.container.dom.appendChild(this.renderer.domElement);

      this.render();

    });

    this.signals.sceneGraphChanged.add(function() {

      this.render();

    });



    this.signals.cameraChanged.add(function() {

      this.render();

    });

    this.signals.objectSelected.add(function(object) {

      this.selectionBox.visible = false;
      //transformControls.detach();

      if (object !== null) {

        if (object instanceof THREE.Object3D === true) {

          this.selectionBox.update(object);
          this.selectionBox.visible = true;

        }

        //transformControls.attach( object );

      }

      this.render();

    });

    this.signals.objectFocused.add(function(object) {

      this.controls.focus(object);

    });

    this.signals.geometryChanged.add(function(object) {

      if (object !== null) {

        this.selectionBox.update(object);

      }

      this.render();

    });

    this.signals.objectAdded.add(function(object) {

      object.traverse(function(child) {

        objects.push(child);

      });

    });

    this.signals.objectChanged.add(function(object) {

      if (editor.selected === object) {

        this.selectionBox.update(object);
        //transformControls.update();

      }

      if (object instanceof THREE.PerspectiveCamera) {

        object.updateProjectionMatrix();

      }

      if (editor.helpers[object.id] !== undefined) {

        editor.helpers[object.id].update();

      }

      this.render();

    });

    this.signals.objectRemoved.add(function(object) {

      object.traverse(function(child) {

        objects.splice(objects.indexOf(child), 1);

      });

    });

    this.signals.helperAdded.add(function(object) {

      objects.push(object.getObjectByName('picker'));

    });

    this.signals.helperRemoved.add(function(object) {

      objects.splice(objects.indexOf(object.getObjectByName('picker')), 1);

    });

    this.signals.materialChanged.add(function(material) {

      render();

    });

    this.signals.fogTypeChanged.add(function(fogType) {

      if (fogType !== this.oldFogType) {

        if (fogType === "None") {

          this.scene.fog = null;

        } else if (fogType === "Fog") {

          this.scene.fog = new THREE.Fog(this.oldFogColor, this.oldFogNear, this.oldFogFar);

        } else if (fogType === "FogExp2") {

          this.scene.fog = new THREE.FogExp2(this.oldFogColor, this.oldFogDensity);

        }

        this.oldFogType = fogType;

      }

      this.render();

    });

    this.signals.fogColorChanged.add(function(fogColor) {

      this.oldFogColor = fogColor;

      this.updateFog(scene);

      this.render();

    });

    this.signals.fogParametersChanged.add(function(near, far, density) {

      this.oldFogNear = near;
      this.oldFogFar = far;
      this.oldFogDensity = density;

      this.updateFog(this.scene);

      this.render();

    });

    this.signals.windowResize.add(function() {

      // TODO: Move this out?

      editor.DEFAULT_CAMERA.aspect = this.container.dom.offsetWidth / this.container.dom.offsetHeight;
      editor.DEFAULT_CAMERA.updateProjectionMatrix();

      this.camera.aspect = this.container.dom.offsetWidth / this.container.dom.offsetHeight;
      this.camera.updateProjectionMatrix();

      this.renderer.setSize(this.container.dom.offsetWidth, this.container.dom.offsetHeight);

      this.render();

    });

    this.signals.showGridChanged.add(function(showGrid) {

      this.grid.visible = showGrid;
      this.render();

    });
  }

  return Viewport;
});
