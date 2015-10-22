
import { ADD_CUBE, REMOVE_CUBE, RESIZE_SPACE } from '../store/actions.js'
import { assetPath } from '../assets.js'
import { reject } from 'lodash';

//
// add a cube to the state
//

function addCube(state, action) {
  let { cubeid, position, quaternion} = action;
  var cubeidstring = 'cube' + cubeid.toString();

  var newcube = {
    position: position,
    quaternion: quaternion,
    materialname: assetPath('lollipopGreen.png'),
    key: cubeidstring,
    name: cubeidstring
  };

  // should probs use immutable.js...
  var newcubes = [...state.cubes, newcube];

  return Object.assign({}, state, {
    cubes: newcubes
  });
}

//
// delete the specified cube from teh state
//

function removeCubeByID(state, cubeid) {
  var isthecube = function(cube) { return cube.key === cubeid; };

  var newcubes = reject(state.cubes, isthecube);

  return Object.assign({}, state, {
    cubes: newcubes
  });
}

const InitialState = {
  cubes: [],
  viewspace: {xsize:500, ysize:500, zsize:500},
  borderpx: 1
};


export function r3testApp(state = InitialState, action)
{
  switch (action.type) {
  case ADD_CUBE:
    return addCube(state, action);
  case REMOVE_CUBE:
    return removeCubeByID(state, action.cubeid);
  case RESIZE_SPACE:
    return Object.assign({}, state, {
      viewspace: action.newspace
    });
  default:
    return state;
  }
}
