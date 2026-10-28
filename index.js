/**
 * @format
 */

import React from 'react';
import { StatusBar } from "react-native";
import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createLogger from 'redux-logger';
import reducer from './src/reducer/index';
import rootSaga from './src/sagas';

const sagaMiddleware = createSagaMiddleware();
const store2 = compose(applyMiddleware(sagaMiddleware));

const store = createStore(reducer, store2);
sagaMiddleware.run(rootSaga);

const Apps = () => (
  <Provider store={store}>
    <StatusBar
      barStyle="light-content"
      backgroundColor="#0E5EF2"
    />
    <App />
  </Provider>
);
AppRegistry.registerComponent(appName, () => Apps);
