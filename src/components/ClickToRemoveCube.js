import { createClass, createElement } from 'react';
import { connect } from 'react-redux';

import { removeCubeAction } from '../store/actions';
import ClickableCube from './ClickableCube';

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

var ClickToRemoveCubeWithRedux = connect()(ClickToRemoveCube);

export default ClickToRemoveCubeWithRedux;


