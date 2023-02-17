import {View, Text, SafeAreaView, Image} from 'react-native';
import React, {useEffect} from 'react';
import {GlobalStyles} from '../constants/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {userGetInfo} from '../store/reducers/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import logo from './../assets/img/logo.jpg';

const SplashScreen = ({navigation}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(userGetInfo());
    }, 2000);
  }, []);

  return (
    <SafeAreaView
      style={[
        GlobalStyles.container,
        GlobalStyles.flexJustifyBetween,
        GlobalStyles.flexAlignCenter,
      ]}>
      <Image
        style={{width: '100%', height: 200}}
        resizeMode="contain"
        source={logo}
      />
    </SafeAreaView>
  );
};

export default SplashScreen;
