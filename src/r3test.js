//
// Basic ReactTHREE example using events to add/remove meshes

// React/three/react-three

import { createClass, createElement } from 'react';
import { render } from 'react-three';
import * as THREE from 'three';

// App stuff

import { InitialState, r3testApp } from './reducers/index';
import { assetPath, assetCache } from './assets';
import CubeApp from './components/CubeApp';

// Redux

import { createStore, compose, applyMiddleware } from 'redux';
import { Provider } from 'react-redux';

// Redux DevTools

import thunk from 'redux-thunk';

//
// setup devtools
//

var RootComponent = createClass({
  displayName:'Root',
  render: function() {
    let store = this.props.store;
    let app = createElement(CubeApp, store.getState());
    return createElement(Provider,
                         {store:store},
                         app);
  }
});

function setupStore()
{
  const store = createStore(
    r3testApp,
    InitialState,
    window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
  );

  return store;
}

function r3teststart() {
  let store = setupStore();
  let renderfunc = () =>
      {
        let renderelement = document.getElementById("three-box");
        render(createElement(RootComponent, {store:store}), renderelement);
      };
  store.subscribe(renderfunc);
  renderfunc();
}

function preloaddata() {
  let loader = new THREE.JSONLoader();
  loader.load(
    assetPath('grumpycyclops.json'),
    function (geometry /*, materials*/) {
      assetCache.cyclopsGeometry = geometry;
      let texturemap = THREE.ImageUtils.loadTexture( assetPath('grumpycyclops_diffuse.png') );
      assetCache.cyclopsMaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
      r3teststart();
    }
  );
}

window.onload = preloaddata;
