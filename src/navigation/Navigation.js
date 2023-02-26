import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GameScreen from '../screens/GameScreen';
import {useSelector} from 'react-redux';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';
import {useWebsocket} from '../hooks/useWebsocket';
import {WebsocketContext} from '../context/WebsocketContext';
import {memo} from 'react';

const AuthStack = createNativeStackNavigator();
const UnauthStack = createNativeStackNavigator();

const Navigation = () => {
  const {loading, auth} = useSelector(state => state.user);
  const {
    websocket,
    setDataToSend,
    chessboard,
    time,
    userTimer,
    opponentTimer,
    setOpponentTimer,
    setUserTimer,
    handleUserTimerStart,
    handleOpponentTimerStart,
  } = useWebsocket();

  return (
    <NavigationContainer>
      {auth ? (
        <WebsocketContext.Provider
          value={{
            websocket,
            setDataToSend,
            chessboard,
            time,
            userTimer,
            opponentTimer,
            setUserTimer,
            setOpponentTimer,
            handleUserTimerStart,
            handleOpponentTimerStart,
          }}>
          <AuthStack.Navigator initialRouteName="Game">
            <AuthStack.Screen
              name="Game"
              options={{headerShown: false}}
              component={GameScreen}
            />
          </AuthStack.Navigator>
        </WebsocketContext.Provider>
      ) : (
        <UnauthStack.Navigator screenOptions={{headerShown: false}}>
          {loading && (
            <UnauthStack.Screen name="SplashScreen" component={SplashScreen} />
          )}
          <UnauthStack.Screen name="SignIn" component={SignInScreen} />
          <UnauthStack.Screen name="SignUp" component={SignUpScreen} />
        </UnauthStack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default memo(Navigation);
