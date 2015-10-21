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

import { createDevTools, persistState } from 'redux-devtools';
import thunk from 'redux-thunk';
import LogMonitor from 'redux-devtools-log-monitor';
import DockMonitor from 'redux-devtools-dock-monitor';

//
// setup devtools
//

let devTools = createDevTools(
  createElement(DockMonitor,
                {toggleVisibilityKey:'H', changePositionKey:'Q'},
                createElement(LogMonitor))
);
let devWindow = createElement(devTools);
var rootComponent = createClass({
  displayName:'Root',
  render: function() {
    let store = this.props.store;
    let app = createElement(CubeApp, store.getState());
    return createElement(Provider,
                         {store:store},
                         createElement("div", {},
                                       app,
                                       devWindow));
  }
});

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
  if (module.hot) {
    module.hot.accept('./reducers', () =>
                      store.replaceReducer(require('./reducers/index')));
  }

  return store;
}

function r3teststart() {
  let store = setupStore();
  let renderfunc = () =>
      {
        let renderelement = document.getElementById("three-box");
        render(createElement(rootComponent, {store:store}), renderelement);
      };
  store.subscribe(renderfunc);
  renderfunc();
}

function preloaddata() {
  let loader = new THREE.JSONLoader();
  loader.load(
    assetPath('jellyfish.json'),
    function (geometry, materials) {
      assetCache.cyclopsGeometry = geometry;
      let texturemap = THREE.ImageUtils.loadTexture( assetPath('jellyfish_diffuse.png') );
      assetCache.cyclopsMaterial = new THREE.MeshBasicMaterial( { map: texturemap } );
      r3teststart();
    }
  );
}

window.onload = preloaddata;
