import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import './index.css';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import duck from './todoDuck';
import thunk from 'redux-thunk';
// const { electronEnhancer } = window.require('redux-electron-store');
const replayActionRenderer = window.require('electron-redux').replayActionRenderer;
const forwardToMain = window.require('electron-redux').forwardToMain;
const getInitialStateRenderer = window.require('electron-redux').getInitialStateRenderer;
// import {replayActionRenderer, forwardToMain, getInitialStateRenderer} from 'electron-redux';


let enhancer = compose(
  applyMiddleware(forwardToMain, thunk),
  // electronEnhancer({
  //   dispatchProxy: a => store.dispatch(a),
  // }),
);

const initialState = getInitialStateRenderer();
const store = createStore(
  duck,
  initialState,
  enhancer,
);

replayActionRenderer(store);

ReactDOM.render(
  <Provider store={store}>
    <App/>
  </Provider>
  , document.getElementById('root')
);
