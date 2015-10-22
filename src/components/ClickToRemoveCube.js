import { createClass, createElement } from 'react';
import { connect } from 'react-redux';

import { removeCubeAction } from '../store/actions';
import ClickableCube from './ClickableCube';

//
// A cube that, when clicked, removes itself from the application state
//

let ClickToRemoveCube = createClass({
  displayName: 'ClickToRemoveCube',
  removeThisCube: function(event, intersection) {
    let cubeid = intersection.object.name;
    this.props.dispatch(removeCubeAction(cubeid));
  },
  render: function() {
    let cubeprops = Object.assign({}, this.props, {
      materialname: 'lollipopGreen.png',
      onClick3D: this.removeThisCube
    });
    return createElement(ClickableCube,cubeprops);
  }
});

let ClickToRemoveCubeWithRedux = connect()(ClickToRemoveCube);

export default ClickToRemoveCubeWithRedux;




