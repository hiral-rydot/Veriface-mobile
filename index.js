/**
 * @format
 */

import 'react-native-gesture-handler';
import React from 'react';
import { StatusBar, View, Text } from "react-native";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as DeprecatedPropTypes from 'deprecated-react-native-prop-types';

try {
  if (View && !View.propTypes) {
    View.propTypes = DeprecatedPropTypes.ViewPropTypes;
  }
  if (Text && !Text.propTypes) {
    Text.propTypes = DeprecatedPropTypes.TextPropTypes;
  }
} catch (e) {}

import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';
import createSagaMiddleware from 'redux-saga';
import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import createLogger from 'redux-logger';
import reducer from './src/reducer/index';
import rootSaga from './src/sagas';

const createSaga = typeof createSagaMiddleware === 'function' ? createSagaMiddleware : (createSagaMiddleware && createSagaMiddleware.default ? createSagaMiddleware.default : createSagaMiddleware);
const sagaMiddleware = createSaga();
const store2 = compose(applyMiddleware(sagaMiddleware));

const store = createStore(reducer, store2);
sagaMiddleware.run(rootSaga);

const Apps = () => (
  <GestureHandlerRootView style={{ flex: 1 }}>
    <SafeAreaProvider>
      <Provider store={store}>
        <StatusBar
          barStyle="light-content"
          backgroundColor="#0E5EF2"
        />
        <App />
      </Provider>
    </SafeAreaProvider>
  </GestureHandlerRootView>
);
AppRegistry.registerComponent(appName, () => Apps);
if (appName !== 'TurnoutM') {
  AppRegistry.registerComponent('TurnoutM', () => Apps);
}
