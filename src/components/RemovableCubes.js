import { createClass, createElement, PropTypes } from 'react';
import { Object3D } from 'react-three';

import ClickToRemoveCube from './ClickToRemoveCube';

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
    var cubeelements = this.props.cubes.map((cube) => { return createElement(ClickToRemoveCube, cube);});
    var args = [ Object3D, containerprops, ...cubeelements ];
    return createElement.apply(null,args);
  }
});

export default RemovableCubes;
