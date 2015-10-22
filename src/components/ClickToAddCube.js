import { createClass, createElement } from 'react';
import * as THREE from 'three';
import { Object3D } from 'react-three';
import { connect } from 'react-redux';

import { createRandomAddCubeAction } from '../store/actions.js';
import ClickableCube from './ClickableCube.js';

//
// Component that represents an add button. click on this 'button' (really a cube) to add a cube to the scene
//
let ClickToAddCube = createClass({
  displayName:'ClickToAddCube',
  propTypes: {
  },
  handleClick: function(/*event, intersection*/) {
    this.props.dispatch(createRandomAddCubeAction(this.props.viewspace));
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
let ClickToAddCubeWithRedux = connect((state) => { return {viewspace:state.viewspace};})(ClickToAddCube);

export default ClickToAddCubeWithRedux;

