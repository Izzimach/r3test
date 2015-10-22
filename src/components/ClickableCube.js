import { createClass, createElement, PropTypes } from 'react';
import { assetPath, assetCache } from '../assets.js';
import { find } from 'lodash';
import * as THREE from 'three';
import { Mesh } from 'react-three';

//
// Component to represent a clickable cube with a given texture
// the box geometry is shared!
// materials are generated and cached here. Normally you would want to
// come up with a more general purpose asset manager...
//

var boxgeometry = new THREE.BoxGeometry(10,10,10);

var boxmaterialcache = [];
function lookupmaterial(materialname) {
  var material = find(boxmaterialcache, function(x) { return x.name === materialname;});
  if (typeof material !== "undefined") { return material; }

  // not found. create a new material for the given texture
  var texturemap = THREE.ImageUtils.loadTexture( assetPath(materialname) );
  var newmaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
  newmaterial.name = materialname;

  boxmaterialcache.push(newmaterial);
  return newmaterial;
}

export var ClickableCube = createClass({
  displayName: 'ClickableCube',
  propTypes: {
    position: PropTypes.instanceOf(THREE.Vector3),
    quaternion: PropTypes.instanceOf(THREE.Quaternion),
    materialname: PropTypes.string.isRequired,
    shared: PropTypes.bool
  },
  render: function() {
    var boxmaterial = lookupmaterial(this.props.materialname);
    var cubeprops = Object.assign({}, this.props, {
      geometry: boxgeometry,
      material: boxmaterial,
      //geometry: assetCache['cyclopsGeometry'],
      //material: assetCache['cyclopsMaterial'],
      scale: 3
    });
    return createElement(Mesh, cubeprops);
  }
});

export default ClickableCube;
