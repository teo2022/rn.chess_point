import {View, Text, SafeAreaView} from 'react-native';
import React, {useEffect} from 'react';
import {GlobalStyles} from '../constants/globalStyles';
import {useDispatch, useSelector} from 'react-redux';
import {userGetInfo} from '../store/reducers/userReducer';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({navigation}) => {
  const dispatch = useDispatch();

  useEffect(() => {
    setTimeout(() => {
      dispatch(userGetInfo());
    }, 2000);
  }, []);

  return (
    <SafeAreaView style={[GlobalStyles.container]}>
      <Text>Chess point</Text>
    </SafeAreaView>
  );
};

export default SplashScreen;
