import * as THREE from 'three';

//
// This 'application' tracks a bunch of cubes.
// You can do two things:
//
// 1. add a new randomly-placed cube to the application state
export const ADD_CUBE = 'ADD_CUBE';
export function addCubeAction(newcubeid, position, quaternion)
{
  return {
    type: ADD_CUBE,
    cubeid: newcubeid,
    position: position,
    quaternion: quaternion
  };
}
//
// 2. remove a specific cube, specified by the cube id
export const REMOVE_CUBE = 'REMOVE_CUBE';
export function removeCubeAction(id) {
  return {
    type: REMOVE_CUBE,
    cubeid: id
  };
}

//
// 3. resize the allow space in which to place cubes
export const RESIZE_SPACE = 'RESIZE_SPACE';
export function resizeSpaceAction(xsize, ysize, zsize)
{
  return {
    type: RESIZE_SPACE,
    newspace: {xsize,ysize,zsize}
  };
}

// when adding a cube we need to generate a unique id which
// can't be done in the reducer, so the id is generated here and passed in
var g_nextcubeid = 1;
function randomradian() {
  return Math.random() * Math.PI;
}
export function createRandomAddCubeAction(viewspace) {
  let {xsize, ysize, zsize} = viewspace;
  let position = new THREE.Vector3(
      (Math.random() - 0.5) * xsize,
      (Math.random() - 0.5) * ysize,
      (Math.random() - 0.5) * zsize
  );
  let quaternion= new THREE.Quaternion().setFromEuler(new THREE.Euler(randomradian(), randomradian(), randomradian(),'XYZ'));

  return addCubeAction(g_nextcubeid++, position, quaternion);
}
