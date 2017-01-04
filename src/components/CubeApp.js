import { createClass, createElement, PropTypes } from 'react';
import { Scene, Renderer } from 'react-three';
import * as THREE from 'three';

import ClickToAddCube from './ClickToAddCube';
import RemovableCubes from './RemovableCubes';

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
    return createElement(Renderer,
                         {width: this.state.width, height:this.state.height},
                         createElement(Scene,
                                       // stage props
                                       {width: this.state.width, height: this.state.height, pointerEvents: ['onClick'], camera:this.state.camera},
                                       // children components are the buttons and the dynamic sprites
                                       createElement(RemovableCubes, {key:'cubes', cubes:this.props.cubes}),
                                       createElement(ClickToAddCube, {key:'gui'})
                                      )
                        );
  }
});

export default CubeApp;

