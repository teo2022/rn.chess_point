import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import GameScreen from '../screens/GameScreen';
import {useSelector} from 'react-redux';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';
import SplashScreen from '../screens/SplashScreen';

const AuthStack = createNativeStackNavigator();
const UnauthStack = createNativeStackNavigator();

const Navigation = () => {
  const {loading, auth} = useSelector(state => state.user);

  return (
    <NavigationContainer>
      {auth ? (
        <AuthStack.Navigator initialRouteName="Game">
          <AuthStack.Screen
            name="Game"
            options={{headerShown: false}}
            component={GameScreen}
          />
        </AuthStack.Navigator>
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

export default Navigation;
