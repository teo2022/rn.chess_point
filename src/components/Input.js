import {View, Text, TextInput} from 'react-native';
import React from 'react';
import {Colors} from '../constants/colors';
import {GlobalStyles} from '../constants/globalStyles';

const Input = ({
  value,
  onChange,
  placeholder = 'Введите',
  type,
  secure = false,
}) => {
  return (
    <TextInput
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      secureTextEntry={secure}
      placeholderTextColor={Colors.black}
      style={[
        GlobalStyles.textBlack,
        GlobalStyles.border,
        GlobalStyles.borderRadius10,
        GlobalStyles.pt10,
        GlobalStyles.pb10,
        GlobalStyles.pl10,
        GlobalStyles.pr10,
      ]}
    />
  );
};

export default Input;
