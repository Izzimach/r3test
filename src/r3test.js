//
// Basic ReactTHREE example using events to add/remove sprites.

// tell jshint that we use lodash
/* global _ : false */
/* jshint strict: false */

import { createClass, createElement, PropTypes } from 'react';
import { render, Mesh, Object3D, Scene } from 'react-three';
var ReactTHREE = require('react-three');
var THREE = require('three');

import { createStore, compose, applyMiddleware } from 'redux';
import { Provider, connect } from 'react-redux';
// Redux DevTools
import { createDevTools, persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';


var g_assetpath = function(filename) { return 'assets/' + filename; };

//
// This 'application' tracks a bunch of cubes.
// You can do two things:
//
// 1. add a new randomly-placed cube to the application state
const ADD_CUBE = 'ADD_CUBE';
function addCubeAction(newcubeid)
{
  return {
    type: ADD_CUBE,
    cubeid: newcubeid
  };
}
//
// 2. remove a specific cube, specified by the cube id
const REMOVE_CUBE = 'REMOVE_CUBE';
function removeCubeAction(id) {
  return {
    type: REMOVE_CUBE,
    cubeid: id
  };
}

//
// 3. resize the allow space in which to place cubes
const RESIZE_SPACE = 'RESIZE_SPACE';
function resizeSpaceAction(xsize, ysize, zsize)
{
  return {
    type: RESIZE_SPACE,
    newspace: {xsize,ysize,zsize}
  };
}

// when adding a cube we need to generate a unique id which
// can't be done in the reducer, so the id is generated here and passed in
var g_nextcubeid = 1;
function createAddCubeAction() {
  return addCubeAction(g_nextcubeid++);
}

//
// function which adds a randomly placed cube to the application state
//

function randomradian() {
  return Math.random() * Math.PI;
}

function addRandomCube(state, newcubeid) {
  var cubeid = 'cube' + newcubeid.toString();
  var {xsize, ysize, zsize} = state.viewspace;

  var newcube = {
    position: new THREE.Vector3(
      (Math.random() - 0.5) * xsize,
      (Math.random() - 0.5) * ysize,
      (Math.random() - 0.5) * zsize
    ),
    quaternion: new THREE.Quaternion().setFromEuler(new THREE.Euler(randomradian(), randomradian(), randomradian(),'XYZ')),
    materialname: g_assetpath('lollipopGreen.png'),
    key: cubeid,
    name: cubeid
  };

  // should probs use immutable.js...
  var newcubes = [...state.cubes, newcube];

  return Object.assign({}, state, {
    cubes: newcubes
  });
}

//
// function to delete the specified cube
//

function removeCubeByID(state, cubeid) {
  var isthecube = function(cube) { return cube.key === cubeid; };

  var newcubes = _.reject(state.cubes, isthecube);

  return Object.assign({}, state, {
    cubes: newcubes
  });
};

function r3testApp(state = InitialState, action)
{
  switch (action.type) {
  case ADD_CUBE:
    return addRandomCube(state, action.cubeid);
  case REMOVE_CUBE:
    return removeCubeByID(state, action.cubeid);
  case RESIZE_SPACE:
    return Object.assign({}, state, {
      viewspace: action.newspace
    });
  default:
    return state;
  }
};

//
// React Components follow
//


//
// Component to represent a clickable cube with a given texture
// the box geometry is shared!
// materials are generated and cached here. Normally you would want to
// come up with a more general purpose asset manager...
//

var boxgeometry = new THREE.BoxGeometry(200,200,200);

var boxmaterialcache = [];
function lookupmaterial(materialname) {
  var material = _.find(boxmaterialcache, function(x) { return x.name === materialname;});
  if (typeof material !== "undefined") { return material; }

  // not found. create a new material for the given texture
  var texturemap = THREE.ImageUtils.loadTexture( g_assetpath(materialname) );
  var newmaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
  newmaterial.name = materialname;

  boxmaterialcache.push(newmaterial);
  return newmaterial;
}

var ClickableCube = createClass({
  displayName: 'ClickableCube',
  propTypes: {
    position: PropTypes.instanceOf(THREE.Vector3),
    quaternion: PropTypes.instanceOf(THREE.Quaternion),
    materialname: PropTypes.string.isRequired,
    shared: PropTypes.bool
  },
  render: function() {
    var boxmaterial = lookupmaterial(this.props.materialname);
    var cubeprops = _.clone(this.props);
    cubeprops.geometry = boxgeometry;
    cubeprops.material = boxmaterial;
    return createElement(Mesh, cubeprops);
  }
});

//
// A cube that, when clicked, removes itself from the application state
//

var ClickToRemoveCube = createClass({
  displayName: 'ClickToRemoveCube',
  removeThisCube: function(event, intersection) {
    var cubeid = intersection.object.name;
    this.props.dispatch(removeCubeAction(cubeid));
  },
  render: function() {
    var cubeprops = _.clone(this.props);
    cubeprops.materialname = 'lollipopGreen.png';
    cubeprops.onClick3D = this.removeThisCube;
    return createElement(ClickableCube,cubeprops);
  }
});
ClickToRemoveCube = connect()(ClickToRemoveCube);

//
// Component that represents an add button. click on this 'button' (really a cube) to add a cube to the scene
//
var CubeAppButtons = createClass({
  displayName:'CubeAppButtons',
  propTypes: {
  },
  handleClick: function(/*event, intersection*/) {
    this.props.dispatch(createAddCubeAction());
  },
  render: function() {
    return createElement(Object3D,
			 {},
			 createElement(ClickableCube,
				       {position: new THREE.Vector3(0,0,0), materialname:'cherry.png', name:'addbutton', onClick3D:this.handleClick})
    );
  }
});
// hook into react-redux
CubeAppButtons = connect()(CubeAppButtons)

//
// Component to display all the dynamically added cubes. All we do is
// generate a ClickableCube component for each entry in the 'cubes' property.
//

var RemovableCubes = createClass({
  displayName:'RemoveableCubes',
  propTypes: {
    cubes: PropTypes.arrayOf(PropTypes.object).isRequired
  },
  render: function() {
    // props for the Object3D containing the cubes. You could change these
    // props to translate/rotate/scale the whole group of cubes at once
    var containerprops = {};
    var args = [Object3D, containerprops];
    _.forEach(this.props.cubes, function(cube) { args.push(createElement(ClickToRemoveCube,cube));});
    return createElement.apply(null,args);
  }
});

//
// The top level component
// props:
// - width,height : size of the overall render canvas in pixels
// - sprites: a list of objects describing all the current sprites containing x,y and image fields
//

var CubeApp = createClass({
  displayName: 'CubeApp',
  propTypes: {
    cubes: PropTypes.arrayOf(PropTypes.object).isRequired,
    viewspace: PropTypes.object.isRequired
  },
  getInitialState: function() {
    // base initial size on window size minus border size
    var width = window.innerWidth - this.props.borderpx;
    var height = window.innerHeight - this.props.borderpx;

    var initialcamera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    initialcamera.position.z = 600;
    initialcamera.userData = null; // will set this up in componentDidMount

    return {camera: initialcamera, width:width, height:height};
  },
  componentDidMount: function() {
    var zeroVec = new THREE.Vector3(0,0,0);
    var componentinstance = this;
    var spinquaternion = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0), 0.01);
    var animationcallback = function(/*t*/) {
      var camera = componentinstance.state.camera;
      camera.position.applyQuaternion(spinquaternion);
      camera.lookAt(zeroVec);
      componentinstance.setState({camera:camera});      // 'update' the camera
      camera.userData = requestAnimationFrame(animationcallback);
    };
    // add an interval timer function to rotation the camera
    // the rAQ timer ID is dumped into the camera. Not the best place to put it probably.
    this.state.camera.userData = requestAnimationFrame(animationcallback);

    // handle resize events - should prob. be a mixin
    var resizecallback = function() {
      var newwidth = window.innerWidth - componentinstance.props.borderpx;
      var newheight = window.innerHeight - componentinstance.props.borderpx;

      // since we're responsible for the camera we need to update it here
      var camera = componentinstance.state.camera;
      camera.aspect = (newwidth / newheight);
      camera.updateProjectionMatrix();

      componentinstance.setState({width:newwidth, height:newheight, camera:camera});
    };
    window.addEventListener('resize',resizecallback, false);
    this.setState({resizecallback:resizecallback});
  },
  componentWillUnmount: function() {
    if (this.state.camera.userData !== null) {
      cancelAnimationFrame(this.state.camera.userData);
    }
    this.state.camera.userData = null;
    window.removeEventListener('resize',this.state.resizecallback);
  },
  render: function() {
    return createElement(Scene,
                         // stage props
			 {width: this.state.width, height: this.state.height, pointerEvents: ['onClick'], camera:this.state.camera},
			 // children components are the buttons and the dynamic sprites
			 createElement(RemovableCubes, {key:'cubes', cubes:this.props.cubes}),
			 createElement(CubeAppButtons, {key:'gui'})
			);
  }
});

