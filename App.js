/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */

import React from 'react';
import {View} from 'react-native';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import {Provider} from 'react-redux';
import {WebsocketContext} from './src/context/WebsocketContext';
import {useWebsocket} from './src/hooks/useWebsocket';
import Navigation from './src/navigation/Navigation';
import {store} from './src/store/store';

const App = () => {
  const {websocket} = useWebsocket();

  return (
    <Provider store={store}>
      <WebsocketContext.Provider value={{websocket}}>
        <GestureHandlerRootView style={{flex: 1}}>
          <Navigation />
        </GestureHandlerRootView>
      </WebsocketContext.Provider>
    </Provider>
  );
};

export default App;