let devTools = createDevTools(
  createElement(DockMonitor,
                {toggleVisibilityKey:'H', changePositionKey:'Q'},
                createElement(LogMonitor))
);
let devWindow = createElement(devTools);
var rootComponent = createClass({
  displayName:'Root',
  render: function() {
    let store = this.props;
    let app = createElement(CubeApp, store.getState());
    return createElement(Provider,
                         {store:store},
                         createElement("div", {},
                                       app,
                                       devWindow));
  }
});

const InitialState = {
  cubes: [],
  viewspace: {xsize:500, ysize:500, zsize:500},
  borderpx: 1
};

function setupStore()
{
  let createStoreWithDevTools = compose(
    applyMiddleware(thunk),
    devTools.instrument(),
    persistState(
      window.location.href.match(
          /[?&]debug_session=([^&]+)\b/
      )
    )
  )(createStore);

  let store = createStoreWithDevTools(
    r3testApp,
    InitialState);

  // eventually allow for hot reload of the reducer(s)
/*  if (module.hot) {
    module.hot.accept('../reducers', () =>
                      store.replaceReducer(require('../reducers')));
  }*/

  return store;
}

function r3teststart() {
  let store = setupStore();
  let renderfunc = () =>
      {
        let renderelement = document.getElementById("three-box");
        render(createElement(rootComponent, store), renderelement);
//        render(app, renderelement);
      };
  store.subscribe(renderfunc);
  renderfunc();
}

window.onload = r3teststart;
